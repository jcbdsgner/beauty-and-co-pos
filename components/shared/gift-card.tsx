import { DemoQrBlock } from "@/components/clientele/loyalty-card";
import { cn, formatFcfa } from "@/lib/utils";

type GiftCardProps = { code: string; balance: number; className?: string };

/**
 * Carte cadeau — même famille visuelle que LoyaltyCard (plaque taupe/rose plate, DESIGN.md
 * Flat-Fill Rule) mais sans identité cliente : la dénomination est l'information vedette, le
 * code le repère qu'on scannera ou tapera au comptoir. Pas de génération de code à la volée
 * (ADR 0002) — on imprime toujours la face d'un code déjà provisionné dans le mock.
 */
export function GiftCard({ code, balance, className }: GiftCardProps) {
  return (
    <div
      className={cn(
        "relative aspect-[1.6/1] w-full overflow-hidden rounded-3xl bg-primary p-6 text-white shadow-[0px_4px_16px_0px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      <div aria-hidden className="absolute -top-10 -right-10 size-40 rounded-full bg-primary/20" />
      <div aria-hidden className="absolute -bottom-14 -left-8 size-32 rounded-full bg-primary/10" />

      <div className="relative flex h-full flex-col justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-white/70 uppercase">Beauty and Co</p>
          <p className="mt-0.5 text-xs text-white/50">Carte cadeau</p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-[family-name:var(--font-heading)] font-semibold text-4xl leading-none">{formatFcfa(balance)}</p>
            <p className="mt-1.5 font-mono text-sm tracking-[0.15em] text-white/70">{code}</p>
          </div>
          <DemoQrBlock seed={code} size={72} className="shrink-0 border-0" />
        </div>
      </div>
    </div>
  );
}
