"use client";

import { BOOKING_QUESTIONS } from "@/lib/data/booking-questions";
import { SERVICE_CATEGORIES } from "@/lib/data/menu";
import { TextInput } from "@/components/ui/atoms/text-input";
import { cn } from "@/lib/utils";

/** Réponses en cours de saisie, par `${personKey}:${categoryId}` puis par id de question —
 *  même forme que le `QuestionAnswers` de la prise de RDV b&co. */
export type RdvAnswers = Record<string, Record<string, string>>;

export const rdvAnswerKey = (personKey: string, categoryId: string) => `${personKey}:${categoryId}`;

/** Une personne et les catégories qu'elle a choisies (dans l'ordre du Menu). */
export type RdvQuestionPerson = { key: string; label: string; categoryIds: string[] };

/** Questions restées sans réponse, toutes personnes confondues — affiché, jamais bloquant :
 *  au téléphone, la réceptionniste n'a pas toujours la réponse. */
export function missingAnswers(people: RdvQuestionPerson[], answers: RdvAnswers): number {
  return people.reduce(
    (n, p) =>
      n +
      p.categoryIds.reduce(
        (m, cat) =>
          m + (BOOKING_QUESTIONS[cat] ?? []).filter((q) => !(answers[rdvAnswerKey(p.key, cat)]?.[q.id] ?? "").trim()).length,
        0,
      ),
    0,
  );
}

/**
 * Les questions de catégorie de la prise de RDV b&co (tresses à retirer, diabétique, type de
 * peau…), posées au comptoir dans la fenêtre rendez-vous : une section par personne × catégorie
 * choisie, libellés verbatim. Rien quand aucune catégorie choisie n'a de questions.
 */
export function RdvQuestions({
  people,
  answers,
  onAnswer,
}: {
  people: RdvQuestionPerson[];
  answers: RdvAnswers;
  onAnswer: (personKey: string, categoryId: string, questionId: string, value: string) => void;
}) {
  const sections = people.flatMap((p) =>
    SERVICE_CATEGORIES.filter((c) => p.categoryIds.includes(c.id) && BOOKING_QUESTIONS[c.id]).map((c) => ({
      person: p,
      category: c,
    })),
  );
  if (sections.length === 0) return null;
  const showPerson = people.length > 1;

  return (
    <div className="flex flex-col gap-3">
      {sections.map(({ person, category }) => {
        const key = rdvAnswerKey(person.key, category.id);
        return (
          <fieldset key={key} className="rounded-box border border-base-300 px-4 py-3">
            <legend className="px-1 text-sm font-semibold text-base-content">
              {category.name}
              {showPerson && <span className="font-normal text-base-content/60"> · {person.label}</span>}
            </legend>
            <div className="flex flex-col divide-y divide-base-300">
              {BOOKING_QUESTIONS[category.id].map((q) => {
                const value = answers[key]?.[q.id] ?? "";
                return q.type === "yesno" ? (
                  <div key={q.id} className="flex items-center justify-between gap-4 py-2">
                    <span className="text-sm text-base-content">{q.label}</span>
                    <div role="radiogroup" aria-label={q.label} className="flex shrink-0 gap-2">
                      {["Oui", "Non"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          role="radio"
                          aria-checked={value === opt}
                          onClick={() => onAnswer(person.key, category.id, q.id, value === opt ? "" : opt)}
                          className={cn(
                            "h-11 min-w-16 rounded-field border px-4 text-sm font-semibold transition",
                            value === opt
                              ? "border-primary bg-primary text-primary-content"
                              : "border-base-300 bg-base-100 text-base-content hover:border-primary/50",
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <label key={q.id} className="flex flex-col gap-1.5 py-2">
                    <span className="text-sm text-base-content">{q.label}</span>
                    <TextInput value={value} onChange={(e) => onAnswer(person.key, category.id, q.id, e.target.value)} />
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
