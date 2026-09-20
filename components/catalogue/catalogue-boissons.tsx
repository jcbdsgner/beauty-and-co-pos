"use client";

import { useState } from "react";
import { CatalogueCard, CatalogueEmpty } from "@/components/catalogue/catalogue-parts";
import { CatalogueLightbox } from "@/components/catalogue/catalogue-lightbox";
import { BOISSONS } from "@/lib/data/boissons";

/**
 * Boissons — le Bar Beauty & Co, en lecture : chaque boisson avec sa photo, sa composition et son
 * prix. On feuillette avec la cliente pendant qu'elle patiente ; l'ajout au panier se fait au
 * Comptoir (onglet « Boissons » du Menu). Les mêmes références que la prise de RDV b&co. Cartes
 * « menu » (ADR 0021) — pas de rail, pas de catégorie : le bar n'en a pas.
 */
export function CatalogueBoissons() {
  const boissons = BOISSONS.filter((b) => b.active);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (boissons.length === 0) {
    return <CatalogueEmpty title="Aucune boisson" hint="Le bar n'a rien à la carte pour le moment." />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-base-content/60">
        {`${boissons.length} boisson${boissons.length > 1 ? "s" : ""} au Bar Beauty & Co`}
      </p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {boissons.map((b, i) => (
          <CatalogueCard
            key={b.id}
            name={b.name}
            price={b.price}
            image={b.image}
            imageBg="bg-accent"
            description={b.description}
            onOpen={() => setOpenIndex(i)}
          />
        ))}
      </div>

      <p className="text-center text-xs text-base-content/45">Lait avec ou sans lactose au choix.</p>

      <CatalogueLightbox
        items={boissons.map((b) => ({ id: b.id, name: b.name, price: b.price, image: b.image, description: b.description }))}
        index={openIndex}
        onNavigate={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </div>
  );
}
