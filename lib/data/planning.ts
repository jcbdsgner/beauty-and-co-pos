import type { RendezVous, Reservation } from "@/lib/data/types";

/**
 * La prise de rendez-vous ne vit pas dans cette app (ADR 0006) : « Créer un rendez-vous » ouvre
 * la plateforme de réservation externe. Point d'entrée depuis le Planning (fiche réservation) et
 * l'Accueil (en-tête).
 */
export const BOOKING_URL = "https://booking.beautyandco.example";

/**
 * Seed réservations for "today". The booking journey lives on the external platform — here they
 * arrive already made. Each Réservation has one payeur (`payerClientId`) and 1..N atomic
 * Rendez-vous, possibly in parallel (same start, different praticiennes), possibly for a friend
 * or a child (`beneficiaryName`), possibly worked by two praticiennes at once (`secondStaffId`,
 * with `durationMin` already halved).
 */
export const RESERVATIONS: Reservation[] = [
  {
    id: "res-1",
    payerClientId: "cl-7",
    source: "en_ligne",
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
    source: "en_ligne",
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
