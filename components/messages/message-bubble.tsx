import { cn } from "@/lib/utils";
import { FULL_DATE_FMT } from "@/components/messages/lib";
import type { Message } from "@/lib/data/types";

const TIME_FMT = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

/**
 * One conversational message (no `relanceType`). Cliente sits left on white; the receptionist and
 * the Conseillère sit right on the rose-soft accent. The Conseillère carries her signature line.
 */
export function MessageBubble({ message }: { message: Message }) {
  const mine = message.sender !== "cliente";
  return (
    <div className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm",
          mine ? "bg-accent text-base-content" : "border border-border bg-white text-base-content",
        )}
      >
        <p className="whitespace-pre-line">{message.body}</p>
      </div>
      <span className="px-1 text-[11px] text-base-content/45" title={FULL_DATE_FMT.format(new Date(message.at))}>
        {message.sender === "conseillere" && "Conseillère · Beauty and Co · "}
        {TIME_FMT.format(new Date(message.at))}
      </span>
    </div>
  );
}
