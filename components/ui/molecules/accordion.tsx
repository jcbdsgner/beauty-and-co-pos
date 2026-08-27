"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = { value: string; title: React.ReactNode; content: React.ReactNode };

type AccordionProps = {
  items: AccordionItem[];
  type?: "single" | "multiple";
  className?: string;
};

/** Collapsible section list — service-catalogue subcategories, FAQ, "Entreprises & Salons" company rows. */
export function Accordion({ items, type = "single", className }: AccordionProps) {
  const rootProps = type === "single" ? { type: "single" as const, collapsible: true } : { type: "multiple" as const };
  return (
    <AccordionPrimitive.Root {...rootProps} className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <AccordionPrimitive.Item
          key={item.value}
          value={item.value}
          className="overflow-hidden rounded-2xl border border-[var(--color-gray-200)] bg-white"
        >
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-3 p-4 text-left font-semibold text-[var(--color-gray-900)]">
              {item.title}
              <ChevronDown aria-hidden className="size-4 shrink-0 text-[var(--color-gray-400)] transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-[accordion-down_200ms_ease-out] data-[state=closed]:animate-[accordion-up_200ms_ease-out]">
            <div className="border-t border-[var(--color-gray-200)] p-4 text-sm text-[var(--color-gray-600)]">{item.content}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
