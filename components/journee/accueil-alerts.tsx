"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CalendarClock, ChevronRight, Gift, Printer } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import { Toast } from "@/components/ui/molecules/toast";
import { useGiftCardPrint } from "@/components/journee/gift-card-tile";
import { POINTAGE_BLOCK } from "@/components/journee/accueil-pointage";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { giftCardContent, giftCardRecipient } from "@/lib/data/cartes-cadeaux";
import { serviceById, SERVICES } from "@/lib/data/menu";
import { shiftsAt } from "@/lib/data/praticiennes";
import { groupDayByReservation, reservationDate, todayISO, type ReservationDayRow } from "@/lib/data/planning";
import { minutesToTime, timeToMinutes } from "@/lib/data/time";
import { POSTE_SALON_ID } from "@/lib/session";
import { cn, formatFcfa } from "@/lib/utils";
import { useAppStore, type AppState } from "@/lib/store/app-store";
import type { GiftCardOrder, RendezVous } from "@/lib/data/types";

/** Démo : l'Accueil s'ouvre sans alerte, puis elles arrivent au bout de ce délai. */
const DEMO_REVEAL_MS = 5000;
/** Une réservation qui commence dans ce délai (minutes) devient une alerte « Rendez-vous imminent ». */
const IMMINENT_WINDOW_MIN = 30;
/** La réservation de démo commence dans… */
const DEMO_LEAD_MIN = 15;

// Une fois arrivées, les alertes restent jusqu'au rechargement — revenir sur l'Accueil ne rejoue
// pas l'attente de 5 s (état de module, comme le reste du store : session seulement).
let demoRevealed = false;

/** L'heure à la minute, re-rendue chaque minute — « dans 15 min » décompte tout seul. */
function subscribeMinute(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}
const minuteNow = () => Math.floor(Date.now() / 60_000) * 60_000;
const noMinute = () => null;

function nowMinutes(now: number): number {
  const d = new Date(now);
  return d.getHours() * 60 + d.getMinutes();
}

/** Les réservations du jour, pas encore encaissées, qui commencent dans la fenêtre — la plus proche d'abord. */
function imminentRows(reservations: AppState["reservations"], now: number) {
  const todayIso = todayISO();
  return groupDayByReservation(reservations.filter((r) => reservationDate(r) === todayIso && !r.saleId))
    .map((row) => ({ row, inMin: timeToMinutes(row.start) - nowMinutes(now) }))
    .filter(({ row, inMin }) => !row.allCancelled && inMin >= 0 && inMin <= IMMINENT_WINDOW_MIN)
    .sort((a, b) => a.inMin - b.inMin);
}

/** La réservation de démo : une cliente du fichier sans rendez-vous aujourd'hui, une prestation de
 *  coiffure, une coiffeuse de l'équipe du poste, dans 15 minutes. Elle arrive comme une réservation
 *  en ligne déjà vue — elle doit nourrir l'alerte, pas la bande « Réservations reçues ». Inutile si
 *  le seed en a déjà une d'imminente à ce moment-là. */
function injectDemoReservation(state: AppState) {
  if (imminentRows(state.reservations, Date.now()).length > 0) return;
  const startMin = nowMinutes(Date.now()) + DEMO_LEAD_MIN;
  if (startMin >= 24 * 60) return;
  const todayIso = todayISO();
  const busy = new Set(state.reservations.filter((r) => reservationDate(r) === todayIso).map((r) => r.payerClientId));
  const client = state.clients.find((c) => !busy.has(c.id)) ?? state.clients[0];
  const service = SERVICES.find((s) => s.id === "coiffure-pose-perruque") ?? SERVICES[0];
  const today = new Date();
  const staff =
    state.praticiennes.find((p) => p.role === "coiffeuse" && shiftsAt(p, today, POSTE_SALON_ID).length > 0) ??
    state.praticiennes.find((p) => p.role === "coiffeuse") ??
    state.praticiennes[0];
  if (!client || !service || !staff) return;
  const id = "RV-demo-imminent";
  state.receiveReservation({
    id,
    payerClientId: client.id,
    source: "en_ligne",
    seen: true,
    date: todayISO(),
    createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    rendezVous: [
      {
        id: `${id}-1`,
        reservationId: id,
        serviceId: service.id,
        staffId: staff.id,
        salonId: POSTE_SALON_ID,
        start: minutesToTime(startMin),
        durationMin: service.durationMinutes,
        status: "actif",
      },
    ],
  });
}

