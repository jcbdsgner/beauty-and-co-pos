"use client";

import { useState } from "react";
import { CatalogueSwitch } from "@/components/catalogue/catalogue-parts";
import { CatalogueProduits } from "@/components/catalogue/catalogue-produits";
import { CatalogueBoissons } from "@/components/catalogue/catalogue-boissons";

/**
 * Catalogue — module de consultation autonome (ADR 0021). Deux volets, en vitrine plutôt qu'en
 * tableau : Produits (photo + stock restant) et Boissons (le Bar Beauty & Co). Aucun lien avec
 * l'encaissement — la baisse de stock se fait au Comptoir.
 */
export default function CataloguePage() {
  const [volet, setVolet] = useState<"produits" | "boissons">("produits");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4 pl-1">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-[30px] font-medium leading-[30px] tracking-[-0.02em] text-[var(--color-gray-900)]">
            Catalogue
          </h1>
        </div>
        <CatalogueSwitch
          value={volet}
          onChange={setVolet}
          options={[
            { value: "produits", label: "Produits" },
            { value: "boissons", label: "Boissons" },
          ]}
        />
      </div>

      {volet === "produits" ? <CatalogueProduits /> : <CatalogueBoissons />}
    </div>
  );
}
