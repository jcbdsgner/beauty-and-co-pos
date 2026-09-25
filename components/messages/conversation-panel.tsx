"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { Textarea } from "@/components/ui/atoms/textarea";
import { FlipChip, Legend } from "@/components/ui/board";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { ChannelGlyph } from "@/components/messages/channel-glyph";
import { MessageBubble } from "@/components/messages/message-bubble";
import { FULL_DATE_FMT, RELANCE_TYPE_LABEL, STATE_LABEL, orderedMessages } from "@/components/messages/lib";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { styleById } from "@/lib/data/styles";
import { cn } from "@/lib/utils";
import type { Conversation, Message } from "@/lib/data/types";

const TIER_BADGE = {
  vip: { label: "VIP", variant: "vip" as const },
  platinum: { label: "Platinum", variant: "platinum" as const },
  gold: { label: "Gold", variant: "gold" as const },
  silver: { label: "Silver", variant: "silver" as const },
};

const RELANCE_DATE_FMT = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });

export function ConversationPanel({ conversationId }: { conversationId: string }) {
  const {
    conversations,
    clients,
    markConversationRead,
    takeOverConversation,
    handBackToBot,
    transferToManager,
    sendClientMessage,
  } = useAppData();

  const conv = conversations.find((c) => c.id === conversationId);
  const client = conv ? clients.find((c) => c.id === conv.clientId) : undefined;

  const [draft, setDraft] = useState("");
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const unread = conv?.unread ?? false;
  useEffect(() => {
    // Opening a thread marks it read — same "adjust store in an effect" pattern as noteClientViewed.
    if (unread) markConversationRead(conversationId);
  }, [conversationId, unread, markConversationRead]);

  useEffect(() => {
    timelineRef.current?.scrollTo({ top: timelineRef.current.scrollHeight });
  }, [conv?.messages.length]);

  if (!conv || !client) {
    return (
      <div className="flex h-full items-center justify-center rounded-[14px] border border-base-300 bg-white">
        <p className="text-sm text-base-content/55">Conversation introuvable.</p>
      </div>
    );
  }

  const shortName = client.firstName;
  const ordered = orderedMessages(conv.messages);

  function send() {
    if (!draft.trim()) return;
    sendClientMessage(conv!.id, draft);
    setDraft("");
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[14px] border border-base-300 bg-white">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-3.5">
        <Avatar initial={clientInitial(client)} size={40} className="bg-accent font-semibold text-secondary" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-[family-name:var(--font-heading)] font-semibold text-[15px] text-base-content">
              {clientFullName(client)}
            </span>
            {client.tier && <Badge {...TIER_BADGE[client.tier]}>{TIER_BADGE[client.tier].label}</Badge>}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-base-content/55">
            <ChannelGlyph channel={conv.channel} className="size-3.5" />
            <span>{STATE_LABEL[conv.state]}</span>
          </div>
        </div>
        <HandActions state={conv.state} onHandBack={() => handBackToBot(conv.id)} onTransfer={() => setConfirmTransfer(true)} />
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
        {ordered.map((m) =>
          m.relanceType && m.pending ? (
            <PendingRelance key={m.id} message={m} paused={conv.state === "receptionniste"} />
          ) : m.relanceType ? (
            <RelanceCard key={m.id} message={m} />
          ) : (
            <MessageBubble key={m.id} message={m} />
          ),
        )}
      </div>

      {/* Composer */}
      <Composer
        state={conv.state}
        clientName={shortName}
        draft={draft}
        onDraft={setDraft}
        onSend={send}
        onTakeOver={() => takeOverConversation(conv.id)}
      />

      <ConfirmDialog
        open={confirmTransfer}
        tone="neutral"
        confirmVariant="brand"
        title="Transférer à la manager ?"
        description={`${clientFullName(client)} sera prise en charge par la manager, hors de l'app. Le fil reste visible ici en lecture seule.`}
        confirmLabel="Transférer"
        onCancel={() => setConfirmTransfer(false)}
        onConfirm={() => {
          transferToManager(conv.id);
          setConfirmTransfer(false);
        }}
      />
    </div>
  );
}

