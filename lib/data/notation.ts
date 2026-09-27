/**
 * « Noter la cliente » — the short photo questionnaire the receptionist runs on the receipt, once
 * the sale is cashed in. The counter asks the onglerie questions (`NOTER_QUESTIONS`); the other
 * domains carry questions of the same shape so the fiche can show every domain the same way (démo).
 *
 * Each round is kept on the fiche as a `NotationRound` (`Cliente.notationRounds`, most recent first):
 * the fiche tallies how often each answer came back and which one was picked last time.
 *
 * Photos: files in `public/notation/`, set on each option's `photo`. Polygel and the four lengths
 * borrow one of the five real photos for the demo until theirs arrive;
 * the other domains have none yet and show their domain pictogram instead.
 */

import type { Cliente, NotationRound, PreferenceDomain } from "@/lib/data/types";

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
      { id: "polygel", label: "Polygel", photo: "/notation/decoration.jpg" },
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
      { id: "courts", label: "Courts", photo: "/notation/vernis-permanent.jpg" },
      { id: "moyens", label: "Moyens", photo: "/notation/french.jpg" },
      { id: "longs", label: "Longs", photo: "/notation/gel-x.jpg" },
      { id: "tres-longs", label: "Très longs", photo: "/notation/capsules.jpg" },
    ],
  },
  // — Démo : les autres domaines, même forme que l'onglerie, sans photos pour l'instant. —
  {
    id: "coiffure-style",
    domain: "coiffure",
    title: "Quelle coiffure a-t-elle faite ?",
    subtitle: "Plusieurs réponses possibles.",
    noteLabel: "Style",
    options: [
      { id: "tresses-collees", label: "Tresses collées" },
      { id: "box-braids", label: "Box braids" },
      { id: "vanilles", label: "Vanilles" },
      { id: "tissage", label: "Tissage" },
      { id: "brushing", label: "Brushing" },
      { id: "coupe", label: "Coupe" },
    ],
  },
  {
    id: "coiffure-soin",
    domain: "coiffure",
    title: "Quel soin ?",
    subtitle: "Plusieurs réponses possibles.",
    noteLabel: "Soin",
    options: [
      { id: "shampoing", label: "Shampoing seul" },
      { id: "masque", label: "Masque hydratant" },
      { id: "bain-huile", label: "Bain d'huile" },
      { id: "keratine", label: "Kératine" },
    ],
  },
  {
    id: "spa-massage",
    domain: "spa",
    title: "Quel massage ?",
    subtitle: "Plusieurs réponses possibles.",
    noteLabel: "Massage",
    options: [
      { id: "relaxant", label: "Relaxant" },
      { id: "tonique", label: "Tonique" },
      { id: "pierres-chaudes", label: "Pierres chaudes" },
      { id: "deep-tissue", label: "Deep tissue" },
    ],
  },
  {
    id: "spa-pression",
    domain: "spa",
    title: "Quelle pression ?",
    subtitle: "Une seule réponse.",
    noteLabel: "Pression",
    options: [
      { id: "legere", label: "Légère" },
      { id: "moyenne", label: "Moyenne" },
      { id: "forte", label: "Forte" },
    ],
  },
  {
    id: "epilation-methode",
    domain: "epilation",
    title: "Quelle méthode ?",
    subtitle: "Plusieurs réponses possibles.",
    noteLabel: "Méthode",
    options: [
      { id: "cire-chaude", label: "Cire chaude" },
      { id: "cire-froide", label: "Cire froide" },
      { id: "sucre", label: "Sucre" },
      { id: "fil", label: "Fil" },
    ],
  },
  {
    id: "epilation-zone",
    domain: "epilation",
    title: "Quelles zones ?",
    subtitle: "Plusieurs réponses possibles.",
    noteLabel: "Zones",
    options: [
      { id: "sourcils", label: "Sourcils" },
      { id: "visage", label: "Visage" },
      { id: "aisselles", label: "Aisselles" },
      { id: "bras", label: "Bras" },
      { id: "jambes", label: "Jambes" },
      { id: "maillot", label: "Maillot" },
    ],
  },
  {
    id: "boisson-choix",
    domain: "boisson",
    title: "Qu'a-t-elle bu ?",
    subtitle: "Plusieurs réponses possibles.",
    noteLabel: "Choix",
    options: [
      { id: "the-menthe", label: "Thé à la menthe" },
      { id: "cafe", label: "Café Touba" },
      { id: "bissap", label: "Bissap" },
      { id: "bouye", label: "Jus de bouye" },
      { id: "gingembre", label: "Gingembre" },
      { id: "eau", label: "Eau" },
    ],
  },
  {
    id: "boisson-sucre",
    domain: "boisson",
    title: "Sucrée comment ?",
    subtitle: "Une seule réponse.",
    noteLabel: "Sucre",
    options: [
      { id: "sans-sucre", label: "Sans sucre" },
      { id: "peu-sucre", label: "Peu sucré" },
      { id: "sucre", label: "Sucré" },
    ],
  },
];

