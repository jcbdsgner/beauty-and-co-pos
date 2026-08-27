import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

// No gradient variant, deliberately — flat brand fills only (rose/taupe/lilac/semantic).
export type ButtonVariant = "brand" | "dark" | "outline" | "lilac" | "success" | "info" | "danger" | "danger-outline";
type Variant = ButtonVariant;

const variants: Record<Variant, string> = {
  brand:
    "bg-[var(--core-brand-color,#fdcfca)] text-black shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:opacity-90",
  dark:
    "bg-[var(--pos-accent-dark,#886666)] text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:opacity-90",
  outline:
    "bg-white border border-[var(--brand-color-1,rgba(216,184,180,0.5))] text-[var(--button-2-color,#a27576)] hover:bg-[#f5f5f5]",
  lilac:
    "bg-[var(--brand-lilac,#e4c8ff)] text-[var(--text-secondary,#344054)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:opacity-90",
  // Semantic actions (WhatsApp-style confirm, informational) — flat fills, same family as Badge's success/info.
  success:
    "bg-[var(--color-success,#12805c)] text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:opacity-90",
  info:
    "bg-[var(--color-info,#2662d9)] text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:opacity-90",
  // Loud destructive action (e.g. the confirm button on a delete/revoke alertdialog) — flat fill, same weight as brand/dark.
  danger:
    "bg-[var(--color-error,#b42318)] text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:opacity-90",
  // Quiet destructive/secondary action (e.g. "Annuler" on a pending request) — text-only red, no fill.
  "danger-outline": "bg-white border border-[var(--color-gray-200)] text-[var(--color-error,#b42318)] hover:bg-[var(--color-error-soft)]",
};

// Touch-desktop pass: every tap gets a felt press (active:scale, DESIGN.md's convention — hover
// alone never registers on a touchscreen), and a disabled state stays a legible muted fill
// (DESIGN.md's Disabled-Is-Not-Invisible Rule) instead of the generic opacity wash that made an
// "outline"/"danger-outline" button's text nearly unreadable when disabled.
const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[17px] font-[450] transition active:scale-[0.97] disabled:pointer-events-none disabled:scale-100 disabled:bg-[var(--color-gray-200)] disabled:text-[var(--color-gray-400)] disabled:shadow-none disabled:border-transparent";

type CommonProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: Variant;
  className?: string;
};

type LinkButtonProps = CommonProps & {
  href: string;
  /** Set when href leaves this site (a separate Beauty and Co property, e.g. the shop or gift card site). Opens in a new tab and shows an external-link cue so the user knows they're navigating away. */
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
  const { children, icon, variant = "brand", className } = props;
  const classes = cn(base, variants[variant], className);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- stripped so they aren't spread onto the DOM button
  const { href, variant: _variant, className: _cn, icon: _icon, children: _children, type = "button", ...buttonRest } =
    props as ActionButtonProps;

  return (
    <button type={type} className={classes} {...buttonRest}>
      {icon}
      {children}
    </button>
  );
}
