import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats an ALL-CAPS service label as "First letter up, rest lowercase". */
export function toSentenceCase(label: string) {
  const lower = label.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const fcfaFormatter = new Intl.NumberFormat("fr-FR");

/** FCFA amount, e.g. 12345 -> "12 345 F" — never €, per PRODUCT.md. */
export function formatFcfa(amount: number) {
  return `${fcfaFormatter.format(Math.round(amount))} F`;
}
