"use client";

import { Cake } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { Avatar } from "@/components/ui/atoms/avatar";
import { FlipChip, Legend } from "@/components/ui/board";
import { ClientSearchField } from "@/components/shared/client-search-field";
import { ChannelGlyph } from "@/components/messages/channel-glyph";
import {
  RELANCE_TYPE_LABEL,
  STATE_LABEL,
  lastRealMessage,
  nearestPending,
  shortStamp,
  unseenBirthdayWish,
} from "@/components/messages/lib";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/data/types";

const RELANCE_DATE_FMT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });

type MessageInboxProps = {
  selectedClientId: string | null;
  onSelect: (clientId: string) => void;
  filterClientId: string | null;
  onFilter: (clientId: string | null) => void;
};

export function MessageInbox({ selectedClientId, onSelect, filterClientId, onFilter }: MessageInboxProps) {
  const { conversations, clients } = useAppData();
  const clientFor = (id: string) => clients.find((c) => c.id === id);

  const visible = filterClientId ? conversations.filter((c) => c.clientId === filterClientId) : conversations;

  // Anniversaire souhaité par le Bot, pas encore vu : en tête, ombre rosée, jusqu'à l'ouverture du fil.
  const birthdays = visible
    .filter((c) => unseenBirthdayWish(c.messages))
    .sort((a, b) => unseenBirthdayWish(b.messages)!.at.localeCompare(unseenBirthdayWish(a.messages)!.at));
  const birthdayIds = new Set(birthdays.map((c) => c.id));

  const scheduled = visible
    .filter((c) => !birthdayIds.has(c.id) && c.messages.some((m) => m.pending))
    .sort((a, b) => {
      const pa = nearestPending(a.messages)!;
      const pb = nearestPending(b.messages)!;
      const anivA = pa.relanceType === "anniversaire";
      const anivB = pb.relanceType === "anniversaire";
      if (anivA !== anivB) return anivA ? -1 : 1;
      return pa.at.localeCompare(pb.at);
    });

  const scheduledIds = new Set(scheduled.map((c) => c.id));
  const rest = visible
    .filter((c) => !birthdayIds.has(c.id) && !scheduledIds.has(c.id))
    .sort((a, b) => {
      if (a.unread !== b.unread) return a.unread ? -1 : 1;
      const la = lastRealMessage(a.messages)?.at ?? "";
      const lb = lastRealMessage(b.messages)?.at ?? "";
      return lb.localeCompare(la);
    });

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-box border border-base-300 bg-white">
      <div className="flex shrink-0 flex-col gap-2 border-b border-border p-3">
        <ClientSearchField
          selectedClientId={filterClientId}
          onSelect={onFilter}
          placeholder="Filtrer par cliente…"
          className="border-solid"
        />
        {filterClientId && (
          <Button variant="outline" size="sm" className="self-start" onClick={() => onFilter(null)}>
            Toutes
          </Button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-1 px-6 py-14 text-center">
            <Legend>Aucun échange</Legend>
            <p className="text-sm text-base-content/55">Rien pour ce filtre.</p>
          </div>
        ) : (
          <>
            {birthdays.length > 0 && (
              <>
                <p className="px-3 pt-2 pb-1">
                  <Legend>Anniversaires souhaités · {birthdays.length}</Legend>
                </p>
                <div className="flex flex-col gap-1.5 px-0.5 pb-1">
                  {birthdays.map((conv) => {
                    const client = clientFor(conv.clientId);
                    if (!client) return null;
                    const wish = unseenBirthdayWish(conv.messages)!;
                    return (
                      <InboxRow
                        key={conv.id}
                        conv={conv}
                        name={clientFullName(client)}
                        initial={clientInitial(client)}
                        subtitle="Joyeux anniversaire envoyé"
                        stamp={shortStamp(wish.at)}
                        selected={selectedClientId === conv.clientId}
                        onSelect={() => onSelect(conv.clientId)}
                        birthday
                      />
                    );
                  })}
                </div>
              </>
            )}

            {scheduled.length > 0 && (
              <>
                <p className={cn("px-3 pb-1", birthdays.length > 0 ? "pt-3" : "pt-2")}>
                  <Legend>Programmées · {scheduled.length}</Legend>
                </p>
                {scheduled.map((conv) => {
                  const client = clientFor(conv.clientId);
                  if (!client) return null;
                  const pending = nearestPending(conv.messages)!;
                  return (
                    <InboxRow
                      key={conv.id}
                      conv={conv}
                      name={clientFullName(client)}
                      initial={clientInitial(client)}
                      subtitle={`${RELANCE_TYPE_LABEL[pending.relanceType!]} · ${RELANCE_DATE_FMT.format(new Date(pending.at))}`}
                      stamp={RELANCE_DATE_FMT.format(new Date(pending.at))}
                      selected={selectedClientId === conv.clientId}
                      onSelect={() => onSelect(conv.clientId)}
                    />
                  );
                })}
              </>
            )}

            {rest.length > 0 && (
              <>
                {(scheduled.length > 0 || birthdays.length > 0) && (
                  <p className="px-3 pt-3 pb-1">
                    <Legend>Conversations</Legend>
                  </p>
                )}
                {rest.map((conv) => {
                  const client = clientFor(conv.clientId);
                  if (!client) return null;
                  const last = lastRealMessage(conv.messages);
                  return (
                    <InboxRow
                      key={conv.id}
                      conv={conv}
                      name={clientFullName(client)}
                      initial={clientInitial(client)}
                      subtitle={last?.body ?? "—"}
                      stamp={last ? shortStamp(last.at) : ""}
                      selected={selectedClientId === conv.clientId}
                      onSelect={() => onSelect(conv.clientId)}
                    />
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InboxRow({
  conv,
  name,
  initial,
  subtitle,
  stamp,
  selected,
  onSelect,
  birthday = false,
}: {
  conv: Conversation;
  name: string;
  initial: string;
  subtitle: string;
  stamp: string;
  selected: boolean;
  onSelect: () => void;
  /** An unseen birthday wish — ombre rosée + gâteau on the avatar, until the thread is opened. */
  birthday?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-field px-3 py-2.5 text-left transition active:scale-[0.99]",
        birthday && "highlight-rose border bg-white",
        selected ? "bg-accent" : "hover:bg-base-200",
      )}
    >
      <span className="relative shrink-0">
        <Avatar initial={initial} size={40} className="bg-accent font-semibold text-secondary" />
        {birthday && (
          <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-content ring-2 ring-white">
            <Cake aria-hidden className="size-3" />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-[family-name:var(--font-heading)] text-[15px] font-semibold text-base-content">
            {name}
          </span>
          {conv.unread && <span aria-label="Non lu" className="size-2 shrink-0 rounded-full bg-warning" />}
          {birthday && <span className="sr-only">Anniversaire souhaité, pas encore vu</span>}
        </span>
        <span className="line-clamp-1 text-[13px] text-base-content/55">{subtitle}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="flex items-center gap-1.5 text-xs text-base-content/45 tabular-nums">
          {stamp}
          <ChannelGlyph channel={conv.channel} className="size-3.5" />
        </span>
        <FlipChip value={STATE_LABEL[conv.state]} tone="neutral" className="min-w-0 px-1.5 py-0.5 text-xs" />
      </span>
    </button>
  );
}
