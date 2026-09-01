"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageInbox } from "@/components/messages/message-inbox";
import { ConversationPanel } from "@/components/messages/conversation-panel";
import { Legend } from "@/components/ui/board";
import { useAppData } from "@/components/providers/app-data-provider";

export function MessagesView() {
  return (
    <Suspense fallback={null}>
      <MessagesViewInner />
    </Suspense>
  );
}

function MessagesViewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { conversations } = useAppData();

  const selectedClientId = searchParams.get("client");
  const [filterClientId, setFilterClientId] = useState<string | null>(null);

  const selectedConv = selectedClientId
    ? conversations.find((c) => c.clientId === selectedClientId)
    : undefined;

  function select(clientId: string) {
    router.replace(`/messages?client=${clientId}`);
  }

  return (
    <div className="grid h-full grid-cols-[380px_minmax(0,1fr)] gap-5">
      <MessageInbox
        selectedClientId={selectedClientId}
        onSelect={select}
        filterClientId={filterClientId}
        onFilter={setFilterClientId}
      />
      {selectedConv ? (
        <ConversationPanel key={selectedConv.id} conversationId={selectedConv.id} />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-[14px] border border-[var(--board-groove)] bg-white text-center">
          <Legend>Aucune conversation ouverte</Legend>
          <p className="max-w-xs text-sm text-[var(--color-gray-500)]">
            Choisissez une conversation dans la liste pour voir le fil et répondre à la cliente.
          </p>
        </div>
      )}
    </div>
  );
}
