import type { Service } from "@/lib/data/types";
import { serviceById } from "@/lib/data/menu";

/**
 * Packs — ensembles fixes de prestations prépayées, définis par la direction dans le back-office
 * b&co. Reflet verbatim de `b&co/lib/data/packs.ts`. Un Pack est le *modèle* ; l'achat d'une
 * cliente est un `PackPurchase` (lib/data/pack-purchases.ts). Le prix est **dérivé** : −20 % de la
 * somme à l'unité, arrondi au multiple de 500. ADR 0017.
 */
export type Pack = {
  id: string;
  label: string;
  description: string;
  /** Réfs Service, jamais dupliquées ici. */
  prestationIds: string[];
};

export const PACKS: Pack[] = [
  {
    id: "eclat-express",
    label: "Pack Éclat Express",
    description: "Brushing, vernis et sourcils nets pour un look soigné en un seul passage.",
    prestationIds: [
      "coiffure-shampoing-brushing-shampoing-inclus-et-obligatoire",
      "manucure-pedicure-vernis-simple-mains-classique-et-halal",
      "epilation-epilation-sourcils",
    ],
  },
  {
    id: "cocooning-duo",
    label: "Pack Cocooning Duo",
    description: "Soin du dos et réflexologie : une vraie parenthèse détente.",
    prestationIds: ["spa-soin-du-dos", "spa-reflexology"],
  },
  {
    id: "beaute-des-mains",
    label: "Pack Beauté des Mains",
    description: "Manucure, pédicure et remplissage gel pour des mains et pieds impeccables.",
    prestationIds: [
      "manucure-pedicure-manucure-spa-express",
      "manucure-pedicure-pedicure-me-spa",
      "onglerie-remplissage-gel",
    ],
  },
  {
    id: "glow-total",
    label: "Pack Glow Total",
    description: "Facial éclat, épilation complète et manucure russe pour un glow total.",
    prestationIds: [
      "soin-du-visage-glow-me-facial",
      "epilation-pack-epilations-completes",
      "manucure-pedicure-manucure-russe-sans-vernis-sans-gel",
    ],
  },
];

export function packById(id: string): Pack | undefined {
  return PACKS.find((p) => p.id === id);
}

/** Résout les prestationIds dans le Menu, avec leur prix à l'unité. */
export function packPrestations(pack: Pack): Service[] {
  return pack.prestationIds.map(serviceById).filter((s): s is Service => Boolean(s));
}

/** Somme des prix à l'unité des prestations incluses. */
export function packIndividualTotal(pack: Pack): number {
  return packPrestations(pack).reduce((sum, s) => sum + s.price, 0);
}

/** Prix packagé — 20 % moins cher que la somme à l'unité, arrondi au multiple de 500. */
export function packPrice(pack: Pack): number {
  return Math.round((packIndividualTotal(pack) * 0.8) / 500) * 500;
}
