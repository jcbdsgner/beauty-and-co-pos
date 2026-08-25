import { cn } from "@/lib/utils";
import {
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Cake,
  Coffee,
  ListChecks,
  Clock,
  Crown,
  Sparkle,
  Gift,
  Scissors,
  FileText,
  Printer,
  Download,
  SlidersHorizontal,
  MessageCircle,
} from "lucide-react";

type IconProps = { className?: string };

/** Small icon set specific to the Clients module (contact rows, subscription perks, follow-up, card actions). Kept local so the shared `components/ui/icons` set isn't touched by this module. */

export function PhoneIcon({ className }: IconProps) {
  return <Phone className={cn("size-5", className)} />;
}

/** WhatsApp brand mark — lucide has no equivalent, so this stays hand-drawn rather than being swapped for a generic chat bubble. */
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
  return <Mail className={cn("size-5", className)} />;
}

export function PinIcon({ className }: IconProps) {
  return <MapPin className={cn("size-5", className)} />;
}

export function BriefcaseIcon({ className }: IconProps) {
  return <Briefcase className={cn("size-5", className)} />;
}

export function CakeIcon({ className }: IconProps) {
  return <Cake className={cn("size-5", className)} />;
}

export function CupIcon({ className }: IconProps) {
  return <Coffee className={cn("size-5", className)} />;
}

export function StarListIcon({ className }: IconProps) {
  return <ListChecks className={cn("size-5", className)} />;
}

export function ClockIcon({ className }: IconProps) {
  return <Clock className={cn("size-5", className)} />;
}

export function CrownIcon({ className }: IconProps) {
  return <Crown className={cn("size-5", className)} />;
}

export function SparkleIcon({ className }: IconProps) {
  return <Sparkle className={cn("size-5", className)} />;
}

export function GiftIcon({ className }: IconProps) {
  return <Gift className={cn("size-5", className)} />;
}

export function ScissorsIcon({ className }: IconProps) {
  return <Scissors className={cn("size-5", className)} />;
}

export function NoteIcon({ className }: IconProps) {
  return <FileText className={cn("size-5", className)} />;
}

export function PrinterIcon({ className }: IconProps) {
  return <Printer className={cn("size-5", className)} />;
}

export function DownloadIcon({ className }: IconProps) {
  return <Download className={cn("size-5", className)} />;
}

export function SlidersIcon({ className }: IconProps) {
  return <SlidersHorizontal className={cn("size-5", className)} />;
}

export function ChatBubbleIcon({ className }: IconProps) {
  return <MessageCircle className={cn("size-4", className)} />;
}
