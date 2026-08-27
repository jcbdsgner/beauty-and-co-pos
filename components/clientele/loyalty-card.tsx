import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientTier } from "@/lib/data/types";

const TIER_LABEL: Record<Exclude<ClientTier, null>, string> = {
  vip: "VIP",
  gold: "Gold",
  silver: "Silver",
};

type LoyaltyCardProps = {
  name: string;
  tier: ClientTier;
  points: number;
  clientId: string;
  className?: string;
};

/**
 * Dedicated "credit card" visual for a cliente's carte de fidélité — deliberately not a generic
 * `Card`: a flat taupe-to-rose duotone plate, pill-shaped chip motif, serif points figure, and a
 * demo QR pattern deterministically derived from the client id (so it varies between clientes
 * without pretending to encode real scan data — cf. USERFLOW.md's "motif démo" note).
 */
export function LoyaltyCard({ name, tier, points, clientId, className }: LoyaltyCardProps) {
  const cells = qrCells(clientId);

  return (
    <div
      className={cn(
        "relative aspect-[1.6/1] w-full overflow-hidden rounded-3xl bg-[var(--brand-taupe-muted)] p-6 text-white shadow-[0px_4px_16px_0px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      {/* Ambient rose accent shapes — flat fills only, no gradient, per DESIGN.md */}
      <div aria-hidden className="absolute -top-10 -right-10 size-40 rounded-full bg-[var(--core-brand-color)]/20" />
      <div aria-hidden className="absolute -bottom-14 -left-8 size-32 rounded-full bg-[var(--core-brand-color)]/10" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-white/70 uppercase">Beauty and Co</p>
            <p className="mt-0.5 text-xs text-white/50">Carte de fidélité</p>
          </div>
          {tier && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <Sparkles aria-hidden className="size-3.5" />
              {TIER_LABEL[tier]}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="truncate text-lg font-semibold">{name}</p>
            <p className="font-[var(--font-heading)] text-4xl leading-none">{points}</p>
            <p className="mt-1 text-xs text-white/60">points fidélité</p>
          </div>

          {/* Demo QR pattern — no real scan payload encoded, cf. component doc above */}
          <div aria-hidden className="grid shrink-0 grid-cols-6 gap-[2px] rounded-lg bg-white p-2">
            {cells.map((on, i) => (
              <span key={i} className={cn("size-[5px]", on ? "bg-[var(--brand-taupe-muted)]" : "bg-transparent")} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Deterministic 6x6 pseudo-random on/off grid seeded from the client id — same id always renders the same pattern. */
export function qrCells(seed: string): boolean[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < 36; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h >> 16) % 3 === 0);
  }
  return cells;
}

type DemoQrBlockProps = { seed: string; size?: number; className?: string };

/** Standalone demo-QR tile — same deterministic pattern as LoyaltyCard's embedded one, reused on the Fiche cliente identity block. Never encodes real scan data (cf. component doc above). */
export function DemoQrBlock({ seed, size = 72, className }: DemoQrBlockProps) {
  const cells = qrCells(seed);
  return (
    <div
      aria-hidden
      className={cn("grid grid-cols-6 gap-[2px] rounded-lg border border-[var(--color-gray-200)] bg-white p-2", className)}
      style={{ width: size, height: size }}
    >
      {cells.map((on, i) => (
        <span key={i} className={cn("rounded-[1px]", on ? "bg-[var(--brand-taupe-muted)]" : "bg-transparent")} />
      ))}
    </div>
  );
}
