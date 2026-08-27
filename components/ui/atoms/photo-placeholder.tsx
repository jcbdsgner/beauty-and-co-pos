import { Image as ImageIcon } from "lucide-react";
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
      <ImageIcon aria-hidden className="size-7 shrink-0" />
      <span className="px-2 text-center text-[13px] font-[450]">{label}</span>
    </div>
  );
}
