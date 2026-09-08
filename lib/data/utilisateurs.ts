import type { Role } from "@/lib/data/types";

/**
 * Utilisateur — une personne qui peut tenir le poste de comptoir. Sous-ensemble de l'équipe
 * (pas toutes les praticiennes). Aucun rôle de permission : tous ont exactement les mêmes droits
 * (voir ADR 0001). Pas de code personnel — une remise accordée n'en demande plus (ADR 0008).
 * Données simulées, comme le reste de l'app — aucune authentification réelle.
 */
export type Utilisateur = {
  id: string;
  name: string;
  initial: string;
  role: Role;
  /** PIN par défaut, simulé — la "vraie" valeur vit en session (voir securite-view). */
  pin: string;
};

/** Libellés au masculin — la fonction, pas la personne (l'équipe est mixte). */
export const ROLE_LABEL: Record<Role, string> = {
  coiffeuse: "Coiffeur",
  estheticienne: "Esthéticien",
  menage: "Ménage",
  accueil: "Accueil",
};

export const UTILISATEURS: Utilisateur[] = [
  { id: "ndiole", name: "Ndiole", initial: "N", role: "accueil", pin: "1234" },
  { id: "fatou", name: "Fatou", initial: "F", role: "coiffeuse", pin: "1234" },
  { id: "marie-dominique", name: "Marie Dominique", initial: "MD", role: "estheticienne", pin: "1234" },
];

export function utilisateurById(id: string) {
  return UTILISATEURS.find((u) => u.id === id);
}
