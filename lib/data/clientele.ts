import type { Cliente, Ethnicity } from "@/lib/data/types";

export const CLIENTS: Cliente[] = [
  {
    id: "cl-1",
    notationRounds: [
      { at: "2026-09-19T16:40:00.000Z", choices: { "ongles-type": ["gel-x"], "ongles-longueur": ["moyens"], "coiffure-style": ["tresses-collees"], "coiffure-soin": ["masque"], "boisson-choix": ["the-menthe"], "boisson-sucre": ["sans-sucre"] } },
      { at: "2026-08-30T10:20:00.000Z", choices: { "ongles-type": ["gel-x", "french"], "ongles-longueur": ["longs"], "boisson-choix": ["the-menthe"], "boisson-sucre": ["sans-sucre"] } },
      { at: "2026-08-02T11:15:00.000Z", choices: { "ongles-type": ["capsules", "french"], "ongles-longueur": ["longs"], "coiffure-style": ["tresses-collees"], "coiffure-soin": ["bain-huile"], "boisson-choix": ["bissap"], "boisson-sucre": ["peu-sucre"] } },
      { at: "2026-06-21T15:00:00.000Z", choices: { "ongles-type": ["vernis-permanent"], "ongles-longueur": ["courts"], "coiffure-style": ["box-braids"], "coiffure-soin": ["masque"], "boisson-choix": ["the-menthe"], "boisson-sucre": ["sans-sucre"] } },
      { at: "2026-05-09T12:30:00.000Z", choices: { "ongles-type": ["gel-x", "decoration"], "ongles-longueur": ["longs"], "coiffure-style": ["tresses-collees"], "coiffure-soin": ["masque"], "boisson-choix": ["the-menthe"] } },
    ],
    number: 1006,
    loyaltyCode: "BACO-FID-1042",
    billingCompany: {
      name: "Kër Digital SARL",
      address: "Immeuble Fayçal, 4e étage, rue Carnot, Dakar",
      ninea: "009876543 2G3",
      rccm: "SN-DKR-2021-B-14532",
    },
    firstName: "Awa",
    lastName: "Sarr",
    phone: "+221784455661",
    whatsapp: "+221784455661",
    email: "awa.sarr@example.com",
    residenceCountry: "Sénégal",
    birthday: "03-14",
    ethnicity: "africain",
    address: "Sacré-Cœur 3, Villa 412, Dakar",
    tier: null,
    points: 320,
    hairType: "Naturel 4C",
    colorReference: "Châtain profond #3",
    preferenceNotes: {
      coiffure: "Préfère les tresses collées, pas de rajouts trop lourds.",
      boisson: "Thé à la menthe, sans sucre.",
    },
    lastVisit: "Il y a 6 j",
    totalSpent: 245000,
    totalVisits: 9,
    notes: [
      { id: "note-cl1-2", at: "2026-09-19T16:40:00.000Z", authorId: "ndiole", origin: "encaissement", text: "A demandé à être prévenue dès qu'un créneau se libère le samedi matin. Très contente de sa French — photos du résultat pour la prochaine fois.", attachments: [
        { id: "att-cl1-3", name: "french-resultat.jpg", kind: "image", size: 184_320, url: "/notation/french.jpg" },
        { id: "att-cl1-4", name: "decoration-annulaire.jpg", kind: "image", size: 201_728, url: "/notation/decoration.jpg" },
      ] },
      { id: "note-cl1-1", at: "2026-08-02T11:15:00.000Z", authorId: "bineta", origin: "fiche", text: "Cuir chevelu sensible — éviter les produits mentholés au shampooing. Ordonnance de sa dermatologue jointe.", attachments: [
        { id: "att-cl1-1", name: "ordonnance-dermatologue.pdf", kind: "document", size: 753, url: "/fichiers/ordonnance-dermatologue.pdf" },
        { id: "att-cl1-2", name: "test-allergie-colorations.pdf", kind: "document", size: 689, url: "/fichiers/test-allergie-colorations.pdf" },
      ] },
    ],
    createdAt: "2026-02-01",
    preferredStaffId: "bineta",
  },
  {
    id: "cl-2",
    notationRounds: [
      { at: "2026-09-10T15:05:00.000Z", choices: { "ongles-type": ["vernis-permanent", "decoration"], "ongles-longueur": ["courts"], "boisson-choix": ["cafe"] } },
      { at: "2026-07-18T11:40:00.000Z", choices: { "ongles-type": ["vernis-permanent"], "ongles-longueur": ["courts"], "spa-massage": ["relaxant"], "spa-pression": ["legere"] } },
      { at: "2026-06-02T17:10:00.000Z", choices: { "ongles-type": ["french"], "ongles-longueur": ["moyens"], "boisson-choix": ["cafe", "eau"] } },
    ],
    number: 1009,
    loyaltyCode: "BACO-FID-2170",
    firstName: "Fatou",
    lastName: "Camara",
    phone: "+221771122334",
    email: "fatou.camara@example.com",
    residenceCountry: "Sénégal",
    birthday: "10-12",
    ethnicity: "africain",
    address: "Cité Keur Gorgui, Rue 12, Dakar",
    tier: null,
    points: 140,
    lastVisit: "1 sem.",
    totalSpent: 98000,
    totalVisits: 4,
    notes: [
      { id: "note-cl2-1", at: "2026-09-10T15:05:00.000Z", authorId: "aissatou", origin: "encaissement", text: "Vient souvent avec sa fille, prévoir un fauteuil en plus." },
    ],
    createdAt: "2026-05-10",
  },
  {
    id: "cl-3",
    number: 1010,
    loyaltyCode: "BACO-FID-3388",
    firstName: "Coumba",
    lastName: "Thiam",
    phone: "+221765544332",
    email: "coumba.thiam@example.com",
    residenceCountry: "Sénégal",
    birthday: "09-26",
    ethnicity: "africain",
    address: "Parcelles Assainies U15, Dakar",
    tier: null,
    points: 60,
    lastVisit: "4 sem.",
    totalSpent: 42000,
    totalVisits: 2,
    createdAt: "2026-06-20",
  },
  {
    id: "cl-4",
    number: 1005,
    loyaltyCode: "BACO-FID-4519",
    firstName: "Bineta",
    lastName: "Diagne",
    phone: "+221709988776",
    email: "bineta.diagne@example.com",
    residenceCountry: "Sénégal",
    birthday: "07-02",
    ethnicity: "africain",
    address: "Mermoz, Rue MZ-24, Dakar",
    tier: null,
    points: 210,
    lastVisit: "1 mois",
    totalSpent: 156000,
    totalVisits: 6,
    createdAt: "2026-01-15",
  },
  {
    id: "cl-5",
    number: 1007,
    loyaltyCode: "BACO-FID-5024",
    firstName: "Mariam",
    lastName: "Kane",
    phone: "+221781234567",
    email: "mariam.kane@example.com",
    residenceCountry: "Côte d'Ivoire",
    birthday: "12-05",
    ethnicity: "africain",
    address: "Cocody Angré, Rue des Jardins, Abidjan",
    tier: null,
    points: 90,
    lastVisit: "2 mois",
    totalSpent: 61000,
    totalVisits: 3,
    createdAt: "2026-03-05",
  },
  {
    id: "cl-6",
    notationRounds: [
      { at: "2026-09-14T10:00:00.000Z", choices: { "spa-massage": ["pierres-chaudes"], "spa-pression": ["forte"], "ongles-type": ["french"], "ongles-longueur": ["moyens"] } },
      { at: "2026-08-10T10:00:00.000Z", choices: { "spa-massage": ["deep-tissue"], "spa-pression": ["forte"] } },
      { at: "2026-07-06T10:00:00.000Z", choices: { "spa-massage": ["deep-tissue", "relaxant"], "spa-pression": ["moyenne"], "ongles-type": ["french"], "ongles-longueur": ["courts"] } },
    ],
    number: 1002,
    loyaltyCode: "BACO-FID-6607",
    firstName: "Awa",
    lastName: "Niang",
    phone: "+221776543210",
    email: "awa.niang@example.com",
    residenceCountry: "Sénégal",
    birthday: "01-23",
    ethnicity: "africain",
    address: "Almadies, Route des Almadies, Dakar",
    tier: "vip",
    points: 1420,
    hairType: "Défrisé",
    colorReference: "Auburn #30",
    preferenceNotes: {
      onglerie: "Vernis semi-permanent nude, ongles courts et carrés.",
      spa: "Sensible au parfum d'eucalyptus — préférer la lavande.",
    },
    lastVisit: "2 mois",
    totalSpent: 890000,
    totalVisits: 22,
    notes: [
      { id: "note-cl6-1", at: "2026-07-22T10:30:00.000Z", authorId: "ndiole", origin: "fiche", text: "Préfère régler par Wave. Arrive en général 10 min en avance. Modèle de pose apporté par la cliente.", attachments: [
        { id: "att-cl6-1", name: "modele-gel-x.jpg", kind: "image", size: 163_840, url: "/notation/gel-x.jpg" },
      ] },
    ],
    createdAt: "2025-09-01",
    preferredStaffId: "fatou",
  },
  {
    id: "cl-7",
    number: 1003,
    loyaltyCode: "BACO-FID-7731",
    firstName: "Sokhna",
    lastName: "Ndiaye",
    phone: "+221703216549",
    email: "sokhna.ndiaye@example.com",
    residenceCountry: "Sénégal",
    birthday: "05-18",
    ethnicity: "africain",
    address: "Point E, Rue 4 x E, Dakar",
    tier: "gold",
    points: 680,
    lastVisit: "2 mois",
    totalSpent: 410000,
    totalVisits: 14,
    createdAt: "2025-11-12",
  },
  {
    id: "cl-8",
    number: 1004,
    loyaltyCode: "BACO-FID-8890",
    firstName: "Ndèye",
    lastName: "Diop",
    phone: "+221781239900",
    email: "ndeye.diop@example.com",
    residenceCountry: "France",
    birthday: "11-30",
    ethnicity: "africain",
    address: "12 Rue de Belleville, 75020 Paris",
    tier: "silver",
    points: 300,
    lastVisit: "5 mois",
    totalSpent: 180000,
    totalVisits: 7,
    createdAt: "2025-12-01",
  },
  {
    id: "cl-9",
    notationRounds: [
      { at: "2026-09-20T09:30:00.000Z", choices: { "epilation-methode": ["cire-chaude"], "epilation-zone": ["sourcils", "aisselles"], "boisson-choix": ["gingembre"], "boisson-sucre": ["peu-sucre"] } },
      { at: "2026-08-22T09:30:00.000Z", choices: { "epilation-methode": ["fil"], "epilation-zone": ["sourcils"], "boisson-choix": ["gingembre"] } },
      { at: "2026-07-25T09:30:00.000Z", choices: { "epilation-methode": ["cire-chaude"], "epilation-zone": ["sourcils", "jambes"], "boisson-choix": ["bouye"], "boisson-sucre": ["sucre"] } },
    ],
    number: 1001,
    loyaltyCode: "BACO-FID-9276",
    firstName: "Yacine",
    lastName: "Wade",
    phone: "+221775551234",
    whatsapp: "+221775551234",
    email: "yacine.wade@example.com",
    residenceCountry: "Sénégal",
    birthday: "10-03",
    ethnicity: "africain",
    address: "Ouakam, Cité Assemblée, Dakar",
    tier: "platinum",
    points: 950,
    hairType: "Locks",
    colorReference: "Noir naturel #1",
    preferenceNotes: {
      epilation: "Cire tiède uniquement, peau réactive.",
      boisson: "Café noir, un carré de chocolat.",
    },
    lastVisit: "3 mois",
    totalSpent: 620000,
    totalVisits: 18,
    createdAt: "2025-08-19",
  },
  {
    id: "cl-10",
    notationRounds: [
      { at: "2026-09-05T14:00:00.000Z", choices: { "boisson-choix": ["cafe"], "boisson-sucre": ["sucre"], "coiffure-style": ["brushing"], "coiffure-soin": ["keratine"] } },
      { at: "2026-08-08T14:00:00.000Z", choices: { "boisson-choix": ["cafe"], "boisson-sucre": ["sucre"], "coiffure-style": ["coupe", "brushing"], "coiffure-soin": ["shampoing"] } },
    ],
    number: 1008,
    loyaltyCode: "BACO-FID-1038",
    firstName: "Aminata",
    lastName: "Fall",
    phone: "+221776623145",
    whatsapp: "+221776623145",
    email: "aminata.fall@example.com",
    residenceCountry: "Sénégal",
    birthday: "09-27",
    ethnicity: "africain",
    address: "Liberté 6, Rue LB-19, Dakar",
    tier: null,
    points: 140,
    preferenceNotes: {
      boisson: "Jus de bissap pour les enfants, jamais de café.",
    },
    lastVisit: "Il y a 3 semaines",
    totalSpent: 96000,
    totalVisits: 4,
    createdAt: "2026-04-12",
  },
];

