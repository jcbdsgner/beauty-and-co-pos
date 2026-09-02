"use client";

import { useState } from "react";
import { BoardHeader } from "@/components/ui/board";
import { Tabs } from "@/components/ui/molecules/tabs";
import { ProfilView } from "@/components/compte/profil-view";
import { SecuriteView } from "@/components/compte/securite-view";

/**
 * Mon compte — les seuls écrans « moi » de l'app (il n'y a pas de section Réglages, voir ADR 0001).
 * Atteint depuis le menu identité du pied de sidebar. Tout est simulé, aucun compte réel.
 */
export default function ComptePage() {
  const [tab, setTab] = useState("profil");

  return (
    <div className="flex flex-col gap-7">
      <BoardHeader section="Compte" />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "profil", label: "Profil", content: <ProfilView /> },
          { value: "securite", label: "Sécurité", content: <SecuriteView /> },
        ]}
      />
    </div>
  );
}
