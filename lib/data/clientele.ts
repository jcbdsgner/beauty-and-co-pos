import type { Cliente } from "@/lib/data/types";

export const CLIENTS: Cliente[] = [
  {
    id: "cl-1",
    firstName: "Awa",
    lastName: "Sarr",
    phone: "+221784455661",
    whatsapp: "+221784455661",
    email: "awa.sarr@example.com",
    tier: null,
    points: 320,
    lastVisit: "Il y a 6 j",
    totalSpent: 245000,
    totalVisits: 9,
    createdAt: "2026-02-01",
    preferredStaffId: "bineta",
  },
  {
    id: "cl-2",
    firstName: "Fatou",
    lastName: "Camara",
    phone: "+221771122334",
    tier: null,
    points: 140,
    lastVisit: "1 sem.",
    totalSpent: 98000,
    totalVisits: 4,
    createdAt: "2026-05-10",
  },
  {
    id: "cl-3",
    firstName: "Coumba",
    lastName: "Thiam",
    phone: "+221765544332",
    tier: null,
    points: 60,
    lastVisit: "4 sem.",
    totalSpent: 42000,
    totalVisits: 2,
    createdAt: "2026-06-20",
  },
  {
    id: "cl-4",
    firstName: "Bineta",
    lastName: "Diagne",
    phone: "+221709988776",
    tier: null,
    points: 210,
    lastVisit: "1 mois",
    totalSpent: 156000,
    totalVisits: 6,
    createdAt: "2026-01-15",
  },
  {
    id: "cl-5",
    firstName: "Mariam",
    lastName: "Kane",
    phone: "+221781234567",
    tier: null,
    points: 90,
    lastVisit: "2 mois",
    totalSpent: 61000,
    totalVisits: 3,
    createdAt: "2026-03-05",
  },
  {
    id: "cl-6",
    firstName: "Awa",
    lastName: "Niang",
    phone: "+221776543210",
    tier: "vip",
    points: 1420,
    lastVisit: "2 mois",
    totalSpent: 890000,
    totalVisits: 22,
    createdAt: "2025-09-01",
    preferredStaffId: "fatou",
  },
  {
    id: "cl-7",
    firstName: "Sokhna",
    lastName: "Ndiaye",
    phone: "+221703216549",
    tier: "gold",
    points: 680,
    lastVisit: "2 mois",
    totalSpent: 410000,
    totalVisits: 14,
    createdAt: "2025-11-12",
  },
  {
    id: "cl-8",
    firstName: "Ndèye",
    lastName: "Diop",
    phone: "+221781239900",
    tier: "silver",
    points: 300,
    lastVisit: "5 mois",
    totalSpent: 180000,
    totalVisits: 7,
    createdAt: "2025-12-01",
  },
  {
    id: "cl-9",
    firstName: "Yacine",
    lastName: "Wade",
    phone: "+221775551234",
    whatsapp: "+221775551234",
    email: "yacine.wade@example.com",
    tier: "vip",
    birthday: "1990-06-27",
    points: 950,
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

/** Takes the live `clients` array (from `useAppData()`) rather than the static seed list, so a cliente created this session is searchable immediately. */
export function searchClients(clients: Cliente[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return clients;
  return clients.filter(
    (c) => clientFullName(c).toLowerCase().includes(q) || c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
  );
}
