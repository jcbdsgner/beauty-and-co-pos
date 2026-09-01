import type { Praticienne } from "@/lib/data/types";

export const PRATICIENNES: Praticienne[] = [
  { id: "bineta", name: "Bineta", role: "coiffeuse", initial: "B", workingToday: true, shiftStart: "09:00", shiftEnd: "18:00" },
  { id: "fatou", name: "Fatou", role: "coiffeuse", initial: "F", workingToday: true, shiftStart: "10:00", shiftEnd: "19:00" },
  { id: "gnagna", name: "Gnagna", role: "estheticienne", initial: "G", workingToday: true, shiftStart: "09:00", shiftEnd: "17:00" },
  { id: "henry", name: "Henry", role: "coiffeuse", initial: "H", workingToday: false },
  { id: "marie-dominique", name: "Marie Dominique", role: "estheticienne", initial: "MD", workingToday: true, shiftStart: "11:00", shiftEnd: "19:00" },
  { id: "adja", name: "Adja", role: "estheticienne", initial: "A", workingToday: true, shiftStart: "09:30", shiftEnd: "18:30" },
  { id: "michelle", name: "Michelle", role: "coiffeuse", initial: "M", workingToday: true, shiftStart: "08:30", shiftEnd: "16:30" },
  { id: "aissatou", name: "Aïssatou", role: "menage", initial: "AÏ", workingToday: true, shiftStart: "08:00", shiftEnd: "13:00" },
  { id: "ndiole", name: "Ndiole", role: "accueil", initial: "N", workingToday: true, shiftStart: "08:30", shiftEnd: "19:00" },
];

export function praticienneById(id: string) {
  return PRATICIENNES.find((p) => p.id === id);
}
