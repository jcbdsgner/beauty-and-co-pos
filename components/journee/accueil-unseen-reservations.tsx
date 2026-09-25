"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { salonById } from "@/lib/data/entreprises";
import { serviceById } from "@/lib/data/menu";
import {
  dateISO,
  groupDayByReservation,
  isUnseenReservation,
  reservationComposition,
  reservationDate,
  todayISO,
} from "@/lib/data/planning";
import type { RendezVous } from "@/lib/data/types";

/** Au-delà, la bande pousserait « Rendez-vous » hors de l'écran — le reste se déplie à la demande. */
const HOME_LIMIT = 4;

/** L'heure à la minute près, re-rendue chaque minute : « reçue il y a 4 min » vieillit tout seul
 *  pendant que l'Accueil reste ouvert. `null` côté serveur — le seed calcule `createdAt` à
 *  l'évaluation du module, qui diffère entre serveur et client : le libellé ne s'affiche qu'une
 *  fois hydraté, sinon mismatch d'hydratation. */
function subscribeMinute(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}
const minuteNow = () => Math.floor(Date.now() / 60_000) * 60_000;
const noMinute = () => null;

function useNow(): number | null {
  return useSyncExternalStore(subscribeMinute, minuteNow, noMinute);
}

function receivedLabel(createdAt: string | undefined, now: number | null): string | null {
  if (!createdAt || now === null) return null;
  const min = Math.floor((now - new Date(createdAt).getTime()) / 60_000);
  if (min < 1) return "Reçue à l'instant";
  if (min < 60) return `Reçue il y a ${min} min`;
  if (min < 24 * 60) return `Reçue il y a ${Math.floor(min / 60)} h`;
  return `Reçue le ${new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(new Date(createdAt))}`;
}

function dayLabel(iso: string, todayIso: string): string {
  if (iso === todayIso) return "Aujourd'hui";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (iso === dateISO(tomorrow)) return "Demain";
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(new Date(y, m - 1, d));
}

/**
 * « Réservations reçues » — la bande rose tout en haut de l'Accueil (ADR 0030, rév. 25/09) :
 * les réservations **Non vues** (CONTEXT.md) — arrivées de la plateforme en ligne, pas encore
 * remarquées par la réceptionniste —, **quel que soit leur jour** (une cliente qui réserve pour samedi doit se voir aujourd'hui) et
 * indépendamment des filtres de la section « Rendez-vous ». Remplace l'ancien point sur l'avatar
 * de la carte du jour, trop discret. Toucher une ligne ouvre la fiche réservation, ce qui la marque
 * vue et la retire de la bande ; « Tout marquer comme vu » vide la bande d'un geste. La bande
 * disparaît quand il n'y a plus rien — l'Accueil reste calme.
 */
