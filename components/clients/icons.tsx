import { cn } from "@/lib/utils";

type IconProps = { className?: string };

/** Small icon set specific to the Clients module (contact rows, subscription perks, follow-up, card actions). Kept local so the shared `components/ui/icons` set isn't touched by this module. */

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <path
        d="M6 3.5h2.5l1.3 4-1.8 1.6a11 11 0 0 0 5 5l1.6-1.8 4 1.3V16a2 2 0 0 1-2.2 2A16 16 0 0 1 4 4.2 2 2 0 0 1 6 3.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <path
        d="M6 18.5l-1.2 3.2 3.3-1.2A9 9 0 1 0 4.5 12 8.9 8.9 0 0 0 6 18.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 10.2c0 3.4 2.4 5.8 5.8 5.8.6 0 1-.5.9-1.1l-.3-1.3-2 .3-1.4-1.4.3-2-1.3-.3c-.6-.1-1.1.3-1.1.9v-.9z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 6.5l8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PinIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <path
        d="M12 21s6.5-5.8 6.5-11A6.5 6.5 0 1 0 5.5 10c0 5.2 6.5 11 6.5 11z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function BriefcaseIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <rect x="3.5" y="8" width="17" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 8V6.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V8M3.5 13h17" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CakeIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <path d="M4 20.5h16v-6a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 17.5c1.2 0 1.2-1.2 2.4-1.2s1.2 1.2 2.4 1.2 1.2-1.2 2.4-1.2 1.2 1.2 2.4 1.2 1.2-1.2 2.4-1.2 1.2 1.2 2.4 1.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 8.5V6M9.5 5c0-1 1-1.3 1-2M14.5 5c0-1-1-1.3-1-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CupIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <path d="M5 8h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16 9.5h1.5a2 2 0 0 1 0 4H16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function StarListIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <path
        d="M9.5 4l1.4 2.9 3.2.5-2.3 2.2.5 3.2-2.8-1.5-2.8 1.5.5-3.2-2.3-2.2 3.2-.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M13.5 16h6.5M13.5 19h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CrownIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <path
        d="M4 18h16l-1.4-8-4.1 3.5L12 8l-2.5 5.5L5.4 10z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M4 20.5h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <path
        d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GiftIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <rect x="4" y="9.5" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 13h16M12 9.5v10" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 9.5c-1-2.5-2.5-4-4-3.5s-.5 3.5 4 3.5zM12 9.5c1-2.5 2.5-4 4-3.5s.5 3.5-4 3.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ScissorsIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <circle cx="6" cy="6.5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="17.5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.7 8l11.8 10M19.5 6L7.7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function NoteIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <path d="M6 4h9l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14.5 4v4h4M8 12h8M8 15.5h8M8 8.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PrinterIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <path d="M6.5 8.5V4h11v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="3.5" y="8.5" width="17" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 14v6h11v-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-5", className)}>
      <path d="M12 3.5v11.5M8 11l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 17v2.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChatBubbleIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-4", className)}>
      <path
        d="M4 12a7 7 0 0 1 7-7h2a7 7 0 0 1 0 14h-3l-4.5 3 .8-3.6A6.9 6.9 0 0 1 4 12z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
