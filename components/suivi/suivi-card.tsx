"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import type { SuiviCard as SuiviCardData } from "@/lib/data/suivi";

const TIER_LABEL: Record<"vip" | "gold", string> = {
  vip: "VIP",
  gold: "GOLD",
};

function TierBadge({ tier }: { tier?: "vip" | "gold" }) {
  if (!tier) return null;
  return (
    <Badge variant={tier} className="shrink-0">
      {TIER_LABEL[tier]}
    </Badge>
  );
}

/** Carte cliente du module Suivi — format compact (échéance future) ou développé (échéance urgente). */
export function SuiviCard({ card }: { card: SuiviCardData }) {
  const [authorized, setAuthorized] = useState(false);

  if (card.variant === "compact") {
    return (
      <Card className="flex items-center gap-3 p-4">
        <Avatar
          initial={card.initials}
          size={44}
          className="bg-[var(--brand-rose-soft)] font-semibold text-[var(--brand-taupe-muted)]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-[var(--color-gray-900)]">{card.name}</p>
            <TierBadge tier={card.tier} />
          </div>
          <p className="truncate text-sm text-[var(--color-gray-500)]">{card.subtitle}</p>
        </div>
        <IconButton
          aria-label={`Envoyer un message WhatsApp à ${card.name}`}
          className="size-10 shrink-0 rounded-full bg-[var(--color-success)] text-white hover:opacity-90"
        >
          💬
        </IconButton>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <Avatar
          initial={card.initials}
          size={44}
          className="bg-[var(--brand-rose-soft)] font-semibold text-[var(--brand-taupe-muted)]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-[var(--color-gray-900)]">{card.name}</p>
            <TierBadge tier={card.tier} />
          </div>
          <p className="truncate text-sm text-[var(--color-gray-500)]">{card.subtitle}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="error" icon={<span aria-hidden>⏱</span>}>
              En retard de {card.lateDays} j
            </Badge>
            <span className="text-[11px] font-semibold tracking-wide text-[var(--color-gray-400)] uppercase">
              {card.typeLabel}
            </span>
          </div>
        </div>
      </div>

      <p className="rounded-xl bg-[var(--brand-cream)] p-4 text-sm leading-relaxed text-[var(--color-gray-600)]">
        {card.message}
      </p>

      {card.action.kind === "contact" && (
        <div className="flex flex-wrap gap-2">
          <Button variant="dark" className="flex-1">
            💬 WhatsApp
          </Button>
          <Button variant="outline" className="flex-1">
            ✉ Email
          </Button>
          <Button variant="brand" className="flex-1">
            📅 RDV pris
          </Button>
        </div>
      )}

      {card.action.kind === "pending" && (
        <div className="rounded-xl bg-[var(--color-warning-soft)] px-4 py-3 text-sm font-medium text-[var(--color-warning)]">
          🛡 En attente de validation — comprise dans « Valider &amp; envoyer »
        </div>
      )}

      {card.action.kind === "discount" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl bg-[var(--color-warning-soft)] px-4 py-3 text-sm font-medium text-[var(--color-warning)]">
            ⊘ Remise -{card.action.percent} % (code {card.action.code}) — en attente d&apos;autorisation de la direction
          </div>
          <Button
            variant="dark"
            className={cn("w-full", authorized && "opacity-60")}
            onClick={() => setAuthorized(true)}
            disabled={authorized}
          >
            {authorized ? `✓ Remise -${card.action.percent} % autorisée` : `🛡 Autoriser la remise -${card.action.percent} %`}
          </Button>
        </div>
      )}
    </Card>
  );
}
