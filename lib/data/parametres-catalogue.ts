import { formatFCFA } from "@/lib/data/clients";

export { formatFCFA };

/** Mock data for the Paramètres catalogue screens: Gestion Services, Gestion Produits,
 * Conseils beauté. Scoped to this module only (see AGENTS.md — another agent owns the
 * other components/parametres/* screens in the same directory, on its own files). */

// ---------------------------------------------------------------------------
// Shared "entreprise" / "dépôt" selectors (small local mirrors of the Planning
// module's pattern — kept here rather than imported so this module stays self
// contained and never touches files owned by the parallel agent).
// ---------------------------------------------------------------------------

export const COMPANY_OPTIONS = [{ value: "beauty-and-co", label: "Beauty and Co" }];

export const DEPOT_OPTIONS = [
  { value: "global", label: "Stock depot (global)" },
  { value: "almadies", label: "Salon Almadies" },
  { value: "sea-plaza", label: "Salon Sea Plaza" },
];

// ---------------------------------------------------------------------------
// Gestion Services
// ---------------------------------------------------------------------------

export type ServiceCategoryValue =
  | "coiffure"
  | "spa-massages"
  | "epilation"
  | "cils-sourcils"
  | "manucure-pedicure"
  | "soins-visage"
  | "nail-art";

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategoryValue, string> = {
  coiffure: "Coiffure",
  "spa-massages": "Spa & Massages",
  epilation: "Épilation",
  "cils-sourcils": "Cils & Sourcils",
  "manucure-pedicure": "Manucure / Pedicure",
  "soins-visage": "Soins Visage",
  "nail-art": "Nail art",
};

export const SERVICE_CATEGORY_OPTIONS: Array<{ value: ServiceCategoryValue; label: string }> = (
  Object.keys(SERVICE_CATEGORY_LABELS) as ServiceCategoryValue[]
).map((value) => ({ value, label: SERVICE_CATEGORY_LABELS[value] }));

export type Service = {
  id: string;
  name: string;
  /** Section header this card is grouped under — more granular than the pill category. */
  groupLabel: string;
  category: ServiceCategoryValue;
  price: number;
  durationMin: number;
  active: boolean;
};

export const SERVICES: Service[] = [
  { id: "srv-1", name: "Balayage californien", groupLabel: "Mèches & Balayage", category: "coiffure", price: 55000, durationMin: 120, active: true },
  { id: "srv-2", name: "Botox capillaire premium", groupLabel: "Soin Botox capillaire", category: "coiffure", price: 55000, durationMin: 90, active: true },
  { id: "srv-3", name: "Brushing", groupLabel: "Coiffure", category: "coiffure", price: 10000, durationMin: 30, active: true },
  { id: "srv-4", name: "Coloration", groupLabel: "Coiffure", category: "coiffure", price: 25000, durationMin: 90, active: true },
  { id: "srv-5", name: "Coupe femme", groupLabel: "Coiffure", category: "coiffure", price: 12000, durationMin: 45, active: true },
  { id: "srv-6", name: "Coupe homme", groupLabel: "Coiffure", category: "coiffure", price: 7000, durationMin: 30, active: true },
  { id: "srv-7", name: "Lissage brésilien", groupLabel: "Coiffure", category: "coiffure", price: 45000, durationMin: 150, active: true },
  { id: "srv-8", name: "Chignon soirée", groupLabel: "Coiffure", category: "coiffure", price: 18000, durationMin: 60, active: false },
  { id: "srv-9", name: "Massage relaxant 60 min", groupLabel: "Massages", category: "spa-massages", price: 30000, durationMin: 60, active: true },
  { id: "srv-10", name: "Bain hydromassant", groupLabel: "Spa", category: "spa-massages", price: 20000, durationMin: 45, active: true },
  { id: "srv-11", name: "Épilation jambes complètes", groupLabel: "Épilation cire", category: "epilation", price: 8000, durationMin: 30, active: true },
  { id: "srv-12", name: "Épilation maillot", groupLabel: "Épilation cire", category: "epilation", price: 5000, durationMin: 20, active: true },
  { id: "srv-13", name: "Rehaussement de cils", groupLabel: "Cils", category: "cils-sourcils", price: 15000, durationMin: 60, active: true },
  { id: "srv-14", name: "Restructuration sourcils", groupLabel: "Sourcils", category: "cils-sourcils", price: 6000, durationMin: 20, active: true },
  { id: "srv-15", name: "Manucure classique", groupLabel: "Manucure", category: "manucure-pedicure", price: 8000, durationMin: 40, active: true },
  { id: "srv-16", name: "Beauté des pieds complète", groupLabel: "Pédicure", category: "manucure-pedicure", price: 12000, durationMin: 50, active: true },
  { id: "srv-17", name: "Soin visage hydratant", groupLabel: "Soins Visage", category: "soins-visage", price: 22000, durationMin: 60, active: true },
  { id: "srv-18", name: "Nettoyage de peau profond", groupLabel: "Soins Visage", category: "soins-visage", price: 18000, durationMin: 45, active: true },
  { id: "srv-19", name: "Nail art motif simple", groupLabel: "Nail art", category: "nail-art", price: 3000, durationMin: 20, active: true },
  { id: "srv-20", name: "Vernis semi-permanent", groupLabel: "Nail art", category: "nail-art", price: 10000, durationMin: 40, active: true },
];

