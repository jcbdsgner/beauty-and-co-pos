"use client";

import { Button } from "@/components/ui/button";

// Mirrors Button's variant union (not exported from components/ui/button, which this
// module must not modify) so the print action stays visually consistent with the rest
// of the app's buttons.
type PrintButtonVariant = "brand" | "dark" | "outline" | "lilac" | "success" | "info" | "danger-outline";

type PrintButtonProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: PrintButtonVariant;
  className?: string;
};

/**
 * "Imprimer" action shared by the client profile card and the loyalty-card page.
 * There's no print pipeline in this prototype, so `window.print()` is the honest,
 * actually-working equivalent — clicking it used to do nothing at all.
 */
export function PrintButton({ children, icon, variant = "outline", className }: PrintButtonProps) {
  return (
    <Button type="button" variant={variant} icon={icon} className={className} onClick={() => window.print()}>
      {children}
    </Button>
  );
}
