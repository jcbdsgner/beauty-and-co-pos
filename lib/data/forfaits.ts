import type { Service } from "@/lib/data/types";
import { serviceById } from "@/lib/data/menu";

/**
 * Forfaits — plans d'abonnement définis par la direction dans le back-office b&co. point-de-vente
 * ne fait que les lire : reflet verbatim de `b&co/lib/data/forfaits.ts` (ids, libellés, prix libre,
 * durée de cycle), comme le Menu reflète `booking-services.ts`. Un Forfait est le *plan* ;
 * l'engagement d'une cliente est un `Abonnement` (lib/data/abonnements.ts). ADR 0017.
 */
export type Forfait = {
  id: string;
  label: string;
  description: string;
  /** Valeur libre décidée par le salon, sans rapport avec la somme des prestations. Entier F CFA. */
  price: number;
  /** Affichage : « Mensuel », « Toutes les 6 semaines ». */
  cycleLabel: string;
  /** Entier — pilote tout le calcul d'échéance (lastPaidAt + cycleDays). */
  cycleDays: number;
  /** Réfs Service, jamais dupliquées ici. Chaque prestation = 1 fois par cycle. */
  prestationIds: string[];
};

export const FORFAITS: Forfait[] = [
  {
    id: "eclat-mensuel",
    label: "Abonnement Éclat Mensuel",
    description: "Un rituel complet à renouveler chaque mois : cheveux, visage et mains chouchoutés.",
    price: 65000,
    cycleLabel: "Mensuel",
    cycleDays: 30,
    prestationIds: [
      "coiffure-shampoing-brushing-shampoing-inclus-et-obligatoire",
      "soin-du-visage-glow-me-facial",
      "manucure-pedicure-vernis-simple-mains-classique-et-halal",
    ],
  },
  {
    id: "detente-spa",
    label: "Abonnement Détente Spa",
    description: "Une parenthèse détente chaque mois, entre massage du dos et réflexologie.",
    price: 90000,
    cycleLabel: "Mensuel",
    cycleDays: 30,
    prestationIds: ["spa-soin-du-dos", "spa-reflexology"],
  },
  {
    id: "mains-et-pieds",
    label: "Abonnement Mains & Pieds",
    description: "Mains et pieds toujours impeccables, sans jamais y repenser.",
    price: 55000,
    cycleLabel: "Toutes les 6 semaines",
    cycleDays: 42,
    prestationIds: [
      "manucure-pedicure-jelly-pedicure",
      "manucure-pedicure-manucure-spa-express",
      "onglerie-remplissage-gel",
    ],
  },
];

export function forfaitById(id: string): Forfait | undefined {
  return FORFAITS.find((f) => f.id === id);
}

/** Résout les prestationIds dans le Menu — jamais de prix au niveau d'un forfait (prix libre). */
export function forfaitPrestations(forfait: Forfait): Service[] {
  return forfait.prestationIds.map(serviceById).filter((s): s is Service => Boolean(s));
}