/**
 * Les alertes de l'Accueil (ADR 0040), à droite du bloc Scanner et à sa hauteur : ce qui demande
 * la réceptionniste maintenant. Deux sortes — un **rendez-vous imminent** (une réservation du jour,
 * pas encore encaissée, qui commence dans moins de 30 min) et une **carte cadeau à imprimer** (la
 * plus ancienne de la file, ADR 0012). Rien ⇒ une ligne grise, la place reste tenue pour que rien
 * ne saute quand une alerte arrive.
 *
 * Démo : l'Accueil s'ouvre vide, et 5 s après les alertes arrivent (une réservation qui commence
 * dans 15 min est injectée à ce moment-là).
 */
export function AccueilAlerts({ onOpenReservation }: { onOpenReservation: (rv: RendezVous) => void }) {
  const { reservations, giftCardOrders } = useAppData();
  const now = useSyncExternalStore(subscribeMinute, minuteNow, noMinute);
  const [revealed, setRevealed] = useState(() => demoRevealed);
  // Au niveau de la rangée : une carte imprimée quitte l'alerte (la suivante prend sa place),
  // le toast doit lui survivre.
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (demoRevealed) return;
    const timer = window.setTimeout(() => {
      demoRevealed = true;
      injectDemoReservation(useAppStore.getState());
      setRevealed(true);
    }, DEMO_REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const imminent = revealed && now !== null ? imminentRows(reservations, now) : [];

  const toPrint = revealed
    ? giftCardOrders.filter((o) => o.status === "a_imprimer").sort((a, b) => a.orderedAt.localeCompare(b.orderedAt))
    : [];

  const count = imminent.length + (toPrint.length > 0 ? 1 : 0);

  return (
    <section aria-label="Alertes" aria-live="polite" className="min-w-0 flex-1">
      {count === 0 ? (
        <div
          className={cn(
            POINTAGE_BLOCK,
            "flex w-full items-center justify-center rounded-box border border-dashed border-base-300 px-6",
          )}
        >
          <p className="text-[15px] text-base-content/45">Aucune alerte pour le moment</p>
        </div>
      ) : (
        <ul className="-m-2 flex gap-4 overflow-x-auto p-2">
          {imminent.map(({ row, inMin }, i) => (
            <AlertSlot key={row.reservation.id} index={i}>
              <ImminentAlert row={row} inMin={inMin} onOpen={() => onOpenReservation(row.rendezVous[0])} />
            </AlertSlot>
          ))}
          {toPrint.length > 0 && (
            <AlertSlot index={imminent.length}>
              <GiftCardAlert
                key={toPrint[0].id}
                order={toPrint[0]}
                others={toPrint.length - 1}
                onPrinted={() => setToast(`Carte-cadeau ${toPrint[0].code} envoyée à l'impression.`)}
              />
            </AlertSlot>
          )}
        </ul>
      )}
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </section>
  );
}

/** Une alerte arrive : glisse de la droite et se pose, en cascade — le seul mouvement de l'Accueil. */
function AlertSlot({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <li
      className="shrink-0 animate-in fade-in-0 slide-in-from-right-6 fill-mode-backwards duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {children}
    </li>
  );
}

const CARD = "flex h-48 w-[19.5rem] flex-col rounded-box border border-base-300 bg-base-100 p-4";

function AlertKind({ icon, label, aside }: { icon: React.ReactNode; label: string; aside?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-[13px] font-semibold text-secondary">
        <span className="flex size-7 items-center justify-center rounded-full bg-accent text-primary">{icon}</span>
        {label}
      </span>
      {aside}
    </div>
  );
}

function ImminentAlert({ row, inMin, onOpen }: { row: ReservationDayRow; inMin: number; onOpen: () => void }) {
  const { clients, praticiennes } = useAppData();
  const payer = clients.find((c) => c.id === row.reservation.payerClientId);
  const services = row.rendezVous.map((rv) => serviceById(rv.serviceId)?.name ?? "Prestation");
  const staff = row.staffIds.map((id) => praticiennes.find((p) => p.id === id)).filter((p) => p !== undefined);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={cn(
        CARD,
        "text-left transition hover:border-primary active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
      )}
    >
      <AlertKind
        icon={<CalendarClock aria-hidden className="size-4" />}
        label="Rendez-vous imminent"
        aside={<ChevronRight aria-hidden className="size-4 text-base-content/35" />}
      />
      <span className="mt-3 flex items-baseline gap-2">
        <span className="font-[family-name:var(--font-heading)] text-xl leading-none font-semibold text-primary tabular-nums">
          {inMin === 0 ? "Maintenant" : `Dans ${inMin} min`}
        </span>
        <span className="text-sm text-base-content/55 tabular-nums">à {row.start}</span>
      </span>
      <span className="mt-3 flex items-end justify-between gap-3">
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-base font-semibold text-base-content">
            {payer ? clientFullName(payer) : "Cliente"}
          </span>
          <span className="truncate text-[13px] text-base-content/60">
            {services[0]}
            {services.length > 1 && ` + ${services.length - 1}`}
          </span>
        </span>
        <span className="flex shrink-0 -space-x-2">
          {staff.slice(0, 3).map((p) => (
            <Avatar
              key={p.id}
              photoUrl={p.photoUrl}
              initial={p.initial}
              size={34}
              className="bg-accent text-xs font-semibold text-secondary ring-2 ring-base-100"
            />
          ))}
        </span>
      </span>
    </button>
  );
}

