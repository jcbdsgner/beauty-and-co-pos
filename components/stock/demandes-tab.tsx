"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Pills, type PillOption } from "@/components/ui/pills";
import { ClockIcon } from "@/components/stock/icons";
import { RequestCard } from "@/components/stock/request-card";
import type { RequestStatus, StockRequest } from "@/lib/data/stock";

type SubFilter = RequestStatus | "toutes";

const SUB_FILTERS: PillOption[] = [
  { value: "en_attente", label: "En attente" },
  { value: "preparation", label: "Preparation" },
  { value: "envoye", label: "Envoyé" },
  { value: "toutes", label: "Toutes" },
];

type DemandesTabProps = {
  requests: StockRequest[];
  onPrepare: (id: string) => void;
  onCancel: (id: string) => void;
  onEditQty: (id: string, qty: number) => void;
  onEditComment: (id: string, comment: string) => void;
};

/** Onglet "Demandes" — sous-filtres par statut + liste de demandes avec timeline et actions Preparer/Annuler. Les demandes elles-memes sont detenues par la page parente (le badge de compteur du bandeau d'onglets en depend). */
export function DemandesTab({ requests, onPrepare, onCancel, onEditQty, onEditComment }: DemandesTabProps) {
  const [filter, setFilter] = useState<SubFilter>("en_attente");

  const filtered = useMemo(
    () => (filter === "toutes" ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter],
  );

  return (
    <div className="flex flex-col gap-5">
      <Pills options={SUB_FILTERS} value={filter} onChange={(v) => setFilter(v as SubFilter)} />

      {filtered.length === 0 ? (
        <EmptyState icon={<ClockIcon className="size-12" />} title="Aucune demande dans cette catégorie" />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onPrepare={onPrepare}
              onCancel={onCancel}
              onEditQty={onEditQty}
              onEditComment={onEditComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
