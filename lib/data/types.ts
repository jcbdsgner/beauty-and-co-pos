// Shared conceptual model — see docs/USERFLOW.md § "Modèle conceptuel". One object, one file per
// concept below, all cross-referenced by id rather than duplicated, matching the unified model
// (Rendez-vous <-> Vente relation, Conversation/Message per client thread — ADR 0011, Vente's
// "abandonnée" state) that the v2 userflow rework requires.

export type Role = "coiffeuse" | "estheticienne" | "menage" | "accueil";

export type DayOfWeek = "lun" | "mar" | "mer" | "jeu" | "ven" | "sam" | "dim";

/** Une plage de présence dans un salon, "HH:mm" -> "HH:mm" (ADR 0036). */
export type Shift = { start: string; end: string; salonId: string };

/** L'horaire hebdomadaire récurrent d'une praticienne (ADR 0020) — un jour absent de l'objet est
 *  un jour de repos. Chaque jour tient une ou deux plages, dans l'ordre, chacune dans un salon
 *  (ADR 0036) : deux plages dans deux salons = elle commence dans l'un et finit dans l'autre, le
 *  battement entre les deux est son trajet. D'un jour à l'autre, le salon peut changer. */
export type WeeklySchedule = Partial<Record<DayOfWeek, Shift[]>>;

export type Praticienne = {
  id: string;
  name: string;
  role: Role;
  initial: string;
  /** Photo d'avatar (public/images/equipe) — absente ⇒ l'initiale s'affiche. */
  photoUrl?: string;
  /** Porte aussi le salon de chaque plage — une praticienne n'a plus de salon fixe (ADR 0036). */
  weeklySchedule: WeeklySchedule;
  /** Absence ponctuelle du jour (dernière minute) — vient par-dessus l'horaire hebdomadaire. */
  unavailableToday?: boolean;
};

export type ClientTier = "vip" | "platinum" | "gold" | "silver" | null;

/** Les cinq domaines de préférence tenus sur une fiche cliente — chacun un texte libre + des photos. */
export type PreferenceDomain = "onglerie" | "coiffure" | "spa" | "epilation" | "boisson";

/** Un passage de « Noter la cliente » : quand, et ce qui a été répondu (id de question → ids d'options). */
export type NotationRound = { at: string; choices: Record<string, string[]> };

export const PREFERENCE_DOMAINS: PreferenceDomain[] = ["onglerie", "coiffure", "spa", "epilation", "boisson"];

export const PREFERENCE_DOMAIN_LABEL: Record<PreferenceDomain, string> = {
  onglerie: "Mani-pédi-onglerie",
  coiffure: "Coiffure",
  spa: "Spa",
  epilation: "Épilation",
  boisson: "Boisson",
};

/** Un fichier joint à une note interne — photo (avant/après, réaction cutanée…) ou document
 *  (ordonnance, test d'allergie, décharge signée). Sans backend : un fichier ajouté en séance vit
 *  le temps de la session (`URL.createObjectURL`) ; ceux du seed pointent vers `public/`. */
export type NoteAttachment = {
  id: string;
  name: string;
  /** « image » s'affiche en vignette agrandissable ; tout le reste en pastille qui s'ouvre à part. */
  kind: "image" | "document";
  /** Octets — affiché « 245 Ko ». */
  size: number;
  url: string;
};

/** Une entrée du journal interne d'une fiche cliente — jamais montrée à la cliente. `authorId` est
 *  une praticienne de l'équipe (le compte du poste par défaut, modifiable à la saisie). */
export type ClientNote = {
  id: string;
  at: string; // ISO
  authorId: string;
  text: string;
  /** Où la note a été prise : sur la fiche, ou dans « Noter la cliente » après l'encaissement. */
  origin: "fiche" | "encaissement";
  /** Fichiers joints, dans l'ordre d'ajout. Une note peut n'être que des fichiers (texte vide). */
  attachments?: NoteAttachment[];
};

