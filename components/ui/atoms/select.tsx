"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "cream" | "rose-soft" | "white";
type Size = "field" | "compact";

const TONE_CLASS: Record<Tone, string> = {
  cream: "border border-border bg-[var(--brand-cream)]",
  "rose-soft": "border border-transparent bg-accent",
  white: "border border-border bg-white",
};

const SIZE_CLASS: Record<Size, string> = {
  field: "h-14 rounded-xl px-4 text-[15px]",
  compact: "h-11 rounded-lg px-3 text-sm",
};

export type SelectOption = { value: string; label: string; disabled?: boolean };

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  tone?: Tone;
  size?: Size;
  disabled?: boolean;
  className?: string;
};

/**
 * Same focus language as TextInput. Disabled options render as a struck-through, greyed row with
 * "· pris" rather than disappearing — USERFLOW.md's rendez-vous form needs a taken time slot
 * visibly unavailable, not silently absent. Menu rows are 56px tap targets.
 */
export function Select({ value, onChange, options, placeholder = "Sélectionner…", tone = "white", size = "field", disabled, className }: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={cn(
          "flex w-full items-center justify-between gap-2 text-left text-[var(--color-gray-900)] transition",
          "focus:border-ring focus:ring-4 focus:ring-ring/15 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-40 data-[placeholder]:text-[var(--color-gray-400)]",
          TONE_CLASS[tone],
          SIZE_CLASS[size],
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown aria-hidden className="size-4 shrink-0 text-[var(--color-gray-500)]" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-border bg-popover shadow-[0px_12px_32px_-8px_rgba(0,0,0,0.25)]"
        >
          <SelectPrimitive.Viewport className="max-h-72 p-1.5">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-[15px] text-[var(--color-gray-800)] outline-none data-[highlighted]:bg-accent data-[state=checked]:font-semibold data-[disabled]:cursor-not-allowed data-[disabled]:text-[var(--color-gray-400)] data-[disabled]:line-through"
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                  {option.disabled && " · pris"}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check aria-hidden className="size-4 text-secondary" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
