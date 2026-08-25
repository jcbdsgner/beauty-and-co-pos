// Mock data for the Vente & Paiement (POS) module. No backend — everything here is local,
// in-memory fixture data used only by app/(app)/vente/page.tsx and components/vente/**.

export type CategoryIcon = "coiffure" | "spa" | "epilation" | "cils" | "manucure" | "visage" | "nailart";

export type Service = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  subcat: string;
};

export type Category = {
  id: string;
  name: string;
  icon: CategoryIcon;
  bg: string;
  count: number;
};

export type ClientBadge = { label: string; variant: "vip" | "gold" | "silver" };

export type Client = {
  id: string;
  initial: string;
  name: string;
  phone: string;
  points: number;
  badge?: ClientBadge;
};

export type CartItem = {
  id: string;
  serviceId: string;
  name: string;
  unitPrice: number;
  qty: number;
  practitioner: string | null;
};

export type PaymentMethodId = "wave" | "orange_money" | "especes" | "carte";

export type Sale = {
  id: string;
  name: string;
  client: Client | null;
  cart: CartItem[];
  discountCode: string;
  promoApplied: { code: string; percent: number } | null;
  loyaltyPointsUsed: number;
  managerCode: string;
  managerDiscountApplied: number;
  paymentMethod: PaymentMethodId | null;
  mixedPayment: boolean;
  mixedMethod2: PaymentMethodId | null;
  mixedAmount1: string;
  mixedAmount2: string;
};

/** Raw service catalogue — category counters (below) are derived from this, single source of truth. */
export const SERVICES: Service[] = [
  // Coiffure (8)
  { id: "svc-brushing", name: "Brushing", price: 10000, categoryId: "coiffure", subcat: "Coiffage" },
  { id: "svc-coloration", name: "Coloration", price: 35000, categoryId: "coiffure", subcat: "Coloration & Mèches" },
  { id: "svc-coupe-femme", name: "Coupe femme", price: 15000, categoryId: "coiffure", subcat: "Coupes" },
  { id: "svc-coupe-homme", name: "Coupe homme", price: 8000, categoryId: "coiffure", subcat: "Coupes" },
  { id: "svc-lissage", name: "Lissage brésilien", price: 75000, categoryId: "coiffure", subcat: "Soins cheveux" },
  { id: "svc-tissage", name: "Tissage", price: 50000, categoryId: "coiffure", subcat: "Coiffage" },
  { id: "svc-tresse", name: "Tresse", price: 45000, categoryId: "coiffure", subcat: "Coiffage" },
  { id: "svc-balayage", name: "Balayage californien", price: 55000, categoryId: "coiffure", subcat: "Coloration & Mèches" },

  // Spa & Massages (4)
  { id: "svc-massage-relaxant", name: "Massage relaxant 60min", price: 30000, categoryId: "spa", subcat: "Massages" },
  { id: "svc-massage-duo", name: "Massage duo", price: 55000, categoryId: "spa", subcat: "Massages" },
  { id: "svc-soin-dos", name: "Soin du dos", price: 20000, categoryId: "spa", subcat: "Soins" },
  { id: "svc-reflexologie", name: "Réflexologie plantaire", price: 15000, categoryId: "spa", subcat: "Soins" },

  // Epilation (6)
  { id: "svc-epil-sourcils", name: "Épilation sourcils", price: 3000, categoryId: "epilation", subcat: "Visage" },
  { id: "svc-epil-levre", name: "Épilation lèvre", price: 2000, categoryId: "epilation", subcat: "Visage" },
  { id: "svc-epil-aisselles", name: "Épilation aisselles", price: 5000, categoryId: "epilation", subcat: "Corps" },
  { id: "svc-epil-jambes", name: "Épilation jambes complètes", price: 15000, categoryId: "epilation", subcat: "Corps" },
  { id: "svc-epil-maillot", name: "Épilation maillot", price: 8000, categoryId: "epilation", subcat: "Corps" },
  { id: "svc-epil-bras", name: "Épilation bras", price: 7000, categoryId: "epilation", subcat: "Corps" },

  // Cils & Sourcils (6)
  { id: "svc-rehaussement-cils", name: "Rehaussement de cils", price: 15000, categoryId: "cils-sourcils", subcat: "Cils" },
  { id: "svc-extension-cils", name: "Extension de cils", price: 25000, categoryId: "cils-sourcils", subcat: "Cils" },
  { id: "svc-lifting-cils", name: "Lifting de cils", price: 20000, categoryId: "cils-sourcils", subcat: "Cils" },
  { id: "svc-teinture-cils", name: "Teinture cils", price: 5000, categoryId: "cils-sourcils", subcat: "Cils" },
  { id: "svc-teinture-sourcils", name: "Teinture sourcils", price: 5000, categoryId: "cils-sourcils", subcat: "Sourcils" },
  { id: "svc-restructuration-sourcils", name: "Restructuration sourcils", price: 7000, categoryId: "cils-sourcils", subcat: "Sourcils" },

  // Manucure / Pedicure (7)
  { id: "svc-manucure-classique", name: "Manucure classique", price: 5000, categoryId: "manucure-pedicure", subcat: "Manucure" },
  { id: "svc-pose-gel", name: "Pose gel", price: 12000, categoryId: "manucure-pedicure", subcat: "Manucure" },
  { id: "svc-pose-semi-permanent", name: "Pose vernis semi-permanent", price: 10000, categoryId: "manucure-pedicure", subcat: "Manucure" },
  { id: "svc-depose-vernis", name: "Dépose vernis", price: 2000, categoryId: "manucure-pedicure", subcat: "Manucure" },
  { id: "svc-pedicure-classique", name: "Pédicure classique", price: 7000, categoryId: "manucure-pedicure", subcat: "Pédicure" },
  { id: "svc-beaute-pieds", name: "Beauté des pieds", price: 8000, categoryId: "manucure-pedicure", subcat: "Pédicure" },
  { id: "svc-manu-pedi", name: "Manucure + pédicure", price: 15000, categoryId: "manucure-pedicure", subcat: "Formules" },

  // Soins Visage (6)
  { id: "svc-nettoyage-peau", name: "Nettoyage de peau", price: 15000, categoryId: "soins-visage", subcat: "Nettoyage" },
  { id: "svc-gommage-visage", name: "Gommage visage", price: 10000, categoryId: "soins-visage", subcat: "Nettoyage" },
  { id: "svc-masque-purifiant", name: "Masque purifiant", price: 12000, categoryId: "soins-visage", subcat: "Nettoyage" },
  { id: "svc-soin-hydratant", name: "Soin hydratant", price: 18000, categoryId: "soins-visage", subcat: "Hydratation" },
  { id: "svc-soin-anti-age", name: "Soin anti-âge", price: 25000, categoryId: "soins-visage", subcat: "Anti-âge" },
  { id: "svc-soin-eclat", name: "Soin éclat", price: 20000, categoryId: "soins-visage", subcat: "Éclat" },

  // Nail art (0) — intentionally empty, matches the Figma capture.
];

