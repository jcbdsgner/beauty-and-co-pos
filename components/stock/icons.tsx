import { cn } from "@/lib/utils";

type IconProps = { className?: string };

/** Small icon set specific to the Stock module (not in the shared icon set — kept local per module conventions). */

export function AlertTriangleIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <path
        d="M12 4.5l9 15.5H3l9-15.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 10v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function BoxIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-4", className)}>
      <path d="M4 8l8-4 8 4-8 4-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 8v8l8 4 8-4V8M12 12v8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function PaperPlaneIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-4", className)}>
      <path
        d="M21 3L10.5 13.5M21 3l-6.5 18-4-8.5L2 8.5 21 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DocumentIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-4", className)}>
      <path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 3.5V8h4M8.5 12.5h7M8.5 16h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-4", className)}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HourglassIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-4", className)}>
      <path
        d="M6 3.5h12M6 20.5h12M7 3.5v3.2c0 1.3.7 2.5 1.9 3.1L12 11.5l3.1-1.7c1.2-.6 1.9-1.8 1.9-3.1V3.5M7 20.5v-3.2c0-1.3.7-2.5 1.9-3.1L12 12.5l3.1 1.7c1.2.6 1.9 1.8 1.9 3.1v3.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BuildingIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-4", className)}>
      <rect x="5" y="3.5" width="10" height="17" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 10.5h4v10h-4M8 7.5h1M11.5 7.5h1M8 11h1M11.5 11h1M8 14.5h1M11.5 14.5h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function StoreIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-4", className)}>
      <path d="M4 9l1-5h14l1 5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4.5 9v10a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 9a2.3 2.3 0 0 0 4.6 0 2.3 2.3 0 0 0 4.6 0 2.3 2.3 0 0 0 4.6 0 2.3 2.3 0 0 0 4.6 0" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function DropIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-4", className)}>
      <path
        d="M12 3.5s6 6.7 6 11a6 6 0 1 1-12 0c0-4.3 6-11 6-11z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WarehouseIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-12", className)}>
      <path d="M3 10.5L12 5l9 5.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 21v-6h8v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 10.5l9 3 9-3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
