import type { RendezVous, Reservation } from "@/lib/data/types";

/**
 * La prise de rendez-vous ne vit pas dans cette app (ADR 0006) : « Créer un rendez-vous » ouvre
 * la plateforme de réservation externe. Point d'entrée depuis le Planning (fiche réservation) et
 * l'Accueil (en-tête).
 */
export const BOOKING_URL = "https://booking.beautyandco.example";

/** A calendar day as "YYYY-MM-DD" (local). */
export function dateISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Today as "YYYY-MM-DD". */
export function todayISO(): string {
  return dateISO(new Date());
}

/** "YYYY-MM-DD" for a day `offset` days from now — used to keep the demo seed clustered around
 *  "today" whatever the real date is. */
function seedDay(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return dateISO(d);
}

/** A réservation's calendar day. Absent `date` ⇒ today (walk-ins, legacy). Always read it here. */
export function reservationDate(r: Reservation): string {
  return r.date ?? todayISO();
}

/**
 * Seed réservations, clustered around "today" (a few days back, a full week ahead) so the Semaine
 * views of the Planning have something to show. The booking journey lives on the external platform
 * — here they arrive already made. Each Réservation has one payeur (`payerClientId`) and 1..N
 * atomic Rendez-vous, possibly in parallel (same start, different praticiennes), possibly for a
 * friend or a child (`beneficiaryName`), possibly worked by two praticiennes at once
 * (`secondStaffId`, with `durationMin` already halved). `date` absent ⇒ today.
 */
