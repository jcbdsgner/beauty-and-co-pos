"use client";

import { BoardHeader } from "@/components/ui/board";
import { RepertoireView } from "@/components/clientele/repertoire-view";
import { useAppData } from "@/components/providers/app-data-provider";

/**
 * Clientèle — recherche d'abord (docs/REFONTE-2.md §2.2). Chercher une cliente, ouvrir et tenir
 * sa fiche. La tournée de relance et les campagnes vivent dans la section Relances.
 */
export default function ClientelePage() {
  const { clients } = useAppData();

  return (
    <div className="flex flex-col gap-6">
      <BoardHeader
        section="Clientèle"
        context={`${clients.length} cliente${clients.length > 1 ? "s" : ""} au répertoire.`}
      />
      <RepertoireView />
    </div>
  );
}
