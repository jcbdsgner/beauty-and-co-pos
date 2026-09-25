import { bookingServices } from "@/lib/prise-rdv/data/booking-services";
import { toSentenceCase } from "@/lib/prise-rdv/utils";

export type Forfait = {
  id: string;
  label: string;
  image: string;
  /** Vidéo de fond en boucle pour la card carousel, en remplacement de `image` — `image` reste le poster/fallback. */
  video?: string;
  description: string;
  /** Valeur libre décidée par le salon, indépendante de la somme des prix des Prestations incluses. */
  price: number;
  cycleLabel: string;
  cycleDays: number;
  /** Ids de BookingSubService, résolus dans bookingServices à l'affichage — jamais dupliqués ici. */
  prestationIds: string[];
};

export const forfaits: Forfait[] = [
  {
    id: "eclat-mensuel",
    label: "Abonnement Éclat Mensuel",
    image: "/images/accueil/gallery-6.png",
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
    image: "/images/accueil/forfait-detente-spa-poster.jpg",
    video: "/videos/forfait-detente-spa.mp4",
    description: "Une parenthèse détente chaque mois, entre massage du dos et réflexologie.",
    price: 90000,
    cycleLabel: "Mensuel",
    cycleDays: 30,
    prestationIds: ["spa-soin-du-dos", "spa-reflexology"],
  },
  {
    id: "mains-et-pieds",
    label: "Abonnement Mains & Pieds",
    image: "/images/accueil/gallery-1.png",
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

export type ForfaitPrestation = {
  id: string;
  label: string;
  categoryId: string;
  categoryLabel: string;
  /** Texte marketing de la Prestation dans le catalogue, absent pour certaines — jamais de prix ni de durée ici : le Forfait a un prix libre, indépendant de la somme de ses Prestations. */
  description?: string;
};

/** Résout les prestationIds d'un Forfait dans le catalogue — jamais de prix ni de durée : seuls le nom, sa description marketing et sa Catégorie d'origine comptent ici. */
export function getForfaitPrestations(forfait: Forfait): ForfaitPrestation[] {
  const prestations: ForfaitPrestation[] = [];

  for (const category of bookingServices) {
    for (const sub of category.subServices) {
      if (!forfait.prestationIds.includes(sub.id)) continue;
      prestations.push({
        id: sub.id,
        label: toSentenceCase(sub.label),
        categoryId: category.id,
        categoryLabel: category.label,
        description: sub.description,
      });
    }
  }

  return prestations;
}