export const RESERVATIONS: Reservation[] = [
  {
    id: "res-1",
    payerClientId: "cl-7",
    date: seedDay(0),
    source: "en_ligne",
    depositPaid: 5000,
    rendezVous: [
      // Tissage éligible « à 2 » : deux coiffeuses, temps de chaise divisé (120 → 60).
      {
        id: "rdv-1a",
        reservationId: "res-1",
        serviceId: "coiffure-tissage-versatile",
        staffId: "bineta",
        secondStaffId: "fatou",
        start: "10:00",
        durationMin: 60,
        status: "actif",
      },
      // …pendant qu'une amie (sans fiche) est en manucure à la même heure.
      {
        id: "rdv-1b",
        reservationId: "res-1",
        serviceId: "manucure-pedicure-manucure-spa-express",
        staffId: "gnagna",
        beneficiaryName: "Awa (amie)",
        start: "10:00",
        durationMin: 45,
        status: "actif",
      },
    ],
  },
  {
    id: "res-2",
    payerClientId: "cl-6",
    date: seedDay(0),
    source: "en_ligne",
    rendezVous: [
      {
        id: "rdv-2a",
        reservationId: "res-2",
        serviceId: "soin-du-visage-glow-me-facial",
        staffId: "marie-dominique",
        start: "11:30",
        durationMin: 60,
        status: "actif",
      },
      {
        id: "rdv-2b",
        reservationId: "res-2",
        serviceId: "epilation-epilation-sourcils",
        staffId: "marie-dominique",
        start: "12:30",
        durationMin: 15,
        status: "annule",
      },
    ],
  },
  {
    id: "res-3",
    payerClientId: "cl-8",
    date: seedDay(0),
    source: "en_ligne",
    depositPaid: 8000,
    rendezVous: [
      {
        id: "rdv-3a",
        reservationId: "res-3",
        serviceId: "spa-relax-me-time",
        staffId: "gnagna",
        start: "14:00",
        durationMin: 80,
        status: "actif",
      },
    ],
  },
  {
    id: "res-4",
    payerClientId: "cl-2",
    date: seedDay(0),
    source: "en_ligne",
    rendezVous: [
      {
        id: "rdv-4a",
        reservationId: "res-4",
        serviceId: "coiffure-shampoing-brushing-shampoing-inclus-et-obligatoire",
        staffId: "michelle",
        start: "09:30",
        durationMin: 60,
        status: "actif",
      },
    ],
  },
  {
    id: "res-5",
    payerClientId: "cl-1",
    date: seedDay(0),
    source: "en_ligne",
    rendezVous: [
      {
        id: "rdv-5a",
        reservationId: "res-5",
        serviceId: "spa-soin-du-dos",
        staffId: "adja",
        start: "16:00",
        durationMin: 90,
        status: "actif",
      },
    ],
  },
  {
    id: "res-6",
    payerClientId: "cl-3",
    date: seedDay(0),
    source: "en_ligne",
    rendezVous: [
      {
        id: "rdv-6a",
        reservationId: "res-6",
        serviceId: "coiffure-silk-press",
        staffId: "fatou",
        start: "13:00",
        durationMin: 180,
        status: "actif",
      },
      // Une prestation Mini&Co pour sa fille, réglée sur la même note.
      {
        id: "rdv-6b",
        reservationId: "res-6",
        serviceId: "mini-co-mini-jely-manucure",
        staffId: "adja",
        beneficiaryName: "Salématou (7 ans)",
        start: "13:00",
        durationMin: 30,
        status: "actif",
      },
    ],
  },

  /* ── Avant-hier ─────────────────────────────────────────────── */
  {
    id: "res-7",
    payerClientId: "cl-4",
    date: seedDay(-2),
    source: "en_ligne",
    rendezVous: [
      { id: "rdv-7a", reservationId: "res-7", serviceId: "manucure-pedicure-jelly-pedicure", staffId: "gnagna", start: "10:00", durationMin: 65, status: "actif" },
    ],
  },
  {
    id: "res-8",
    payerClientId: "cl-5",
    date: seedDay(-2),
    source: "en_ligne",
    rendezVous: [
      { id: "rdv-8a", reservationId: "res-8", serviceId: "coiffure-silk-press", staffId: "bineta", start: "14:00", durationMin: 180, status: "actif" },
    ],
  },
  {
    id: "res-9",
    payerClientId: "cl-9",
    date: seedDay(-2),
    source: "en_ligne",
    rendezVous: [
      { id: "rdv-9a", reservationId: "res-9", serviceId: "soin-du-visage-hydrafacial-deep-clean", staffId: "marie-dominique", start: "11:00", durationMin: 75, status: "actif" },
    ],
  },

  /* ── Hier ───────────────────────────────────────────────────── */
  {
    id: "res-10",
    payerClientId: "cl-2",
    date: seedDay(-1),
    source: "en_ligne",
    rendezVous: [
      { id: "rdv-10a", reservationId: "res-10", serviceId: "coiffure-soin-complet", staffId: "fatou", start: "10:00", durationMin: 130, status: "actif" },
    ],
  },
  {
    id: "res-11",
    payerClientId: "cl-6",
    date: seedDay(-1),
    source: "en_ligne",
    rendezVous: [
      { id: "rdv-11a", reservationId: "res-11", serviceId: "spa-relax-me-time", staffId: "adja", start: "15:00", durationMin: 80, status: "actif" },
    ],
  },
  {
    id: "res-12",
    payerClientId: "cl-1",
    date: seedDay(-1),
    source: "en_ligne",
    rendezVous: [
      { id: "rdv-12a", reservationId: "res-12", serviceId: "manucure-pedicure-perfect-manucure-russe-gel-sur-ongles-naturels-gainage", staffId: "gnagna", start: "09:00", durationMin: 90, status: "actif" },
    ],
  },

  /* ── Demain ─────────────────────────────────────────────────── */
  {
    id: "res-13",
    payerClientId: "cl-3",
    date: seedDay(1),
    source: "en_ligne",
    rendezVous: [
      { id: "rdv-13a", reservationId: "res-13", serviceId: "coiffure-tissage-versatile", staffId: "bineta", secondStaffId: "fatou", start: "09:00", durationMin: 60, status: "actif" },
      { id: "rdv-13b", reservationId: "res-13", serviceId: "manucure-pedicure-manucure-spa-express", staffId: "gnagna", start: "10:30", durationMin: 45, status: "actif" },
    ],
  },
  {
    id: "res-14",
    payerClientId: "cl-7",
    date: seedDay(1),
    source: "en_ligne",
    rendezVous: [
      { id: "rdv-14a", reservationId: "res-14", serviceId: "soin-du-visage-golden-vip-facial", staffId: "marie-dominique", start: "14:00", durationMin: 90, status: "actif" },
    ],
  },
  {
    id: "res-15",
    payerClientId: "cl-8",
    date: seedDay(1),
    source: "en_ligne",
    rendezVous: [
      { id: "rdv-15a", reservationId: "res-15", serviceId: "spa-soin-du-dos", staffId: "adja", start: "16:00", durationMin: 90, status: "actif" },
    ],
  },

  /* ── Après-demain ───────────────────────────────────────────── */
  {
    id: "res-16",
    payerClientId: "cl-5",
    date: seedDay(2),
    source: "en_ligne",
    rendezVous: [
      { id: "rdv-16a", reservationId: "res-16", serviceId: "coiffure-coupe-transformation", staffId: "michelle", start: "10:00", durationMin: 40, status: "actif" },
      { id: "rdv-16b", reservationId: "res-16", serviceId: "coiffure-silk-press", staffId: "fatou", start: "11:00", durationMin: 180, status: "actif" },
    ],
  },
  {
    id: "res-17",
    payerClientId: "cl-9",
    date: seedDay(2),
    source: "en_ligne",
    rendezVous: [
      { id: "rdv-17a", reservationId: "res-17", serviceId: "manucure-pedicure-smooth-pedicure", staffId: "gnagna", start: "13:00", durationMin: 80, status: "actif" },
    ],
  },

  /* ── Dans trois jours ───────────────────────────────────────── */
  {
    id: "res-18",
    payerClientId: "cl-4",
    date: seedDay(3),
    source: "en_ligne",
    rendezVous: [
      { id: "rdv-18a", reservationId: "res-18", serviceId: "coiffure-tresses-cheveux", staffId: "bineta", start: "09:30", durationMin: 60, status: "actif" },
    ],
  },
  {
    id: "res-19",
    payerClientId: "cl-1",
    date: seedDay(3),
    source: "en_ligne",
    rendezVous: [
      { id: "rdv-19a", reservationId: "res-19", serviceId: "soin-du-visage-face-lift-and-glow-raffermissant-lift-et-glow", staffId: "marie-dominique", start: "11:00", durationMin: 70, status: "actif" },
      { id: "rdv-19b", reservationId: "res-19", serviceId: "epilation-epilation-sourcils", staffId: "marie-dominique", start: "12:30", durationMin: 15, status: "actif" },
    ],
  },

  /* ── Dans quatre / six jours ────────────────────────────────── */
  {
    id: "res-20",
    payerClientId: "cl-6",
    date: seedDay(4),
    source: "en_ligne",
    rendezVous: [
      { id: "rdv-20a", reservationId: "res-20", serviceId: "spa-hot-stone-pierres-chaudes", staffId: "adja", start: "10:00", durationMin: 60, status: "actif" },
    ],
  },
  {
    id: "res-21",
    payerClientId: "cl-2",
    date: seedDay(6),
    source: "en_ligne",
    rendezVous: [
      { id: "rdv-21a", reservationId: "res-21", serviceId: "coiffure-ponytail", staffId: "fatou", start: "14:00", durationMin: 90, status: "actif" },
    ],
  },
];

