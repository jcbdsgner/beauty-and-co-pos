"use client";

/**
 * Le devis et la facture dans le fil Messages (ADR 0042) : dans la timeline, ce que la cliente
 * reçoit vraiment — un document joint au message (une version remplacée est barrée) ; sous
 * l'en-tête du fil, le dossier en cours épinglé, seul endroit où l'on agit.
 */

import { useState } from "react";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { FlipChip } from "@/components/ui/board";
import { Dialog } from "@/components/ui/molecules/dialog";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { CancelFactureDialog, RecordPaymentDialog } from "@/components/devis/facture-dialogs";
import { DevisDocument } from "@/components/devis/devis-document";
import { buildDossiers, devisStatus, documentTotals, sinceLabel, SHORT_DATE_FMT, type Dossier } from "@/components/devis/lib";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn, formatFcfa } from "@/lib/utils";
import type { Cliente, Devis, Facture, Message } from "@/lib/data/types";

const TIME_FMT = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });
const PAY = { wave: "Wave", orange_money: "Orange Money", especes: "espèces", carte: "carte" } as const;

type ThreadDoc =
  | { kind: "devis"; devis: Devis; dossier: Dossier; current: boolean }
  | { kind: "facture"; facture: Facture; dossier: Dossier; current: true };

function useThreadDoc(message: Message): ThreadDoc | null {
  const { devis, factures } = useAppData();
  const dossiers = buildDossiers(devis, factures);
  if (message.factureId) {
    const facture = factures.find((f) => f.id === message.factureId);
    const dossier = facture && dossiers.find((d) => d.facture?.id === facture.id);
    return facture && dossier ? { kind: "facture", facture, dossier, current: true } : null;
  }
  const d = devis.find((x) => x.id === message.devisId);
  const dossier = d && dossiers.find((x) => x.number === d.number);
  if (!d || !dossier) return null;
  // Le devis courant porte les actions ; une version remplacée ou un devis déjà facturé se lit seulement.
  return { kind: "devis", devis: d, dossier, current: dossier.devis.id === d.id && !dossier.facture };
}

/** Statut lisible de la pièce, pour une puce. */
function docChip(doc: ThreadDoc): { value: string; tone: "neutral" | "act" | "now" | "done" | "void" | "signal" } {
  if (doc.kind === "facture") {
    const f = doc.facture;
    if (f.status === "annulee") return { value: "Annulée", tone: "void" };
    if (f.status === "a_payer") return { value: "À payer", tone: "act" };
    return { value: "Payée", tone: "done" };
  }
  switch (devisStatus(doc.devis)) {
    case "envoye": return { value: "Envoyé", tone: "act" };
    case "facture": return { value: "Facturé", tone: "done" };
    case "refuse": return { value: "Refusé", tone: "void" };
    case "expire": return { value: "Expiré", tone: "void" };
    case "remplace": return { value: "Remplacé", tone: "void" };
    default: return { value: "Brouillon", tone: "neutral" };
  }
}

function docNumber(doc: ThreadDoc) {
  return doc.kind === "facture" ? doc.facture.number : `${doc.devis.number}${doc.devis.version > 1 ? ` · v${doc.devis.version}` : ""}`;
}

function docTotal(doc: ThreadDoc) {
  return doc.kind === "facture" ? doc.facture.total : documentTotals(doc.devis.lines, doc.devis.remises).total;
}

/** Ce qu'il y a à faire sur le dossier, maintenant — porté par le bandeau épinglé seulement. */
function DocActions({ doc, onEditDraft }: { doc: ThreadDoc; onEditDraft: (devisId: string) => void }) {
  const { invoiceDevis, reviseDevis, refuseDevis } = useAppData();
  const [dialog, setDialog] = useState<"refuse" | "pay" | "cancel" | null>(null);
  if (doc.kind === "devis") {
    if (!doc.current || devisStatus(doc.devis) !== "envoye") return null;
    return (
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" onClick={() => setDialog("refuse")}>Refusé</Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const draft = reviseDevis(doc.devis.id);
            if (draft) onEditDraft(draft.id);
          }}
        >
          Modifier
        </Button>
        <Button size="sm" onClick={() => invoiceDevis(doc.devis.id)}>Facturer</Button>
        <ConfirmDialog
          open={dialog === "refuse"}
          tone="neutral"
          confirmVariant="brand"
          title="La cliente refuse le devis ?"
          description={`${doc.devis.number} sera clos. Il reste lisible dans le fil.`}
          confirmLabel="Marquer refusé"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            refuseDevis(doc.devis.id);
            setDialog(null);
          }}
        />
      </div>
    );
  }
  if (doc.facture.status !== "a_payer") return null;
  return (
    <div className="flex shrink-0 gap-2">
      <Button variant="outline" size="sm" onClick={() => setDialog("cancel")}>Annuler par un avoir</Button>
      <Button size="sm" onClick={() => setDialog("pay")}>Enregistrer le paiement</Button>
      {dialog === "pay" && <RecordPaymentDialog facture={doc.facture} onClose={() => setDialog(null)} />}
      {dialog === "cancel" && <CancelFactureDialog facture={doc.facture} onClose={() => setDialog(null)} />}
    </div>
  );
}

