"use client";

import { BoardHeader } from "@/components/ui/board";
import { RepertoireView } from "@/components/clientele/repertoire-view";

/**
 * Clientèle — recherche d'abord (docs/REFONTE-2.md §2.2). Chercher une cliente, ouvrir et tenir
 * sa fiche. Les relances (vue en lecture) vivent dans la section Messages.
 */
export default function ClientelePage() {
  return (
    <div className="flex flex-col gap-6">
      <BoardHeader section="Clientèle" />
      <RepertoireView />
    </div>
  );
}