/** One rendez-vous with a back-reference to its parent réservation — the rendez-vous-grained row. */
export type RendezVousRow = { rv: RendezVous; reservation: Reservation };

/** Flatten every rendez-vous of every réservation, keeping a back-reference to its parent. */
export function flattenRendezVous(reservations: Reservation[]): RendezVousRow[] {
  return reservations.flatMap((reservation) =>
    reservation.rendezVous.map((rv) => ({ rv, reservation })),
  );
}

/**
 * The réservation-grained row for the day view (ADR 0014). One line = one payeuse = one note :
 * la réceptionniste retrouve la cliente qui se présente au comptoir sans qu'elle soit éparpillée
 * sur plusieurs praticiennes. `rendezVous` est trié par heure ; les annulés ne sont inclus que sur
 * demande. `start` / `end` couvrent tout le passage de la cliente.
 */
export type ReservationDayRow = {
  reservation: Reservation;
  rendezVous: RendezVous[];
  /** Earliest start among shown rendez-vous, "HH:mm" — the sort key. */
  start: string;
  /** Latest end among shown rendez-vous, "HH:mm". */
  end: string;
  /** Distinct praticiennes across active rendez-vous (primary + second). */
  staffIds: string[];
  /** True when every rendez-vous of the réservation is cancelled. */
  allCancelled: boolean;
};

/**
 * Group a day's réservations into sorted day rows. Default sort: start ascending, then payeuse id
 * for a stable order at equal start (the caller re-sorts by name when it has the client list).
 */
export function groupDayByReservation(
  reservations: Reservation[],
  options: { includeCancelled?: boolean } = {},
): ReservationDayRow[] {
  const { includeCancelled = false } = options;
  return reservations
    .map((reservation) => {
      const sorted = [...reservation.rendezVous].sort((a, b) => a.start.localeCompare(b.start));
      const active = sorted.filter((rv) => rv.status !== "annule");
      const shown = includeCancelled ? sorted : active;
      const timing = active.length > 0 ? active : sorted;
      const start = timing.reduce((min, rv) => (rv.start < min ? rv.start : min), timing[0]?.start ?? "00:00");
      const end = timing.reduce((max, rv) => {
        const e = appointmentEndTime(rv);
        return e > max ? e : max;
      }, "00:00");
      const staffIds = [
        ...new Set(active.flatMap((rv) => [rv.staffId, rv.secondStaffId].filter(Boolean) as string[])),
      ];
      return { reservation, rendezVous: shown, start, end, staffIds, allCancelled: active.length === 0 };
    })
    .filter((row) => row.rendezVous.length > 0 && (includeCancelled || !row.allCancelled))
    .sort((a, b) => a.start.localeCompare(b.start) || a.reservation.payerClientId.localeCompare(b.reservation.payerClientId));
}

export function reservationById(reservations: Reservation[], id: string) {
  return reservations.find((r) => r.id === id);
}

export function reservationForRendezVous(reservations: Reservation[], rvId: string) {
  return reservations.find((r) => r.rendezVous.some((rv) => rv.id === rvId));
}

/** "HH:mm" -> minutes since midnight. */
export function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** minutes since midnight -> "HH:mm". */
export function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** A rendez-vous's end time, "HH:mm" — start + durationMin. */
export function appointmentEndTime(appointment: Pick<RendezVous, "start" | "durationMin">) {
  return minutesToTime(timeToMinutes(appointment.start) + appointment.durationMin);
}
