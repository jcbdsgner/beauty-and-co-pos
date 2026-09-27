"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Dialog } from "@/components/ui/molecules/dialog";
import { computeTotals, useAppData } from "@/components/providers/app-data-provider";
import { NOTER_QUESTIONS, type NotationQuestion } from "@/lib/data/notation";
import { NotationTile } from "@/components/clientele/notation-tile";
import { UTILISATEUR } from "@/lib/data/utilisateurs";
import { cn, formatFcfa } from "@/lib/utils";
import type { Cliente, Sale } from "@/lib/data/types";

/**
 * « Noter la cliente » — run from the receipt (« Continuer ») once the sale is cashed in. When a
 * remise was granted, its motif comes first (`needsReason`) — internal, never on the receipt, it
 * lands in `Sale.remiseReason` for Récap des ventes. Then one question per screen,
 * answered by tapping photo tiles (several answers allowed), then a free internal note. The answers
 * are kept as one more round in her `notationRounds` (the fiche counts how often each comes back), the note
 * into her internal log, signed by the poste's account; finishing stamps
 * `Sale.clientRatedAt`, which releases the Comptoir. Closing with « × » keeps the answers and
 * leaves the lock in place.
 */
export function NoterClienteDialog({
  open,
  sale,
  client,
  needsReason,
  onClose,
}: {
  open: boolean;
  sale: Sale;
  client: Cliente;
  needsReason: boolean;
  onClose: () => void;
}) {
  const { updateClient, addClientNote, updateSale, setDiscountReason } = useAppData();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");

  // The motif step is kept once entered, so « Retour » from the first question can reach it again.
  const [withReason] = useState(needsReason);
  const offset = withReason ? 1 : 0;
  const onReasonStep = withReason && stepIndex === 0;
  const totalSteps = offset + NOTER_QUESTIONS.length + 1;
  const question: NotationQuestion | undefined = onReasonStep ? undefined : NOTER_QUESTIONS[stepIndex - offset];
  const reasonOk = reason.trim().length >= 3;
  const selected = question ? (answers[question.id] ?? []) : [];

  function toggle(optionId: string) {
    if (!question) return;
    setAnswers((prev) => {
      const current = prev[question.id] ?? [];
      const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
      return { ...prev, [question.id]: next };
    });
  }

  function answerSummary(q: NotationQuestion): string {
    return (answers[q.id] ?? [])
      .map((id) => q.options.find((o) => o.id === id)?.label)
      .filter(Boolean)
      .join(", ");
  }

  function finish() {
    const trimmedNote = note.trim();
    const choices = Object.fromEntries(Object.entries(answers).filter(([, ids]) => ids.length > 0));
    updateClient(client.id, { notationRounds: [{ at: new Date().toISOString(), choices }, ...(client.notationRounds ?? [])] });
    if (trimmedNote) addClientNote(client.id, { authorId: UTILISATEUR.praticienneId, text: trimmedNote, origin: "encaissement" });
    if (withReason) setDiscountReason(sale.id, reason);
    updateSale(sale.id, { clientRatedAt: new Date().toISOString() });
    onClose();
  }

  return (
    <Dialog open={open} labelledBy="noter-cliente-title" className="relative flex max-h-[calc(100vh-2rem)] max-w-[920px] flex-col overflow-hidden p-0">
      <CloseButton onClick={onClose} className="top-4 right-4" aria-label="Fermer — les réponses sont gardées" />

      {/* Where we are */}
      <header className="shrink-0 px-9 pt-8">
        <div className="flex items-center gap-3">
          <ol className="flex gap-1.5" aria-label={`Étape ${stepIndex + 1} sur ${totalSteps}`}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <li
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500 ease-out",
                  i === stepIndex ? "w-10 bg-primary" : i < stepIndex ? "w-5 bg-primary/45" : "w-5 bg-base-300",
                )}
              />
            ))}
          </ol>
          <p className="text-sm text-base-content/55">
            Noter <span className="font-semibold text-base-content/80">{client.firstName}</span>
          </p>
        </div>
      </header>

      {/* The question */}
      <div key={stepIndex} className="min-h-0 flex-1 overflow-y-auto px-9 pt-5 pb-7 animate-in fade-in-0 slide-in-from-right-6 duration-300 ease-out">
        {onReasonStep ? (
          <>
            <h2 id="noter-cliente-title" className="font-[family-name:var(--font-heading)] text-[28px] font-bold leading-tight text-base-content">
              Pourquoi cette remise ?
            </h2>
            <p className="mt-1 text-[15px] text-base-content/55">
              {computeTotals(sale)
                .remiseBreakdown.map((r) => `${r.mode === "pourcentage" ? `${r.value} %` : formatFcfa(r.amount)} sur ${r.lineIds.length} prestation${r.lineIds.length > 1 ? "s" : ""}`)
                .join(" · ")}{" "}
              — interne, n&apos;apparaît pas sur le reçu. Visible dans le récap des ventes.
            </p>
            <Textarea
              className="mt-6 text-[17px]"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex. Geste commercial — attente de 40 min."
              aria-label="Motif de la remise"
              autoFocus
            />
          </>
        ) : question ? (
          <>
            <h2 id="noter-cliente-title" className="font-[family-name:var(--font-heading)] text-[28px] font-bold leading-tight text-balance text-base-content">
              {question.title}
            </h2>
            <p className="mt-1 text-[15px] text-base-content/55">{question.subtitle}</p>
            <div
              className={cn("mt-6 grid gap-4", question.options.length === 4 ? "grid-cols-4" : "grid-cols-3")}
              role="group"
              aria-labelledby="noter-cliente-title"
            >
              {question.options.map((option) => (
                <NotationTile
                  key={option.id}
                  question={question}
                  option={option}
                  selected={selected.includes(option.id)}
                  onToggle={() => toggle(option.id)}
                  tall={question.options.length === 4}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 id="noter-cliente-title" className="font-[family-name:var(--font-heading)] text-[28px] font-bold leading-tight text-base-content">
              Une note pour l&apos;équipe ?
            </h2>
            <p className="mt-1 text-[15px] text-base-content/55">
              Interne uniquement — elle apparaîtra dans le journal de sa fiche. Facultatif.
            </p>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 rounded-box bg-base-200 px-5 py-4 text-[15px]">
              {NOTER_QUESTIONS.map((q) => (
                <div key={q.id} className="flex gap-2">
                  <dt className="text-base-content/55">{q.noteLabel}</dt>
                  <dd className="font-semibold text-base-content/90">{answerSummary(q)}</dd>
                </div>
              ))}
            </dl>
            <Textarea
              className="mt-4 text-[17px]"
              rows={6}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Texte libre (facultatif)"
              autoFocus
            />
          </>
        )}
      </div>

      {/* Moving on */}
      <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-base-300 px-9 py-5">
        {stepIndex > 0 ? (
          <Button variant="outline" size="default" icon={<ArrowLeft className="size-4" />} onClick={() => setStepIndex((i) => i - 1)}>
            Retour
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-4">
          {question && (
            <p className="text-sm tabular-nums text-base-content/55" aria-live="polite">
              {selected.length === 0 ? "Choisissez au moins une réponse" : `${selected.length} sélectionnée${selected.length > 1 ? "s" : ""}`}
            </p>
          )}
          {onReasonStep ? (
            <Button variant="brand" size="xl" className="min-w-48" disabled={!reasonOk} onClick={() => setStepIndex((i) => i + 1)}>
              Continuer
            </Button>
          ) : question ? (
            <Button variant="brand" size="xl" className="min-w-48" disabled={selected.length === 0} onClick={() => setStepIndex((i) => i + 1)}>
              Continuer
            </Button>
          ) : (
            <Button variant="brand" size="xl" className="min-w-48" icon={<Check className="size-5" />} onClick={finish}>
              {note.trim() ? "Enregistrer" : "Terminer sans note"}
            </Button>
          )}
        </div>
      </footer>
    </Dialog>
  );
}

