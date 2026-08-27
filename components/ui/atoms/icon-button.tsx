import { cn } from "@/lib/utils";

type IconButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  className?: string;
  "aria-label": string;
};

/** Unstyled-by-default icon-only button: centers its content and requires an aria-label, since there's no visible text for assistive tech to read. Visual treatment (size, shape, colors) is left to the caller via className — this is a touch-only desktop app, so every caller must size at least `size-11` (44px) and add its own `active:` press feedback (hover alone doesn't register on a tap). */
export function IconButton({ className, children, type = "button", ...rest }: IconButtonProps) {
  return (
    <button type={type} className={cn("inline-flex items-center justify-center transition", className)} {...rest}>
      {children}
    </button>
  );
}

type CloseButtonProps = Omit<IconButtonProps, "children" | "aria-label"> & {
  "aria-label"?: string;
};

/** The "×" dismiss control used in the top-right corner of dialogs. size-11 (44px) — the touch minimum; was size-9 (36px). */
export function CloseButton({ className, "aria-label": ariaLabel = "Fermer", ...rest }: CloseButtonProps) {
  return (
    <IconButton
      aria-label={ariaLabel}
      className={cn(
        "absolute top-2 right-2 size-11 rounded-lg text-xl leading-none text-[var(--color-gray-400)] transition active:scale-90 active:bg-black/[.06] hover:bg-black/[.03] hover:text-[var(--color-gray-500)]",
        className,
      )}
      {...rest}
    >
      ×
    </IconButton>
  );
}
