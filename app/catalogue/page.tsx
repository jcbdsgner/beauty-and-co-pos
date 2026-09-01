"use client";

import { useState } from "react";
import { BoardHeader, VoletSwitch } from "@/components/ui/board";
import { CatalogueStyles } from "@/components/catalogue/catalogue-styles";
import { CataloguePhotos } from "@/components/catalogue/catalogue-photos";
import { CatalogueProduits } from "@/components/catalogue/catalogue-produits";
import { CatalogueBoissons } from "@/components/catalogue/catalogue-boissons";

/**
 * Catalogue — module de consultation autonome (docs/REFONTE-2.md §2.4). Quatre volets : Les Planches
 * (styles signature à montrer), Photos de référence, Produits (photo + stock restant, lecture) et
 * Boissons (le Bar Beauty & Co). Aucun lien avec l'encaissement — la baisse de stock se fait au Comptoir.
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
          { value: "produits", label: "Produits" },
          { value: "boissons", label: "Boissons" },
        ]}
      />
      {volet === "planches" && <CatalogueStyles />}
      {volet === "photos" && <CataloguePhotos />}
      {volet === "produits" && <CatalogueProduits />}
      {volet === "boissons" && <CatalogueBoissons />}
    </div>
  );
}
