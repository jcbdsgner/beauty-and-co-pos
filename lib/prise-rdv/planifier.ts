import type { Praticienne, Reservation, Role } from "@/lib/data/types";
import { SALONS } from "@/lib/data/entreprises";
import { coversInterval, dayOfWeek } from "@/lib/data/praticiennes";
import { SALON_CLOSING, SALON_OPENING, minutesToTime, reservationDate, timeToMinutes, todayISO } from "@/lib/data/planning";

/**
 * Le pont entre la fenêtre de rendez-vous (`RdvDialog`, ADR 0041) et l'agenda réel de l'équipe : quels horaires
 * proposer, et quelle praticienne poser d'office sur chaque prestation — la moins chargée ce
 * jour-là parmi celles libres, modifiable ensuite parmi les seules libres.
 */

/** Heures d'ouverture des deux salons (CONTEXT.md, Praticienne) : tout se tient entre 10h et 20h. */
const OPENING = timeToMinutes(SALON_OPENING);
const CLOSING = timeToMinutes(SALON_CLOSING);
const SLOT_STEP = 30;

function roleFor(categoryId: string): Role {
  return categoryId === "coiffure" || categoryId === "mini-co-hair" ? "coiffeuse" : "estheticienne";
}

export type PlanItem = {
  /** La clé de la ligne. */
  key: string;
  personId: string;
  serviceId: string;
  categoryId: string;
  durationMinutes: number;
  twoPractitionersEligible: boolean;
};

export type PlanLine = {
  key: string;
  personId: string;
  serviceId: string;
  start: string;
  durationMin: number;
  staffIds: string[];
};

type Interval = { start: number; end: number };

export type PlanContext = {
  date: string;
  salonId: string;
  praticiennes: Praticienne[];
  reservations: Reservation[];
  /** Rendez-vous de la réservation en cours de modification — ignorés comme occupation. */
  excludeRvIds?: Set<string>;
};

function busyAndLoad(ctx: PlanContext) {
  const busy = new Map<string, Interval[]>();
  const load = new Map<string, number>();
  for (const r of ctx.reservations) {
    if (reservationDate(r) !== ctx.date) continue;
    for (const rv of r.rendezVous) {
      if (rv.status === "annule" || ctx.excludeRvIds?.has(rv.id)) continue;
      const start = timeToMinutes(rv.start);
      for (const id of [rv.staffId, rv.secondStaffId]) {
        if (!id) continue;
        busy.set(id, [...(busy.get(id) ?? []), { start, end: start + rv.durationMin }]);
        load.set(id, (load.get(id) ?? 0) + rv.durationMin);
      }
    }
  }
  return { busy, load };
}

function salonOpen(ctx: PlanContext) {
  const salon = SALONS.find((s) => s.id === ctx.salonId);
  const day = dayOfWeek(new Date(`${ctx.date}T00:00:00`));
  return Boolean(salon) && !salon?.closedDays?.includes(day);
}

/** Praticiennes du salon, du bon métier, présentes et libres sur tout l'intervalle. */
function freeStaff(ctx: PlanContext, busy: Map<string, Interval[]>, categoryId: string, iv: Interval): Praticienne[] {
  const role = roleFor(categoryId);
  const day = new Date(`${ctx.date}T00:00:00`);
  return ctx.praticiennes.filter((p) => {
    if (p.role !== role) return false;
    if (p.unavailableToday && ctx.date === todayISO()) return false;
    // Dans ce salon sur tout l'intervalle (ADR 0036) — une praticienne de passage compte ici le
    // temps de sa plage, jamais pendant son trajet ni sa plage dans l'autre salon. `busy` couvre
    // les deux salons : elle n'est jamais à deux endroits à la fois.
    if (!coversInterval(p, day, ctx.salonId, iv.start, iv.end)) return false;
    return !(busy.get(p.id) ?? []).some((b) => iv.start < b.end && b.start < iv.end);
  });
}

