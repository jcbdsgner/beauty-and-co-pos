import { Avatar } from "@/components/ui/atoms/avatar";
import { Badge, type BadgeVariant } from "@/components/ui/atoms/badge";
import { cn } from "@/lib/utils";

type PersonCardProps = {
  initial: string;
  name: string;
  meta?: string;
  badge?: { label: string; variant: BadgeVariant };
  trailing?: string;
  online?: boolean;
  onClick?: () => void;
  className?: string;
};

/**
 * A person is an identity, so the avatar leads at a size that actually reads as a face-stand-in
 * (48px, up from 44) with any tier badge as a small corner flag on the avatar itself — not
 * squeezed inline next to the name, competing with it for the same line. Name stays the one
 * unambiguous headline of the row.
 */
export function PersonCard({ initial, name, meta, badge, trailing, online, onClick, className }: PersonCardProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-2xl border border-[var(--color-gray-200)] bg-white p-4 text-left transition",
        onClick && "active:scale-[0.97] active:border-[var(--brand-taupe-muted)] hover:border-[var(--brand-taupe-muted)]",
        className,
      )}
    >
      <span className="relative shrink-0">
        <Avatar initial={initial} size={48} className="bg-[var(--brand-rose-soft)] font-semibold text-[var(--brand-taupe-muted)]" />
        {online && (
          <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-white bg-[var(--color-success)]" />
        )}
        {badge && (
          <span className="absolute -top-1 -left-1">
            <Badge variant={badge.variant} className="px-1.5 py-0.5 text-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.15)]">
              {badge.label}
            </Badge>
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-[var(--color-gray-900)]">{name}</span>
        {meta && <span className="block truncate text-sm text-[var(--color-gray-500)]">{meta}</span>}
      </span>
      {trailing && <span className="shrink-0 text-xs text-[var(--color-gray-400)]">{trailing}</span>}
    </Comp>
  );
}
