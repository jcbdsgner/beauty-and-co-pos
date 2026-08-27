// Shared conceptual model — see docs/USERFLOW.md § "Modèle conceptuel". One object, one file per
// concept below, all cross-referenced by id rather than duplicated, matching the unified model
// (Rendez-vous <-> Vente relation, Relance as one discriminated-union object, Vente's "abandonnée"
// state) that the v2 userflow rework requires.

export type Role = "coiffeuse" | "estheticienne" | "accueil";

export type Praticienne = {
  id: string;
  name: string;
  role: Role;
  initial: string;
  workingToday: boolean;
  unavailableToday?: boolean;
};

export type ClientTier = "vip" | "gold" | "silver" | null;

export type Cliente = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  profession?: string;
  birthday?: string; // ISO date
  tier: ClientTier;
  points: number;
  hairType?: string;
  colorReference?: string;
  skinNotes?: string;
  preferencesNotes?: string;
  internalNotes?: string;
  lastVisit?: string;
  totalSpent: number;
  totalVisits: number;
  createdAt: string;
  preferredStaffId?: string;
};

export type ServiceCategory = {
  id: string;
  name: string;
};

export type Service = {
  id: string;
  categoryId: string;
  subcategory?: string;
  name: string;
  price: number;
  durationMinutes: number;
  active: boolean;
};

export type ProductCategory = {
  id: string;
  name: string;
};

export type Produit = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  importedAbroad?: boolean;
};

export type AppointmentStatus = "en_attente" | "confirme" | "annule";

export type RendezVous = {
  id: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  start: string; // "HH:mm"
  durationMin: number;
  status: AppointmentStatus;
  /** Set once "Accueillir" opens a sale tab for this rendez-vous — the "En cours" relation, not a status. */
  saleId?: string;
};

export type PaymentMode = "wave" | "orange_money" | "especes" | "carte";

export type CartLine = {
  id: string;
  refId: string; // service or produit id
  kind: "service" | "produit";
  name: string;
  unitPrice: number;
  qty: number;
  staffId?: string;
};

export type SaleStatus = "ouverte" | "encaissee" | "abandonnee";
export type SaleStep = "vente" | "paiement" | "recu";

export type Sale = {
  id: string;
  label: string;
  clientId: string | null;
  cart: CartLine[];
  giftCardCode: string;
  giftCardApplied: { code: string; amount: number } | null;
  loyaltyPointsUsed: number;
  managerCode: string;
  managerDiscountApplied: number;
  status: SaleStatus;
  step: SaleStep;
  originAppointmentId?: string;
  payment?: { modes: { mode: PaymentMode; amount: number }[] };
  loyaltyPointsEarned?: number;
  createdAt: string;
  encaisseeAt?: string;
};

export type StyleCategory = "coiffure" | "ongles" | "soin-visage" | "massage";

export type Style = {
  id: string;
  category: StyleCategory;
  name: string;
  price: number;
  trending: boolean;
};

export type RelanceType = "anniversaire" | "soins" | "fidelite" | "reconquete" | "recommandation";
export type RelanceStatus = "en_attente" | "envoyee" | "ignoree" | "en_attente_autorisation" | "autorisee";

export type Relance = {
  id: string;
  clientId: string;
  type: RelanceType;
  status: RelanceStatus;
  message: string;
  lateDays?: number;
  styleId?: string;
  discountLabel?: string;
};

export type CampaignStatus = "brouillon" | "planifiee" | "envoyee";

export type Campaign = {
  id: string;
  title: string;
  message: string;
  audienceLabel: string;
  status: CampaignStatus;
};

export type Company = {
  id: string;
  name: string;
};

export type Salon = {
  id: string;
  companyId: string;
  name: string;
  address: string;
  active: boolean;
};

export type BeautyTip = {
  id: string;
  family: string;
  title: string;
  body: string;
};
