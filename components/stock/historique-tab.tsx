"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pills, type PillOption } from "@/components/ui/pills";
import { WarehouseIcon } from "@/components/stock/icons";

type SubFilter = "tout" | "mouvements" | "transferts" | "receptions";

const SUB_FILTERS: PillOption[] = [
  { value: "tout", label: "Tout" },
  { value: "mouvements", label: "Mouvements" },
  { value: "transferts", label: "Transferts" },
  { value: "receptions", label: "Receptions" },
];

/** Onglet "Historique" — sous-filtres + 3 tuiles stats (toujours a 0 dans ce dataset mock) + etat vide. */
export function HistoriqueTab() {
  const [filter, setFilter] = useState<SubFilter>("tout");

  return (
    <div className="flex flex-col gap-5">
      <Pills options={SUB_FILTERS} value={filter} onChange={(v) => setFilter(v as SubFilter)} />

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="font-[var(--font-heading)] text-2xl text-[var(--color-gray-900)]">0</p>
          <p className="text-xs text-[var(--color-gray-500)]">Mouvements</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="font-[var(--font-heading)] text-2xl text-[var(--color-info)]">0</p>
          <p className="text-xs text-[var(--color-gray-500)]">Transferts</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="font-[var(--font-heading)] text-2xl text-[var(--color-success)]">0</p>
          <p className="text-xs text-[var(--color-gray-500)]">Receptions</p>
        </Card>
      </div>

      <EmptyState icon={<WarehouseIcon />} title="Aucun mouvement enregistre" />
    </div>
  );
}