export type Cliente = {
  id: string;
  /** Numéro cliente — séquentiel, attribué à la création, jamais réattribué. Affiché « N° 1042 »,
   *  retrouvable par la recherche. Distinct du `loyaltyCode`, qui est un jeton d'identification. */
  number: number;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp?: string;
  /** Toujours renseigné — obligatoire à la création. */
  email: string;
  address?: string;
  profession?: string;
  /** Jour et mois seulement, « MM-JJ » (ex. « 09-27 ») — jamais l'année. Obligatoire, sauf sur une
   *  fiche à compléter (créée pour un devis, ADR 0042) : demandé à sa première venue. */
  birthday?: string;
  /** Idem : absente sur une fiche à compléter. */
  ethnicity?: Ethnicity;
  /** Pays de résidence — obligatoire à la création (défaut « Sénégal »). */
  residenceCountry: string;
  /** Code carried by her loyalty card — the counter's identification token: scanning its QR or
   *  typing this code attaches her fiche to a sale. A bearer credential (possession of the card),
   *  never a password. Generated at creation. See ADR 0013. */
  loyaltyCode: string;
  tier: ClientTier;
  points: number;
  hairType?: string;
  colorReference?: string;
  /** Texte libre par domaine de préférence ; une note rangée dans un domaine vient s'y ajouter. */
  preferenceNotes?: Partial<Record<PreferenceDomain, string>>;
  /** Chaque passage de « Noter la cliente », le plus récent d'abord (lib/data/notation.ts). La fiche
   *  en tire combien de fois chaque réponse revient et laquelle a été choisie la dernière fois. */
  notationRounds?: NotationRound[];
  /** Journal interne, le plus récent d'abord. */
  notes?: ClientNote[];
  lastVisit?: string;
  totalSpent: number;
  totalVisits: number;
  createdAt: string;
  preferredStaffId?: string;
  /** Société facturée (ADR 0042) — facultative, reprise d'un devis à l'autre. */
  billingCompany?: BillingCompany;
};

/** Identité de facturation d'une cliente qui fait facturer sa structure (ADR 0042). Distincte de
 *  `Company`, qui est l'enseigne émettrice (Beauty and Co). */
export type BillingCompany = {
  name: string;
  address: string;
  ninea: string;
  rccm?: string;
};

export type Ethnicity = "asiatique" | "africain" | "americain" | "europeen";

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
  /** One of `PRODUCT_CATEGORIES` — a brand: "kerastase", "saryna-keys", "nefertiti", "beccy-wave", "autres".
   *  Never "boissons" — bar drinks are a `Boisson`, their own family (ADR 0016). */
  categoryId: string;
  /** Range within the category — e.g. a Kérastase gamme ("Nutritive", "Chronologiste"). Mirrors
   *  `Service.subcategory`. Absent for a category that doesn't split (Saryna Keys, Nefertiti, Beccy Wave, Autres). */
  subcategory?: string;
  name: string;
  price: number;
  /** Units left in the salon. Decremented at "Confirmer l'encaissement"; a produit at 0 can't be
   *  added to a panier. Session-only — a page refresh resets it (mock, no backend). */
  stock: number;
  active: boolean;
  importedAbroad?: boolean;
  /** Optional product photo (path under /public). Absent → a placeholder tile. */
  image?: string;
  /** Short blurb. */
  description?: string;
};

/**
 * A drink from the Bar Beauty & Co — its own family, neither a Prestation nor a Produit (ADR 0016).
 * No category, no stock ("un bar ne se compte pas au verre"). Cashed in like the rest and counts
 * toward loyalty points earned, but is never in a discount's base. Same references as the b&co
 * booking platform's bar menu.
 */
export type Boisson = {
  id: string;
  name: string;
  price: number;
  active: boolean;
  /** Optional photo (path under /public). Absent → a placeholder tile. */
  image?: string;
  /** Composition — shown to the cliente while she waits. */
  description?: string;
};

/** A rendez-vous is simply live or cancelled. There is no "pending / confirmed" step: bookings are
 *  made on the external online platform and arrive already firm — the receptionist never validates
 *  them, only cancels or cashes them in. */
export type AppointmentStatus = "actif" | "annule";

