"use client";

import { useState } from "react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BoxIcon, ClockIcon, CommentIcon } from "@/components/stock/icons";
import { PencilIcon } from "@/components/ui/icons";
import { REQUEST_STATUS_LABELS, type RequestStatus, type StockRequest } from "@/lib/data/stock";
import { cn } from "@/lib/utils";

const STATUS_BADGE_VARIANT: Record<RequestStatus, BadgeVariant> = {
  en_attente: "warning",
  preparation: "info",
  envoye: "success",
};

type TimelineStepProps = {
  label: string;
  filled: boolean;
  detail: string;
  date?: string;
  last?: boolean;
};

function TimelineStep({ label, filled, detail, date, last }: TimelineStepProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "size-2.5 rounded-full border-2",
            filled ? "border-[var(--pos-accent-dark)] bg-[var(--pos-accent-dark)]" : "border-[var(--color-gray-300)] bg-white",
          )}
        />
        {!last && <span className="mt-1 h-6 w-px bg-[var(--color-gray-200)]" />}
      </div>
      <div className="-mt-0.5 flex flex-1 items-start justify-between gap-2 pb-1">
        <div>
          <p className={cn("text-sm font-medium", filled ? "text-[var(--color-gray-900)]" : "text-[var(--color-gray-500)]")}>
            {label}
          </p>
          <p className={cn("text-xs", filled ? "text-[var(--color-gray-600)]" : "italic text-[var(--color-gray-400)]")}>
            {detail}
          </p>
        </div>
        {date && <span className="shrink-0 text-xs text-[var(--color-gray-400)]">{date}</span>}
      </div>
    </div>
  );
}

type RequestCardProps = {
  request: StockRequest;
  onPrepare: (id: string) => void;
  onCancel: (id: string) => void;
  onEditQty: (id: string, qty: number) => void;
  onEditComment: (id: string, comment: string) => void;
};

/** Carte "Demande" — meta produit/salon, timeline verticale Demandé/Envoyé/Reçu, actions Preparer/Annuler. */
export function RequestCard({ request, onPrepare, onCancel, onEditQty, onEditComment }: RequestCardProps) {
  const isSent = request.status === "envoye";
  const [editingQty, setEditingQty] = useState(false);
  const [qtyDraft, setQtyDraft] = useState(String(request.qty));
  const [editingComment, setEditingComment] = useState(false);
  const [commentDraft, setCommentDraft] = useState(request.comment ?? "");

  function saveQty() {
    const value = Math.max(1, Number.parseInt(qtyDraft, 10) || request.qty);
    onEditQty(request.id, value);
    setQtyDraft(String(value));
    setEditingQty(false);
  }

  function saveComment() {
    onEditComment(request.id, commentDraft.trim());
    setEditingComment(false);
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-rose-soft)] text-[var(--pos-accent-dark)]">
            <ClockIcon />
          </span>
          <p className="font-semibold text-[var(--color-gray-900)]">{request.productName}</p>
        </div>
        <span className="shrink-0 text-xs text-[var(--color-gray-500)]">
          {request.salonLabel} · {request.entrepriseLabel}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--color-gray-500)]">
        {editingQty ? (
          <span className="inline-flex items-center gap-1">
            Qté:
            <input
              type="number"
              min={1}
              autoFocus
              value={qtyDraft}
              onChange={(e) => setQtyDraft(e.target.value)}
              onBlur={saveQty}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveQty();
                if (e.key === "Escape") {
                  setQtyDraft(String(request.qty));
                  setEditingQty(false);
                }
              }}
              className="w-14 rounded-md border border-[var(--color-gray-200)] bg-white px-1.5 py-0.5 text-[var(--color-gray-900)] focus:border-[var(--brand-taupe-muted)] focus:outline-none"
            />
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setEditingQty(true)}
            className="inline-flex items-center gap-1 hover:text-[var(--color-gray-700)]"
          >
            Qté: {request.qty} <PencilIcon className="size-3" />
          </button>
        )}
        <Badge variant="neutral">Salon: {request.salonStock}</Badge>
        <Badge variant="neutral">Dépôt: {request.depotStock}</Badge>
      </div>

      <div className="mt-4 flex flex-col">
        <TimelineStep label="Demandé" filled detail={request.requestedBy} date={request.requestedAt} />
        <TimelineStep
          label="Envoyé"
          filled={Boolean(request.sentBy)}
          detail={request.sentBy ?? "en attente"}
          date={request.sentAt}
        />
        <TimelineStep
          label="Reçu"
          filled={Boolean(request.receivedBy)}
          detail={request.receivedBy ?? "en attente"}
          date={request.receivedAt}
          last
        />
      </div>

      {editingComment ? (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            autoFocus
            rows={2}
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="w-full resize-none rounded-xl border border-[var(--color-gray-200)] bg-white px-3 py-2 text-sm text-[var(--color-gray-900)] placeholder:text-[var(--color-gray-400)] focus:border-[var(--brand-taupe-muted)] focus:outline-none"
          />
          <div className="flex gap-2">
            <Button variant="dark" className="px-3 py-1.5 text-xs" onClick={saveComment}>
              Enregistrer
            </Button>
            <button
              type="button"
              onClick={() => {
                setCommentDraft(request.comment ?? "");
                setEditingComment(false);
              }}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-[var(--color-gray-500)] hover:bg-[var(--color-gray-100)]"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-1.5">
          {request.comment && (
            <p className="flex items-start gap-1.5 text-sm italic text-[var(--color-gray-500)]">
              <CommentIcon className="mt-0.5 shrink-0" />
              {request.comment}
            </p>
          )}
          <button
            type="button"
            onClick={() => setEditingComment(true)}
            className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-[var(--color-gray-500)] hover:text-[var(--pos-accent-dark)]"
          >
            <CommentIcon />
            Commenter ⌄
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--color-gray-100)] pt-4">
        <div className="flex items-center gap-2">
          {!isSent && (
            <Button variant="dark" icon={<BoxIcon />} className="px-3 py-2 text-sm" onClick={() => onPrepare(request.id)}>
              Préparer
            </Button>
          )}
          {!isSent && (
            <button
              type="button"
              onClick={() => onCancel(request.id)}
              className="rounded-full px-3 py-2 text-sm font-medium text-[var(--color-error)] hover:bg-[#fdece9]"
            >
              Annuler
            </button>
          )}
        </div>
        <Badge variant={STATUS_BADGE_VARIANT[request.status]}>{REQUEST_STATUS_LABELS[request.status]}</Badge>
      </div>
    </Card>
  );
}
