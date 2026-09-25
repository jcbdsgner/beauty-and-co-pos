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
 * A cliente's preferences — always rendered wherever she is shown, never behind a disclosure: the
 * receptionist must see them on every passage. An empty fiche says so rather than showing nothing.
 */
export function ClientPreferences({ client, className }: { client: Cliente; className?: string }) {
  const lines = clientPreferenceLines(client);
  return (
    <div className={cn("rounded-2xl bg-base-200 px-3 py-2", className)}>
      <p className="text-[11px] font-semibold tracking-[0.08em] text-base-content/55 uppercase">Préférences</p>
      {lines.length > 0 ? (
        <dl className="mt-1 flex flex-col gap-1">
          {lines.map((pref) => (
            <div key={pref.label} className="flex gap-1.5 text-xs leading-snug">
              <dt className="shrink-0 font-semibold text-base-content/80">{pref.label} ·</dt>
              <dd className="text-base-content/70">{pref.note}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-1 text-xs text-base-content/55">Aucune préférence notée</p>
      )}
    </div>
  );
}