/** Flat product catalogue for the "Produits" tab (retail items, not prestations). */
export const PRODUCTS: Service[] = [
  { id: "prd-shampoing", name: "Shampoing hydratant", price: 6000, categoryId: "produits", subcat: "Produits" },
  { id: "prd-apres-shampoing", name: "Après-shampoing réparateur", price: 6500, categoryId: "produits", subcat: "Produits" },
  { id: "prd-serum", name: "Sérum capillaire", price: 8000, categoryId: "produits", subcat: "Produits" },
  { id: "prd-gel-coiffant", name: "Gel coiffant", price: 4000, categoryId: "produits", subcat: "Produits" },
  { id: "prd-huile-argan", name: "Huile d'argan", price: 7000, categoryId: "produits", subcat: "Produits" },
  { id: "prd-vernis", name: "Vernis semi-permanent", price: 5000, categoryId: "produits", subcat: "Produits" },
];

function countFor(categoryId: string) {
  return SERVICES.filter((service) => service.categoryId === categoryId).length;
}

export type ServiceGroup = { subcat: string; services: Service[] };

/** Groups a flat service list into subcategory sections (first-appearance order) — used by the
 * "categories" landing step to show the full browsable catalogue under the category grid,
 * matching the Figma capture where the grid isn't the only way to reach a service. */
export function groupServicesBySubcat(services: Service[]): ServiceGroup[] {
  const order: string[] = [];
  const map = new Map<string, Service[]>();
  for (const service of services) {
    if (!map.has(service.subcat)) {
      map.set(service.subcat, []);
      order.push(service.subcat);
    }
    map.get(service.subcat)!.push(service);
  }
  return order.map((subcat) => ({ subcat, services: map.get(subcat)! }));
}

