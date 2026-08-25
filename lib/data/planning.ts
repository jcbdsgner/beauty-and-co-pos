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

// Une seule enseigne (Beauty and Co) avec 2 salons — pas de multi-entreprise réel,
// contrairement au jeu de données de démo Figma qui suggérait une 2e entreprise fictive.
export const COMPANY_OPTIONS = [{ value: "beauty-and-co", label: "Beauty and Co" }];

export const SALON_OPTIONS = [
  { value: "tous", label: "Tous salons" },
  { value: "almadies", label: "Almadies" },
  { value: "sea-plaza", label: "Sea Plaza" },
];
