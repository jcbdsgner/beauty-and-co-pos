import type { ConversationState, Message, MessageSender, RelanceType } from "@/lib/data/types";

/** Inbox / header token for who holds the thread. */
export const STATE_LABEL: Record<ConversationState, string> = {
  auto: "Auto",
  conseillere: "Conseillère",
  receptionniste: "Vous",
  direction: "Direction",
};

export const RELANCE_TYPE_LABEL: Record<RelanceType, string> = {
  anniversaire: "Anniversaire",
  soins: "Soin & rendez-vous",
  fidelite: "Fidélité",
  reconquete: "Reconquête",
  recommandation: "Recommandation",
};

const TIME_FMT = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });
const WEEKDAY_FMT = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
const DATE_FMT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
export const FULL_DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

/** Short relative stamp for an inbox row: "14:20" today, "lun." this week, "3 sept" beyond. */
export function shortStamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return TIME_FMT.format(d);
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays >= 0 && diffDays < 7) return WEEKDAY_FMT.format(d).replace(".", "");
  return DATE_FMT.format(d);
}

/** Chronological, `pending` relances always last (they sit in the future / after the present). */
export function orderedMessages(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => {
    if (Boolean(a.pending) !== Boolean(b.pending)) return a.pending ? 1 : -1;
    return a.at.localeCompare(b.at);
  });
}

export function senderLabel(sender: MessageSender, clientShortName: string): string {
  if (sender === "cliente") return clientShortName;
  if (sender === "receptionniste") return "Vous";
  return "Conseillère";
}

export function lastRealMessage(messages: Message[]): Message | undefined {
  const real = messages.filter((m) => !m.pending).sort((a, b) => a.at.localeCompare(b.at));
  return real[real.length - 1];
}

export function nearestPending(messages: Message[]): Message | undefined {
  return messages
    .filter((m) => m.pending)
    .sort((a, b) => a.at.localeCompare(b.at))[0];
}
