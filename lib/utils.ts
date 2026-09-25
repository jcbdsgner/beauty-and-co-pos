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

/** Senegalese numbers in one shape — `+221 77 412 08 55` — whatever spacing the source used.
 *  Anything that isn't a 9-digit national number (after the +221) is returned untouched. */
export function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const national = digits.startsWith("221") ? digits.slice(3) : digits;
  if (national.length !== 9) return raw;
  return `+221 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5, 7)} ${national.slice(7)}`;
}
