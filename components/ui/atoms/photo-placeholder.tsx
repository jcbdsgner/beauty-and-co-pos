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
        "flex flex-col items-center justify-center gap-2 rounded-box border border-dashed border-base-300 bg-base-200 text-base-content/45",
        className,
      )}
    >
      <ImageIcon aria-hidden className="size-7 shrink-0" />
      <span className="px-2 text-center text-[13px] font-normal">{label}</span>
    </div>
  );
}
