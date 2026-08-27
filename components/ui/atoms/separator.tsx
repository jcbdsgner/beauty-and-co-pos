"use client";

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

type SeparatorProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

/** Hairline divider — the same `--color-gray-200` border used everywhere else, exposed as a standalone rule. */
export function Separator({ orientation = "horizontal", className }: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn(
        "shrink-0 bg-[var(--color-gray-200)]",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
    />
  );
}
