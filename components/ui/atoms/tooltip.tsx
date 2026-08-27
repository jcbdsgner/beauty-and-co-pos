"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
};

/** Wraps `children` (a single focusable element) with a taupe-fill hover/focus hint — for an icon-only button or a truncated label. */
export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={300}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="z-50 rounded-lg bg-[var(--brand-taupe-muted)] px-2.5 py-1.5 text-xs font-medium text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]"
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-[var(--brand-taupe-muted)]" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

/** Mount once near the app root so every Tooltip in the tree shares one delay group. */
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <TooltipPrimitive.Provider>{children}</TooltipPrimitive.Provider>;
}
