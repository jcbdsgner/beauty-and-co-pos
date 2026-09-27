"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";
import { Board, BoardEmpty } from "@/components/ui/board";
import { Button } from "@/components/ui/atoms/button";
import { EmptyState } from "@/components/ui/molecules/empty-state";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { NotationTile } from "@/components/clientele/notation-tile";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientNumberLabel } from "@/lib/data/clientele";
import { demoPhotoFor } from "@/lib/data/demo-photos";
import { lastNotationAt, notationTally } from "@/lib/data/notation";
import { PREFERENCE_DOMAINS, PREFERENCE_DOMAIN_LABEL, type Cliente, type PreferenceDomain } from "@/lib/data/types";

const LONG_DATE = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/**
 * « Voir les préférences » — everything the salon noted about a cliente, one domain at a time.
 * Read-only: each « Noter la cliente » answer as the questionnaire's own photo tile, with how many
 * times she took it and which one she took last time; then the domain's free note and reference
 * photos. `?domaine=` opens a given domain (the fiche links each of its rows here).
 */
export function PreferencesView({ clientId }: { clientId: string }) {
  return (
    <Suspense fallback={null}>
      <PreferencesViewInner clientId={clientId} />
    </Suspense>
  );
}

function isDomain(value: string | null): value is PreferenceDomain {
  return PREFERENCE_DOMAINS.includes(value as PreferenceDomain);
}

function hasContent(client: Cliente, domain: PreferenceDomain) {
  return (
    notationTally(client, domain).length > 0 ||
    Boolean(client.preferenceNotes?.[domain]) ||
    (client.preferencePhotos?.[domain]?.length ?? 0) > 0 ||
    (domain === "coiffure" && Boolean(client.hairType || client.colorReference))
  );
}

/** The domain of her most recent round, else the first with anything noted. */
function defaultDomain(client: Cliente): PreferenceDomain {
  const dated = PREFERENCE_DOMAINS.map((d) => ({ d, at: lastNotationAt(client, d) }))
    .filter((x): x is { d: PreferenceDomain; at: string } => Boolean(x.at))
    .sort((a, b) => b.at.localeCompare(a.at));
  return dated[0]?.d ?? PREFERENCE_DOMAINS.find((d) => hasContent(client, d)) ?? "onglerie";
}

function PreferencesViewInner({ clientId }: { clientId: string }) {
  const { clients } = useAppData();
  const client = clients.find((c) => c.id === clientId);
  const requested = useSearchParams().get("domaine");
  const [picked, setPicked] = useState<PreferenceDomain | null>(isDomain(requested) ? requested : null);

  if (!client) {
    return (
      <Board legend="Préférences introuvables">
        <BoardEmpty
          title="Cette cliente est introuvable"
          hint="Impossible d'afficher ses préférences."
          action={
            <Button href="/clientele" variant="outline">
              Retour à la Clientèle
            </Button>
          }
        />
      </Board>
    );
  }

  const domain = picked ?? defaultDomain(client);
  const tallies = notationTally(client, domain);
  const lastAt = lastNotationAt(client, domain);
  const passages = (client.notationRounds ?? []).filter((r) => tallies.some((t) => (r.choices[t.question.id]?.length ?? 0) > 0)).length;
  const note = client.preferenceNotes?.[domain];
  const photos = client.preferencePhotos?.[domain] ?? [];
  const basics = domain === "coiffure" ? [
    { label: "Type de cheveux", value: client.hairType },
    { label: "Référence couleur", value: client.colorReference },
  ].filter((b) => b.value) : [];
  const empty = !hasContent(client, domain);

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col">
      <header className="flex items-center gap-4">
        <Link
          href={`/clientele/${client.id}`}
          aria-label={`Retour à la fiche de ${client.firstName}`}
          className="-mr-2 -ml-7 flex size-10 shrink-0 items-center justify-center text-secondary transition hover:text-primary active:scale-90"
        >
          <ChevronLeft aria-hidden className="size-6" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-heading)] text-[28px] font-bold leading-tight text-base-content">Préférences</h1>
          <p className="mt-0.5 text-[15px] text-base-content/60">
            {clientFullName(client)} · {clientNumberLabel(client)}
          </p>
        </div>
      </header>

      <SegmentedToggle
        className="mt-7"
        value={domain}
        onChange={(value) => setPicked(value as PreferenceDomain)}
        options={PREFERENCE_DOMAINS.map((d) => ({ value: d, label: PREFERENCE_DOMAIN_LABEL[d] }))}
      />

      <div key={domain} className="animate-in fade-in-0 duration-200 ease-out">
        {empty ? (
          <EmptyState
            className="mt-6"
            icon={<Sparkles />}
            title={`Rien de noté en ${PREFERENCE_DOMAIN_LABEL[domain].toLowerCase()}`}
            subtitle="Les réponses de « Noter la cliente » s'afficheront ici, passage après passage."
          />
        ) : (
          <>
            {lastAt && (
              <p className="mt-6 text-[15px] text-base-content/60">
                Notée <span className="font-semibold tabular-nums text-base-content">{passages} fois</span> · la dernière le{" "}
                <span className="font-semibold text-base-content">{LONG_DATE.format(new Date(lastAt))}</span>
              </p>
            )}

            {basics.length > 0 && (
              <dl className="mt-6 flex gap-10 rounded-box border border-base-300 bg-base-100 px-5 py-4">
                {basics.map((b) => (
                  <div key={b.label}>
                    <dt className="text-xs font-medium text-base-content/55">{b.label}</dt>
                    <dd className="mt-0.5 text-[17px] font-medium text-base-content">{b.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {tallies.map((tally) => {
              const tall = tally.question.options.length === 4;
              return (
                <section key={tally.question.id} className="mt-9" aria-labelledby={`q-${tally.question.id}`}>
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 id={`q-${tally.question.id}`} className="text-xl font-semibold text-base-content">
                      {tally.question.noteLabel}
                    </h2>
                    <p className="text-sm tabular-nums text-base-content/55">
                      sur {tally.rounds} passage{tally.rounds > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-6 gap-4">
                    {tally.options.map(({ option, count, latest }) => (
                      <NotationTile
                        key={option.id}
                        question={tally.question}
                        option={option}
                        tall={tall}
                        selected={latest}
                        count={count}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {(note || photos.length > 0) && (
              <section className="mt-9" aria-labelledby="pref-notes">
                <h2 id="pref-notes" className="text-xl font-semibold text-base-content">
                  Noté par l&apos;équipe
                </h2>
                {note && (
                  <p className="mt-3 max-w-[70ch] whitespace-pre-line text-[17px] leading-relaxed text-base-content/90">{note}</p>
                )}
                {photos.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-4">
                    {photos.map((ref) => (
                      // eslint-disable-next-line @next/next/no-img-element -- demo fixture photos
                      <img key={ref} src={demoPhotoFor(ref)} alt="" className="size-40 rounded-box object-cover" />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