/** How a Réservation reached the salon. Almost always "en_ligne" — the client books herself on the
 *  external booking platform; "comptoir" is the rare walk-in a receptionist notes by hand. */
export type ReservationSource = "en_ligne" | "comptoir";

/** A boisson or produit pré-commandé en ligne avec une réservation, à retirer le jour même —
 *  jamais une prestation (elle arrive toujours d'un Rendez-vous). `refId` pointe vers `Boisson.id`
 *  ou `Produit.id` selon `kind`. */
export type ReservationExtra = {
  kind: "produit" | "boisson";
  refId: string;
  qty: number;
};

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
  /** Calendar day of the passage, "YYYY-MM-DD". Absent ⇒ today (walk-ins noted at the counter,
   *  legacy seed) — read it through `reservationDate()`, never the raw field. */
  date?: string;
  /** Set once "Encaisser" opens a sale for this réservation — the "En cours" relation, not a status. */
  saleId?: string;
  /** What the cliente already paid on the external platform when she booked, in FCFA — arrives
   *  verbatim like the rest of the réservation, never entered or edited in this app. Deducted from
   *  the sale's total at the counter (see `Sale.depositPaid`, ADR 0015). Absent ⇒ no acompte. */
  depositPaid?: number;
  /** Set only when the acompte was taken at the counter, at the end of the booking journey (ADR 0032)
   *  — how and when it was paid, so it counts in that day's sales. Absent ⇒ paid online (or none). */
  depositMode?: DepositMode;
  depositPaidAt?: string;
  /** « Note pour le salon » left in the booking journey (ADR 0032). */
  note?: string;
  /** Note libre de la réceptionniste, saisie dans la fenêtre rendez-vous (créer / modifier) —
   *  distincte de `note`, écrite par la cliente en ligne. */
  staffNote?: string;
  /** Boissons / produits pré-commandés en ligne avec la réservation, pour retrait le jour même —
   *  arrivent verbatim comme le reste et s'ajoutent au panier avec les prestations à « Encaisser ».
   *  Jamais de prestation ici (elle naît toujours d'un Rendez-vous). */
  extras?: ReservationExtra[];
  createdAt?: string;
  /** Whether the réceptionniste has noticed this réservation — only ever posed (`false`) on a
   *  `source: "en_ligne"` réservation; absent/`true` ⇒ vue (ADR 0030). Se lève à l'ouverture de la
   *  fiche réservation. Never set on `source: "comptoir"` — she's present for its whole creation. */
  seen?: boolean;
};

/** How a bénéficiaire reads on the Accueil's composition line ("1 femme + 1 enfant"). Derived from
 *  the prestation (Mini&Co ⇒ enfant) when possible; `RendezVous.beneficiaryKind` only disambiguates
 *  a free-text bénéficiaire the prestation alone can't settle (an adult male companion). */
export type BeneficiaryKind = "femme" | "homme" | "enfant";

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
  /** Le salon où il se tient (`Salon.id`) — porté par le rendez-vous, jamais déduit de la
   *  praticienne, qui peut changer de salon d'un jour ou d'une heure à l'autre (ADR 0036). */
  salonId: string;
  /** A second praticienne working the same prestation in parallel — only for `twoPractitionersEligible`
   *  services. When set, `durationMin` is already the halved on-chair time. */
  secondStaffId?: string;
  /** The person receiving the prestation, when she is a known fiche. */
  beneficiaryClientId?: string;
  /** …or a free-text name (a friend, a child) when she has no fiche. Neither set ⇒ the payer herself. */
  beneficiaryName?: string;
  /** Only meaningful alongside `beneficiaryName` — a known fiche is always "femme" (le salon reçoit
   *  des clientes), and a Mini&Co prestation is always "enfant" regardless of this field. Lets a
   *  free-text companion (mari, frère) read as "homme" on the composition line. */
  beneficiaryKind?: BeneficiaryKind;
  start: string; // "HH:mm"
  durationMin: number;
  status: AppointmentStatus;
  /** Free-text reason captured when the receptionist cancels — visible in the annulés history (ADR 0009). */
  cancelReason?: string;
  /** Réponses aux questions obligatoires de la catégorie, données par la bénéficiaire à la prise
   *  de rendez-vous en ligne (id de question → réponse, cf. `BOOKING_QUESTIONS`). Identiques sur
   *  ses rendez-vous d'une même catégorie. Absent pour un rendez-vous pris au comptoir. */
  bookingAnswers?: Record<string, string>;
};

