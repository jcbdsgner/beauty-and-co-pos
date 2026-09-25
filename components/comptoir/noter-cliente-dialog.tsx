"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Dialog } from "@/components/ui/molecules/dialog";
import { useAppData } from "@/components/providers/app-data-provider";
import { NOTATION_QUESTIONS, type NotationOption, type NotationQuestion } from "@/lib/data/notation";
import { cn } from "@/lib/utils";
import type { Cliente, Sale } from "@/lib/data/types";

const STAMP_FMT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/**
 * « Noter la cliente » — run from the receipt once the sale is cashed in. One question per screen,
 * answered by tapping photo tiles (several answers allowed), then a free internal note. Answers
 * go into the cliente's onglerie préférence, the note into her internal log; finishing stamps
 * `Sale.clientRatedAt`, which releases the Comptoir. Closing with « × » keeps the answers and
 * leaves the lock in place.
 */
export function NoterClienteDialog({
  open,
  sale,
  client,
  onClose,
}: {
  open: boolean;
  sale: Sale;
  client: Cliente;
  onClose: () => void;
}) {
  const { updateClient, updateSale } = useAppData();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [note, setNote] = useState("");

  const totalSteps = NOTATION_QUESTIONS.length + 1;
  const question: NotationQuestion | undefined = NOTATION_QUESTIONS[stepIndex];
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
    const stamp = STAMP_FMT.format(new Date());
    const preference = `${NOTATION_QUESTIONS.map((q) => `${q.noteLabel} : ${answerSummary(q)}`).join(" · ")} (${stamp})`;
    const currentPref = client.preferenceNotes?.onglerie;
    const trimmedNote = note.trim();
    updateClient(client.id, {
      preferenceNotes: {
        ...client.preferenceNotes,
        onglerie: currentPref ? `${preference}\n${currentPref}` : preference,
      },
      ...(trimmedNote && {
        internalNotes: client.internalNotes ? `[${stamp}] ${trimmedNote}\n\n${client.internalNotes}` : `[${stamp}] ${trimmedNote}`,
      }),
    });
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
        {question ? (
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
              {question.options.map((option, i) => (
                <PhotoTile
                  key={option.id}
                  option={option}
                  selected={selected.includes(option.id)}
                  onToggle={() => toggle(option.id)}
                  // Length tiles draw a nail that grows from short to very long.
                  lengthRank={question.id === "ongles-longueur" ? i : undefined}
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
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 rounded-[18px] bg-base-200 px-5 py-4 text-[15px]">
              {NOTATION_QUESTIONS.map((q) => (
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
              placeholder="Ex. Très pointilleuse sur la forme amande, préfère Fatou pour la pose."
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
          {question ? (
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

function PhotoTile({
  option,
  selected,
  onToggle,
  lengthRank,
  tall,
}: {
  option: NotationOption;
  selected: boolean;
  onToggle: () => void;
  lengthRank?: number;
  tall: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[20px] border-2 bg-base-100 text-left transition duration-200 ease-out active:scale-[0.98]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        selected ? "border-primary shadow-[0_10px_24px_-12px_rgba(136,102,102,0.55)]" : "border-base-300 hover:border-primary/40",
      )}
    >
      <div className={cn("relative w-full overflow-hidden bg-accent", tall ? "aspect-[3/4]" : "aspect-[4/3]")}>
        {option.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- local fixture photos, sizes vary
          <img src={option.photo} alt="" className="size-full object-cover transition duration-300 group-active:scale-[1.02]" />
        ) : (
          <NailPlaceholder lengthRank={lengthRank} />
        )}
        <span
          aria-hidden
          className={cn(
            "absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border-2 transition duration-200",
            selected ? "scale-100 border-primary bg-primary text-primary-content" : "scale-90 border-primary/30 bg-white/80 text-transparent",
          )}
        >
          <Check className="size-4" strokeWidth={3} />
        </span>
      </div>
      <div className="flex min-h-16 flex-col justify-center px-4 py-3">
        <span className={cn("text-[17px] leading-tight", selected ? "font-semibold text-base-content" : "font-medium text-base-content/80")}>
          {option.label}
        </span>
        {option.hint && <span className="mt-0.5 text-[13px] text-base-content/55">{option.hint}</span>}
      </div>
    </button>
  );
}

/** Stand-in until the real photos arrive: a nail silhouette in the brand tint. With `lengthRank`,
 *  the free edge grows from short (0) to very long (3) so the length question still reads. */
function NailPlaceholder({ lengthRank }: { lengthRank?: number }) {
  const free = lengthRank === undefined ? 16 : 6 + lengthRank * 12;
  const top = 58 - free;
  return (
    <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 m-auto h-3/4 w-auto text-primary/25">
      {/* finger */}
      <path d="M30 100 V62 a20 20 0 0 1 40 0 V100 Z" fill="currentColor" opacity="0.45" />
      {/* nail bed + free edge */}
      <path
        d={`M37 84 V${top + 12} Q37 ${top} 50 ${top} Q63 ${top} 63 ${top + 12} V84 Q50 90 37 84 Z`}
        fill="currentColor"
      />
    </svg>
  );
}
