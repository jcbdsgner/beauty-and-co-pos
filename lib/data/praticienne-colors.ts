/**
 * Palette d'accent par praticienne — couleurs reprises à la lettre du Figma de référence
 * (node 270:2466, ADR 0025) : une teinte saturée distincte par ligne (rouge, sarcelle, bleu,
 * ambre, violet, rose, vert, ardoise…), plutôt que la palette de 16 tons pastel qui excluait
 * délibérément l'ambre (ADR 0024, table rase — voir ADR 0025). Assignée par **position** dans
 * l'équipe planifiable (pas par hash de l'id) pour reproduire l'ordre du Figma ; se déplace avec
 * la praticienne si l'équipe est réordonnée par glisser-déposer.
 */
type PraticienneAccent = { bg: string; border: string; text: string; dot: string };

const PALETTE: PraticienneAccent[] = [
  { bg: "#feebe6", border: "#ef4444", text: "#b92819", dot: "#dc4632" }, // rouge (Bineta)
  { bg: "#e0f2f1", border: "#14b8a6", text: "#0d786e", dot: "#149688" }, // sarcelle (Fatou)
  { bg: "#edf6fb", border: "#49a4ca", text: "#1e6eaa", dot: "#3891cc" }, // bleu (Henry)
  { bg: "#fff7e6", border: "#f59e0b", text: "#a0640a", dot: "#d99320" }, // ambre (Michelle)
  { bg: "#f3e8ff", border: "#8b5cf6", text: "#6432b9", dot: "#7c50d2" }, // violet (Gnagna)
  { bg: "#fde2eb", border: "#ec4899", text: "#aa1e55", dot: "#d23c78" }, // rose (Marie Dominique)
  { bg: "#dcfce7", border: "#22c55e", text: "#168048", dot: "#22a05a" }, // vert (Adja)
  { bg: "#f1f4f5", border: "#778d9c", text: "#414b82", dot: "#5a69a0" }, // ardoise (Aïssatou)
];

export function praticienneAccent(index: number): PraticienneAccent {
  return PALETTE[((index % PALETTE.length) + PALETTE.length) % PALETTE.length];
}
