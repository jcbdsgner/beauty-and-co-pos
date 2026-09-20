import { Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RelanceChannel } from "@/lib/data/types";

const LUCIDE_GLYPH: Partial<Record<RelanceChannel, { Icon: typeof Mail; color: string; label: string }>> = {
  sms: { Icon: MessageSquare, color: "text-info", label: "SMS" },
  email: { Icon: Mail, color: "text-base-content/45", label: "Email" },
};

/** Which channel a thread runs on — a coloured glyph, reused in the inbox row and the
 *  conversation header. WhatsApp uses its own logo mark rather than a generic lucide icon. */
export function ChannelGlyph({ channel, className }: { channel: RelanceChannel; className?: string }) {
  if (channel === "whatsapp") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- fixed local brand mark, not a Next Image asset
      <img
        src="/images/icons/whatsapp.png"
        alt="WhatsApp"
        className={cn("size-4 shrink-0 object-contain", className)}
      />
    );
  }
  const { Icon, color, label } = LUCIDE_GLYPH[channel]!;
  return <Icon aria-label={label} className={cn("size-4 shrink-0", color, className)} />;
}
