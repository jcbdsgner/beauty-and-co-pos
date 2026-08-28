import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// No gradient variant, deliberately — flat brand fills only (DESIGN.md Flat-Fill Rule).
// Two-hue system: `brand` = rose (light/primary action), `dark` = taupe (the one most-frequent
// action on a screen). Semantic fills (success/info/danger) stay separate from the accent.
export type ButtonVariant =
  | "brand"
  | "dark"
  | "outline"
  | "lilac"
  | "success"
  | "info"
  | "danger"
  | "danger-outline";

const AMBIENT = "shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]";

export const buttonVariants = cva(
  // Touch-first counter station: every tap gets a felt press (active:scale — hover never
  // registers on a touchscreen), and a disabled control stays a legible muted fill
  // (DESIGN.md Disabled-Is-Not-Invisible Rule), never the opacity wash that erodes contrast.
  cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-[450] whitespace-nowrap transition",
    "outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:border-ring",
    "active:scale-[0.97]",
    "disabled:pointer-events-none disabled:scale-100 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:border-transparent",
    "aria-disabled:pointer-events-none aria-disabled:scale-100 aria-disabled:bg-muted aria-disabled:text-muted-foreground aria-disabled:shadow-none",
  ),
  {
    variants: {
      variant: {
        brand: cn("bg-primary text-primary-foreground hover:opacity-90", AMBIENT),
        dark: cn("bg-secondary text-secondary-foreground hover:opacity-90", AMBIENT),
        outline:
          "bg-white border border-[var(--brand-color-1)] text-[var(--button-2-color)] hover:bg-[var(--color-gray-50)]",
        lilac: cn("bg-[var(--brand-lilac)] text-[var(--text-secondary)] hover:opacity-90", AMBIENT),
        success: cn("bg-[var(--color-success)] text-white hover:opacity-90", AMBIENT),
        info: cn("bg-[var(--color-info)] text-white hover:opacity-90", AMBIENT),
        danger: cn("bg-destructive text-destructive-foreground hover:opacity-90", AMBIENT),
        "danger-outline":
          "bg-white border border-border text-destructive hover:bg-[var(--color-error-soft)]",
      },
      size: {
        // 56px — the default primary tap target for the counter (DESIGN.md → 56 min, 60 ideal).
        default: "h-14 px-5 text-[17px]",
        // 60px — hero actions ("Encaisser", "Nouvelle Vente").
        xl: "h-[60px] px-6 text-[17px]",
        // 44px — a secondary action packed into a dense row (still the old touch minimum).
        sm: "h-11 px-4 text-[15px]",
        // square icon-only, 56px.
        icon: "size-14",
      },
    },
    defaultVariants: { variant: "brand", size: "default" },
  },
);

type CommonProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
};

type LinkButtonProps = CommonProps & {
  href: string;
  /** Set when href leaves this site (a separate Beauty and Co property). Opens in a new tab with an external-link cue. */
  external?: boolean;
  /** Hide the external-link arrow cue even when `external` is set (target/rel still apply). */
  hideExternalIcon?: boolean;
};

type ActionButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

export type ButtonProps = LinkButtonProps | ActionButtonProps;

export function Button(props: ButtonProps) {
  const { children, icon, variant = "brand", size = "default", className } = props;
  const classes = cn(buttonVariants({ variant, size }), className);

  if (props.href) {
    const { href, external = false, hideExternalIcon = false } = props;
    return (
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={classes}
      >
        {icon}
        {children}
        {external && !hideExternalIcon && <ArrowUpRight aria-hidden className="size-4 shrink-0" />}
      </Link>
    );
  }

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- stripped so they aren't spread onto the DOM button
    href, variant: _v, size: _s, className: _c, icon: _i, children: _ch, type = "button", ...buttonRest
  } = props as ActionButtonProps;

  return (
    <button type={type} className={classes} {...buttonRest}>
      {icon}
      {children}
    </button>
  );
}
