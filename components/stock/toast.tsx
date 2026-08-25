"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

type ToastProps = {
  message: string | null;
  onDismiss: () => void;
};

/**
 * Lightweight confirmation banner for actions that don't otherwise show visible feedback
 * (+ Reappro, Preparer, Annuler, Envoyer au salon…). Auto-dismisses; no entrance/exit motion
 * beyond a plain opacity fade so it doesn't read as decorative animation.
 */
export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDismiss, 3200);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4 transition-opacity duration-200",
        message ? "opacity-100" : "opacity-0",
      )}
    >
      {message && (
        <div className="pointer-events-auto rounded-full bg-[var(--color-gray-900)] px-5 py-3 text-sm font-medium text-white shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
}
