import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

/** Label + control + inline error in one place — a field whose error message lives somewhere
 *  else on the page is exactly the "silent failure" USERFLOW.md's validation principle rules
 *  out, so the error slot is built into the wrapper rather than left to each form to remember. */
export function Field({ label, required, error, className, children }: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-[var(--color-gray-600)]">
        {label}
        {required && <span className="text-[var(--color-error)]"> *</span>}
      </span>
      {children}
      {error && <span className="text-sm font-medium text-[var(--color-error)]">{error}</span>}
    </label>
  );
}