/** Moyens d'acompte du parcours de prise de rendez-vous : ceux du site b&co, plus les espèces (ADR 0032). */
export type DepositMode = "especes" | "mobile_money" | "carte";

export type PaymentMode = "wave" | "orange_money" | "especes" | "carte";

/** How a receptionist-granted discount is expressed. `pourcentage` is a share of the prestations
 *  total (services only, products excluded); `montant` is a flat FCFA cut. Capped at
 *  `RECEPTIONIST_MAX_PCT` (10 %) with no code, up to `MAX_REMISE_PCT` (20 %) with a manager
 *  code — see the store. */
export type RemiseMode = "montant" | "pourcentage";

export type RemiseAccordee = {
  id: string;
  /** The ticket lines this remise applies to (ADR 0031) — prestation lines only, never a produit or
   *  a boisson. A line belongs to at most one remise; "tout le ticket" is just every eligible line
   *  selected. The 10 % / 20 % ceilings are measured against these lines' net amount (the assiette). */
  lineIds: string[];
  mode: RemiseMode;
  /** FCFA when `mode === "montant"`, a 1–20 percentage when `mode === "pourcentage"`. */
  value: number;
  /** A manager's one-off code, present only when the remise went past 10 % of its assiette —
   *  the receptionist grants everything up to 10 % with no code at all. Not verified (mock) — kept
   *  on the sale for traceability. See ADR 0008. */
  managerCode?: string;
};

export type CarteCadeauStatus = "active" | "used" | "expired";

/** What a gift card pays for: a free amount to spend, or a fixed set of prestations. */
export type GiftCardKind = "montant" | "prestations";

export type CarteCadeau = {
  code: string;
  /** Remaining stored value in FCFA — also the monetary cap for a `prestations` card. */
  balance: number;
  status: CarteCadeauStatus;
  /** ISO date, set when `status === "expired"`. */
  expiresOn?: string;
  kind: GiftCardKind;
  /** For `kind === "prestations"` — the service ids the card entitles the holder to. */
  serviceIds?: string[];
  /** The cliente this card identifies at the counter. Absent → pure bearer card, identifies no one.
   *  Where it comes from is out of scope here (it travels on the card — ADR 0013 §5). */
  holderClientId?: string;
};

/** How the buyer chose to receive a printed gift card at purchase (ADR 0012). E-cards are out of
 *  scope; both printed modes feed the salon's preparation queue. */
export type GiftCardFulfillment = "retrait" | "livraison";

export type GiftCardOrderStatus = "a_imprimer" | "imprimee" | "remise" | "livree";

/**
 * A gift card bought and paid for on an external platform, in a printed version the salon must
 * prepare: print it, then hand it over (retrait) or pass it to delivery (livraison). No cashing —
 * it is already paid (ADR 0001, 0012).
 */
/** Un pointage d'un membre de l'équipe (ADR 0040) : son badge scanné au comptoir, puis « Arrivée »
 *  ou « Départ ». Rien n'est déduit de l'horaire — c'est elle (ou la réceptionniste) qui choisit. */
export type PointageKind = "arrivee" | "depart";

export type Pointage = {
  id: string;
  /** `Praticienne.id` — toute l'équipe pointe, ménage compris. */
  staffId: string;
  kind: PointageKind;
  /** ISO datetime. */
  at: string;
};