// ---------------------------------------------------------------------------
// Gestion Produits
// ---------------------------------------------------------------------------

export type ProductCategoryValue =
  | "capillaire"
  | "soins-visage"
  | "soins-corps"
  | "maquillage"
  | "ongles"
  | "consommables"
  | "outils-accessoires";

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategoryValue, string> = {
  capillaire: "Capillaire",
  "soins-visage": "Soins Visage",
  "soins-corps": "Soins Corps",
  maquillage: "Maquillage",
  ongles: "Ongles",
  consommables: "Consommables",
  "outils-accessoires": "Outils & Accessoires",
};

export const PRODUCT_CATEGORY_OPTIONS: Array<{ value: ProductCategoryValue; label: string }> = (
  Object.keys(PRODUCT_CATEGORY_LABELS) as ProductCategoryValue[]
).map((value) => ({ value, label: PRODUCT_CATEGORY_LABELS[value] }));

/** 2-level category tree shown in the "Categories produits" modal (chevron expand on L1). */
export type ProductCategoryNode = { label: string; children?: string[] };

export const PRODUCT_CATEGORY_TREE: ProductCategoryNode[] = [
  { label: "Capillaire", children: ["Shampooings", "Soins capillaires", "Colorations", "Styling"] },
  { label: "Soins Visage", children: ["Nettoyants", "Hydratants", "Anti-âge", "Masques"] },
  { label: "Soins Corps" },
  { label: "Maquillage" },
  { label: "Ongles" },
  { label: "Consommables" },
  { label: "Outils & Accessoires" },
];

export type ProductType = "revente" | "backbar";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: ProductCategoryValue;
  subCategory?: string;
  priceSale: number;
  priceCost: number;
  stock: number;
  lowStockThreshold: number;
  supplier?: string;
  productType: ProductType;
  foreignCurrency?: string;
  active: boolean;
};

