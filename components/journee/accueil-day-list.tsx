"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import { boissonById } from "@/lib/data/boissons";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { produitById, serviceById } from "@/lib/data/menu";
import { reservationComposition, reservationDate, timeToMinutes, todayISO, type ReservationDayRow } from "@/lib/data/planning";
import { cn, formatFcfa } from "@/lib/utils";
import type { Cliente, Praticienne, RendezVous } from "@/lib/data/types";

/** The card never grows with the réservation — cap the item list and summarize the rest; the full
 *  breakdown lives in the fiche réservation (`AppointmentDetailSheet`). */
const MAX_VISIBLE_ITEMS = 3;

type ItemRow = { key: string; label: string; note: string; price: number };

type Props = {
  rows: ReservationDayRow[];
  clients: Cliente[];
  praticiennes: Praticienne[];
  /** Ouvre la fiche réservation (le sheet), pointée sur ce rendez-vous. */
  onOpenReservation: (rv: RendezVous) => void;
  onEncaisser: (reservationId: string) => void;
};

function currentMinute(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/** 2h slices anchored on even hours (10h, 12h, 14h…) so the day reads as a timeline the
 *  receptionist can scan — "qui est là vers 10h, vers midi, vers 16h" — instead of one
 *  undifferentiated grid. */
const SLOT_MIN = 120;

function formatHour(min: number): string {
  return `${Math.floor(min / 60)}h${min % 60 ? String(min % 60).padStart(2, "0") : ""}`;
}

type SlotState = "past" | "current" | "upcoming";

/** The hour column of the timeline — the slot's start big on the left, a node on a vertical
 *  rail, the rail running on to the next slot's node. The slot the receptionist is living in
 *  gets a filled node with a halo + « En cours » ; past slots fade. The hours used to sit as a
 *  tiny tracked legend above each row of cards — unreadable at arm's length. */
function SlotRail({ start, state, last }: { start: number; state: SlotState; last: boolean }) {
  const current = state === "current";
  const past = state === "past";
  return (
    <div className="relative w-32 shrink-0 pt-4">
      {/* Node centre sits 32px down (pt-4 + mt-1 + half of size-6) ; the rail runs past the
          slot's bottom, through the gap-6 between slots, to the next node's centre. */}
      {!last && <span aria-hidden className="absolute top-8 -bottom-14 left-[11px] w-0.5 bg-primary/25" />}
      {/* Sticky: a busy slot wraps to several rows of cards — its hour stays in view. */}
      <div className="sticky top-6 flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2 bg-base-100",
            current ? "border-primary ring-4 ring-primary/15" : past ? "border-primary/30" : "border-primary",
          )}
        >
          {current && <span className="size-2.5 rounded-full bg-primary" />}
          {past && <span className="size-2 rounded-full bg-primary/30" />}
        </span>
        <div className="leading-tight">
          <p
            className={cn(
              "font-[family-name:var(--font-heading)] text-2xl font-semibold tabular-nums",
              past ? "text-base-content/50" : "text-base-content",
            )}
          >
            {formatHour(start)}
          </p>
          <p className={cn("mt-1 text-sm tabular-nums", past ? "text-base-content/45" : "text-base-content/65")}>
            jusqu&apos;à {formatHour(start + SLOT_MIN)}
          </p>
          {current && (
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.08em] text-primary">En cours</p>
          )}
        </div>
      </div>
    </div>
  );
}

/** "Aujourd'hui" or "lundi 22 septembre" — only shown once the list spans more than one calendar
 *  day (recherche + période, `AccueilPage`) ; the single-day case (le défaut) stays exactly as
 *  before, no date header. */
