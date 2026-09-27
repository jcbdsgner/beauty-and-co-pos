import { CupSoda } from "lucide-react";
import { CoiffureIcon, EpilationIcon, SpaIcon } from "@/components/ui/atoms/service-category-icons";
import type { NotationOption, NotationQuestion } from "@/lib/data/notation";
import type { PreferenceDomain } from "@/lib/data/types";

/** Stand-ins for the domains that have no photos yet (démo) — the Menu's own pictograms. */
const DOMAIN_GLYPH: Partial<Record<PreferenceDomain, React.ComponentType<{ className?: string }>>> = {
  coiffure: CoiffureIcon,
  spa: SpaIcon,
  epilation: EpilationIcon,
  boisson: ({ className }) => <CupSoda strokeWidth={1} className={className} />,
};

/**
 * The picture of a « Noter la cliente » answer — the same image on the questionnaire tile and next
 * to the préférence on the fiche. Fills its (relative, sized) parent. Until the real photos land in
 * `public/notation/`, a nail silhouette in the brand tint stands in; on the length question its free
 * edge grows from short to very long so the answer still reads. Other domains show their pictogram.
 */
export function NotationPhoto({ question, option }: { question: NotationQuestion; option: NotationOption }) {
  if (option.photo) {
    // eslint-disable-next-line @next/next/no-img-element -- local fixture photos, sizes vary
    return <img src={option.photo} alt="" className="absolute inset-0 size-full object-cover" />;
  }
  const Glyph = DOMAIN_GLYPH[question.domain];
  if (Glyph) {
    return (
      <span aria-hidden className="absolute inset-0 flex items-center justify-center text-primary/60">
        <Glyph className="size-2/5" />
      </span>
    );
  }
  const lengthRank = question.id === "ongles-longueur" ? question.options.findIndex((o) => o.id === option.id) : undefined;
  return <NailPlaceholder lengthRank={lengthRank} />;
}

function NailPlaceholder({ lengthRank }: { lengthRank?: number }) {
  const free = lengthRank === undefined ? 16 : 6 + lengthRank * 12;
  const top = 58 - free;
  return (
    <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 m-auto h-3/4 w-auto text-primary/25">
      {/* finger */}
      <path d="M30 100 V62 a20 20 0 0 1 40 0 V100 Z" fill="currentColor" opacity="0.45" />
      {/* nail bed + free edge */}
      <path
        d={`M37 84 V${top + 12} Q37 ${top} 50 ${top} Q63 ${top} 63 ${top + 12} V84 Q50 90 37 84 Z`}
        fill="currentColor"
      />
    </svg>
  );
}
