import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** Label + required-asterisk wrapper for a form control — the shared shape behind every labeled input in the app. */
export function Field({ label, required, className, children }: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-[var(--color-gray-600)]">
        {label}
        {required && <span className="text-[var(--color-error)]"> *</span>}
      </span>
      {children}
    </label>
  );
}
