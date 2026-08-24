import { cn } from "@/lib/utils";
import type { CategoryIcon } from "@/lib/data/vente";

type IconProps = { className?: string };

/** Icon set specific to the Vente & Paiement (POS) module — category glyphs, payment methods, cart, scan, receipt. */

export function ScissorsIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <circle cx="6" cy="6.5" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="17.5" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.7 8L20 19M7.7 16L20 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SpaIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <path
        d="M12 21c-4-1.5-7-5-7-9 3 0 5.5 1.3 7 3.5C13.5 13.3 16 12 19 12c0 4-3 7.5-7 9z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 15.5V6M9 8.5c0-2 1.3-3.5 3-4.5 1.7 1 3 2.5 3 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EpilationIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <path d="M12 3c3 3.5 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6.5 5-10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 21v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function LashIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <path d="M3 13c2.5-4 6-6 9-6s6.5 2 9 6c-2.5 4-6 6-9 6s-6.5-2-9-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8.5L4 6.5M9.5 6.3L9 4.3M14.5 6.3l.5-2M19 8.5l1-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ManucureIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <path
        d="M7 12V5.5a1.5 1.5 0 0 1 3 0V11M10 11V4.2a1.5 1.5 0 0 1 3 0V11M13 11V5a1.5 1.5 0 0 1 3 0v7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 8.5a1.5 1.5 0 0 1 3 0V14c0 4-2.7 7-7 7s-7-2.5-7-6v-3.2c0-1 .8-1.8 1.8-1.8.9 0 1.7.7 1.7 1.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VisageIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 10.5h.01M15 10.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 15c1 1 2 1.5 3 1.5s2-.5 3-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function NailArtIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <path
        d="M12 3.5l1.4 3.4 3.6.4-2.7 2.4.8 3.6L12 11.5 8.9 13.3l.8-3.6-2.7-2.4 3.6-.4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M5 18.5l1-1M18 18.5l1-1M12 18v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<CategoryIcon, (props: IconProps) => React.ReactElement> = {
  coiffure: ScissorsIcon,
  spa: SpaIcon,
  epilation: EpilationIcon,
  cils: LashIcon,
  manucure: ManucureIcon,
  visage: VisageIcon,
  nailart: NailArtIcon,
};

export function CategoryGlyph({ icon, className }: { icon: CategoryIcon; className?: string }) {
  const Icon = CATEGORY_ICONS[icon];
  return <Icon className={className} />;
}

export function CartGlyphIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <path d="M3 4h2l1.6 10.6a2 2 0 0 0 2 1.7h8a2 2 0 0 0 2-1.6L20 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="20" r="1.3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="20" r="1.3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function PersonSilhouetteIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 20c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function QrFrameIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-full", className)}>
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function WaveGlyphIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <rect x="6" y="3" width="12" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 16c1-1.5 2-2.2 3-2.2s2 .7 3 2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function OrangeMoneyGlyphIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 14h3v3M20 14v3h-3M14 20h3M20 20v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CashGlyphIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <rect x="2.5" y="6.5" width="19" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 9v-.01M18.5 15v-.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CardGlyphIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 9.5h19" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 14.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 12.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StarGlyphIcon({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className={cn("size-5", className)}>
      <path
        d="M12 3.5l2.6 5.4 5.9.7-4.3 4.1 1.1 5.9L12 16.7l-5.3 2.9 1.1-5.9-4.3-4.1 5.9-.7z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarSuggestIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 9.5h17M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 13l1.1 2.2 2.4.3-1.75 1.65.45 2.35L12 18.4l-2.2 1.1.45-2.35-1.75-1.65 2.4-.3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function ReceiptTagIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-4", className)}>
      <path
        d="M4 4h8l8 8-8 8-8-8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function KeyGlyphIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-4", className)}>
      <circle cx="7" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.8 10.2L18 2m0 0v4m0-4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
