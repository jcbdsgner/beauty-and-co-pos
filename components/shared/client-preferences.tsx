"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { notationSummary } from "@/lib/data/notation";
import { PREFERENCE_DOMAINS, PREFERENCE_DOMAIN_LABEL } from "@/lib/data/types";
import type { Cliente } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export type PreferenceLine = { label: string; note: string };

/** A cliente's preferences as label/note pairs: hair and colour reference, then each domain's
 *  « Noter la cliente » summary joined to its free-text note. Empty when the fiche holds none. */
export function clientPreferenceLines(client: Cliente | null | undefined): PreferenceLine[] {
  if (!client) return [];
  const lines: PreferenceLine[] = [];
  if (client.hairType) lines.push({ label: "Type de cheveux", note: client.hairType });
  if (client.colorReference) lines.push({ label: "Réf. couleur", note: client.colorReference });
  for (const domain of PREFERENCE_DOMAINS) {
    const note = [notationSummary(client, domain), client.preferenceNotes?.[domain]].filter(Boolean).join(" · ");
    if (note) lines.push({ label: PREFERENCE_DOMAIN_LABEL[domain], note });
  }
  return lines;
}

/**
 * A cliente's preferences — shown wherever she is, never hidden by default: the receptionist must
 * see them on every passage. An empty fiche says so rather than showing nothing. `collapsible`
 * (Comptoir ticket) lets her fold them to free room for the règlement; each new cliente opens
 * unfolded again.
 */
export function ClientPreferences({
  client,
  collapsible = false,
  className,
}: {
  client: Cliente;
  collapsible?: boolean;
  className?: string;
}) {
  const lines = clientPreferenceLines(client);
  const [collapsedFor, setCollapsedFor] = useState<string | null>(null);
  const collapsed = collapsible && collapsedFor === client.id;
  const title = (
    <span className="text-[11px] font-semibold tracking-[0.08em] text-base-content/55 uppercase">
      Préférences{collapsed && lines.length > 0 && <span className="tabular-nums"> · {lines.length}</span>}
    </span>
  );
  return (
    <div className={cn("rounded-2xl bg-base-200 px-3 py-2", collapsible && "pt-0", collapsed && "pb-0", className)}>
      {collapsible ? (
        <button
          type="button"
          aria-expanded={!collapsed}
          onClick={() => setCollapsedFor(collapsed ? null : client.id)}
          className="-mx-3 flex min-h-11 w-[calc(100%+1.5rem)] items-center justify-between gap-2 rounded-2xl px-3 text-left"
        >
          {title}
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary">
            {collapsed ? "Afficher" : "Réduire"}
            <ChevronDown className={cn("size-4 transition-transform", !collapsed && "rotate-180")} aria-hidden />
          </span>
        </button>
      ) : (
        <p>{title}</p>
      )}
      {collapsed ? null : lines.length > 0 ? (
        <dl className={cn("flex flex-col gap-1", !collapsible && "mt-1")}>
          {lines.map((pref) => (
            <div key={pref.label} className="flex gap-1.5 text-xs leading-snug">
              <dt className="shrink-0 font-semibold text-base-content/80">{pref.label} ·</dt>
              <dd className="text-base-content/70">{pref.note}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className={cn("text-xs text-base-content/55", !collapsible && "mt-1")}>Aucune préférence notée</p>
      )}
    </div>
  );
}
