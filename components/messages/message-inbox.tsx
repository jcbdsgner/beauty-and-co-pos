"use client";

import { Button } from "@/components/ui/atoms/button";
import { Avatar } from "@/components/ui/atoms/avatar";
import { FlipChip, Legend } from "@/components/ui/board";
import { ClientSearchField } from "@/components/shared/client-search-field";
import { ChannelGlyph } from "@/components/messages/channel-glyph";
import { RELANCE_TYPE_LABEL, STATE_LABEL, lastRealMessage, nearestPending, shortStamp } from "@/components/messages/lib";
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

  const scheduled = visible
    .filter((c) => c.messages.some((m) => m.pending))
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
    .filter((c) => !scheduledIds.has(c.id))
    .sort((a, b) => {
      if (a.unread !== b.unread) return a.unread ? -1 : 1;
      const la = lastRealMessage(a.messages)?.at ?? "";
      const lb = lastRealMessage(b.messages)?.at ?? "";
      return lb.localeCompare(la);
    });

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-[var(--board-groove)] bg-white">
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
            <p className="text-sm text-[var(--color-gray-500)]">Rien pour ce filtre.</p>
          </div>
        ) : (
          <>
            {scheduled.length > 0 && (
              <>
                <p className="px-3 pt-2 pb-1">
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
                {scheduled.length > 0 && (
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
}: {
  conv: Conversation;
  name: string;
  initial: string;
  subtitle: string;
  stamp: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition active:scale-[0.99]",
        selected ? "bg-accent" : "hover:bg-[var(--color-gray-50)]",
      )}
    >
      <Avatar initial={initial} size={40} className="bg-accent font-semibold text-secondary" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-[family-name:var(--font-heading)] text-[15px] font-semibold text-[var(--color-gray-900)]">
            {name}
          </span>
          {conv.unread && <span aria-label="Non lu" className="size-2 shrink-0 rounded-full bg-[var(--board-amber)]" />}
        </span>
        <span className="line-clamp-1 text-[13px] text-[var(--color-gray-500)]">{subtitle}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-gray-400)] tabular-nums">
          {stamp}
          <ChannelGlyph channel={conv.channel} className="size-3.5" />
        </span>
        <FlipChip value={STATE_LABEL[conv.state]} tone="neutral" className="min-w-0 px-1.5 py-0.5 text-[0.55rem]" />
      </span>
    </button>
  );
}
