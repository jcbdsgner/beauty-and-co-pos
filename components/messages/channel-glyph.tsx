import { Mail, MessageCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RelanceChannel } from "@/lib/data/types";

const GLYPH: Record<RelanceChannel, { Icon: typeof Mail; color: string; label: string }> = {
  whatsapp: { Icon: MessageCircle, color: "text-[#25D366]", label: "WhatsApp" },
  sms: { Icon: MessageSquare, color: "text-info", label: "SMS" },
  email: { Icon: Mail, color: "text-base-content/45", label: "Email" },
};

/** Which channel a thread runs on — a coloured lucide glyph, reused in the inbox row and the
 *  conversation header. */
export function ChannelGlyph({ channel, className }: { channel: RelanceChannel; className?: string }) {
  const { Icon, color, label } = GLYPH[channel];
  return <Icon aria-label={label} className={cn("size-4 shrink-0", color, className)} />;
}
