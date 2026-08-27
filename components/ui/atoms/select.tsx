"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "cream" | "rose-soft" | "white";
type Size = "field" | "compact";

const TONE_CLASS: Record<Tone, string> = {
  cream: "border border-[var(--color-gray-200)] bg-[var(--brand-cream)]",
  "rose-soft": "border border-transparent bg-[var(--brand-rose-soft)]",
  white: "border border-[var(--color-gray-200)] bg-white",
};

const SIZE_CLASS: Record<Size, string> = {
  field: "rounded-xl px-4 py-3 text-[15px]",
  compact: "rounded-lg px-3 py-2 text-sm",
};

export type SelectOption = { value: string; label: string };

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

/** Accessible dropdown select styled to the same recipe as TextInput — use over a bare `<select>` whenever the option list needs real styling (search catalogues, filters, forms). */
export function Select({ value, onChange, options, placeholder = "Sélectionner…", tone = "white", size = "field", disabled, className }: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={cn(
          "flex w-full items-center justify-between gap-2 text-left text-[var(--color-gray-900)] focus:border-[var(--brand-taupe-muted)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 data-[placeholder]:text-[var(--color-gray-400)]",
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
          className="z-50 overflow-hidden rounded-2xl border border-[var(--color-gray-200)] bg-white shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)]"
        >
          <SelectPrimitive.Viewport className="max-h-64 p-1.5">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm text-[var(--color-gray-800)] outline-none data-[highlighted]:bg-[var(--brand-rose-soft)] data-[state=checked]:font-semibold"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check aria-hidden className="size-4 text-[var(--brand-taupe-muted)]" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
