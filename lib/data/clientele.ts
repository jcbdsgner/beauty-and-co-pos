import type { Cliente } from "@/lib/data/types";

export const CLIENTS: Cliente[] = [
  {
    id: "cl-1",
    loyaltyCode: "BACO-FID-1042",
    firstName: "Awa",
    lastName: "Sarr",
    phone: "+221784455661",
    whatsapp: "+221784455661",
    email: "awa.sarr@example.com",
    residenceCountry: "Sénégal",
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
    createdAt: "2026-02-01",
    preferredStaffId: "bineta",
  },
  {
    id: "cl-2",
    loyaltyCode: "BACO-FID-2170",
    firstName: "Fatou",
    lastName: "Camara",
    phone: "+221771122334",
    residenceCountry: "Sénégal",
    tier: null,
    points: 140,
    lastVisit: "1 sem.",
    totalSpent: 98000,
    totalVisits: 4,
    createdAt: "2026-05-10",
  },
  {
    id: "cl-3",
    loyaltyCode: "BACO-FID-3388",
    firstName: "Coumba",
    lastName: "Thiam",
    phone: "+221765544332",
    residenceCountry: "Sénégal",
    tier: null,
    points: 60,
    lastVisit: "4 sem.",
    totalSpent: 42000,
    totalVisits: 2,
    createdAt: "2026-06-20",
  },
  {
    id: "cl-4",
    loyaltyCode: "BACO-FID-4519",
    firstName: "Bineta",
    lastName: "Diagne",
    phone: "+221709988776",
    residenceCountry: "Sénégal",
    tier: null,
    points: 210,
    lastVisit: "1 mois",
    totalSpent: 156000,
    totalVisits: 6,
    createdAt: "2026-01-15",
  },
  {
    id: "cl-5",
    loyaltyCode: "BACO-FID-5024",
    firstName: "Mariam",
    lastName: "Kane",
    phone: "+221781234567",
    residenceCountry: "Côte d'Ivoire",
    tier: null,
    points: 90,
    lastVisit: "2 mois",
    totalSpent: 61000,
    totalVisits: 3,
    createdAt: "2026-03-05",
  },
  {
    id: "cl-6",
    loyaltyCode: "BACO-FID-6607",
    firstName: "Awa",
    lastName: "Niang",
    phone: "+221776543210",
    residenceCountry: "Sénégal",
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
    createdAt: "2025-09-01",
    preferredStaffId: "fatou",
  },
  {
    id: "cl-7",
    loyaltyCode: "BACO-FID-7731",
    firstName: "Sokhna",
    lastName: "Ndiaye",
    phone: "+221703216549",
    residenceCountry: "Sénégal",
    tier: "gold",
    points: 680,
    lastVisit: "2 mois",
    totalSpent: 410000,
    totalVisits: 14,
    createdAt: "2025-11-12",
  },
  {
    id: "cl-8",
    loyaltyCode: "BACO-FID-8890",
    firstName: "Ndèye",
    lastName: "Diop",
    phone: "+221781239900",
    residenceCountry: "France",
    tier: "silver",
    points: 300,
    lastVisit: "5 mois",
    totalSpent: 180000,
    totalVisits: 7,
    createdAt: "2025-12-01",
  },
  {
    id: "cl-9",
    loyaltyCode: "BACO-FID-9276",
    firstName: "Yacine",
    lastName: "Wade",
    phone: "+221775551234",
    whatsapp: "+221775551234",
    email: "yacine.wade@example.com",
    residenceCountry: "Sénégal",
    tier: "vip",
    birthday: "1990-06-27",
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

/** Takes the live `clients` array (from `useAppData()`) rather than the static seed list, so a cliente created this session is searchable immediately. */
export function searchClients(clients: Cliente[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return clients;
  return clients.filter(
    (c) => clientFullName(c).toLowerCase().includes(q) || c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
  );
}
