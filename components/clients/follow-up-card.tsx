"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeartPulseIcon, ChevronIcon } from "@/components/ui/icons";
import { ChatBubbleIcon, SparkleIcon } from "@/components/clients/icons";
import { type Client, type FollowUpSuggestion } from "@/lib/data/clients";

/**
 * A single "à lui proposer" suggestion. Clicking "Proposer" gives immediate feedback
 * by turning into the same "Envoyée" badge already used below for a sent recommendation
 * — reusing an existing status vocabulary instead of inventing a new one.
 */
function SuggestionRow({ suggestion }: { suggestion: FollowUpSuggestion }) {
  const [sent, setSent] = useState(false);

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-gray-200)] p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-[var(--color-gray-900)]">{suggestion.name}</p>
          <Badge variant="neutral">{suggestion.category}</Badge>
        </div>
        <p className="mt-0.5 text-sm text-[var(--color-gray-500)]">{suggestion.reason}</p>
      </div>
      {sent ? (
        <Badge variant="info" className="shrink-0">
          Envoyée
        </Badge>
      ) : (
        <Button
          type="button"
          variant="success"
          icon={<ChatBubbleIcon />}
          className="shrink-0 px-4 py-2 text-sm"
          onClick={() => setSent(true)}
        >
          Proposer
        </Button>
      )}
    </div>
  );
}

export function FollowUpCard({ client }: { client: Client }) {
  const followUp = client.followUp;

  return (
    <Card className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
          <HeartPulseIcon className="size-5 text-[var(--brand-taupe-muted)]" />
          Suivi &amp; recommandations
        </h2>
        <Link
          href="/suivi"
          className="flex items-center gap-1 text-xs font-semibold tracking-wide text-[var(--brand-taupe-muted)] uppercase"
        >
          Centre de suivi
          <ChevronIcon className="size-3" />
        </Link>
      </div>

      {!followUp ? (
        <p className="text-sm text-[var(--color-gray-500)]">Aucune recommandation en attente pour ce client.</p>
      ) : (
        <>
          <div className="rounded-xl bg-[var(--color-warning-soft)] p-4">
            <p className="text-xs font-semibold tracking-wide text-[var(--color-warning)] uppercase">
              Prochaine visite conseillée
            </p>
            <p className="mt-1 text-[15px] font-semibold text-[var(--color-gray-900)]">
              {followUp.dueLabel}{" "}
              <span className="text-[var(--color-error)]">en retard de {followUp.overdueDays} j</span>
            </p>
          </div>

          <p className="text-sm text-[var(--color-gray-700)]">
            <span className="mr-2 inline-block size-1.5 rounded-full bg-[var(--color-gray-400)] align-middle" />
            {followUp.rewardLabel} ·{" "}
            <span className="text-[var(--color-error)]">en retard de {followUp.rewardOverdueDays} j</span>
          </p>

          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
              <SparkleIcon className="size-4 text-[var(--brand-taupe-muted)]" />
              À lui proposer
            </p>
            {followUp.suggestions.map((suggestion) => (
              <SuggestionRow key={suggestion.name} suggestion={suggestion} />
            ))}
          </div>

          {followUp.recommendationSent && (
            <div className="flex flex-col gap-2 border-t border-[var(--color-gray-200)] pt-4">
              <p className="text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
                Recommandations
              </p>
              <div className="flex items-center justify-between">
                <p className="text-[15px] text-[var(--color-gray-900)]">{followUp.recommendationSent}</p>
                <Badge variant="info">Envoyée</Badge>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
