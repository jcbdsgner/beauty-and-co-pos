/**
 * Palette d'accent par praticienne — exception ciblée à la règle mono-couleur du POS (daisyUI
 * "beautyco", #886666 partout ailleurs), validée avec l'utilisateur pour le Planning : les
 * références visuelles (calendrier par collaborateur) reposent sur une teinte par ligne pour
 * repérer d'un coup d'œil qui travaille où. Tons pastel choisis pour rester à l'écart de l'ambre
 * (#b5590a, seul signal "à traiter" du POS) et du rose/taupe de marque.
 */
type PraticienneAccent = { bg: string; border: string; text: string; dot: string };

const PALETTE: PraticienneAccent[] = [
  { bg: "#eaf1fb", border: "#c3d6f0", text: "#3f5f95", dot: "#5b7fc0" }, // bleu
  { bg: "#eaf5f0", border: "#c2e4d4", text: "#3f7a5f", dot: "#4f9c78" }, // sauge
  { bg: "#f2eef9", border: "#dccdf0", text: "#6c4f96", dot: "#8a63bd" }, // violet
  { bg: "#e9f4f6", border: "#bfe0e5", text: "#2f7480", dot: "#3f95a3" }, // teal
  { bg: "#f7eef2", border: "#eccfdd", text: "#9c4f74", dot: "#c1638f" }, // prune
  { bg: "#eef2e7", border: "#d4e0c0", text: "#607a3a", dot: "#7f9c4e" }, // olive doux
  { bg: "#eceef7", border: "#ccd2ec", text: "#4a5590", dot: "#6570b8" }, // indigo
];

function hash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function praticienneAccent(id: string): PraticienneAccent {
  return PALETTE[hash(id) % PALETTE.length];
}
