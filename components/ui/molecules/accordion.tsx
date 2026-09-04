"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = { value: string; title: React.ReactNode; content: React.ReactNode };

type AccordionProps = {
  items: AccordionItem[];
  type?: "single" | "multiple";
  className?: string;
};

/**
 * Chevron swapped for a rotating +/× — a plus sign reads unambiguously as "there's more here to
 * open" even glanced at from across a counter, where a small chevron's rotation is easy to miss.
 * Trigger now presses with active:scale like every other tappable surface in the system.
 */
export function Accordion({ items, type = "single", className }: AccordionProps) {
  const rootProps = type === "single" ? { type: "single" as const, collapsible: true } : { type: "multiple" as const };
  return (
    <AccordionPrimitive.Root {...rootProps} className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <AccordionPrimitive.Item
          key={item.value}
          value={item.value}
          className="overflow-hidden rounded-2xl border border-base-300 bg-white"
        >
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="group flex min-h-14 w-full items-center justify-between gap-3 p-4 text-left font-semibold text-base-content transition active:bg-base-200">
              {item.title}
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-base-200 text-base-content/55 transition-transform duration-200 group-data-[state=open]:rotate-45">
                <Plus aria-hidden className="size-4" />
              </span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-[accordion-down_200ms_ease-out] data-[state=closed]:animate-[accordion-up_200ms_ease-out]">
            <div className="border-t border-base-300 p-4 text-sm text-base-content/70">{item.content}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
