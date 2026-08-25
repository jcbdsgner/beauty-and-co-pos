import type { BadgeVariant } from "@/components/ui/badge";

/**
 * Mock data for the Planning module (vue Équipe / vue Rendez-vous).
 *
 * Mapping badge de rôle (documenté ici car repris dans team-view.tsx) :
 *   Coiffeuse      -> variant "dark"    (taupe, --pos-accent-dark)
 *   Esthéticienne  -> variant "error"   (rose/rouge, --color-error)
 *   Accueil        -> variant "info"    (bleu, --color-info)
 *   Stock          -> variant "success" (vert, --color-success)
 */

export type Role = "coiffeuse" | "estheticienne" | "accueil" | "stock";

export const ROLE_LABELS: Record<Role, string> = {
  coiffeuse: "Coiffeuse",
  estheticienne: "Esthéticienne",
  accueil: "Accueil",
  stock: "Stock",
};

export const ROLE_BADGE_VARIANT: Record<Role, BadgeVariant> = {
  coiffeuse: "dark",
  estheticienne: "error",
  accueil: "info",
  stock: "success",
};

export type TeamMember = {
  id: string;
  name: string;
  initial: string;
  role: Role;
};

function initialsOf(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 1).toUpperCase();
}

const RAW_TEAM: Array<{ name: string; role: Role }> = [
  { name: "Aminata", role: "accueil" },
  { name: "Bineta", role: "estheticienne" },
  { name: "Codou", role: "accueil" },
  { name: "Diarra", role: "accueil" },
  { name: "Fatou", role: "coiffeuse" },
  { name: "Gestionnaire Stock", role: "stock" },
  { name: "Gnagna", role: "estheticienne" },
  { name: "Henry", role: "coiffeuse" },
  { name: "Margha", role: "accueil" },
  { name: "Marie Dominique", role: "estheticienne" },
  { name: "Michelle", role: "estheticienne" },
  { name: "Ndiole", role: "coiffeuse" },
  { name: "Oumy", role: "coiffeuse" },
  { name: "William", role: "coiffeuse" },
  { name: "Yaye Fatou", role: "coiffeuse" },
  { name: "Zeyna", role: "estheticienne" },
  { name: "Noellie", role: "accueil" },
];

export const TEAM_MEMBERS: TeamMember[] = RAW_TEAM.map((m, i) => ({
  id: `team-${i + 1}`,
  name: m.name,
  role: m.role,
  initial: initialsOf(m.name),
}));

export const ROLE_FILTERS: Array<{ value: "tous" | Role; label: string }> = [
  { value: "tous", label: "Tous" },
  { value: "coiffeuse", label: "Coiffeuse" },
  { value: "estheticienne", label: "Esthéticienne" },
  { value: "accueil", label: "Accueil" },
];

export type WeekDay = {
  /** LUN / MAR / MER / JEU / VEN / SAM / DIM */
  short: string;
  /** Numéro du jour dans le mois */
  dayNumber: number;
  /** Libellé complet du jour ("Lundi 24 Août 2026") pour l'en-tête et les états vides */
  full: string;
};

export const MONTH_LABEL = "Août 2026";

export const WEEK_DAYS: WeekDay[] = [
  { short: "LUN", dayNumber: 24, full: "Lundi 24 Août 2026" },
  { short: "MAR", dayNumber: 25, full: "Mardi 25 Août 2026" },
  { short: "MER", dayNumber: 26, full: "Mercredi 26 Août 2026" },
  { short: "JEU", dayNumber: 27, full: "Jeudi 27 Août 2026" },
  { short: "VEN", dayNumber: 28, full: "Vendredi 28 Août 2026" },
  { short: "SAM", dayNumber: 29, full: "Samedi 29 Août 2026" },
  { short: "DIM", dayNumber: 30, full: "Dimanche 30 Août 2026" },
];

/** Index of "today" within WEEK_DAYS — this mock week starts on the actual current date
 *  (Lundi 24 Août 2026), so "today" is the first day. Drives the "Aujourd'hui" shortcut
 *  button, which only appears once the user has navigated away from this index. */
export const TODAY_INDEX = 0;

// Deux entreprises distinctes, qui se partagent l'emplacement Sea Plaza : Beauty and Co
// (Almadies + Sea Plaza) et Michele Ka (Sea Plaza uniquement, pas de salon Almadies).
export const COMPANY_OPTIONS = [
  { value: "beauty-and-co", label: "Beauty and Co" },
  { value: "michele-ka", label: "Michele Ka" },
];

