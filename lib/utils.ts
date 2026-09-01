import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fcfaFormatter = new Intl.NumberFormat("fr-FR");

/**
 * FCFA amount, e.g. 12345 -> "12 345 F" — never €, per PRODUCT.md.
 * `Intl` groups with U+202F (narrow no-break space), which all but disappears at the ticket's
 * hero size ("71 000" reads as "71000"). Swap it for U+00A0 (regular no-break space) so the
 * thousands gap holds at every size and never wraps.
 */
export function formatFcfa(amount: number) {
  return `${fcfaFormatter.format(Math.round(amount)).replace(/ /g, " ")} F`;
}
