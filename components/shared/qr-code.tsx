import { cn } from "@/lib/utils";

const N = 25; // QR version 2 grid

/** Is (r, c) inside one of the three 7×7 finder squares — or their 1-module white separator? */
function finderZone(r: number, c: number) {
  return (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8);
}

/** Finder square module: dark ring, white ring, 3×3 dark centre. */
function finderOn(r: number, c: number) {
  const fr = r >= N - 8 ? r - (N - 7) : r;
  const fc = c >= N - 8 ? c - (N - 7) : c;
  if (fr < 0 || fr > 6 || fc < 0 || fc > 6) return false; // separator
  const ring = Math.min(fr, fc, 6 - fr, 6 - fc);
  return ring !== 1;
}

/** Decorative QR code drawn from a seed (sale id) — deterministic, never scanned (demo, like
 *  `Barcode`). Finder squares and timing lines make it read as a QR on the printed receipt. */
export function QrCode({ seed, className }: { seed: string; className?: string }) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let on: boolean;
      if (finderZone(r, c)) on = finderOn(r, c);
      else if (r === 6 || c === 6) on = (r + c) % 2 === 0;
      else {
        h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
        on = (h >>> 7) % 2 === 0;
      }
      if (on) cells.push({ r, c });
    }
  }
  return (
    <svg viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" className={cn("size-[26mm]", className)} aria-hidden>
      {cells.map(({ r, c }) => (
        <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="black" />
      ))}
    </svg>
  );
}
