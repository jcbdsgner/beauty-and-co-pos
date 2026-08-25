import { SuiviCard } from "@/components/suivi/suivi-card";
import type { SuiviSection as SuiviSectionData } from "@/lib/data/suivi";

/** Section de la tournée avec en-tête (icône + libellé petites capitales + compteur) et sa liste de cartes. */
export function SuiviSection({ section }: { section: SuiviSectionData }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <section.icon aria-hidden className="size-4 text-[var(--brand-taupe-muted)]" />
        <p className="text-xs font-semibold tracking-[0.14em] text-[var(--brand-taupe-muted)] uppercase">
          {section.label} · {section.count}
        </p>
        <span aria-hidden className="h-px flex-1 bg-[var(--color-gray-200)]" />
      </div>
      <div className="flex flex-col gap-3">
        {section.cards.map((card) => (
          <SuiviCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