export type GiftCardOrder = {
  id: string;
  /** The buyer — always a known cliente fiche. */
  buyerClientId: string;
  /** A `CARTES_CADEAUX` code — the printed card carries it, reusable later at the counter. */
  code: string;
  amount: number;
  fulfillment: GiftCardFulfillment;
  /** ISO date — purchased on the platform (display only, no deadline). */
  orderedAt: string;
  status: GiftCardOrderStatus;
  /** The person the card is for, when it isn't the buyer — either mode (a retrait card can be
   *  collected by the buyer and offered on). Absent → the buyer bought it for herself. */
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  /** Set only when `fulfillment === "livraison"` — the recipient's address (the buyer's own when
   *  she bought it for herself). */
  deliveryAddress?: string;
  /** ISO date — set when the order leaves the queue (`remise` / `livree`); shown in the search history. */
  handedOverAt?: string;
};

/* ── Forfaits, Abonnements & Packs (ADR 0017) — instruments prépayés b&co, décomptés au comptoir ── */

/**
 * L'engagement d'une cliente envers un Forfait, souscrit sur la plateforme b&co — jamais créé au
 * comptoir. Chaque cycle réglé rend à nouveau disponibles toutes les prestations du forfait ;
 * `redeemedPrestationIds` porte ce qu'elle a consommé CE cycle. Échéance dépassée (« à régler ») ou
 * `revokedAt` posé ⇒ non décomptable. Le règlement d'un cycle et la révocation se font sur la
 * plateforme b&co, jamais dans cette app.
 */
export type Abonnement = {
  id: string;
  forfaitId: string;
  /** La cliente qui a souscrit et paie — la fiche sur laquelle l'abonnement s'affiche. Le
   *  « bénéficiaire d'abonnement » de b&co (souscrit pour un proche) ne remonte pas au comptoir. */
  payerClientId: string;
  subscribedAt: string; // ISO date
  /** Dernier cycle réglé — l'échéance est `lastPaidAt + Forfait.cycleDays`. */
  lastPaidAt: string; // ISO date
  revokedAt: string | null; // ISO date
  /** Prestations du forfait consommées dans le cycle en cours — remis à `[]` au paiement du cycle
   *  suivant (sur la plateforme b&co). */
  redeemedPrestationIds: string[];
};

/**
 * Un ensemble fixe de prestations prépayées qu'une cliente a acheté sur la plateforme b&co (à
 * −20 % de la somme à l'unité). Consommé prestation par prestation au fil des visites ; n'expire
 * jamais, ne se recharge jamais — `redeemedPrestationIds` ne fait que grandir.
 */
export type PackPurchase = {
  id: string;
  packId: string;
  ownerClientId: string;
  purchasedAt: string; // ISO date
  redeemedPrestationIds: string[];
};

/**
 * La contribution d'un instrument (Pack ou Abonnement) aux « prestations déjà payées » d'une vente
 * (ADR 0017). Renseignée d'office à l'ouverture de la vente quand la payeuse détient un instrument
 * décomptable ; `serviceIds` liste tout ce que cet instrument peut couvrir sur ce ticket,
 * `checkedServiceIds` le sous-ensemble coché que la réceptionniste décomptera vraiment à
 * « Confirmer l'encaissement » (elle décoche une ligne, ou tout le groupe, pour la garder pour
 * plus tard). Une unité par prestation.
 */
export type SaleCoverage = {
  /** `facture` : une Facture payée — ses prestations prépayées (ADR 0042). */
  source: "abonnement" | "pack" | "facture";
  /** id de l'instance Abonnement / PackPurchase. */
  instanceId: string;
  /** id + libellé du Forfait / Pack, pour le ticket. */
  planId: string;
  planLabel: string;
  /** toutes les prestations du panier que cet instrument peut couvrir (fixé à l'ouverture). */
  serviceIds: string[];
  /** le sous-ensemble coché — décompté à l'encaissement. Défaut : tout `serviceIds`. */
  checkedServiceIds: string[];
};

