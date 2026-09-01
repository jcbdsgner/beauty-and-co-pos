/**
 * Pays de résidence d'une cliente — obligatoire à la création (ADR : lot 2026-09, point 5). Liste
 * courte, orientée clientèle réelle du salon (Sénégal par défaut, Afrique de l'Ouest, diaspora).
 * Le champ `Cliente.residenceCountry` stocke le libellé tel quel.
 */
export const PAYS_DEFAUT = "Sénégal";

export const PAYS: string[] = [
  "Sénégal",
  "Bénin",
  "Burkina Faso",
  "Cameroun",
  "Canada",
  "Cap-Vert",
  "Côte d'Ivoire",
  "Émirats arabes unis",
  "Espagne",
  "États-Unis",
  "France",
  "Gabon",
  "Gambie",
  "Ghana",
  "Guinée",
  "Guinée-Bissau",
  "Italie",
  "Mali",
  "Maroc",
  "Mauritanie",
  "Niger",
  "Nigéria",
  "Portugal",
  "Royaume-Uni",
  "Suisse",
  "Togo",
  "Tunisie",
  "Autre",
];

export const PAYS_OPTIONS = PAYS.map((p) => ({ value: p, label: p }));
