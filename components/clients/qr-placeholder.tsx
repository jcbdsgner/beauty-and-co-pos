import { cn } from "@/lib/utils";

type QrPlaceholderProps = {
  size?: number;
  className?: string;
};

/**
 * Simplified static QR-code motif (no real payload) used everywhere a scannable client
 * code would appear in the Figma reference — profile card, loyalty card, printable sticker.
 * Flat taupe-on-white, deterministic pattern (no randomness) so it renders identically
 * server- and client-side.
 */
const PATTERN = [
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
];

export function QrPlaceholder({ size = 96, className }: QrPlaceholderProps) {
  const cells = PATTERN.length;
  const cell = 100 / cells;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border border-[var(--color-gray-200)] bg-white p-2",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
        <rect x="0" y="0" width="100" height="100" fill="white" />
        {PATTERN.flatMap((row, y) =>
          row.map((filled, x) =>
            filled ? (
              <rect
                key={`${x}-${y}`}
                x={x * cell}
                y={y * cell}
                width={cell}
                height={cell}
                fill="var(--pos-accent-dark)"
              />
            ) : null,
          ),
        )}
      </svg>
    </div>
  );
}
