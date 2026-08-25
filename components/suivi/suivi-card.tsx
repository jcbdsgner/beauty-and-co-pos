"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CloseButton, IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import { useSuiviValidation } from "@/components/suivi/suivi-validation-context";
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
  const { sent } = useSuiviValidation();
  const [authorized, setAuthorized] = useState(false);
  const [channelsSent, setChannelsSent] = useState<{ whatsapp: boolean; email: boolean }>({
    whatsapp: false,
    email: false,
  });
  const [booked, setBooked] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [compactSent, setCompactSent] = useState(false);

  if (dismissed) return null;

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
          aria-label={
            compactSent ? `Message WhatsApp envoyé à ${card.name}` : `Envoyer un message WhatsApp à ${card.name}`
          }
          onClick={() => setCompactSent(true)}
          disabled={compactSent}
          className={cn(
            "size-10 shrink-0 rounded-full text-white transition",
            compactSent ? "bg-[var(--color-success)] opacity-60" : "bg-[var(--color-success)] hover:opacity-90",
          )}
        >
          {compactSent ? "✓" : "💬"}
        </IconButton>
      </Card>
    );
  }

  return (
    <Card className="relative flex flex-col gap-4 p-5">
      <CloseButton
        aria-label={`Ignorer le rappel pour ${card.name}`}
        onClick={() => setDismissed(true)}
      />
      <div className="flex items-start gap-3 pr-8">
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

      {card.action.kind === "contact" &&
        (booked ? (
          <div className="rounded-xl bg-[var(--color-success-soft)] px-4 py-3 text-sm font-medium text-[var(--color-success)]">
            ✓ Rendez-vous pris — merci de l&apos;avoir noté
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="success"
              className="flex-1"
              onClick={() => setChannelsSent((s) => ({ ...s, whatsapp: true }))}
              disabled={channelsSent.whatsapp}
            >
              {channelsSent.whatsapp ? "✓ Envoyé" : "💬 WhatsApp"}
            </Button>
            <Button
              variant="dark"
              className="flex-1"
              onClick={() => setChannelsSent((s) => ({ ...s, email: true }))}
              disabled={channelsSent.email}
            >
              {channelsSent.email ? "✓ Envoyé" : "✉ Email"}
            </Button>
            <Button variant="brand" className="flex-1" onClick={() => setBooked(true)}>
              📅 RDV pris
            </Button>
          </div>
        ))}

      {card.action.kind === "pending" &&
        (sent ? (
          <div className="rounded-xl bg-[var(--color-success-soft)] px-4 py-3 text-sm font-medium text-[var(--color-success)]">
            ✓ Message envoyé
          </div>
        ) : (
          <div className="rounded-xl bg-[var(--color-warning-soft)] px-4 py-3 text-sm font-medium text-[var(--color-warning)]">
            🛡 En attente de validation — comprise dans « Valider &amp; envoyer »
          </div>
        ))}

      {card.action.kind === "discount" && (
        <div className="flex flex-col gap-3">
          <div
            className={cn(
              "rounded-xl px-4 py-3 text-sm font-medium",
              authorized
                ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
                : "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
            )}
          >
            {sent && authorized
              ? `✓ Message envoyé avec la remise -${card.action.percent} % (code ${card.action.code})`
              : authorized
                ? `✓ Remise -${card.action.percent} % autorisée (code ${card.action.code}) — sera incluse dans « Valider & envoyer »`
                : `⊘ Remise -${card.action.percent} % (code ${card.action.code}) — en attente d'autorisation de la direction`}
          </div>
          {!sent && (
            <Button
              variant="dark"
              className={cn("w-full", authorized && "opacity-60")}
              onClick={() => setAuthorized(true)}
              disabled={authorized}
            >
              {authorized
                ? `✓ Remise -${card.action.percent} % autorisée`
                : `🛡 Autoriser la remise -${card.action.percent} %`}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