export const SALON_OPTIONS_BY_COMPANY: Record<string, Array<{ value: string; label: string }>> = {
  "beauty-and-co": [
    { value: "tous", label: "Tous salons" },
    { value: "almadies", label: "Almadies" },
    { value: "sea-plaza", label: "Sea Plaza" },
  ],
  "michele-ka": [
    { value: "tous", label: "Tous salons" },
    { value: "sea-plaza", label: "Sea Plaza" },
  ],
};

/**
 * Rendez-vous mock (vue "Rendez-vous" du Planning) — cf. CONTEXT.md : même événement que le
 * Créneau b&co vu côté équipe, mais sans lien d'id avec ce mock-là pour l'instant.
 */
export type AppointmentStatus = "confirme" | "en_attente";

export type Appointment = {
  id: string;
  /** TeamMember.id */
  staffId: string;
  clientName: string;
  service: string;
  /** "HH:MM", 24h, aligné sur la grille DAY_START_HOUR–DAY_END_HOUR / SLOT_MINUTES. */
  start: string;
  durationMin: number;
  status: AppointmentStatus;
};

export const DAY_START_HOUR = 9;
export const DAY_END_HOUR = 19;
export const SLOT_MINUTES = 30;
export const SLOT_COUNT = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES;

/** Index (0-based) du créneau de 30 min contenant `time` sur la grille du jour. */
export function timeToSlotIndex(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return Math.round(((hour - DAY_START_HOUR) * 60 + minute) / SLOT_MINUTES);
}

/** Nombre de créneaux de 30 min occupés par une durée donnée (arrondi, minimum 1). */
export function durationToSlotSpan(durationMin: number): number {
  return Math.max(1, Math.round(durationMin / SLOT_MINUTES));
}

// Rendez-vous par index de jour (0 = LUN, cf. WEEK_DAYS). Seuls Lundi et Mardi ont des
// données pour l'instant ; les autres jours retombent sur l'état vide déjà géré par
// AppointmentsView — pas besoin de peupler toute la semaine pour un mock.
export const APPOINTMENTS_BY_DAY: Record<number, Appointment[]> = {
  0: [
    { id: "rdv-1", staffId: "team-5", clientName: "Awa Diop", service: "Coupe femme", start: "09:00", durationMin: 60, status: "confirme" },
    { id: "rdv-2", staffId: "team-5", clientName: "Marie Sow", service: "Balayage californien", start: "11:00", durationMin: 120, status: "confirme" },
    { id: "rdv-3", staffId: "team-5", clientName: "Khady Ndiaye", service: "Brushing", start: "15:30", durationMin: 45, status: "confirme" },
    { id: "rdv-4", staffId: "team-8", clientName: "Ibrahima Fall", service: "Coupe homme", start: "09:30", durationMin: 30, status: "confirme" },
    { id: "rdv-5", staffId: "team-8", clientName: "Moussa Diallo", service: "Tresse", start: "13:00", durationMin: 90, status: "confirme" },
    { id: "rdv-6", staffId: "team-13", clientName: "Aida Gueye", service: "Tissage", start: "10:00", durationMin: 120, status: "confirme" },
    { id: "rdv-7", staffId: "team-13", clientName: "Fama Ba", service: "Coloration", start: "16:00", durationMin: 90, status: "en_attente" },
    { id: "rdv-8", staffId: "team-2", clientName: "Coumba Sarr", service: "Épilation sourcils", start: "09:00", durationMin: 15, status: "confirme" },
    { id: "rdv-9", staffId: "team-2", clientName: "Ndeye Diagne", service: "Soin du dos", start: "10:30", durationMin: 60, status: "confirme" },
    { id: "rdv-10", staffId: "team-2", clientName: "Astou Fall", service: "Massage relaxant 60min", start: "14:00", durationMin: 60, status: "confirme" },
    { id: "rdv-11", staffId: "team-16", clientName: "Bineta Cissé", service: "Réflexologie plantaire", start: "11:30", durationMin: 45, status: "confirme" },
    { id: "rdv-12", staffId: "team-16", clientName: "Aissatou Ba", service: "Massage duo", start: "17:00", durationMin: 60, status: "en_attente" },
  ],
  1: [
    { id: "rdv-13", staffId: "team-5", clientName: "Sokhna Mbaye", service: "Coloration", start: "10:00", durationMin: 90, status: "confirme" },
    { id: "rdv-14", staffId: "team-2", clientName: "Rama Diouf", service: "Massage duo", start: "14:30", durationMin: 60, status: "en_attente" },
  ],
};
