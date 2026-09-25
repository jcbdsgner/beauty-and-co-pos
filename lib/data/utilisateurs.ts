import type { Role } from "@/lib/data/types";

/**
 * Le compte du poste — un seul, personne à choisir (voir ADR 0026 et "Écran de verrouillage" dans
 * CONTEXT.md). Aucun rôle de configuration du salon (voir ADR 0001). Données simulées, comme le
 * reste de l'app — aucune authentification réelle.
 */
export type Utilisateur = {
  name: string;
  initial: string;
  role: Role;
  /** Lie ce compte poste à sa fiche `Praticienne` — voir lib/data/praticiennes.ts. Le salon du
   *  poste, lui, vient de la session (lib/session.ts) : personne n'est rattaché à un salon. */
  praticienneId: string;
  /** Mot de passe par défaut, simulé — la "vraie" valeur vit en session (voir lib/session.ts). */
  password: string;
};

/** Libellés au masculin — la fonction, pas la personne (l'équipe est mixte). */
export const ROLE_LABEL: Record<Role, string> = {
  coiffeuse: "Coiffeur",
  estheticienne: "Esthéticien",
  menage: "Ménage",
  accueil: "Accueil",
};

export const UTILISATEUR: Utilisateur = {
  name: "Ndiole",
  initial: "N",
  role: "accueil",
  praticienneId: "ndiole",
  password: "beautyco",
};