export const CATEGORIES: Category[] = [
  { id: "coiffure", name: "Coiffure", icon: "coiffure", bg: "bg-[var(--brand-rose-soft)]", count: countFor("coiffure") },
  { id: "spa", name: "Spa & Massages", icon: "spa", bg: "bg-[var(--brand-lilac)]/30", count: countFor("spa") },
  { id: "epilation", name: "Epilation", icon: "epilation", bg: "bg-[var(--color-gray-100)]", count: countFor("epilation") },
  { id: "cils-sourcils", name: "Cils & Sourcils", icon: "cils", bg: "bg-[var(--pos-accent-dark-soft)]", count: countFor("cils-sourcils") },
  { id: "manucure-pedicure", name: "Manucure / Pedicure", icon: "manucure", bg: "bg-[var(--brand-rose-soft)]", count: countFor("manucure-pedicure") },
  { id: "soins-visage", name: "Soins Visage", icon: "visage", bg: "bg-[var(--brand-lilac)]/30", count: countFor("soins-visage") },
  { id: "nail-art", name: "Nail art", icon: "nailart", bg: "bg-[var(--color-gray-100)]", count: countFor("nail-art") },
];

export const CLIENTS: Client[] = [
  { id: "cli-awa-test", initial: "AT", name: "Awa Test", phone: "+221781208686", points: 180 },
  { id: "cli-fatou-test", initial: "FT", name: "Fatou Test", phone: "+221781208686", points: 0 },
  { id: "cli-coumba-test", initial: "CT", name: "Coumba Test", phone: "+221781208686", points: 75 },
  { id: "cli-bineta-test", initial: "BT", name: "Bineta Test", phone: "+221781208686", points: 25 },
  { id: "cli-mariam-test", initial: "MT", name: "Mariam Test", phone: "+221781208686", points: 0 },
  {
    id: "cli-awa-niang",
    initial: "AN",
    name: "Awa Niang",
    phone: "+221 78 100 00 05",
    points: 1175,
    badge: { label: "VIP", variant: "vip" },
  },
  {
    id: "cli-sokhna-ndiaye",
    initial: "SN",
    name: "Sokhna Ndiaye",
    phone: "+221 77 500 00 12",
    points: 620,
    badge: { label: "GOLD", variant: "gold" },
  },
];

// The logged-in cashier ("Propriétaire", per SALON.cashier below) always heads the list — cart
// lines default to them (see createCartItem) rather than an unassigned placeholder, matching the
// Figma capture where every new line already reads "✂ Propriétaire" until reassigned.
export const PRACTITIONERS: string[] = ["Propriétaire", "Fatou", "Bineta", "William", "Michelle", "Codou"];

export const PAYMENT_METHODS: { id: PaymentMethodId; label: string }[] = [
  { id: "wave", label: "Wave" },
  { id: "orange_money", label: "Orange Money" },
  { id: "especes", label: "Espèces" },
  { id: "carte", label: "Carte" },
];

export const SALON = {
  name: "Beauty and Co",
  area: "Almadies",
  address: "Route des Almadies, Dakar",
  phone: "+221 33 820 00 01",
  cashier: "Propriétaire",
};

export function formatFcfa(amount: number) {
  return `${Math.round(amount).toLocaleString("fr-FR")} F`;
}

/**
 * Fresh empty sale — used both for the first tab and every "+" click. `seq` (1-based) drives
 * the "Vente N" label and must be supplied by the caller (sales.length + 1, or 1 to reset) —
 * deliberately NOT a module-level counter, which under React Strict Mode's double-invocation
 * of state initializers produced a server/client hydration mismatch (SSR saw "Vente 1", the
 * client's doubled initializer call landed on "Vente 2"). `Date.now()` is safe here since it
 * only feeds the id (never rendered as text), giving uniqueness without affecting hydration.
 */
export function createSale(seq: number): Sale {
  return {
    id: `sale-${seq}-${Date.now()}`,
    name: `Vente ${seq}`,
    client: null,
    cart: [],
    discountCode: "",
    promoApplied: null,
    loyaltyPointsUsed: 0,
    managerCode: "",
    managerDiscountApplied: 0,
    paymentMethod: null,
    mixedPayment: false,
    mixedMethod2: null,
    mixedAmount1: "",
    mixedAmount2: "",
  };
}

export type SaleTotals = {
  subtotal: number;
  promoDiscount: number;
  managerDiscount: number;
  loyaltyDiscount: number;
  total: number;
};

export function computeTotals(sale: Sale): SaleTotals {
  const subtotal = sale.cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const promoDiscount = sale.promoApplied ? Math.round(subtotal * sale.promoApplied.percent) : 0;
  const managerDiscount = sale.managerDiscountApplied;
  const loyaltyDiscount = Math.floor(sale.loyaltyPointsUsed / 100) * 1000;
  const total = Math.max(0, subtotal - promoDiscount - managerDiscount - loyaltyDiscount);
  return { subtotal, promoDiscount, managerDiscount, loyaltyDiscount, total };
}
