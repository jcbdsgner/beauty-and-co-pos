import { Check } from "lucide-react";
import { NotationPhoto } from "@/components/clientele/notation-photo";
import type { NotationOption, NotationQuestion } from "@/lib/data/notation";
import { cn } from "@/lib/utils";

/**
 * One answer of « Noter la cliente » as a photo tile — the same block on the questionnaire (tapped
 * to pick it, `onToggle`) and on the préférences page (read-only, with how many times she took it).
 * `selected` is the questionnaire's pick, or « picked last time » on the préférences page.
 */
export function NotationTile({
  question,
  option,
  tall,
  selected,
  onToggle,
  count,
}: {
  question: NotationQuestion;
  option: NotationOption;
  tall: boolean;
  selected: boolean;
  /** Questionnaire mode: the tile is a toggle button with a check mark. */
  onToggle?: () => void;
  /** Read-only mode: rounds in which she took it — 0 dims the tile. */
  count?: number;
}) {
  const interactive = Boolean(onToggle);
  const never = !interactive && count === 0;
  const body = (
    <>
      <div className={cn("relative w-full overflow-hidden bg-accent", tall ? "aspect-[3/4]" : "aspect-[4/3]", never && "opacity-40 grayscale")}>
        <NotationPhoto question={question} option={option} />
        {interactive ? (
          <span
            aria-hidden
            className={cn(
              "absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border-2 transition duration-200",
              selected ? "scale-100 border-primary bg-primary text-primary-content" : "scale-90 border-primary/30 bg-white/80 text-transparent",
            )}
          >
            <Check className="size-4" strokeWidth={3} />
          </span>
        ) : (
          !never && (
            <span className="absolute top-3 right-3 flex h-8 min-w-8 items-center justify-center rounded-full bg-secondary px-2.5 text-[15px] font-semibold tabular-nums text-secondary-content shadow-[0_2px_6px_rgba(0,0,0,0.18)]">
              ×{count}
            </span>
          )
        )}
      </div>
      <div className="flex min-h-16 flex-col justify-center px-4 py-3">
        <span
          className={cn(
            "text-[17px] leading-tight",
            selected ? "font-semibold text-base-content" : never ? "font-medium text-base-content/45" : "font-medium text-base-content/80",
          )}
        >
          {option.label}
        </span>
        {interactive
          ? option.hint && <span className="mt-0.5 text-[13px] text-base-content/55">{option.hint}</span>
          : (
            <span className={cn("mt-0.5 text-[13px]", selected ? "font-semibold text-secondary" : "text-base-content/50")}>
              {selected ? "Dernière fois" : never ? "Jamais choisi" : `${count} fois`}
            </span>
          )}
      </div>
    </>
  );

  const frame = cn(
    "relative flex flex-col overflow-hidden rounded-box border-2 bg-base-100 text-left",
    selected ? "border-primary shadow-[0_10px_24px_-12px_rgba(136,102,102,0.55)]" : "border-base-300",
  );

  if (!interactive) return <div className={frame}>{body}</div>;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        frame,
        "group transition duration-200 ease-out active:scale-[0.98]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        !selected && "hover:border-primary/40",
      )}
    >
      {body}
    </button>
  );
}
