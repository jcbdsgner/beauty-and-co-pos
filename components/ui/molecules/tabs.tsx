"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export type TabItem = { value: string; label: string; content: React.ReactNode };

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/**
 * ARIA tabbed-panel switcher — distinct from Pills/SegmentedToggle (which only ever switch a
 * filter, never unmount/remount panel content). Use Tabs when each option owns real panel
 * content (e.g. "Détails" / "Historique" / "Notes" on a client profile).
 */
export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onChange} className={cn("flex flex-col gap-4", className)}>
      <TabsPrimitive.List className="inline-flex w-fit items-center gap-1 rounded-full bg-[var(--color-gray-100)] p-1">
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            className="rounded-full px-4 py-3 text-sm font-medium text-[var(--color-gray-600)] transition active:scale-[0.97] data-[state=active]:bg-white data-[state=active]:text-[var(--color-gray-900)] data-[state=active]:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.08)]"
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content key={item.value} value={item.value} className="focus:outline-none">
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
