import { SERVICE_CATEGORIES, serviceById } from "@/lib/data/menu";
import type { RendezVous } from "@/lib/data/types";

/** Une question obligatoire de la prise de rendez-vous b&co, posée une fois par personne et par
 *  catégorie (`requiredQuestions`, lib/data/booking-services.ts côté b&co) — libellé et id verbatim.
 *  `short` est la forme courte affichée au comptoir. */
export type BookingQuestion = { id: string; type: "yesno" | "text"; label: string; short: string };

export const BOOKING_QUESTIONS: Record<string, BookingQuestion[]> = {
  coiffure: [
    { id: "tresses-a-retirer", type: "yesno", label: "Avez-vous des tresses à retirer ?", short: "Tresses à retirer" },
    { id: "voilee", type: "yesno", label: "Êtes-vous voilée ?", short: "Voilée" },
    { id: "propres-extensions", type: "yesno", label: "Apporterez-vous vos propres extensions ?", short: "Apporte ses extensions" },
  ],
  "manucure-pedicure": [
    { id: "vernis-permanent-ou-gel-a-retirer", type: "yesno", label: "Avez-vous un vernis permanent ou un gel à retirer ?", short: "Vernis permanent / gel à retirer" },
    { id: "allergique-produits", type: "yesno", label: "Êtes-vous allergique à certains produits ? (merci de préciser sur la note interne)", short: "Allergique à certains produits" },
    { id: "diabetique", type: "yesno", label: "Êtes-vous diabétique ?", short: "Diabétique" },
  ],
  spa: [
    { id: "supporte-chaleur", type: "yesno", label: "Supportez-vous la chaleur ?", short: "Supporte la chaleur" },
    { id: "asthmatique", type: "yesno", label: "Êtes-vous asthmatique ?", short: "Asthmatique" },
    { id: "choix-huile", type: "text", label: "Quel choix d'huile souhaitez-vous ?", short: "Huile" },
    { id: "zone-douleur", type: "text", label: "Où ressentez-vous la douleur ?", short: "Zone de douleur" },
  ],
  "soin-du-visage": [
    { id: "type-peau", type: "text", label: "Quel type de peau avez-vous ? (Sensible, Grasse ou Mixte)", short: "Type de peau" },
  ],
};

export type BookingAnswerGroup = {
  categoryId: string;
  categoryName: string;
  answers: { question: BookingQuestion; value: string }[];
};

/** Les réponses d'une personne, une entrée par catégorie réservée (dans l'ordre du menu). Les
 *  rendez-vous d'une même catégorie portent les mêmes réponses — la première trouvée fait foi. */
export function bookingAnswerGroups(lines: RendezVous[]): BookingAnswerGroup[] {
  const byCategory = new Map<string, Record<string, string>>();
  for (const rv of lines) {
    const categoryId = serviceById(rv.serviceId)?.categoryId;
    if (!categoryId || !rv.bookingAnswers || byCategory.has(categoryId)) continue;
    byCategory.set(categoryId, rv.bookingAnswers);
  }
  return SERVICE_CATEGORIES.flatMap((cat) => {
    const raw = byCategory.get(cat.id);
    const answers = (BOOKING_QUESTIONS[cat.id] ?? [])
      .map((question) => ({ question, value: raw?.[question.id]?.trim() ?? "" }))
      .filter((a) => a.value !== "");
    return answers.length > 0 ? [{ categoryId: cat.id, categoryName: cat.name, answers }] : [];
  });
}

const SEED_TEXT: Record<string, string[]> = {
  "choix-huile": ["Huile d'argan", "Huile de coco", "Huile d'amande douce", "Sans préférence"],
  "zone-douleur": ["Bas du dos", "Nuque et épaules", "Jambes", "Aucune"],
  "type-peau": ["Sensible", "Grasse", "Mixte"],
};

/** Réponses de démo, stables pour une même personne et une même catégorie. « Non » domine les
 *  oui/non, comme en vrai. */
export function seedBookingAnswers(seedKey: string, serviceId: string): Record<string, string> | undefined {
  const categoryId = serviceById(serviceId)?.categoryId;
  const questions = categoryId ? BOOKING_QUESTIONS[categoryId] : undefined;
  if (!questions) return undefined;
  return Object.fromEntries(
    questions.map((q, i) => {
      let h = 7;
      for (const ch of `${seedKey}:${categoryId}:${q.id}:${i}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      if (q.type === "text") {
        const pool = SEED_TEXT[q.id] ?? ["—"];
        return [q.id, pool[h % pool.length]];
      }
      return [q.id, h % 4 === 0 ? "Oui" : "Non"];
    }),
  );
}
