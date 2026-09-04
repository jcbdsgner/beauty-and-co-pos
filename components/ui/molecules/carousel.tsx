"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CarouselProps = {
  children: React.ReactNode;
  /** Show prev/next buttons (desktop convenience — the strip is drag/scroll on touch regardless). */
  arrows?: boolean;
  /** Gap between slides, Tailwind gap class (default `gap-3`). */
  gapClassName?: string;
  className?: string;
  slideClassName?: string;
};

/**
 * embla-carousel horizontal strip — free-drag scrolling for visual pickers (category tiles,
 * style thumbnails). Each direct child becomes a slide sized to its content (`flex-[0_0_auto]`).
 */
export function Carousel({ children, arrows = false, gapClassName = "gap-3", className, slideClassName }: CarouselProps) {
  const [ref, api] = useEmblaCarousel({ dragFree: true, align: "start", containScroll: "trimSnaps" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback((instance: NonNullable<typeof api>) => {
    setCanPrev(instance.canScrollPrev());
    setCanNext(instance.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) return;
    const handler = () => sync(api);
    api.on("select", handler).on("reInit", handler).on("slidesInView", handler);
    return () => {
      api.off("select", handler).off("reInit", handler).off("slidesInView", handler);
    };
  }, [api, sync]);

  return (
    <div className={cn("relative", className)}>
      <div ref={ref} className="overflow-hidden">
        <div className={cn("flex", gapClassName)}>
          {Array.isArray(children)
            ? children.map((child, i) => (
                <div key={i} className={cn("flex-[0_0_auto]", slideClassName)}>
                  {child}
                </div>
              ))
            : <div className={cn("flex-[0_0_auto]", slideClassName)}>{children}</div>}
        </div>
      </div>

      {arrows && (
        <>
          <CarouselArrow side="left" disabled={!canPrev} onClick={() => api?.scrollPrev()} />
          <CarouselArrow side="right" disabled={!canNext} onClick={() => api?.scrollNext()} />
        </>
      )}
    </div>
  );
}

function CarouselArrow({ side, disabled, onClick }: { side: "left" | "right"; disabled: boolean; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Précédent" : "Suivant"}
      className={cn(
        "absolute top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-base-content/70 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] transition active:scale-90 disabled:pointer-events-none disabled:opacity-0",
        side === "left" ? "-left-3" : "-right-3",
      )}
    >
      <Icon aria-hidden className="size-4" />
    </button>
  );
}