/** "Prendre la conversation" n'existe qu'une fois, près du composeur (audit UX du 19/09) — plus
 *  de doublon ici pour les états auto/bot, où le contenu tient largement dans la fenêtre. */
function HandActions({
  state,
  onHandBack,
  onTransfer,
}: {
  state: Conversation["state"];
  onHandBack: () => void;
  onTransfer: () => void;
}) {
  if (state !== "receptionniste") return null;
  return (
    <div className="flex shrink-0 gap-2">
      <Button variant="outline" size="sm" onClick={onHandBack}>
        Repasser au Bot
      </Button>
      <Button variant="danger-outline" size="sm" onClick={onTransfer}>
        Transférer à la manager
      </Button>
    </div>
  );
}

function Composer({
  state,
  clientName,
  draft,
  onDraft,
  onSend,
  onTakeOver,
}: {
  state: Conversation["state"];
  clientName: string;
  draft: string;
  onDraft: (v: string) => void;
  onSend: () => void;
  onTakeOver: () => void;
}) {
  if (state === "manager") {
    return (
      <div className="shrink-0 border-t border-border bg-base-200 p-4 text-center text-sm text-base-content/55">
        Cette conversation a été transférée à la manager. Elle se poursuit hors de l&apos;app.
      </div>
    );
  }

  if (state === "auto" || state === "bot") {
    return (
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-base-200 p-4">
        <p className="text-sm text-base-content/55">Le Bot tient cette conversation.</p>
        <Button variant="brand" size="sm" onClick={onTakeOver}>
          Prendre la conversation
        </Button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-border p-4">
      <Textarea
        value={draft}
        onChange={(e) => onDraft(e.target.value)}
        placeholder={`Écrire à ${clientName}…`}
        rows={2}
      />
      <div className="flex justify-end">
        <Button
          variant="dark"
          size="sm"
          icon={<Send className="size-4" />}
          disabled={!draft.trim()}
          onClick={onSend}
        >
          Envoyer
        </Button>
      </div>
    </div>
  );
}

/** A relance already sent — a full-width system card on the timeline, not a bubble. */
function RelanceCard({ message }: { message: Message }) {
  const style = message.styleId ? styleById(message.styleId) : undefined;
  return (
    <div className="rounded-[10px] border border-base-300 bg-base-200 px-4 py-3">
      <Legend>
        Relance {message.relanceType ? RELANCE_TYPE_LABEL[message.relanceType].toLowerCase() : ""} · envoyée{" "}
        {FULL_DATE_FMT.format(new Date(message.at))}
      </Legend>
      <p className="mt-1.5 whitespace-pre-line text-sm text-base-content">{message.body}</p>
      {message.discountLabel && (
        <div className="mt-2">
          <FlipChip value={message.discountLabel} tone="neutral" />
        </div>
      )}
      {style && (
        <p className="mt-2 text-xs text-base-content/55">Style recommandé : {style.name}</p>
      )}
      <p className="mt-2 text-xs text-base-content/45">Votre conseillère beauté · Beauty and Co</p>
    </div>
  );
}

/** A scheduled relance that has not gone out — sits at the foot of the timeline, dimmed. */
function PendingRelance({ message, paused }: { message: Message; paused: boolean }) {
  const type = message.relanceType ? RELANCE_TYPE_LABEL[message.relanceType] : "Relance";
  return (
    <div
      className={cn(
        "rounded-[10px] border border-dashed border-base-300 bg-base-200 px-4 py-3 text-sm text-base-content/55 opacity-70",
      )}
    >
      {paused ? (
        <span>
          <span className="font-semibold">{type}</span> — en pause (vous tenez la conversation)
        </span>
      ) : (
        <span>
          <span className="font-semibold">{type}</span> — partira le{" "}
          {RELANCE_DATE_FMT.format(new Date(message.at))}, sauf prise en main
        </span>
      )}
    </div>
  );
}
