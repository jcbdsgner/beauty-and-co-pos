import { cn } from "@/lib/utils";

type PhotoPlaceholderProps = {
  className?: string;
  label?: string;
};

export function PhotoPlaceholder({ className, label = "Photo à venir" }: PhotoPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-gray-300)] bg-[var(--brand-cream)] text-[var(--color-gray-400)]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-7 shrink-0">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M21 15.5l-5.5-5.5a1.5 1.5 0 0 0-2.12 0L4 19"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="px-2 text-center text-[13px] font-[450]">{label}</span>
    </div>
  );
}
