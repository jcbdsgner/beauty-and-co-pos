import type { Praticienne } from "@/lib/data/types";

export const PRATICIENNES: Praticienne[] = [
  { id: "bineta", name: "Bineta", role: "coiffeuse", initial: "B", workingToday: true },
  { id: "fatou", name: "Fatou", role: "coiffeuse", initial: "F", workingToday: true },
  { id: "gnagna", name: "Gnagna", role: "estheticienne", initial: "G", workingToday: true },
  { id: "henry", name: "Henry", role: "coiffeuse", initial: "H", workingToday: false },
  { id: "marie-dominique", name: "Marie Dominique", role: "estheticienne", initial: "MD", workingToday: true },
  { id: "michelle", name: "Michelle", role: "coiffeuse", initial: "M", workingToday: true },
  { id: "ndiole", name: "Ndiole", role: "accueil", initial: "N", workingToday: true },
];

export function praticienneById(id: string) {
  return PRATICIENNES.find((p) => p.id === id);
}
