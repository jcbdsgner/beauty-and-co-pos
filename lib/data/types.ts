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
  /** True when the salon can put two praticiennes on this prestation at once, each on a distinct
   *  zone, roughly halving the time on the chair. Mirrors the same flag on the b&co booking
   *  catalogue — the Menu is a read-only reflection of it. */
  twoPractitionersEligible: boolean;
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

/** How a Réservation reached the salon. Almost always "en_ligne" — the client books herself on the
 *  external booking platform; "comptoir" is the rare walk-in a receptionist notes by hand. */
export type ReservationSource = "en_ligne" | "comptoir";

/**
 * Réservation — the payer-level booking. One cliente (`payerClientId`) settles the whole thing at
 * the counter, even when the prestations are spread over several praticiennes or done for a friend
 * or a child. Groups 1..N atomic Rendez-vous. The booking journey itself lives on the external
 * platform — point-de-vente only reads réservations and cashes them in.
 */
export type Reservation = {
  id: string;
  /** La cliente qui règle — the fiche the sale is attached to. */
  payerClientId: string;
  source: ReservationSource;
  rendezVous: RendezVous[];
  /** Set once "Encaisser" opens a sale for this réservation — the "En cours" relation, not a status. */
  saleId?: string;
  createdAt?: string;
};

/**
 * Rendez-vous — now atomic: one prestation, one créneau, one bénéficiaire, one praticienne (two
 * when the prestation is `twoPractitionersEligible` and the salon assigns a second). Several can
 * share the same start time — different praticiennes, same réservation or not. Belongs to exactly
 * one Réservation.
 */
export type RendezVous = {
  id: string;
  reservationId: string;
  serviceId: string;
  staffId: string;
  /** A second praticienne working the same prestation in parallel — only for `twoPractitionersEligible`
   *  services. When set, `durationMin` is already the halved on-chair time. */
  secondStaffId?: string;
  /** The person receiving the prestation, when she is a known fiche. */
  beneficiaryClientId?: string;
  /** …or a free-text name (a friend, a child) when she has no fiche. Neither set ⇒ the payer herself. */
  beneficiaryName?: string;
  start: string; // "HH:mm"
  durationMin: number;
  status: AppointmentStatus;
};

export type PaymentMode = "wave" | "orange_money" | "especes" | "carte";

/** How a receptionist-granted discount is expressed. `pourcentage` is a share of the prestations
 *  total (services only, products excluded); `montant` is a flat FCFA cut. Either way it is capped
 *  at 20 % of the prestations total — see `MAX_REMISE_PCT` in the store. */
export type RemiseMode = "montant" | "pourcentage";

export type RemiseAccordee = {
  mode: RemiseMode;
  /** FCFA when `mode === "montant"`, a 1–20 percentage when `mode === "pourcentage"`. */
  value: number;
  /** The receptionist's personal code — identifies who authorised the discount. */
  grantedByCode: string;
  /** Free-text justification, captured after the sale is cashed in (never before). */
  reason: string | null;
};

export type CarteCadeauStatus = "active" | "used" | "expired";

export type CarteCadeau = {
  code: string;
  /** Remaining stored value in FCFA. */
  balance: number;
  status: CarteCadeauStatus;
  /** ISO date, set when `status === "expired"`. */
  expiresOn?: string;
};

export type CartLine = {
  id: string;
  refId: string; // service or produit id
  kind: "service" | "produit";
  name: string;
  unitPrice: number;
  qty: number;
  /** Set on lines seeded from a réservation whose bénéficiaire isn't the payer — shown as a
   *  subtitle on the ticket and the reçu so it's clear who each prestation was for. */
  beneficiary?: string;
};

export type SaleStatus = "ouverte" | "encaissee" | "abandonnee";
export type SaleStep = "vente" | "paiement" | "recu";

export type Sale = {
  id: string;
  label: string;
  clientId: string | null;
  cart: CartLine[];
  /** Pending code being typed or scanned, before it's validated and applied. */
  giftCardCode: string;
  /** A validated gift card attached to the sale. `balance` is the card's stored value; how much
   *  of it this sale actually consumes is derived in `computeTotals` (the rest stays on the card). */
  giftCardApplied: { code: string; balance: number } | null;
  loyaltyPointsUsed: number;
  /** A discretionary discount a receptionist granted with her personal code, capped at 20 % of the
   *  prestations total. `reason` is filled in after the sale is cashed in. */
  discountGranted: RemiseAccordee | null;
  status: SaleStatus;
  step: SaleStep;
  /** The réservation this sale was opened from, via "Encaisser". Absent for a walk-in sale. */
  originReservationId?: string;
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