export function clientById(id: string) {
  return CLIENTS.find((c) => c.id === id);
}

export function clientFullName(c: Cliente) {
  return `${c.firstName} ${c.lastName}`;
}

export function clientInitial(c: Cliente) {
  return `${c.firstName[0] ?? ""}${c.lastName[0] ?? ""}`.toUpperCase();
}

/** Resolve a loyalty-card code (scanned QR or typed) to a fiche. Case-insensitive, whitespace
 *  trimmed — a receptionist keying it under pressure shouldn't be tripped by casing. */
export function clientByLoyaltyCode(clients: Cliente[], raw: string) {
  const code = raw.trim().toUpperCase();
  if (!code) return undefined;
  return clients.find((c) => c.loyaltyCode.toUpperCase() === code);
}

/** « N° 1042 » — le numéro cliente tel qu'il s'affiche partout. */
export function clientNumberLabel(c: Pick<Cliente, "number">) {
  return `N° ${c.number}`;
}

/** Une cliente correspond-elle à la saisie ? Nom, téléphone (ou WhatsApp), e-mail et numéro cliente
 *  (« 1042 », « N° 1042 », « #1042 ») — les façons dont on la retrouve au comptoir. Les chiffres se comparent sans espaces ni ponctuation,
 *  pour que « 77 123 45 67 », « 771234567 » ou « +221 77… » tombent tous juste. Seule règle de
 *  correspondance cliente : la recherche de rendez-vous de l'Accueil la réutilise. */