export const PRODUCTS: Product[] = [
  {
    id: "prd-1",
    name: "Apres-shampoing Kerastase 200ml",
    sku: "BC-ASH-001",
    category: "capillaire",
    subCategory: "Soins capillaires",
    priceSale: 20000,
    priceCost: 10500,
    stock: 52,
    lowStockThreshold: 5,
    supplier: "Kerastase",
    productType: "revente",
    active: true,
  },
  {
    id: "prd-2",
    name: "ColorWow Dream Coat Anti-Humidity (200ml)",
    sku: "BC-CWD-001",
    category: "capillaire",
    subCategory: "Styling",
    priceSale: 28000,
    priceCost: 30205,
    stock: 0,
    lowStockThreshold: 5,
    supplier: "ColorWow USA",
    productType: "revente",
    foreignCurrency: "USD",
    active: true,
  },
  {
    id: "prd-3",
    name: "Shampoing Kerastase Nutritive 250ml",
    sku: "BC-SKN-002",
    category: "capillaire",
    subCategory: "Shampooings",
    priceSale: 18000,
    priceCost: 9500,
    stock: 34,
    lowStockThreshold: 8,
    supplier: "Kerastase",
    productType: "revente",
    active: true,
  },
  {
    id: "prd-4",
    name: "Coloration Majirel 60ml",
    sku: "BC-CMJ-003",
    category: "capillaire",
    subCategory: "Colorations",
    priceSale: 6500,
    priceCost: 3200,
    stock: 4,
    lowStockThreshold: 10,
    supplier: "L'Oréal Pro",
    productType: "backbar",
    active: true,
  },
  {
    id: "prd-5",
    name: "Gel Coiffant Extra Strong",
    sku: "BC-GCE-004",
    category: "capillaire",
    subCategory: "Styling",
    priceSale: 9000,
    priceCost: 4500,
    stock: 0,
    lowStockThreshold: 6,
    supplier: "L'Oréal Pro",
    productType: "revente",
    active: true,
  },
  {
    id: "prd-6",
    name: "Masque Charbon Detox Visage",
    sku: "BC-MCD-005",
    category: "soins-visage",
    subCategory: "Masques",
    priceSale: 15000,
    priceCost: 7800,
    stock: 0,
    lowStockThreshold: 4,
    supplier: "Nuxe",
    productType: "revente",
    active: true,
  },
  {
    id: "prd-7",
    name: "Creme Solaire SPF50 Visage",
    sku: "BC-CSF-006",
    category: "soins-visage",
    subCategory: "Hydratants",
    priceSale: 12000,
    priceCost: 6200,
    stock: 2,
    lowStockThreshold: 5,
    supplier: "Bioderma",
    productType: "revente",
    active: true,
  },
  {
    id: "prd-8",
    name: "Sérum Anti-âge Vitamine C",
    sku: "BC-SAV-007",
    category: "soins-visage",
    subCategory: "Anti-âge",
    priceSale: 24000,
    priceCost: 13000,
    stock: 11,
    lowStockThreshold: 4,
    supplier: "Nuxe",
    productType: "revente",
    active: true,
  },
  {
    id: "prd-9",
    name: "Huile Sèche Corps Multi-Usage",
    sku: "BC-HSC-008",
    category: "soins-corps",
    priceSale: 14000,
    priceCost: 7000,
    stock: 0,
    lowStockThreshold: 4,
    supplier: "Nuxe",
    productType: "revente",
    active: true,
  },
  {
    id: "prd-10",
    name: "Beurre de Karité Pur 200g",
    sku: "BC-BKP-009",
    category: "soins-corps",
    priceSale: 6000,
    priceCost: 2800,
    stock: 0,
    lowStockThreshold: 10,
    supplier: "Local Sénégal",
    productType: "revente",
    active: true,
  },
  {
    id: "prd-11",
    name: "Lotion Corporelle Hydratante 500ml",
    sku: "BC-LCH-010",
    category: "soins-corps",
    priceSale: 9500,
    priceCost: 5100,
    stock: 6,
    lowStockThreshold: 6,
    supplier: "Nivea",
    productType: "revente",
    active: true,
  },
  {
    id: "prd-12",
    name: "Rouge à lèvres Mat Longue Tenue",
    sku: "BC-RLM-011",
    category: "maquillage",
    priceSale: 8500,
    priceCost: 4200,
    stock: 18,
    lowStockThreshold: 5,
    supplier: "MAC",
    productType: "revente",
    active: true,
  },
  {
    id: "prd-13",
    name: "Vernis Semi-Permanent Nude",
    sku: "BC-VSN-012",
    category: "ongles",
    priceSale: 7500,
    priceCost: 3600,
    stock: 0,
    lowStockThreshold: 8,
    supplier: "OPI",
    productType: "revente",
    active: true,
  },
  {
    id: "prd-14",
    name: "Top Coat Brillance",
    sku: "BC-TCB-013",
    category: "ongles",
    priceSale: 6000,
    priceCost: 3000,
    stock: 0,
    lowStockThreshold: 8,
    supplier: "OPI",
    productType: "backbar",
    active: true,
  },
  {
    id: "prd-15",
    name: "Gants nitrile (boîte de 100)",
    sku: "BC-GNI-014",
    category: "consommables",
    priceSale: 4500,
    priceCost: 2200,
    stock: 22,
    lowStockThreshold: 5,
    supplier: "MedicoSN",
    productType: "backbar",
    active: true,
  },
  {
    id: "prd-16",
    name: "Serviettes jetables (paquet de 50)",
    sku: "BC-SVJ-015",
    category: "consommables",
    priceSale: 3500,
    priceCost: 1700,
    stock: 3,
    lowStockThreshold: 6,
    supplier: "MedicoSN",
    productType: "backbar",
    active: true,
  },
  {
    id: "prd-17",
    name: "Peignoir client réutilisable",
    sku: "BC-PCR-016",
    category: "outils-accessoires",
    priceSale: 0,
    priceCost: 12000,
    stock: 15,
    lowStockThreshold: 3,
    supplier: "TextilePro",
    productType: "backbar",
    active: false,
  },
];

export function isLowStock(product: Product) {
  return product.stock <= product.lowStockThreshold;
}

export function lowStockCount(products: Product[]) {
  return products.filter((product) => isLowStock(product)).length;
}

