import type { Company, Salon } from "@/lib/data/types";

export const COMPANIES: Company[] = [
  { id: "beauty-and-co", name: "Beauty and Co" },
  { id: "michele-ka", name: "Michele Ka" },
];

export const SALONS: Salon[] = [
  { id: "almadies", companyId: "beauty-and-co", name: "Almadies", address: "Route des Almadies, Dakar", active: true },
  { id: "sea-plaza-bco", companyId: "beauty-and-co", name: "Sea Plaza", address: "Sea Plaza, Corniche Ouest, Dakar", active: true },
  { id: "sea-plaza-mk", companyId: "michele-ka", name: "Sea Plaza", address: "Sea Plaza, Corniche Ouest, Dakar", active: true },
];
