import { cn } from "@/lib/utils";

/**
 * One contact detail — icon well, small grey label, the value (or « Non renseigné » en sourdine).
 * Same look as the Coordonnées rows of the fiche cliente, for any read view that lists a person's
 * téléphone / e-mail / adresse.
 */
export function ContactRow({
  icon,
  label,
  value,
  wrap = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  /** Let a long value (an address) run onto several lines instead of truncating. */
  wrap?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-secondary">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-base-content/55">{label}</p>
        <p
          className={cn(
            "text-[15px]",
            wrap ? "leading-snug" : "truncate",
            value ? "text-base-content" : "text-base-content/45",
          )}
        >
          {value ?? "Non renseigné"}
        </p>
      </div>
    </div>
  );
}
