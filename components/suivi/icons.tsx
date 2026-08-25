import { cn } from "@/lib/utils";
import { Clock, Heart, Mail, Megaphone, MessageCircle, Send, Shield, Sparkles, TriangleAlert } from "lucide-react";

type IconProps = { className?: string };

/** Small icon set specific to the Suivi module (relance tournée, campagnes) — kept local per module conventions. */

export function SparkleIcon({ className }: IconProps) {
  return <Sparkles className={cn("size-4", className)} />;
}

export function MegaphoneIcon({ className }: IconProps) {
  return <Megaphone className={cn("size-4", className)} />;
}

export function ClockIcon({ className }: IconProps) {
  return <Clock className={cn("size-4", className)} />;
}

export function HeartIcon({ className }: IconProps) {
  return <Heart className={cn("size-4", className)} />;
}

export function AlertTriangleIcon({ className }: IconProps) {
  return <TriangleAlert className={cn("size-4", className)} />;
}

export function PaperPlaneIcon({ className }: IconProps) {
  return <Send className={cn("size-4", className)} />;
}

export function ChatBubbleIcon({ className }: IconProps) {
  return <MessageCircle className={cn("size-4", className)} />;
}

export function MailIcon({ className }: IconProps) {
  return <Mail className={cn("size-4", className)} />;
}

export function ShieldIcon({ className }: IconProps) {
  return <Shield className={cn("size-4", className)} />;
}