function dateGroupLabel(iso: string, todayIso: string): string {
  if (iso === todayIso) return "Aujourd'hui";
  const label = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(`${iso}T00:00:00`),
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * « Rendez-vous » sur l'Accueil (Figma 242:1735) — une grille fixe de 3 colonnes, une carte par
 * réservation : payeuse · composition (« 1 femme + 1 enfant ») en en-tête, heure à droite, jusqu'à
 * 3 lignes de détail (prestations puis extras pré-commandés — boisson, produit à emporter — le
 * reste résumé en « + N »), Total, puis « Voir les détails » + « Encaisser ». Le détail complet
 * (au-delà des 3 lignes) vit dans la fiche réservation (`AppointmentDetailSheet`), jamais dans la
 * carte : elle garde toujours la même taille. Les créneaux de 2h se lisent sur un rail
 * horaire à gauche (`SlotRail`), le créneau en cours marqué. Plus simple que la `DayList` du Planning
 * (pas de filet « maintenant » à la minute) : l'Accueil trie, le Planning est l'établi.
 */
export function AccueilDayList({ rows, clients, praticiennes, onOpenReservation, onEncaisser }: Props) {
  const now = currentMinute();

  // Equal-start sub-sort by payeuse name — the receptionist scans an alphabetised column.
  const sorted = useMemo(() => {
    const name = (r: ReservationDayRow) => {
      const c = clients.find((x) => x.id === r.reservation.payerClientId);
      return c ? clientFullName(c) : "";
    };
    return [...rows].sort(
      (a, b) => a.start.localeCompare(b.start) || name(a).localeCompare(name(b), "fr"),
    );
  }, [rows, clients]);

  // Grouped by day first (only surfaced as a header once a search/période spans more than one
  // day, docs/adr — recherche + période de l'Accueil), then by 2h slot within each day.
  // Chronological already (sorted above) — a single pass keeps each Map's insertion order
  // increasing, so both levels come out in time order for free.
  const dateGroups = useMemo(() => {
    const byDate = new Map<string, ReservationDayRow[]>();
    for (const row of sorted) {
      const d = reservationDate(row.reservation);
      const bucket = byDate.get(d);
      if (bucket) bucket.push(row);
      else byDate.set(d, [row]);
    }
    return [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, dateRows]) => {
        const slots = new Map<number, ReservationDayRow[]>();
        for (const row of dateRows) {
          const slotStart = Math.floor(timeToMinutes(row.start) / SLOT_MIN) * SLOT_MIN;
          const bucket = slots.get(slotStart);
          if (bucket) bucket.push(row);
          else slots.set(slotStart, [row]);
        }
        return { date, slots: [...slots.entries()] };
      });
  }, [sorted]);
  const showDateHeaders = dateGroups.length > 1;
  const todayIso = todayISO();

  const staffName = (id?: string) => (id ? praticiennes.find((p) => p.id === id)?.name : undefined);
  const staffLine = (rv: RendezVous) => {
    const first = staffName(rv.staffId) ?? "—";
    const second = rv.secondStaffId ? staffName(rv.secondStaffId) : undefined;
    return second ? `${first} + ${second}` : first;
  };

  return (
    <div className="flex flex-col gap-8">
      {dateGroups.map(({ date, slots }, i) => (
        <div
          key={date}
          className={cn("flex flex-col gap-6", showDateHeaders && i > 0 && "border-t border-base-300 pt-8")}
        >
          {showDateHeaders && (
            <p className="pl-1 font-[family-name:var(--font-heading)] text-base font-semibold text-base-content">
              {dateGroupLabel(date, todayIso)}
            </p>
          )}
          {slots.map(([slotStart, slotRows], slotIndex) => {
            const slotEnd = slotStart + SLOT_MIN;
            const slotState: SlotState =
              date !== todayIso
                ? date < todayIso ? "past" : "upcoming"
                : slotEnd <= now ? "past" : slotStart <= now ? "current" : "upcoming";
            return (
        <div key={slotStart} className="flex gap-6">
          <SlotRail start={slotStart} state={slotState} last={slotIndex === slots.length - 1} />
          <div className="grid min-w-0 flex-1 grid-cols-3 gap-4">
            {slotRows.map((row) => {
              const { reservation, rendezVous } = row;
              const payer = clients.find((c) => c.id === reservation.payerClientId);
              const active = rendezVous.filter((rv) => rv.status !== "annule");
              const hasSale = Boolean(reservation.saleId);
              const composition = reservationComposition(reservation);
              // Vient d'arriver de la plateforme externe, pas encore remarquée (ADR 0030) — en
              // taupe, jamais ambre : l'ambre de cette page est déjà pris par « à encaisser ».
              const unseen = reservation.source === "en_ligne" && reservation.seen === false;

              const items: ItemRow[] = active.map((rv) => {
                const service = serviceById(rv.serviceId);
                return { key: rv.id, label: service?.name ?? "Prestation", note: staffLine(rv), price: service?.price ?? 0 };
              });
              for (const extra of reservation.extras ?? []) {
                if (extra.kind === "boisson") {
                  const boisson = boissonById(extra.refId);
                  if (!boisson) continue;
                  items.push({
                    key: `${extra.kind}-${extra.refId}`,
                    label: extra.qty > 1 ? `${extra.qty}× ${boisson.name}` : boisson.name,
                    note: "Boisson",
                    price: boisson.price * extra.qty,
                  });
                } else {
                  const produit = produitById(extra.refId);
                  if (!produit) continue;
                  items.push({
                    key: `${extra.kind}-${extra.refId}`,
                    label: extra.qty > 1 ? `${extra.qty}× ${produit.name}` : produit.name,
                    note: "Produit à emporter",
                    price: produit.price * extra.qty,
                  });
                }
              }
              const total = items.reduce((sum, item) => sum + item.price, 0);
              const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
              const hiddenCount = items.length - visibleItems.length;

              const startMin = timeToMinutes(row.start);
              const endMin = timeToMinutes(row.end);
              const phase = endMin <= now ? "past" : startMin <= now ? "current" : "upcoming";
              const awaitingCheckout = phase === "past" && !hasSale;
              const past = phase === "past" && !awaitingCheckout;

              const target = active[0] ?? rendezVous[0];

              return (
                <div
                  key={reservation.id}
                  className={cn(
                    "flex h-full flex-col gap-3 rounded-field border border-base-300 bg-base-100 p-4",
                    past && "opacity-70",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => target && onOpenReservation(target)}
                    className="flex min-w-0 items-start justify-between gap-3 text-left transition active:opacity-70"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="relative mt-0.5 shrink-0">
                        <Avatar
                          initial={payer ? clientInitial(payer) : "?"}
                          size={32}
                          className="bg-accent text-xs font-bold text-base-content"
                        />
                        {unseen && (
                          <span
                            aria-hidden
                            className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-base-100"
                          />
                        )}
                      </span>
                      <span className="min-w-0">
                        {unseen && <span className="sr-only">Réservation non vue — </span>}
                        <span className="block truncate font-[family-name:var(--font-heading)] text-xl font-medium text-base-content">
                          {payer ? clientFullName(payer) : "Cliente"}
                        </span>
                        {/* line-clamp plutôt que truncate (audit UX du 19/09) : une composition comme
                            « 2 enfants » ne doit jamais être coupée à mi-mot. */}
                        <span className="mt-0.5 line-clamp-2 text-sm leading-snug text-base-content/65">{composition}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right leading-tight">
                      <span className="block text-base font-medium tabular-nums text-base-content">{row.start}</span>
                      <span className="mt-0.5 block text-sm tabular-nums text-base-content/55">→ {row.end}</span>
                    </span>
                  </button>

                  <div className="flex flex-col gap-1.5 border-t border-base-300 pt-3">
                    {visibleItems.map((item) => (
                      <div key={item.key} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-base-content/75">{item.label}</span>
                        <span className="shrink-0 text-base-content/60">{item.note}</span>
                      </div>
                    ))}
                    {hiddenCount > 0 && (
                      <div className="text-sm text-base-content/60">
                        + {hiddenCount} de plus
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-base-300 pt-3 text-sm font-semibold">
                    <span className="text-base-content/65">Total</span>
                    <span className="tabular-nums text-base-content">{formatFcfa(total)}</span>
                  </div>

                  <div className="mt-auto flex gap-2 pt-1">
                    <Button variant="outline" className="flex-1" onClick={() => target && onOpenReservation(target)}>
                      Voir les détails
                    </Button>
                    <Button
                      variant={hasSale ? "outline" : "dark"}
                      className="flex-1"
                      onClick={() => onEncaisser(reservation.id)}
                    >
                      {hasSale ? "Voir la vente" : "Encaisser"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
