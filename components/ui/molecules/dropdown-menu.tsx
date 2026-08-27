"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export type DropdownMenuItem =
  | { type?: "item"; label: string; icon?: React.ReactNode; onSelect: () => void; tone?: "default" | "danger"; disabled?: boolean }
  | { type: "separator" };

type DropdownMenuProps = {
  trigger: React.ReactElement;
  items: DropdownMenuItem[];
  align?: "start" | "center" | "end";
};

/** Row-level "..." menu — items are now min-h-11 (was ~40px) and press with active:bg, since a
 *  short, rare menu is still a menu someone has to actually hit with a finger. */
export function DropdownMenu({ trigger, items, align = "end" }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={6}
          className="z-50 min-w-48 overflow-hidden rounded-2xl border border-[var(--color-gray-200)] bg-white p-1.5 shadow-[0px_12px_32px_-8px_rgba(0,0,0,0.25)]"
        >
          {items.map((item, i) =>
            item.type === "separator" ? (
              <DropdownMenuPrimitive.Separator key={i} className="my-1.5 h-px bg-[var(--color-gray-200)]" />
            ) : (
              <DropdownMenuPrimitive.Item
                key={item.label}
                disabled={item.disabled}
                onSelect={item.onSelect}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm font-medium outline-none transition active:scale-[0.98] data-[highlighted]:bg-[var(--brand-rose-soft)] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40",
                  item.tone === "danger" ? "text-[var(--color-error)]" : "text-[var(--color-gray-800)]",
                )}
              >
                {item.icon}
                {item.label}
              </DropdownMenuPrimitive.Item>
            ),
          )}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
