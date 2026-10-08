"use client";

import { Cake, FileText } from "lucide-react";
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
import { buildDossiers, documentTotals, sinceLabel } from "@/components/devis/lib";
import { cn, formatFcfa } from "@/lib/utils";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import type { Conversation, Devis } from "@/lib/data/types";

const RELANCE_DATE_FMT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });

type MessageInboxProps = {
  selectedClientId: string | null;
  onSelect: (clientId: string) => void;
  filterClientId: string | null;
  onFilter: (clientId: string | null) => void;
};

export function MessageInbox({ selectedClientId, onSelect, filterClientId, onFilter }: MessageInboxProps) {
  const { conversations, clients, devis, factures } = useAppData();
  const clientFor = (id: string) => clients.find((c) => c.id === id);

  const visible = filterClientId ? conversations.filter((c) => c.clientId === filterClientId) : conversations;

  // Devis en cours (ADR 0042) — un fil par cliente qui a un devis ouvert : brouillon pas parti,
  // devis qui attend sa réponse, facture qui attend son paiement. Il passe avant l'anniversaire
  // (qui garde son ombre rosée) : sinon la section se compte mal et la ligne change de groupe à
  // l'ouverture. Une cliente qui a répondu ou un fil non lu remontent, puis le plus ancien.
  const dossiers = buildDossiers(devis, factures);
  const devisRows = visible
    .map((conv) => ({ conv, open: openDevisFor(conv, dossiers, devis) }))
    .filter((r): r is { conv: Conversation; open: OpenDevis } => Boolean(r.open))
    .sort((a, b) => {
      const ra = Number(a.conv.unread) * 2 + Number(a.open.replied);
      const rb = Number(b.conv.unread) * 2 + Number(b.open.replied);
      return rb - ra || a.open.at.localeCompare(b.open.at);
    });
  const devisConvIds = new Set(devisRows.map((r) => r.conv.id));

  // Anniversaire souhaité par le Bot, pas encore vu : en tête, ombre rosée, jusqu'à l'ouverture du fil.
  const birthdays = visible
    .filter((c) => !devisConvIds.has(c.id) && unseenBirthdayWish(c.messages))
    .sort((a, b) => unseenBirthdayWish(b.messages)!.at.localeCompare(unseenBirthdayWish(a.messages)!.at));
  const birthdayIds = new Set(birthdays.map((c) => c.id));

  const scheduled = visible
    .filter((c) => !birthdayIds.has(c.id) && !devisConvIds.has(c.id) && c.messages.some((m) => m.pending))
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
    .filter((c) => !birthdayIds.has(c.id) && !devisConvIds.has(c.id) && !scheduledIds.has(c.id))
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

            {devisRows.length > 0 && (
              <>
                <p className={cn("px-3 pb-1", birthdays.length > 0 ? "pt-3" : "pt-2")}>
                  <Legend>Devis en cours · {devisRows.length}</Legend>
                </p>
                {devisRows.map(({ open, conv }) => {
                  const client = clientFor(conv.clientId);
                  if (!client) return null;
                  return (
                    <InboxRow
                      key={conv.id}
                      conv={conv}
                      name={clientFullName(client)}
                      initial={clientInitial(client)}
                      subtitle={open.subtitle}
                      document
                      stamp={sinceLabel(open.at) === "aujourd'hui" ? shortStamp(open.at) : sinceLabel(open.at).replace("il y a ", "")}
                      selected={selectedClientId === conv.clientId}
                      onSelect={() => onSelect(conv.clientId)}
                      birthday={Boolean(unseenBirthdayWish(conv.messages))}
                    />
                  );
                })}
              </>
            )}

            {scheduled.length > 0 && (
              <>
                <p className={cn("px-3 pb-1", birthdays.length + devisRows.length > 0 ? "pt-3" : "pt-2")}>
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
                {(scheduled.length > 0 || birthdays.length > 0 || devisRows.length > 0) && (
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
  document = false,
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
  /** Le sous-titre parle du devis / de la facture — l'icône document le distingue d'un message. */
  document?: boolean;
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
        <span className={cn("flex items-center gap-1 text-[13px]", document ? "font-medium text-secondary" : "text-base-content/65")}>
          {document && <FileText aria-hidden className="size-3.5 shrink-0" />}
          <span className="line-clamp-1">{subtitle}</span>
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="flex items-center gap-1.5 text-xs text-base-content/60 tabular-nums">
          {stamp}
          <ChannelGlyph channel={conv.channel} className="size-3.5" />
        </span>
        <FlipChip value={STATE_LABEL[conv.state]} tone="neutral" className="min-w-0 px-1.5 py-0.5 text-xs" />
      </span>
    </button>
  );
}

type OpenDevis = { subtitle: string; replied: boolean; at: string };

/** Ce qui reste ouvert côté devis dans ce fil, dit en une ligne — ou rien. Une réponse de la
 *  cliente arrivée après le dernier document passe devant : c'est elle qu'il faut lire. */
function openDevisFor(conv: Conversation, dossiers: ReturnType<typeof buildDossiers>, devis: Devis[]): OpenDevis | null {
  const live = dossiers
    .filter((d) => d.devis.clientId === conv.clientId && (d.stage === "envoye" || d.stage === "a_payer"))
    .sort((a, b) => a.at.localeCompare(b.at));
  const draft = devis.find((d) => d.clientId === conv.clientId && d.status === "brouillon");
  if (live.length === 0 && !draft) return null;
  const last = lastRealMessage(conv.messages);
  const first = live[0];
  if (first) {
    const replied = last?.sender === "cliente" && last.at > first.at;
    const what = first.stage === "a_payer" ? "Facture à payer" : "Devis sans réponse";
    const subtitle = replied
      ? `A répondu : ${last!.body}`
      : `${what} · ${formatFcfa(first.total)}${live.length > 1 ? ` · +${live.length - 1}` : ""}`;
    return { subtitle, replied, at: first.at };
  }
  const total = documentTotals(draft!.lines, draft!.remises).total;
  return { subtitle: `Brouillon · ${formatFcfa(total)}`, replied: false, at: draft!.createdAt };
}
