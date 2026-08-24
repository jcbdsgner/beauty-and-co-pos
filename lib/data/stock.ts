/**
 * Mock data for the Stock module ("Gestion Depot") — vue d'ensemble multi-entreprises/salons,
 * demandes de reapprovisionnement, stock depot central, stock salon et historique des mouvements.
 */

export type ProductCategory =
  | "capillaire"
  | "visage"
  | "corps"
  | "maquillage"
  | "ongles"
  | "consommables";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  capillaire: "Capillaire",
  visage: "Soins Visage",
  corps: "Soins Corps",
  maquillage: "Maquillage",
  ongles: "Ongles",
  consommables: "Consommables",
};

export type ProductType = "revente" | "backbar";

export type Entreprise = { id: string; label: string };
export type Salon = { id: string; label: string; entrepriseId: string };

export const ENTREPRISES: Entreprise[] = [
  { id: "beauty-and-co", label: "Beauty and Co" },
  { id: "michele-ka", label: "Michele Ka" },
];

export const SALONS: Salon[] = [
  { id: "tous", label: "Tous les salons", entrepriseId: "beauty-and-co" },
  { id: "michele-ka-salon", label: "Michele Ka", entrepriseId: "michele-ka" },
  { id: "sea-plaza", label: "Sea Plaza", entrepriseId: "michele-ka" },
];

export type Product = {
  id: string;
  name: string;
  ref: string;
  category: ProductCategory;
  type: ProductType;
  /** Entreprise/depot central qui detient le stock de reference du produit. */
  entrepriseId: string;
  /** Quantite actuellement au depot central de cette entreprise. */
  depotStock: number;
  /** Seuil de reapprovisionnement (en dessous = "stock bas"). */
  min: number;
  /** Quantite suggeree a commander. */
  toOrder: number;
  /** Salon auquel ce produit est aussi rattache pour la vue "Salon" (optionnel). */
  salonId?: string;
  /** Quantite en stock dans ce salon. */
  salonStock?: number;
};

export const PRODUCTS: Product[] = [
  // Ruptures totales (0 en stock) — priorite maximale en Vue d'ensemble
  {
    id: "p-conditionneur-redken",
    name: "Conditionneur Redken 300ml",
    ref: "BC-CON-014",
    category: "capillaire",
    type: "revente",
    entrepriseId: "beauty-and-co",
    depotStock: 0,
    min: 5,
    toOrder: 5,
    salonId: "sea-plaza",
    salonStock: 0,
  },
  {
    id: "p-laque-fixation-forte",
    name: "Laque Fixation Forte 400ml",
    ref: "BC-LAQ-021",
    category: "capillaire",
    type: "revente",
    entrepriseId: "beauty-and-co",
    depotStock: 0,
    min: 6,
    toOrder: 8,
    salonId: "sea-plaza",
    salonStock: 0,
  },
  {
    id: "p-gel-coiffant",
    name: "Gel Coiffant Extra Strong",
    ref: "BC-GEL-009",
    category: "capillaire",
    type: "revente",
    entrepriseId: "beauty-and-co",
    depotStock: 0,
    min: 8,
    toOrder: 10,
  },
  {
    id: "p-masque-charbon",
    name: "Masque Charbon Detox Visage",
    ref: "BC-MSQ-017",
    category: "visage",
    type: "revente",
    entrepriseId: "beauty-and-co",
    depotStock: 0,
    min: 4,
    toOrder: 4,
  },
  {
    id: "p-creme-solaire",
    name: "Creme Solaire SPF50 Visage",
    ref: "BC-CRM-033",
    category: "visage",
    type: "revente",
    entrepriseId: "beauty-and-co",
    depotStock: 0,
    min: 5,
    toOrder: 5,
  },
  {
    id: "p-huile-seche-corps",
    name: "Huile Seche Corps Multi-Usage",
    ref: "BC-HUI-006",
    category: "corps",
    type: "revente",
    entrepriseId: "beauty-and-co",
    depotStock: 0,
    min: 4,
    toOrder: 4,
  },
  {
    id: "p-beurre-karite",
    name: "Beurre de Karite Pur 200g",
    ref: "BC-BEU-011",
    category: "corps",
    type: "revente",
    entrepriseId: "beauty-and-co",
    depotStock: 0,
    min: 10,
    toOrder: 10,
  },
  {
    id: "p-lotion-corporelle",
    name: "Lotion Corporelle Hydratante 500ml",
    ref: "BC-LOT-028",
    category: "corps",
    type: "revente",
    entrepriseId: "beauty-and-co",
    depotStock: 0,
    min: 6,
    toOrder: 6,
  },
  {
    id: "p-vernis-nude",
    name: "Vernis Semi-Permanent Nude",
    ref: "BC-VER-041",
    category: "ongles",
    type: "revente",
    entrepriseId: "beauty-and-co",
    depotStock: 0,
    min: 8,
    toOrder: 8,
    salonId: "michele-ka-salon",
    salonStock: 0,
  },
  {
    id: "p-top-coat",
    name: "Top Coat Brillance",
    ref: "BC-TOP-045",
    category: "ongles",
    type: "backbar",
    entrepriseId: "beauty-and-co",
    depotStock: 0,
    min: 8,
    toOrder: 8,
    salonId: "sea-plaza",
    salonStock: 2,
  },

  // Stock bas (sous le seuil, mais pas a zero) — visibles dans Depot/Salon avec plus de detail
  {
    id: "p-serum-olaplex",
    name: "Serum Anti-Casse Olaplex No.6",
    ref: "BC-SER-002",
    category: "capillaire",
    type: "revente",
    entrepriseId: "beauty-and-co",
    depotStock: 3,
    min: 3,
    toOrder: 6,
  },
  {
    id: "p-shampoing-blond",
    name: "Shampoing Blond Absolu 250ml",
    ref: "MK-SHP-002",
    category: "capillaire",
    type: "revente",
    entrepriseId: "michele-ka",
    depotStock: 0,
    min: 4,
    toOrder: 8,
  },
  {
    id: "p-shampoing-backbar",
    name: "Shampoing Neutre Backbar 1L",
    ref: "BC-SHB-008",
    category: "capillaire",
    type: "backbar",
    entrepriseId: "beauty-and-co",
    depotStock: 4,
    min: 6,
    toOrder: 4,
    salonId: "sea-plaza",
    salonStock: 1,
  },

  // Stock correct — variete pour les jauges de progression
  {
    id: "p-serum-eclat",
    name: "Serum eclat premium",
    ref: "MK-SER-018",
    category: "visage",
    type: "revente",
    entrepriseId: "michele-ka",
    depotStock: 43,
    min: 5,
    toOrder: 0,
    salonId: "sea-plaza",
    salonStock: 7,
  },
  {
    id: "p-huile-lavande",
    name: "Huile Essentielle Lavande 30ml",
    ref: "BC-HEL-052",
    category: "visage",
    type: "backbar",
    entrepriseId: "beauty-and-co",
    depotStock: 22,
    min: 6,
    toOrder: 0,
    salonId: "michele-ka-salon",
    salonStock: 5,
  },
  {
    id: "p-fond-de-teint",
    name: "Fond de Teint Fluide 30ml",
    ref: "BC-FDT-061",
    category: "maquillage",
    type: "revente",
    entrepriseId: "beauty-and-co",
    depotStock: 15,
    min: 5,
    toOrder: 0,
    salonId: "sea-plaza",
    salonStock: 6,
  },
  {
    id: "p-dissolvant",
    name: "Dissolvant Sans Acetone 200ml",
    ref: "BC-DIS-037",
    category: "ongles",
    type: "revente",
    entrepriseId: "beauty-and-co",
    depotStock: 9,
    min: 6,
    toOrder: 0,
    salonId: "michele-ka-salon",
    salonStock: 2,
  },
];

