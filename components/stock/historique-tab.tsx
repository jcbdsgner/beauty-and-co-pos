"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pills, type PillOption } from "@/components/ui/pills";
import { PaperPlaneIcon, WarehouseIcon } from "@/components/stock/icons";
import { MOVEMENT_TYPE_LABELS, type StockMovement } from "@/lib/data/stock";

type SubFilter = "tout" | "transferts" | "receptions";

const SUB_FILTERS: PillOption[] = [
  { value: "tout", label: "Tout" },
  { value: "transferts", label: "Transferts" },
  { value: "receptions", label: "Réceptions" },
];

type HistoriqueTabProps = {
  movements: StockMovement[];
};

/** Onglet "Historique" — sous-filtres + 3 tuiles stats + liste des mouvements de la session (envois vers salon), etat vide sinon. */
export function HistoriqueTab({ movements }: HistoriqueTabProps) {
  const [filter, setFilter] = useState<SubFilter>("tout");

  const filtered = useMemo(() => {
    if (filter === "tout") return movements;
    if (filter === "transferts") return movements.filter((m) => m.type === "transfert");
    return movements.filter((m) => m.type === "reception");
  }, [movements, filter]);

  const transfertsCount = movements.filter((m) => m.type === "transfert").length;
  const receptionsCount = movements.filter((m) => m.type === "reception").length;

  return (
    <div className="flex flex-col gap-5">
      <Pills options={SUB_FILTERS} value={filter} onChange={(v) => setFilter(v as SubFilter)} />

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="font-[var(--font-heading)] text-2xl text-[var(--color-gray-900)]">{movements.length}</p>
          <p className="text-xs text-[var(--color-gray-500)]">Mouvements</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="font-[var(--font-heading)] text-2xl text-[var(--color-info)]">{transfertsCount}</p>
          <p className="text-xs text-[var(--color-gray-500)]">Transferts</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="font-[var(--font-heading)] text-2xl text-[var(--color-success)]">{receptionsCount}</p>
          <p className="text-xs text-[var(--color-gray-500)]">Réceptions</p>
        </Card>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<WarehouseIcon />} title="Aucun mouvement enregistré" />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((movement) => (
            <Card key={movement.id} className="flex items-center gap-3 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-info-soft)] text-[var(--color-info)]">
                <PaperPlaneIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--color-gray-900)]">{movement.productName}</p>
                <p className="text-xs text-[var(--color-gray-500)]">
                  {MOVEMENT_TYPE_LABELS[movement.type]} · Qté {movement.qty} · {movement.salonLabel} ·{" "}
                  {movement.entrepriseLabel}
                </p>
                {movement.note && <p className="mt-1 text-xs italic text-[var(--color-gray-400)]">{movement.note}</p>}
              </div>
              <span className="shrink-0 text-xs text-[var(--color-gray-400)]">{movement.date}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