/** What the counter asks on the receipt — the onglerie questions only. */
export const NOTER_QUESTIONS = NOTATION_QUESTIONS.filter((q) => q.domain === "onglerie");

type WithRounds = Pick<Cliente, "notationRounds">;

export type NotationOptionTally = {
  option: NotationOption;
  /** Rounds in which it was picked. */
  count: number;
  /** Picked in the most recent round that answered the question. */
  latest: boolean;
};

export type NotationQuestionTally = {
  question: NotationQuestion;
  /** Rounds that answered this question. */
  rounds: number;
  lastAt?: string;
  /** Every option, in the question's order — `count` 0 when never picked. */
  options: NotationOptionTally[];
};

/** How a cliente answered each question of a domain across all her rounds. Questions she was never
 *  asked are left out. */
export function notationTally(client: WithRounds, domain: PreferenceDomain): NotationQuestionTally[] {
  const rounds: NotationRound[] = client.notationRounds ?? [];
  return NOTATION_QUESTIONS.filter((q) => q.domain === domain)
    .map((question) => {
      const answered = rounds.filter((r) => (r.choices[question.id]?.length ?? 0) > 0);
      const last = answered[0]?.choices[question.id] ?? [];
      return {
        question,
        rounds: answered.length,
        lastAt: answered[0]?.at,
        options: question.options.map((option) => ({
          option,
          count: answered.filter((r) => r.choices[question.id].includes(option.id)).length,
          latest: last.includes(option.id),
        })),
      };
    })
    .filter((t) => t.rounds > 0);
}

/** The options she took, the ones picked last time first, then the most frequent. */
export function takenOptions(tally: NotationQuestionTally): NotationOptionTally[] {
  return tally.options
    .filter((o) => o.count > 0)
    .sort((a, b) => Number(b.latest) - Number(a.latest) || b.count - a.count);
}

/** When her latest round touching this domain happened. */
export function lastNotationAt(client: WithRounds, domain: PreferenceDomain): string | undefined {
  const ids = new Set(NOTATION_QUESTIONS.filter((q) => q.domain === domain).map((q) => q.id));
  return client.notationRounds?.find((r) => Object.keys(r.choices).some((id) => ids.has(id) && r.choices[id].length > 0))?.at;
}

/** A cliente's answers for one domain, question by question, resolved to their options — the ones
 *  picked last time first. */
export function notationForDomain(client: WithRounds, domain: PreferenceDomain) {
  return notationTally(client, domain).map((t) => ({
    question: t.question,
    options: takenOptions(t).map((o) => o.option),
  }));
}

/** « Type : Gel X, French · Longueur : Moyens » — the text read of a domain's answers, for the
 *  places that show preferences without photos. */
export function notationSummary(client: WithRounds, domain: PreferenceDomain) {
  return notationForDomain(client, domain)
    .map(({ question, options }) => `${question.noteLabel} : ${options.map((o) => o.label).join(", ")}`)
    .join(" · ");
}