export function clientMatchesQuery(c: Cliente, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (clientFullName(c).toLowerCase().includes(q)) return true;
  if (c.email?.toLowerCase().includes(q)) return true;
  const asNumber = q.match(/^(?:n°|no|#)?\s*(\d+)$/);
  if (asNumber && Number(asNumber[1]) === c.number) return true;
  const qDigits = q.replace(/\D/g, "");
  if (qDigits.length >= 2 && /^[\d\s+().-]+$/.test(q)) {
    return [c.phone, c.whatsapp].some((n) => n?.replace(/\D/g, "").includes(qDigits));
  }
  return false;
}

/** Takes the live `clients` array (from `useAppData()`) rather than the static seed list, so a cliente created this session is searchable immediately. */
export function searchClients(clients: Cliente[], query: string) {
  if (!query.trim()) return clients;
  return clients.filter((c) => clientMatchesQuery(c, query));
}

export const ETHNICITY_LABEL: Record<Ethnicity, string> = {
  asiatique: "Asiatique",
  africain: "Africain",
  americain: "Américain",
  europeen: "Européen",
};

export const ETHNICITY_OPTIONS = (Object.keys(ETHNICITY_LABEL) as Ethnicity[]).map((value) => ({
  value,
  label: ETHNICITY_LABEL[value],
}));

export const MONTH_NAMES = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** « MM-JJ » → « 27 septembre ». */
/** Une fiche créée pour un devis avec le strict minimum — anniversaire, origine à demander (ADR 0042). */
export function isFicheACompleter(c: Cliente): boolean {
  return !c.birthday || !c.ethnicity;
}

export function formatBirthday(birthday: string | undefined): string | undefined {
  if (!birthday) return undefined;
  const [m, d] = birthday.split("-").map(Number);
  if (!m || !d) return birthday;
  return `${d === 1 ? "1er" : d} ${MONTH_NAMES[m - 1]}`;
}

/** Jour + mois → « MM-JJ ». */
export function toBirthday(day: number, month: number): string {
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
