/**
 * « Noter la cliente » — the short photo questionnaire the receptionist runs on the receipt, once
 * the sale is cashed in. Each answer lands in the cliente's onglerie préférence.
 *
 * Answers are kept on the fiche as `Cliente.notationChoices` (cumulated, most recent first) and shown
 * there as the same photo tiles, next to the préférence of the question's `domain`.
 *
 * Photos: drop the files in `public/notation/` and fill `photo` (e.g. "/notation/gel-x.jpg").
 * Until then each tile shows a placeholder.
 */

import type { Cliente, PreferenceDomain } from "@/lib/data/types";

export type NotationOption = { id: string; label: string; hint?: string; photo?: string };

export type NotationQuestion = {
  id: string;
  /** The préférence domain the answers belong to on the fiche. */
  domain: PreferenceDomain;
  title: string;
  subtitle: string;
  /** Label used when the answer is written into the préférence note. */
  noteLabel: string;
  options: NotationOption[];
};

export const NOTATION_QUESTIONS: NotationQuestion[] = [
  {
    id: "ongles-type",
    domain: "onglerie",
    title: "Quel type d'ongles a-t-elle fait ?",
    subtitle: "Touchez tout ce qu'elle a fait et apprécié.",
    noteLabel: "Type",
    options: [
      { id: "vernis-permanent", label: "Vernis permanent", photo: "/notation/vernis-permanent.jpg" },
      { id: "capsules", label: "Capsules", photo: "/notation/capsules.jpg" },
      { id: "gel-x", label: "Gel X", photo: "/notation/gel-x.jpg" },
      { id: "polygel", label: "Polygel" },
      { id: "french", label: "French", photo: "/notation/french.jpg" },
      { id: "decoration", label: "Décoration", hint: "Chrome, cat eye, baby boomer", photo: "/notation/decoration.jpg" },
    ],
  },
  {
    id: "ongles-longueur",
    domain: "onglerie",
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

/** A cliente's answers for one domain, question by question, resolved to their options. */
export function notationForDomain(client: Pick<Cliente, "notationChoices">, domain: PreferenceDomain) {
  return NOTATION_QUESTIONS.filter((q) => q.domain === domain)
    .map((q) => ({
      question: q,
      options: (client.notationChoices?.[q.id] ?? [])
        .map((id) => q.options.find((o) => o.id === id))
        .filter((o): o is NotationOption => Boolean(o)),
    }))
    .filter((entry) => entry.options.length > 0);
}

/** « Type : Gel X, French · Longueur : Moyens » — the text read of a domain's answers, for the
 *  places that show preferences without photos. */
export function notationSummary(client: Pick<Cliente, "notationChoices">, domain: PreferenceDomain) {
  return notationForDomain(client, domain)
    .map(({ question, options }) => `${question.noteLabel} : ${options.map((o) => o.label).join(", ")}`)
    .join(" · ");
}

/** Fold a fresh round of answers into the cumulated ones — new picks first, no duplicates. */
export function mergeNotationChoices(
  current: Cliente["notationChoices"],
  fresh: Record<string, string[]>,
): Record<string, string[]> {
  const merged: Record<string, string[]> = { ...current };
  for (const [questionId, ids] of Object.entries(fresh)) {
    merged[questionId] = [...new Set([...ids, ...(current?.[questionId] ?? [])])];
  }
  return merged;
}