export function AccueilUnseenReservations({ onOpenReservation }: { onOpenReservation: (rv: RendezVous) => void }) {
  const { reservations, clients, praticiennes, markReservationSeen } = useAppData();
  const now = useNow();
  const [expanded, setExpanded] = useState(false);

  const unseen = reservations.filter(isUnseenReservation);
  if (unseen.length === 0) return null;

  // La plus récemment reçue en tête — c'est un fil d'arrivées, pas l'agenda du jour (qui, lui, suit
  // l'heure de passage juste en dessous).
  const rows = groupDayByReservation(unseen).sort((a, b) =>
    (b.reservation.createdAt ?? "").localeCompare(a.reservation.createdAt ?? ""),
  );
  const shown = expanded ? rows : rows.slice(0, HOME_LIMIT);
  const hidden = rows.length - shown.length;
  const todayIso = todayISO();

  return (
    <section aria-labelledby="reservations-recues" className="rounded-box bg-[#fdcfca] p-2">
      <div className="flex items-center justify-between gap-4 py-2 pr-1 pl-4">
        <div className="min-w-0">
          <h2
            id="reservations-recues"
            className="flex items-center gap-2.5 font-[family-name:var(--font-heading)] text-xl font-semibold text-[#3d2a2a]"
          >
            Réservations reçues
            <span className="rounded-full bg-base-100 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-secondary">
              {rows.length}
            </span>
          </h2>
          <p className="mt-0.5 text-sm text-[#6b4a4a]">En ligne, pas encore vues.</p>
        </div>
        <button
          type="button"
          onClick={() => unseen.forEach((r) => markReservationSeen(r.id))}
          className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-base-100/55 px-5 text-[15px] font-semibold text-secondary transition hover:bg-base-100 active:scale-[0.98]"
        >
          <Check aria-hidden className="size-4" />
          Tout marquer comme vu
        </button>
      </div>

      <ul className="flex flex-col gap-1.5">
        {shown.map((row) => {
          const { reservation, rendezVous } = row;
          const payer = clients.find((c) => c.id === reservation.payerClientId);
          const name = payer ? clientFullName(payer) : "Cliente";
          const services = [...new Set(rendezVous.map((rv) => serviceById(rv.serviceId)?.name ?? "Prestation"))];
          const staff = row.staffIds
            .map((id) => praticiennes.find((p) => p.id === id))
            .filter((p) => p !== undefined);
          const salon = staff[0] ? salonById(staff[0].salonId)?.name : undefined;
          const day = dayLabel(reservationDate(reservation), todayIso);
          const received = receivedLabel(reservation.createdAt, now);
          const target = rendezVous[0] ?? reservation.rendezVous[0];

          return (
            <li key={reservation.id}>
              <button
                type="button"
                onClick={() => target && onOpenReservation(target)}
                aria-label={`${name}, ${day} à ${row.start} — ${services.join(", ")}. Ouvrir la réservation.`}
                className="grid min-h-[76px] w-full grid-cols-[120px_minmax(0,1fr)_minmax(0,1.3fr)_150px_20px] items-center gap-6 rounded-field bg-base-100 px-5 py-3 text-left shadow-[0_2px_8px_rgb(92_68_68/0.06)] transition hover:shadow-[0_6px_16px_rgb(92_68_68/0.12)] active:scale-[0.995]"
              >
                <span className="leading-tight">
                  <span className="block text-sm font-medium text-base-content/60">{day}</span>
                  <span className="mt-0.5 block text-xl font-semibold tabular-nums text-base-content">{row.start}</span>
                </span>

                <span className="flex min-w-0 items-center gap-3">
                  <Avatar
                    initial={payer ? clientInitial(payer) : "?"}
                    size={40}
                    className="shrink-0 bg-accent text-sm font-bold text-secondary"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-[family-name:var(--font-heading)] text-[17px] font-semibold text-base-content">
                      {name}
                    </span>
                    <span className="block truncate text-sm text-base-content/60">{reservationComposition(reservation)}</span>
                  </span>
                </span>

                <span className="min-w-0">
                  <span className="line-clamp-1 text-[15px] text-base-content/80">{services.join(" · ")}</span>
                  {staff.length > 0 && (
                    <span className="block truncate text-sm text-base-content/55">
                      avec {staff.map((p) => p.name).join(", ")}
                    </span>
                  )}
                </span>

                <span className="text-right leading-tight">
                  {received && <span className="block text-sm font-medium text-secondary">{received}</span>}
                  {salon && <span className="mt-0.5 block text-sm text-base-content/55">{salon}</span>}
                </span>

                <ChevronRight aria-hidden className="size-5 text-base-content/35" />
              </button>
            </li>
          );
        })}
      </ul>

      {rows.length > HOME_LIMIT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 flex h-12 w-full items-center justify-center rounded-field text-[15px] font-semibold text-secondary transition hover:bg-base-100/40"
        >
          {expanded ? "Réduire" : `Afficher les ${hidden} autres`}
        </button>
      )}
    </section>
  );
}