function lineDuration(item: PlanItem, twoPractitioners: boolean) {
  return twoPractitioners && item.twoPractitionersEligible ? Math.round(item.durationMinutes / 2) : item.durationMinutes;
}

/**
 * Pose toutes les prestations à partir de `start` : chaque personne enchaîne les siennes, les
 * personnes sont servies en parallèle (même lecture que le site). `overrides` garde le choix
 * manuel d'une ligne tant qu'il reste libre ; sinon `preferredStaffId` si libre, puis la moins chargée du jour. `null` ⇒ horaire
 * impossible (pas assez de praticiennes libres).
 */
export function planAt(
  ctx: PlanContext,
  items: PlanItem[],
  start: string,
  twoPractitioners: boolean,
  overrides: Record<string, string[]> = {},
  /** Praticienne à poser d'office quand elle est libre (créneau cliqué au Planning), avant la moins chargée. */
  preferredStaffId?: string,
): PlanLine[] | null {
  if (!salonOpen(ctx)) return null;
  const { busy, load } = busyAndLoad(ctx);
  const lines: PlanLine[] = [];
  const byPerson = new Map<string, PlanItem[]>();
  for (const item of items) byPerson.set(item.personId, [...(byPerson.get(item.personId) ?? []), item]);

  for (const personItems of byPerson.values()) {
    let cursor = timeToMinutes(start);
    for (const item of personItems) {
      const durationMin = lineDuration(item, twoPractitioners);
      const iv = { start: cursor, end: cursor + durationMin };
      if (iv.end > CLOSING) return null;
      const need = twoPractitioners && item.twoPractitionersEligible ? 2 : 1;
      const free = freeStaff(ctx, busy, item.categoryId, iv);
      const wanted = overrides[item.key];
      let chosen: string[];
      if (wanted && wanted.length === need && wanted.every((id) => free.some((p) => p.id === id))) {
        chosen = wanted;
      } else {
        if (free.length < need) return null;
        chosen = [...free]
          .sort(
            (a, b) =>
              Number(b.id === preferredStaffId) - Number(a.id === preferredStaffId) ||
              (load.get(a.id) ?? 0) - (load.get(b.id) ?? 0) ||
              a.name.localeCompare(b.name),
          )
          .slice(0, need)
          .map((p) => p.id);
      }
      for (const id of chosen) {
        busy.set(id, [...(busy.get(id) ?? []), iv]);
        load.set(id, (load.get(id) ?? 0) + durationMin);
      }
      lines.push({ key: item.key, personId: item.personId, serviceId: item.serviceId, start: minutesToTime(cursor), durationMin, staffIds: chosen });
      cursor = iv.end;
    }
  }
  return lines;
}

/** Les horaires proposables ce jour-là : toutes les demi-heures d'ouverture où tout le panier tient. */
export function availableTimes(ctx: PlanContext, items: PlanItem[], twoPractitioners: boolean): string[] {
  if (items.length === 0) return [];
  const now = new Date();
  const isToday = ctx.date === todayISO();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const times: string[] = [];
  for (let t = OPENING; t < CLOSING; t += SLOT_STEP) {
    if (isToday && t <= nowMin) continue;
    if (planAt(ctx, items, minutesToTime(t), twoPractitioners)) times.push(minutesToTime(t));
  }
  return times;
}

/** Pour le choix manuel d'une ligne : les praticiennes libres sur son intervalle, le reste du plan tenu. */
export function alternativesFor(ctx: PlanContext, plan: PlanLine[], line: PlanLine, categoryId: string): Praticienne[] {
  const { busy } = busyAndLoad(ctx);
  for (const other of plan) {
    if (other.key === line.key) continue;
    const s = timeToMinutes(other.start);
    for (const id of other.staffIds) busy.set(id, [...(busy.get(id) ?? []), { start: s, end: s + other.durationMin }]);
  }
  const s = timeToMinutes(line.start);
  return freeStaff(ctx, busy, categoryId, { start: s, end: s + line.durationMin });
}
