/** Mock catalogue for the Lookbook module — styles & soins proposables aux clientes. */

export type LookbookCategory =
  | "coiffure"
  | "soins-cheveux"
  | "ongles"
  | "pedicure"
  | "soin-visage"
  | "epilation"
  | "massage";

export type LookbookItem = {
  id: string;
  title: string;
  category: LookbookCategory;
  /** Prix en FCFA. */
  price: number;
  trending?: boolean;
};

export const LOOKBOOK_CATEGORY_LABELS: Record<LookbookCategory, string> = {
  coiffure: "Coiffure",
  "soins-cheveux": "Soins cheveux",
  ongles: "Ongles",
  pedicure: "Pédicure",
  "soin-visage": "Soin visage",
  epilation: "Épilation",
  massage: "Massage",
};

export const LOOKBOOK_ITEMS: LookbookItem[] = [
  // Coiffure
  { id: "coif-1", title: "Closure Behind The Hair Line", category: "coiffure", price: 74900, trending: true },
  { id: "coif-2", title: "Knotless Braids", category: "coiffure", price: 69000, trending: true },
  { id: "coif-3", title: "Silk Press", category: "coiffure", price: 79000 },
  { id: "coif-4", title: "Coiffure Mariée", category: "coiffure", price: 89000 },
  { id: "coif-5", title: "Extensions aux Fils", category: "coiffure", price: 129000 },
  { id: "coif-6", title: "Tissage Versatile", category: "coiffure", price: 56000 },

  // Ongles
  { id: "ong-1", title: "Finition Cat Eye / Chrome / Baby…", category: "ongles", price: 10000, trending: true },
  { id: "ong-2", title: "Perfect Manucure Russe", category: "ongles", price: 43000, trending: true },
  { id: "ong-3", title: "Gel-X — extensions légères", category: "ongles", price: 36000 },
  { id: "ong-4", title: "Luxury Manicure Spa", category: "ongles", price: 32000 },

  // Soin visage
  { id: "visage-1", title: "Glow Me — Coup d'Éclat", category: "soin-visage", price: 49000, trending: true },
  { id: "visage-2", title: "Golden VIP Facial", category: "soin-visage", price: 80000, trending: true },
  { id: "visage-3", title: "Acne Treatment — cure 4 séances", category: "soin-visage", price: 49000 },
  { id: "visage-4", title: "Face Lift and Glow", category: "soin-visage", price: 59000 },
  { id: "visage-5", title: "Hydrafacial Deep Clean", category: "soin-visage", price: 55000 },
  { id: "visage-6", title: "Hydrate Me and Restore", category: "soin-visage", price: 54000 },

  // Épilation
  { id: "epil-1", title: "Pack Épilation Complète", category: "epilation", price: 45000, trending: true },
  { id: "epil-2", title: "Soin Vagifacial", category: "epilation", price: 34000, trending: true },

  // Massage
  { id: "mass-1", title: "Hot Stone — Pierres Chaudes", category: "massage", price: 59000, trending: true },
  { id: "mass-2", title: "Pure Délice", category: "massage", price: 90000, trending: true },
  { id: "mass-3", title: "De-Stress Relaxant", category: "massage", price: 45000 },
  { id: "mass-4", title: "Deep Tonique", category: "massage", price: 49000 },
  { id: "mass-5", title: "Reflexology", category: "massage", price: 49000 },
  { id: "mass-6", title: "Steam Time — Gommage +…", category: "massage", price: 40000 },
];

export function formatLookbookPrice(price: number) {
  return `${new Intl.NumberFormat("fr-FR").format(price)} FCFA`;
}