// ---------------------------------------------------------------------------
// Conseils beauté
// ---------------------------------------------------------------------------

export type CareFamilyValue =
  | "general"
  | "coiffure"
  | "soins-cheveux"
  | "ongles"
  | "pedicure"
  | "visage"
  | "epilation"
  | "massage-corps"
  | "cils";

export const CARE_FAMILY_LABELS: Record<CareFamilyValue, string> = {
  general: "Général",
  coiffure: "Coiffure",
  "soins-cheveux": "Soins cheveux",
  ongles: "Ongles",
  pedicure: "Pédicure",
  visage: "Visage",
  epilation: "Épilation",
  "massage-corps": "Massage & corps",
  cils: "Cils",
};

/** Filter tabs on the "Conseils beauté" list — excludes "Général" (used only in the create form). */
export const CARE_FAMILY_TAB_OPTIONS: Array<{ value: CareFamilyValue; label: string }> = (
  ["coiffure", "soins-cheveux", "ongles", "pedicure", "visage", "epilation", "massage-corps", "cils"] as CareFamilyValue[]
).map((value) => ({ value, label: CARE_FAMILY_LABELS[value] }));

/** Full chip grid for the "Nouveau conseil beauté" form (families, "Général" preselected). */
export const CARE_FAMILY_CHIP_OPTIONS: Array<{ value: CareFamilyValue; label: string }> = (
  Object.keys(CARE_FAMILY_LABELS) as CareFamilyValue[]
).map((value) => ({ value, label: CARE_FAMILY_LABELS[value] }));

export const SKIN_TYPE_OPTIONS = [
  { value: "normale", label: "normale" },
  { value: "seche", label: "sèche" },
  { value: "grasse", label: "grasse" },
  { value: "mixte", label: "mixte" },
  { value: "sensible", label: "sensible" },
  { value: "acneique", label: "acnéique" },
  { value: "mature", label: "mature" },
  { value: "deshydratee", label: "déshydratée" },
];

export const HAIR_TYPE_OPTIONS = [
  { value: "naturel", label: "Naturel" },
  { value: "lisse", label: "Lisse" },
  { value: "boucle", label: "Bouclé" },
  { value: "crepu", label: "Crépu" },
  { value: "defrise", label: "Défrisé" },
  { value: "tresse", label: "Tressé" },
  { value: "colore", label: "Coloré" },
  { value: "meche", label: "Mèché" },
];

export type BeautyTip = {
  id: string;
  /** Primary family used for the section label on the card ("MASSAGE & CORPS", "ONGLES"…). */
  family: CareFamilyValue;
  text: string;
  /** Optional audience targeting collected in the "Nouveau conseil beauté" form (values from
   * SKIN_TYPE_OPTIONS / HAIR_TYPE_OPTIONS). Empty/undefined = applies to everyone. */
  skinTypes?: string[];
  hairTypes?: string[];
};

export const BEAUTY_TIPS: BeautyTip[] = [
  { id: "tip-1", family: "massage-corps", text: "cinq minutes d'étirements le matin prolongent les bienfaits entre deux séances" },
  { id: "tip-2", family: "ongles", text: "portez des gants pour la vaisselle : le semi-permanent déteste l'eau chaude prolongée" },
  { id: "tip-3", family: "coiffure", text: "hydratez vos longueurs matin et soir pendant les 15 jours suivant la coloration" },
  { id: "tip-4", family: "visage", text: "appliquez votre crème sur peau encore légèrement humide pour mieux la faire pénétrer" },
];

export type ServiceCycleTip = {
  id: string;
  serviceName: string;
  text: string;
  /** Relance delay in days, undefined = "—" (pas de délai défini). */
  delayDays?: number;
};

export const SERVICE_CYCLE_TIPS: ServiceCycleTip[] = [
  { id: "cyc-1", serviceName: "Abonnement Cercle Ongles", text: "" },
  {
    id: "cyc-2",
    serviceName: "Bain hydromassant",
    text: "buvez beaucoup d'eau après votre séance pour prolonger ses bienfaits",
    delayDays: 30,
  },
  {
    id: "cyc-3",
    serviceName: "Balayage californien",
    text: "dormez avec un foulard ou une taie en satin pour préserver votre coiffure plus longtemps",
    delayDays: 28,
  },
  {
    id: "cyc-4",
    serviceName: "Beauté des pieds complète",
    text: "une goutte d'huile à cuticules chaque soir prolonge la tenue et la brillance",
    delayDays: 21,
  },
];
