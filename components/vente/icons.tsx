import { cn } from "@/lib/utils";
import type { CategoryIcon } from "@/lib/data/vente";
import {
  Scissors,
  Flower2,
  Zap,
  Hand,
  FaceSlightlySmiling,
  Sparkles,
  Baby,
  ShoppingCart,
  User,
  Camera,
  Banknote,
  CreditCard,
  CircleCheckBig,
  Star,
  CalendarCheck2,
  Tag,
  SearchX,
  Key,
} from "lucide-react";

type IconProps = { className?: string };

/** Icon set specific to the Vente & Paiement (POS) module — category glyphs, payment methods, cart, scan, receipt. */

export function ScissorsIcon({ className }: IconProps) {
  return <Scissors className={cn("size-6", className)} />;
}

export function SpaIcon({ className }: IconProps) {
  return <Flower2 className={cn("size-6", className)} />;
}

export function EpilationIcon({ className }: IconProps) {
  return <Zap className={cn("size-6", className)} />;
}

export function ManucureIcon({ className }: IconProps) {
  return <Hand className={cn("size-6", className)} />;
}

export function VisageIcon({ className }: IconProps) {
  return <FaceSlightlySmiling className={cn("size-6", className)} />;
}

export function NailArtIcon({ className }: IconProps) {
  return <Sparkles className={cn("size-6", className)} />;
}

export function MiniCoIcon({ className }: IconProps) {
  return <Baby className={cn("size-6", className)} />;
}

const CATEGORY_ICONS: Record<CategoryIcon, (props: IconProps) => React.ReactElement> = {
  coiffure: ScissorsIcon,
  spa: SpaIcon,
  epilation: EpilationIcon,
  manucure: ManucureIcon,
  visage: VisageIcon,
  onglerie: NailArtIcon,
  mini: MiniCoIcon,
};

export function CategoryGlyph({ icon, className }: { icon: CategoryIcon; className?: string }) {
  const Icon = CATEGORY_ICONS[icon];
  return <Icon className={className} />;
}

export function CartGlyphIcon({ className }: IconProps) {
  return <ShoppingCart className={cn("size-5", className)} />;
}

export function PersonSilhouetteIcon({ className }: IconProps) {
  return <User className={cn("size-5", className)} />;
}

export function CameraIcon({ className }: IconProps) {
  return <Camera className={cn("size-6", className)} />;
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

/** "Wave" mobile-money brand mark (phone with scan/QR affordance) — a specific payment provider, not a generic wave/signal glyph, so kept hand-drawn. */
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
  return <Banknote className={cn("size-6", className)} />;
}

export function CardGlyphIcon({ className }: IconProps) {
  return <CreditCard className={cn("size-6", className)} />;
}

export function CheckCircleIcon({ className }: IconProps) {
  return <CircleCheckBig className={cn("size-6", className)} />;
}

export function StarGlyphIcon({ className, filled = false }: IconProps & { filled?: boolean }) {
  return <Star className={cn("size-5", className)} fill={filled ? "currentColor" : "none"} />;
}

export function CalendarSuggestIcon({ className }: IconProps) {
  return <CalendarCheck2 className={cn("size-6", className)} />;
}

export function ReceiptTagIcon({ className }: IconProps) {
  return <Tag className={cn("size-4", className)} />;
}

export function NoResultsIcon({ className }: IconProps) {
  return <SearchX className={cn("size-10", className)} />;
}

export function KeyGlyphIcon({ className }: IconProps) {
  return <Key className={cn("size-4", className)} />;
}