function GiftCardAlert({ order, others, onPrinted }: { order: GiftCardOrder; others: number; onPrinted: () => void }) {
  const { clients, printGiftCardOrder } = useAppData();
  const { print, printTarget } = useGiftCardPrint(order);
  const buyer = clients.find((c) => c.id === order.buyerClientId);
  const recipient = giftCardRecipient(order, buyer, buyer ? clientFullName(buyer) : "Cliente inconnue");
  const content = giftCardContent(order);

  return (
    <article className={CARD}>
      {printTarget}
      <AlertKind icon={<Gift aria-hidden className="size-4" />} label="Carte cadeau à imprimer" />
      <span className="mt-3 flex min-w-0 flex-col">
        <span className="truncate font-[family-name:var(--font-heading)] text-lg leading-tight font-bold text-base-content">
          {recipient.name}
        </span>
        <span className="truncate text-[15px] font-semibold text-primary tabular-nums">
          {content.kind === "montant" ? formatFcfa(content.amount) : content.services.join(" · ")}
        </span>
        <span className="truncate text-[13px] text-base-content/55">
          {order.fulfillment === "livraison" ? "À livrer" : "Retrait au comptoir"} ·{" "}
          <span className="font-mono tracking-wide">{order.code}</span>
        </span>
      </span>
      <div className="mt-auto flex items-center gap-2">
        <Button
          size="sm"
          className="flex-1"
          icon={<Printer aria-hidden className="size-4" />}
          onClick={() => {
            print();
            printGiftCardOrder(order.id);
            onPrinted();
          }}
        >
          Imprimer
        </Button>
        {others > 0 && (
          <Link
            href="/cartes-cadeaux"
            className="inline-flex min-h-12 shrink-0 items-center gap-0.5 rounded-field px-2 text-sm font-semibold text-primary transition hover:bg-base-200"
          >
            + {others} autre{others > 1 ? "s" : ""}
            <ChevronRight aria-hidden className="size-4" />
          </Link>
        )}
      </div>
    </article>
  );
}
