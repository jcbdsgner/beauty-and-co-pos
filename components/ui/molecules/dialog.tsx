import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  labelledBy: string;
  role?: "dialog" | "alertdialog";
  /** "sheet" anchors to the bottom on narrow layouts and shows a drag-handle grip — for a form
   *  that wants to feel like it slid up from the counter, not a floating alert. */
  variant?: "center" | "sheet";
  overlayClassName?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Rebuilt with real elevation: a Card is a flat resting surface (see card.tsx), a Dialog is the
 * one thing on screen that's actually lifted above everything else — a deep, wide-spread shadow
 * says so, where the old recipe only differed from Card by a plain `shadow`. Chunkier corners
 * (28px) than Card's 16px so the two never read as the same surface at different sizes.
 */
export function Dialog({ open, labelledBy, role = "dialog", variant = "center", overlayClassName, className, children }: DialogProps) {
  if (!open) return null;
  const sheet = variant === "sheet";

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex bg-black/70 p-4",
        sheet ? "items-end justify-center sm:items-center" : "items-center justify-center",
        overlayClassName,
      )}
    >
      <div
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "w-full bg-white shadow-[0px_24px_64px_-12px_rgba(0,0,0,0.35)]",
          sheet ? "rounded-t-[28px] sm:rounded-[28px]" : "rounded-[28px]",
          className,
        )}
      >
        {sheet && <div aria-hidden className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-[var(--color-gray-200)]" />}
        {children}
      </div>
    </div>
  );
}
