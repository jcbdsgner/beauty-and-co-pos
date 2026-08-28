import type { Role } from "@/lib/data/types";

/**
 * Utilisateur — une personne qui peut tenir le poste de comptoir. Sous-ensemble de l'équipe
 * (pas toutes les praticiennes). Aucun rôle de permission : tous ont exactement les mêmes droits
 * (voir ADR 0001). `code` est le code personnel qui identifie qui a accordé une remise.
 * Données simulées, comme le reste de l'app — aucune authentification réelle.
 */
export type Utilisateur = {
  id: string;
  name: string;
  initial: string;
  role: Role;
  code: string;
  /** PIN par défaut, simulé — la "vraie" valeur vit en session (voir securite-view). */
  pin: string;
};

export const ROLE_LABEL: Record<Role, string> = {
  coiffeuse: "Coiffeuse",
  estheticienne: "Esthéticienne",
  accueil: "Accueil",
};

export const UTILISATEURS: Utilisateur[] = [
  { id: "ndiole", name: "Ndiole", initial: "N", role: "accueil", code: "ND01", pin: "1234" },
  { id: "fatou", name: "Fatou", initial: "F", role: "coiffeuse", code: "FA02", pin: "1234" },
  { id: "marie-dominique", name: "Marie Dominique", initial: "MD", role: "estheticienne", code: "MD03", pin: "1234" },
];

export function utilisateurById(id: string) {
  return UTILISATEURS.find((u) => u.id === id);
}
