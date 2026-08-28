"use client";

import { useState } from "react";
import { BoardHeader, VoletSwitch } from "@/components/ui/board";
import { CatalogueStyles } from "@/components/catalogue/catalogue-styles";
import { CataloguePhotos } from "@/components/catalogue/catalogue-photos";

/**
 * Catalogue — module de consultation autonome (docs/REFONTE-2.md §2.4). Deux volets : Les Planches
 * (styles signature à montrer) et Photos de référence. Aucun lien avec l'encaissement.
 */
export default function CataloguePage() {
  const [volet, setVolet] = useState("planches");

  return (
    <div className="flex flex-col gap-6">
      <BoardHeader section="Catalogue" context="À feuilleter avec la cliente — jamais relié à la caisse." />
      <VoletSwitch
        value={volet}
        onChange={setVolet}
        options={[
          { value: "planches", label: "Les Planches" },
          { value: "photos", label: "Photos de référence" },
        ]}
      />
      {volet === "planches" ? <CatalogueStyles /> : <CataloguePhotos />}
    </div>
  );
}
