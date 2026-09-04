"use client";

import { OTPInput, type SlotProps } from "input-otp";
import { cn } from "@/lib/utils";

type InputOtpProps = {
  value: string;
  onChange: (value: string) => void;
  /** Number of characters (default 4) — the manager discount code is 4 (USERFLOW.md § Remise). */
  length?: number;
  /** Regex string constraint passed to input-otp's `pattern` — defaults to digits only. */
  pattern?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  onComplete?: (value: string) => void;
};

const DIGITS_ONLY = "^\\d*$";

/**
 * Segmented code entry (input-otp) — one big, unambiguous box per character, 56px tall, taupe
 * active outline. Replaces a free `TextInput` where a fixed-length code is expected, so a
 * receptionist sees exactly how many characters to key in.
 */
export function InputOtp({ value, onChange, length = 4, pattern = DIGITS_ONLY, ariaLabel = "Code", disabled, className, onComplete }: InputOtpProps) {
  return (
    <OTPInput
      maxLength={length}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      pattern={pattern}
      disabled={disabled}
      aria-label={ariaLabel}
      containerClassName={cn("flex items-center gap-2", disabled && "opacity-40", className)}
      render={({ slots }) => (
        <>
          {slots.map((slot, i) => (
            <Slot key={i} {...slot} />
          ))}
        </>
      )}
    />
  );
}

function Slot({ char, isActive, hasFakeCaret }: SlotProps) {
  return (
    <div
      className={cn(
        "relative flex h-14 w-12 items-center justify-center rounded-xl border text-xl font-semibold text-base-content transition",
        isActive ? "border-ring ring-4 ring-ring/15" : "border-border",
      )}
    >
      {char ?? ""}
      {hasFakeCaret && <span className="pointer-events-none absolute h-6 w-px animate-pulse bg-base-content" />}
    </div>
  );
}
