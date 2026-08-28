"use client";

import { useState } from "react";
import { BoardHeader, VoletSwitch } from "@/components/ui/board";
import { FlipChip } from "@/components/ui/board";
import { TourneeMatinTab } from "@/components/relances/tournee-matin-tab";
import { EnvoisGroupesTab } from "@/components/relances/envois-groupes-tab";
import { ContenuConseillereTab } from "@/components/relances/contenu-conseillere-tab";
import { useAppData } from "@/components/providers/app-data-provider";

/**
 * Relances — la relation cliente pilotée dans le temps (docs/REFONTE-2.md §2.3). Trois volets :
 * La Tournée du matin (défaut, geste quotidien), Envois groupés (Campagnes), Contenu conseillère.
 */
export default function RelancesPage() {
  const [volet, setVolet] = useState("tournee");
  const { relances } = useAppData();
  const aTraiter = relances.filter((r) => r.status === "en_attente" || r.status === "autorisee").length;

  return (
    <div className="flex flex-col gap-6">
      <BoardHeader
        section="Relances"
        context={aTraiter > 0 ? `${aTraiter} message${aTraiter > 1 ? "s" : ""} à traiter ce matin.` : "Tournée à jour."}
      />
      <VoletSwitch
        value={volet}
        onChange={setVolet}
        options={[
          {
            value: "tournee",
            label: "La Tournée du matin",
            badge: aTraiter > 0 ? <FlipChip value={String(aTraiter)} tone="signal" className="min-w-0 px-1.5" /> : undefined,
          },
          { value: "envois", label: "Envois groupés" },
          { value: "conseillere", label: "Contenu conseillère" },
        ]}
      />
      {volet === "tournee" && <TourneeMatinTab />}
      {volet === "envois" && <EnvoisGroupesTab />}
      {volet === "conseillere" && <ContenuConseillereTab />}
    </div>
  );
}
