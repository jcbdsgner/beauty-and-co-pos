"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import { Legend } from "@/components/ui/board";
import { boissonById } from "@/lib/data/boissons";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { produitById, serviceById } from "@/lib/data/menu";
import { reservationComposition, timeToMinutes, type ReservationDayRow } from "@/lib/data/planning";
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

function slotLabel(startMin: number): string {
  const slotStart = Math.floor(startMin / SLOT_MIN) * SLOT_MIN;
  const fmt = (m: number) => `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`;
  return `${fmt(slotStart)} – ${fmt(slotStart + SLOT_MIN)}`;
}

/**
 * « Rendez-vous » sur l'Accueil (Figma 242:1735) — une grille fixe de 3 colonnes, une carte par
 * réservation : payeuse · composition (« 1 femme + 1 enfant ») en en-tête, heure à droite, jusqu'à
 * 3 lignes de détail (prestations puis extras pré-commandés — boisson, produit à emporter — le
 * reste résumé en « + N »), Total, puis « Voir les détails » + « Encaisser ». Le détail complet
 * (au-delà des 3 lignes) vit dans la fiche réservation (`AppointmentDetailSheet`), jamais dans la
 * carte : elle garde toujours la même taille. Volontairement plus simple que la `DayList` du
 * Planning (pas de rail, pas de filet « maintenant ») : l'Accueil trie, le Planning est l'établi.
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

  // Chronological already (sorted above) — a single pass keeps the Map's insertion order
  // increasing, so slots come out in time order for free.
  const slots = useMemo(() => {
    const groups = new Map<number, ReservationDayRow[]>();
    for (const row of sorted) {
      const slotStart = Math.floor(timeToMinutes(row.start) / SLOT_MIN) * SLOT_MIN;
      const bucket = groups.get(slotStart);
      if (bucket) bucket.push(row);
      else groups.set(slotStart, [row]);
    }
    return [...groups.entries()];
  }, [sorted]);

  const staffName = (id?: string) => (id ? praticiennes.find((p) => p.id === id)?.name : undefined);
  const staffLine = (rv: RendezVous) => {
    const first = staffName(rv.staffId) ?? "—";
    const second = rv.secondStaffId ? staffName(rv.secondStaffId) : undefined;
    return second ? `${first} + ${second}` : first;
  };

  return (
    <div className="flex flex-col gap-6">
      {slots.map(([slotStart, slotRows]) => (
        <div key={slotStart} className="flex flex-col gap-2">
          <Legend className="pl-1">{slotLabel(slotStart)}</Legend>
          <div className="grid grid-cols-3 gap-4">
            {slotRows.map((row) => {
              const { reservation, rendezVous } = row;
              const payer = clients.find((c) => c.id === reservation.payerClientId);
              const active = rendezVous.filter((rv) => rv.status !== "annule");
              const hasSale = Boolean(reservation.saleId);
              const composition = reservationComposition(reservation);

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
                      <Avatar
                        initial={payer ? clientInitial(payer) : "?"}
                        size={32}
                        className="mt-0.5 bg-accent text-xs font-bold text-base-content"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-[family-name:var(--font-heading)] text-xl font-medium text-base-content">
                          {payer ? clientFullName(payer) : "Cliente"}
                        </span>
                        {/* line-clamp plutôt que truncate (audit UX du 19/09) : une composition comme
                            « 2 enfants » ne doit jamais être coupée à mi-mot. */}
                        <span className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-base-content/55">{composition}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right leading-tight">
                      <span className="block text-base font-medium tabular-nums text-base-content">{row.start}</span>
                      <span className="mt-0.5 block text-xs tabular-nums text-base-content/40">→ {row.end}</span>
                    </span>
                  </button>

                  <div className="flex flex-col gap-1.5 border-t border-base-300 pt-3">
                    {visibleItems.map((item) => (
                      <div key={item.key} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-base-content/75">{item.label}</span>
                        <span className="shrink-0 text-base-content/45">{item.note}</span>
                      </div>
                    ))}
                    {hiddenCount > 0 && (
                      <div className="text-sm text-base-content/45">
                        + {hiddenCount} de plus
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-base-300 pt-3 text-sm font-semibold">
                    <span className="text-base-content/55">Total</span>
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
      ))}
    </div>
  );
}