export type CartLine = {
  id: string;
  refId: string; // service, produit or boisson id
  kind: "service" | "produit" | "boisson";
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
  /** The gift card auto-linked to the sale the moment the cliente is identified (ADR 0013) — she
   *  holds it on her fiche, there is nothing to scan or type. `balance` is the card's stored value.
   *  How much of it this sale consumes is derived in `computeTotals` and is adjustable at the counter:
   *  - `montant` card → `appliedAmount` caps how much of the balance to spend (default: all);
   *  - `prestations` card → `coveredServiceIds` is which of the card's prestations to honour on
   *    this ticket (default: all of the card's prestations that are in the cart).
   *  The rest of the balance stays on the card either way. */
  giftCardApplied:
    | {
        code: string;
        balance: number;
        kind: GiftCardKind;
        /** Present for a `prestations` card — the service ids the card can cover. */
        serviceIds?: string[];
        appliedAmount?: number;
        coveredServiceIds?: string[];
      }
    | null;
  loyaltyPointsUsed: number;
  /** Prestations du ticket tirées du Pack ou de l'Abonnement de la payeuse (ADR 0017) — prépayé,
   *  pas une Remise : une ligne couverte est facturée 0 F et sort de l'assiette des remises.
   *  Renseigné d'office à l'ouverture d'une vente sur une cliente qui détient un instrument
   *  décomptable ; la réceptionniste décoche une ligne (ou tout un groupe) à garder pour plus tard.
   *  Décompté dans le ledger à « Confirmer l'encaissement ». */
  coverage: SaleCoverage[];
  /** Remises accordées au règlement (ADR 0031) — each one targets a set of prestation lines. Set on
   *  the payment step, never on the panier. */
  remises: RemiseAccordee[];
  /** The one motif covering every remise of the sale — captured after the sale is cashed in. */
  remiseReason: string | null;
  /** When the receptionist finished « Noter la cliente » on the receipt (préférences ongles + note
   *  interne). Until then a sale with an identified cliente holds the Comptoir. */
  clientRatedAt?: string;
  status: SaleStatus;
  step: SaleStep;
  /** The réservation this sale was opened from, via "Encaisser". Absent for a walk-in sale. */
  originReservationId?: string;
  /** Copied from `Reservation.depositPaid` when the sale opens — not an acquittable Remise (it
   *  doesn't change the sale's value), just what's left to ask for at the counter. See ADR 0015. */
  depositPaid?: number;
  /** Up to three parts (ADR 0031), the same mode may repeat (two cards…). `cashReceived` /
   *  `change` are kept when an espèces part gave change back. */
  payment?: { modes: { mode: PaymentMode; amount: number }[]; cashReceived?: number; change?: number };
  /** Pourboire choisi à « Encaisser », avant le Règlement (ADR 0034) : ajouté à ce qu'il y a à
   *  encaisser, il devient `tip` à la confirmation. */
  pendingTip?: number;
  /** Pourboire encaissé — facultatif. En sus de la vente : hors `payment.modes`, hors points
   *  fidélité et hors chiffre d'affaires ; `mode` = celui de la dernière part du règlement. */
  tip?: { amount: number; mode: PaymentMode };
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

export type RelanceChannel = "whatsapp" | "sms" | "email";

/**
 * Who holds a conversation thread (ADR 0011). `auto` and `bot` behave identically — the virtual
 * conseillère (internally the "bot") tends the thread, scheduled relances go out — they differ
 * only by the inbox token: `auto` was never touched by a human, `bot` was handed back to her
 * after a receptionist take-over. `manager` is terminal: the thread left the app, it stays
 * read-only. "Bot" and "manager" are internal vocabulary only — client-facing messages are still
 * signed "Votre conseillère beauté".
 */
export type ConversationState = "auto" | "bot" | "receptionniste" | "manager";

export type MessageSender = "cliente" | "receptionniste" | "bot";

export type Message = {
  id: string;
  sender: MessageSender;
  channel: RelanceChannel;
  /** ISO datetime — when the message went out, or (if `pending`) when the relance is due to. */
  at: string;
  body: string;
  /** Present ⇔ the message is an automatic relance carried by the bot. */
  relanceType?: RelanceType;
  /** true ⇔ a scheduled relance that has not gone out yet. */
  pending?: boolean;
  lateDays?: number;
  styleId?: string;
  discountLabel?: string;
  /** Anniversaire souhaité (relance `anniversaire` envoyée) : mis en évidence dans Messages tant
   *  que la réceptionniste ne l'a pas vu ; passe à true quand elle ouvre la conversation. */
  seen?: boolean;
  /** Un devis envoyé dans le fil (ADR 0042) — la version précise ; le fil le montre comme une
   *  pièce vivante (statut et action du moment lus dans le store). */
  devisId?: string;
  /** Une facture envoyée dans le fil, en PDF (ADR 0042). */
  factureId?: string;
};

export type Conversation = {
  id: string;
  clientId: string;
  channel: RelanceChannel;
  state: ConversationState;
  /** A client reply not yet seen — carries the amber signal. */
  unread: boolean;
  messages: Message[];
};

export type Company = {
  id: string;
  name: string;
  /** Mentions d'émettrice des devis et factures (ADR 0042) — valeurs fictives en démo. */
  address?: string;
  ninea?: string;
  rccm?: string;
  phone?: string;
  email?: string;
};

export type Salon = {
  id: string;
  companyId: string;
  name: string;
  address: string;
  active: boolean;
  /** Jours de fermeture hebdomadaire — personne n'y travaille, quel que soit son horaire. */
  closedDays?: DayOfWeek[];
};

/* ── Devis & factures (ADR 0042) ─────────────────────────────────────────── */

/** Une ligne de devis ou de facture : une prestation ou un produit du Menu, au prix du jour du devis. */
export type DevisLine = {
  id: string;
  refId: string;
  kind: "service" | "produit";
  name: string;
  unitPrice: number;
  qty: number;
};

/** brouillon → envoye → facture ; ou refuse, expire (30 j), remplace (réémis en version suivante).
 *  Pas d'« accepté » : facturer enregistre l'accord. */
export type DevisStatus = "brouillon" | "envoye" | "facture" | "refuse" | "expire" | "remplace";

export type DevisChannel = "whatsapp" | "email";

export type Devis = {
  id: string;
  /** « DEV-2026-0012 » — partagé par toutes les versions d'un même devis. */
  number: string;
  version: number;
  clientId: string;
  /** Société facturée recopiée au moment du devis — absente = facturé à la cliente elle-même. */
  billTo?: BillingCompany;
  /** Salon émetteur — celui du poste qui a fait le devis (en tête du document). */
  salonId: string;
  /** Qui a fait le devis — « Vendeur » sur le document. */
  sellerName: string;
  lines: DevisLine[];
  /** Remises accordées, mêmes règles qu'au panier (prestations seulement). */
  remises: RemiseAccordee[];
  remiseReason: string | null;
  status: DevisStatus;
  createdAt: string;
  sentAt?: string;
  sentChannel?: DevisChannel;
  /** ISO date — 30 jours après l'envoi (ou la création pour un brouillon). Prix figés jusque-là. */
  validUntil: string;
  /** La facture née de ce devis (status `facture`). */
  factureId?: string;
};

/** a_payer → payee ; annulee = un avoir l'a annulée (une facture ne se supprime jamais). */
export type FactureStatus = "a_payer" | "payee" | "annulee";

export type Facture = {
  id: string;
  /** « FAC-2026-0007 » — unique, jamais réattribué. */
  number: string;
  devisId: string;
  clientId: string;
  billTo?: BillingCompany;
  salonId: string;
  sellerName: string;
  /** Recopiées du devis : une facture ne change jamais. */
  lines: DevisLine[];
  remises: RemiseAccordee[];
  total: number;
  status: FactureStatus;
  issuedAt: string;
  paidAt?: string;
  /** Le paiement, enregistré au poste quand il est reçu — le lien de paiement du PDF est hors périmètre. */
  payment?: { mode: PaymentMode };
  avoir?: { number: string; reason: string; at: string; managerCode: string };
  /** Prestations déjà consommées au comptoir (prépayé, comme un Pack) — un id de ligne par unité
   *  décomptée, une ligne ×2 peut donc y figurer deux fois. */
  redeemedLineIds: string[];
  /** Quand les produits ont été remis à la cliente. */
  productsHandedOverAt?: string;
};

