import { cn } from "@/lib/utils";

/** Decorative barcode drawn from a seed (sale id, gift-card code) — deterministic, never scanned
 *  (demo, like `DemoQrBlock`). Shared by the printed receipt and the printed gift card. */
export function Barcode({ seed, className }: { seed: string; className?: string }) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  while (x < 196) {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    const w = 1 + (h % 3);
    bars.push({ x, w });
    x += w + 1 + ((h >>> 8) % 2);
  }
  return (
    <svg viewBox="0 0 200 40" preserveAspectRatio="none" className={cn("h-12 w-full", className)} aria-hidden>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={40} fill="black" />
      ))}
    </svg>
  );
}
