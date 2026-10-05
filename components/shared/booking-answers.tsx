import { bookingAnswerGroups } from "@/lib/data/booking-questions";
import type { RendezVous } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/**
 * Ce que la bénéficiaire a répondu aux questions de catégorie en prenant rendez-vous en ligne
 * (tresses à retirer, diabétique, type de peau…) — toujours visible, pour préparer le passage.
 * Un « Oui » ressort en gras : c'est lui qui change la préparation. Rien si aucune réponse
 * (rendez-vous pris au comptoir).
 */
export function BookingAnswers({
  lines,
  bare = false,
  className,
}: {
  lines: RendezVous[];
  /** Sans fond ni titre — quand le conteneur porte déjà « Réponses à la réservation ». */
  bare?: boolean;
  className?: string;
}) {
  const groups = bookingAnswerGroups(lines);
  if (groups.length === 0) return null;
  return (
    <div className={cn(!bare && "rounded-box bg-base-200 px-3 py-2", className)}>
      {!bare && (
        <p className="text-[11px] font-semibold tracking-[0.08em] text-base-content/55 uppercase">Réponses à la réservation</p>
      )}
      <dl className={cn("grid grid-cols-[max-content_1fr] items-baseline gap-x-3 gap-y-2", !bare && "mt-1")}>
        {groups.map((g) => (
          <div key={g.categoryId} className="contents">
            <dt className="text-xs text-base-content/55">{g.categoryName}</dt>
            <dd className="flex flex-col gap-0.5 text-sm leading-snug text-base-content">
              {g.answers.map(({ question, value }) => (
                <span key={question.id} title={question.label}>
                  {question.short} :{" "}
                  <span className={cn(question.type === "yesno" && value === "Oui" && "font-semibold")}>{value}</span>
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
