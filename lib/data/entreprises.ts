import type { Company, Salon } from "@/lib/data/types";

export const COMPANIES: Company[] = [
  { id: "beauty-and-co", name: "Beauty and Co" },
];

export const SALONS: Salon[] = [
  { id: "almadies", companyId: "beauty-and-co", name: "Almadies", address: "Route des Almadies, Dakar", active: true, closedDays: ["lun"] },
  { id: "sea-plaza-bco", companyId: "beauty-and-co", name: "Sea Plaza", address: "Sea Plaza, Corniche Ouest, Dakar", active: true },
];

export function salonById(id: string) {
  return SALONS.find((s) => s.id === id);
}
