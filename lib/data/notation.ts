/**
 * « Noter la cliente » — the short photo questionnaire the receptionist runs on the receipt, once
 * the sale is cashed in. Each answer lands in the cliente's onglerie préférence.
 *
 * Photos: drop the files in `public/notation/` and fill `photo` (e.g. "/notation/gel-x.jpg").
 * Until then each tile shows a placeholder.
 */

export type NotationOption = { id: string; label: string; hint?: string; photo?: string };

export type NotationQuestion = {
  id: string;
  title: string;
  subtitle: string;
  /** Label used when the answer is written into the préférence note. */
  noteLabel: string;
  options: NotationOption[];
};

export const NOTATION_QUESTIONS: NotationQuestion[] = [
  {
    id: "ongles-type",
    title: "Quel type d'ongles a-t-elle fait ?",
    subtitle: "Touchez tout ce qu'elle a fait et apprécié.",
    noteLabel: "Type",
    options: [
      { id: "vernis-permanent", label: "Vernis permanent" },
      { id: "capsules", label: "Capsules" },
      { id: "gel-x", label: "Gel X" },
      { id: "polygel", label: "Polygel" },
      { id: "french", label: "French" },
      { id: "decoration", label: "Décoration", hint: "Chrome, cat eye, baby boomer" },
    ],
  },
  {
    id: "ongles-longueur",
    title: "Quelle longueur d'ongles ?",
    subtitle: "Plusieurs réponses possibles.",
    noteLabel: "Longueur",
    options: [
      { id: "courts", label: "Courts" },
      { id: "moyens", label: "Moyens" },
      { id: "longs", label: "Longs" },
      { id: "tres-longs", label: "Très longs" },
    ],
  },
];
