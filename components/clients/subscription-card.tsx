"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DiamondIcon, ChevronIcon } from "@/components/ui/icons";
import { CrownIcon, GiftIcon, SparkleIcon } from "@/components/clients/icons";
import { type Client, type SubscriptionCredit } from "@/lib/data/clients";

/**
 * A single subscription credit. "Utiliser" consumes one credit on click — the count
 * decrements immediately (visible feedback) and the button locks to "Épuisé" at zero
 * instead of silently doing nothing forever.
 */
function CreditCard({ credit }: { credit: SubscriptionCredit }) {
  const [count, setCount] = useState(credit.count);
  const depleted = count <= 0;

  return (
    <Card className="flex items-center justify-between gap-3 p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]">
          {credit.icon === "diamond" ? <DiamondIcon className="size-5" /> : <SparkleIcon className="size-5" />}
        </span>
        <div>
          <p className="text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
            {credit.label}
          </p>
          <p className="font-[var(--font-heading)] text-2xl text-[var(--color-gray-900)]">{count}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="brand"
        className="px-4 py-2 text-sm"
        disabled={depleted}
        onClick={() => setCount((current) => Math.max(0, current - 1))}
      >
        {depleted ? "Épuisé" : "Utiliser"}
      </Button>
    </Card>
  );
}

export function SubscriptionCard({ client }: { client: Client }) {
  const subscription = client.subscription;
  if (!subscription) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-2xl bg-[var(--pos-accent-dark)] p-6 text-white">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15">
          <CrownIcon className="size-5" />
        </span>
        <div>
          <p className="font-[var(--font-heading)] text-xl">{subscription.name}</p>
          <p className="text-sm text-white/75">
            {subscription.since} · renouvellement le {subscription.renewsOn}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {subscription.credits.map((credit) => (
          <CreditCard key={credit.label} credit={credit} />
        ))}
      </div>

      <Card className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-sm text-[var(--color-gray-700)]">
          <GiftIcon className="size-4 shrink-0 text-[var(--brand-taupe-muted)]" />
          Dépose gratuite : après 2 remplissage(s) de plus
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--color-gray-700)]">
          <CrownIcon className="size-4 shrink-0 text-[var(--brand-taupe-muted)]" />
          Manucure russe offerte : dès 2 mois d&apos;abonnement
        </div>
        <div className="flex items-center justify-between border-t border-[var(--color-gray-200)] pt-3 text-sm">
          <span className="text-[var(--color-gray-600)]">Prestataire préférée : — au choix —</span>
          <ChevronIcon className="size-4 rotate-90 text-[var(--color-gray-400)]" />
        </div>
        <p className="text-xs text-[var(--color-gray-400)]">
          Adhésion et renouvellement : vendre le service « Abonnement Cercle Ongles » en caisse.
        </p>
      </Card>
    </div>
  );
}
