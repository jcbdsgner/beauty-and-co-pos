import { cn } from "@/lib/utils";
import type { LookbookCategory } from "@/lib/data/lookbook";

type IconProps = { className?: string };

/**
 * Icônes de catégorie dédiées au Lookbook (ciseaux, main, fleur, plume, vagues…) — le set
 * partagé `@/components/ui/icons` ne couvre pas ces silhouettes, donc on les garde locales
 * au module plutôt que de modifier ce fichier partagé.
 */
function ScissorsIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-8", className)}>
      <circle cx="6" cy="6.5" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="17.5" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.7 8L19 18.5M7.7 16L19 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DropletCombIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-8", className)}>
      <path
        d="M12 3.5s5.5 6.2 5.5 10.2a5.5 5.5 0 0 1-11 0C6.5 9.7 12 3.5 12 3.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9.5 14.5c0 1.4 1.1 2.5 2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HandIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-8", className)}>
      <path
        d="M8 12V5a1.5 1.5 0 0 1 3 0v5.5M11 10V4a1.5 1.5 0 0 1 3 0v6.5M14 10.5V5a1.5 1.5 0 0 1 3 0v8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 12.5l-1.6-1.6a1.4 1.4 0 0 0-2 2L7 15.5c1 2.6 3 5 6.5 5 3.6 0 5.5-2.7 5.5-6V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FootIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-8", className)}>
      <path
        d="M10.5 3.5c-2 0-3 2-3 4.5 0 2-2.5 3-2.5 6.5 0 3.3 2.3 5.5 5.5 5.5 3.7 0 6-2.4 6-6.5 0-3.5-1-4-1-6.5s-1.7-3.5-3-3.5-2 1.6-2 1.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8.5 6.5c.5.8.5 2 0 2.8M11 5c.6.9.6 2.3 0 3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function FlowerIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-8", className)}>
      <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="6" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="9.5" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15.2" cy="16" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.8" cy="16" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="9.5" r="2.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FeatherIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-8", className)}>
      <path
        d="M19.5 4.5c-6 0-13 4-13 11.5 0 1.4.2 2.5.2 2.5s1.1.2 2.5.2C16.7 18.7 20.5 11.5 19.5 4.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M18 6.5L6 18.5M11 13.5L7.5 10M14.5 10L11 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WavesIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-8", className)}>
      <path
        d="M2.5 8.5c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2.5 14c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2.5 19.5c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Fond plein + icône par catégorie — remplace les dégradés du Figma d'origine (interdits). */
const CATEGORY_VISUAL: Record<LookbookCategory, { bg: string; fg: string; icon: (p: IconProps) => React.ReactElement }> = {
  coiffure: { bg: "bg-[var(--core-brand-color)]", fg: "text-[var(--on-core-brand-color)]", icon: ScissorsIcon },
  "soins-cheveux": { bg: "bg-[var(--brand-rose-soft)]", fg: "text-[var(--brand-taupe-muted)]", icon: DropletCombIcon },
  ongles: { bg: "bg-[var(--brand-lilac)]", fg: "text-[var(--pos-accent-dark)]", icon: HandIcon },
  pedicure: { bg: "bg-[var(--core-brand-color-2)]", fg: "text-[var(--pos-accent-dark)]", icon: FootIcon },
  "soin-visage": { bg: "bg-[var(--color-gray-100)]", fg: "text-[var(--pos-accent-dark)]", icon: FlowerIcon },
  epilation: { bg: "bg-[var(--pos-accent-dark-soft)]", fg: "text-[var(--pos-accent-dark)]", icon: FeatherIcon },
  massage: { bg: "bg-[var(--color-gray-200)]", fg: "text-[var(--pos-accent-dark)]", icon: WavesIcon },
};

type CategoryVisualProps = {
  category: LookbookCategory;
  className?: string;
  /** Overrides the icon's default `size-8` — used by the detail dialog's larger visual. */
  iconClassName?: string;
};

export function CategoryVisual({ category, className, iconClassName }: CategoryVisualProps) {
  const { bg, fg, icon: Icon } = CATEGORY_VISUAL[category];
  return (
    <div className={cn("flex aspect-square items-center justify-center rounded-t-2xl", bg, className)}>
      <Icon className={cn(fg, iconClassName)} />
    </div>
  );
}