/** Chiffres agreges affiches en bandeau/KPI de la Vue d'ensemble — inventaire complet (225 produits), au-dela du sous-ensemble mocke ci-dessus. */
export const STOCK_SUMMARY = {
  totalProducts: 225,
  ruptures: 49,
  sousLeSeuil: 93,
  valeurStock: "21 670 000 F",
  aCommander: 122,
};

export type RequestStatus = "en_attente" | "preparation" | "envoye";

export type StockRequest = {
  id: string;
  productName: string;
  salonLabel: string;
  entrepriseLabel: string;
  qty: number;
  salonStock: number;
  depotStock: number;
  status: RequestStatus;
  requestedBy: string;
  requestedAt: string;
  sentBy?: string;
  sentAt?: string;
  receivedBy?: string;
  receivedAt?: string;
  comment?: string;
};

export const STOCK_REQUESTS: StockRequest[] = [
  {
    id: "req-1",
    productName: "Creme Coiffante Boucles",
    salonLabel: "Sea Plaza",
    entrepriseLabel: "Beauty and Co",
    qty: 5,
    salonStock: 2,
    depotStock: 0,
    status: "en_attente",
    requestedBy: "Margha Accueil",
    requestedAt: "3 avr., 14:46",
    comment: "urgent",
  },
  {
    id: "req-2",
    productName: "Vernis Semi-Permanent Nude",
    salonLabel: "Michele Ka",
    entrepriseLabel: "Beauty and Co",
    qty: 10,
    salonStock: 1,
    depotStock: 0,
    status: "en_attente",
    requestedBy: "Oumy",
    requestedAt: "4 avr., 08:30",
  },
  {
    id: "req-3",
    productName: "Shampoing Blond Absolu 250ml",
    salonLabel: "Michele Ka",
    entrepriseLabel: "Michele Ka",
    qty: 8,
    salonStock: 1,
    depotStock: 0,
    status: "preparation",
    requestedBy: "Codou",
    requestedAt: "2 avr., 09:12",
    sentBy: "Gestionnaire Stock",
    sentAt: "2 avr., 15:00",
  },
  {
    id: "req-4",
    productName: "Laque Fixation Forte 400ml",
    salonLabel: "Sea Plaza",
    entrepriseLabel: "Beauty and Co",
    qty: 6,
    salonStock: 0,
    depotStock: 0,
    status: "envoye",
    requestedBy: "Diarra",
    requestedAt: "1 avr., 09:40",
    sentBy: "Depot Beauty and Co",
    sentAt: "1 avr., 11:00",
  },
];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  en_attente: "En attente",
  preparation: "Preparation",
  envoye: "Envoyé",
};

/** Catalogue simplifie propose dans la modale "Envoi vers salon" (bouton "+ Ajouter"). */
export const TRANSFER_CATALOG: Array<{ id: string; name: string }> = PRODUCTS.map((p) => ({
  id: p.id,
  name: p.name,
}));
