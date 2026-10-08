import type { Company, Salon } from "@/lib/data/types";

export const COMPANIES: Company[] = [
  {
    id: "beauty-and-co",
    name: "Beauty and Co",
    // Mentions d'émettrice des devis et factures (ADR 0042) — fictives, à remplacer par les vraies.
    address: "Route des Almadies, Dakar, Sénégal",
    ninea: "007654321 2V2",
    rccm: "SN-DKR-2019-B-08812",
    phone: "+221 33 820 00 00",
    email: "contact@beautyandco.sn",
  },
];

export const SALONS: Salon[] = [
  { id: "almadies", companyId: "beauty-and-co", name: "Almadies", address: "Route des Almadies, Dakar", active: true, closedDays: ["lun"] },
  { id: "sea-plaza-bco", companyId: "beauty-and-co", name: "Sea Plaza", address: "Sea Plaza, Corniche Ouest, Dakar", active: true },
];

export function salonById(id: string) {
  return SALONS.find((s) => s.id === id);
}
