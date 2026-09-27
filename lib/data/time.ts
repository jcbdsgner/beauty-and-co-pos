/** Heures des deux salons (CONTEXT.md, Praticienne, ADR 0036) : tout se passe de 10h à 20h —
 *  horaires de l'équipe comme rendez-vous. Les grilles du Planning et de l'Accueil courent jusqu'à
 *  22h, la tranche 20h–22h grisée comme « fermé ». */
export const SALON_OPENING = "10:00";
export const SALON_CLOSING = "20:00";
export const GRID_END = "22:00";

/** "HH:mm" -> minutes since midnight. */
export function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** minutes since midnight -> "HH:mm". */
export function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