/** Une ligne d'état sous la pièce : quand, par où, et ce qui suit. */
function docStatusLine(doc: ThreadDoc, now = new Date()) {
  if (doc.kind === "facture") {
    const f = doc.facture;
    if (f.status === "payee") {
      const products = f.lines.some((l) => l.kind === "produit");
      return `Payée le ${SHORT_DATE_FMT.format(new Date(f.paidAt!))} · ${PAY[f.payment!.mode]}${f.payment!.via === "lien" ? " par le lien" : " au salon"}${products && !f.productsHandedOverAt ? " · produits à remettre au comptoir" : ""}`;
    }
    if (f.status === "annulee") return `Annulée par l'avoir ${f.avoir?.number}`;
    return `Émise ${sinceLabel(f.issuedAt, now)} · lien de paiement envoyé`;
  }
  const s = devisStatus(doc.devis, now);
  if (s === "envoye") return `Valable jusqu'au ${SHORT_DATE_FMT.format(new Date(doc.devis.validUntil))}`;
  if (s === "facture") return "Accepté · facturé";
  if (s === "remplace") return "Remplacé par une version plus récente";
  if (s === "expire") return `Expiré le ${SHORT_DATE_FMT.format(new Date(doc.devis.validUntil))}`;
  if (s === "refuse") return "Refusé par la cliente";
  return "";
}

function FullDocDialog({ doc, client, open, onClose }: { doc: ThreadDoc; client: Cliente; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="doc-dialog-title" className="max-h-[92dvh] max-w-[760px] overflow-y-auto rounded-[28px] bg-base-200 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p id="doc-dialog-title" className="font-semibold">{docNumber(doc)}</p>
        <button type="button" aria-label="Fermer" onClick={onClose} className="grid size-12 place-items-center rounded-full hover:bg-base-300">
          <X className="size-5" />
        </button>
      </div>
      {doc.kind === "facture" ? (
        <DevisDocument kind="facture" facture={doc.facture} client={client} />
      ) : (
        <DevisDocument kind="devis" devis={doc.devis} client={client} />
      )}
    </Dialog>
  );
}

/* ── Pièce jointe dans la bulle ─────────────────────────────────────────── */

function DocumentAttachment({ message, doc, client }: { message: Message; doc: ThreadDoc; client: Cliente }) {
  const [open, setOpen] = useState(false);
  // Seule une version remplacée se barre ; un devis facturé, refusé ou expiré reste lisible.
  const struck = doc.kind === "devis" && devisStatus(doc.devis) === "remplace";
  const chip = docChip(doc);
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="max-w-[80%] rounded-box bg-accent p-2 text-sm">
        <button type="button" onClick={() => setOpen(true)} className="flex w-[300px] items-center gap-3 rounded-field bg-white px-3 py-2.5 text-left">
          <span className="grid size-10 shrink-0 place-items-center rounded-field bg-base-200"><FileText aria-hidden className="size-5 text-[var(--brand-taupe-muted)]" /></span>
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate font-semibold", struck && "text-base-content/45 line-through")}>{doc.kind === "facture" ? "Facture" : "Devis"} {docNumber(doc)}</span>
            <span className="block text-xs text-base-content/55">
              PDF · <span className="tabular-nums">{formatFcfa(docTotal(doc))}</span> · {chip.value}
            </span>
          </span>
        </button>
        <p className="px-1.5 pt-2 pb-0.5">{message.body}</p>
      </div>
      <span className="px-1 text-xs text-base-content/45">{TIME_FMT.format(new Date(message.at))}</span>
      <FullDocDialog doc={doc} client={client} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

/**
 * Le dossier en cours de la cliente, épinglé sous l'en-tête du fil : le seul endroit où l'on agit.
 * Un brouillon passe devant (devis pas encore parti, ou nouvelle version en cours) ; sinon le
 * devis qui attend sa réponse, ou la facture qui attend son paiement.
 */
export function PinnedDossier({ client, onEditDraft }: { client: Cliente; onEditDraft: (devisId: string) => void }) {
  const { devis, factures, deleteDevisDraft } = useAppData();
  const [open, setOpen] = useState(false);
  const mine = devis.filter((d) => d.clientId === client.id);
  const draft = mine.find((d) => d.status === "brouillon");
  const live = buildDossiers(mine, factures).find((d) => d.stage === "envoye" || d.stage === "a_payer");

  if (draft) {
    const total = documentTotals(draft.lines, draft.remises).total;
    return (
      <div className="flex shrink-0 items-center gap-3 border-b border-base-300 bg-base-200 px-5 py-3">
        <FileText aria-hidden className="size-5 text-base-content/45" />
        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="font-semibold tabular-nums">{draft.number}{draft.version > 1 ? ` · v${draft.version}` : ""}</span>
            <FlipChip value="Brouillon" tone="neutral" />
          </span>
          <span className="block truncate text-sm text-base-content/60">{formatFcfa(total)} · pas encore envoyé</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => deleteDevisDraft(draft.id)}>Supprimer</Button>
        <Button size="sm" onClick={() => onEditDraft(draft.id)}>Reprendre</Button>
      </div>
    );
  }

  if (!live) return null;
  const doc: ThreadDoc = live.facture
    ? { kind: "facture", facture: live.facture, dossier: live, current: true }
    : { kind: "devis", devis: live.devis, dossier: live, current: true };
  const chip = docChip(doc);
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-base-300 bg-[var(--brand-rose-soft)] px-5 py-3">
      <FileText aria-hidden className="size-5 text-[var(--brand-taupe-muted)]" />
      <button type="button" onClick={() => setOpen(true)} className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-2">
          <span className="font-semibold tabular-nums">{docNumber(doc)}</span>
          <FlipChip value={chip.value} tone={chip.tone} />
        </span>
        <span className="block truncate text-sm text-base-content/60">{formatFcfa(docTotal(doc))} · {docStatusLine(doc)}</span>
      </button>
      <DocActions doc={doc} onEditDraft={onEditDraft} />
      <FullDocDialog doc={doc} client={client} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export function ThreadDocument({ message, client }: { message: Message; client: Cliente }) {
  const doc = useThreadDoc(message);
  if (!doc) return null;
  return <DocumentAttachment message={message} doc={doc} client={client} />;
}
