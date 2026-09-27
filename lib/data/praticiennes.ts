import { salonById } from "@/lib/data/entreprises";
import { SALON_CLOSING, SALON_OPENING, timeToMinutes } from "@/lib/data/time";
import type { DayOfWeek, Praticienne, Shift } from "@/lib/data/types";

/** `Date.getDay()` (0 = dimanche) -> jour du glossaire, dans cet ordre. */
const DAY_KEYS: DayOfWeek[] = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];

const SEA_PLAZA = "sea-plaza-bco";
const ALMADIES = "almadies";

export function dayOfWeek(d: Date): DayOfWeek {
  return DAY_KEYS[d.getDay()];
}

/** Le salon ferme-t-il ce jour-là (Almadies le lundi, cf. `Salon.closedDays`) ? */
export function isSalonClosed(salonId: string, d: Date): boolean {
  return Boolean(salonById(salonId)?.closedDays?.includes(dayOfWeek(d)));
}

/** Les plages de présence d'une praticienne ce jour-là, dans l'ordre — vide ⇒ repos. Une plage
 *  dans un salon fermé ce jour-là ne compte pas (ADR 0036). */
export function shiftsFor(p: Praticienne, d: Date): Shift[] {
  return (p.weeklySchedule[dayOfWeek(d)] ?? []).filter((s) => !isSalonClosed(s.salonId, d));
}

/** Ses plages ce jour-là dans un salon précis. */
export function shiftsAt(p: Praticienne, d: Date, salonId: string): Shift[] {
  return shiftsFor(p, d).filter((s) => s.salonId === salonId);
}

/** Vrai si la praticienne est censée travailler ce jour-là (dans ce salon, s'il est donné) —
 *  horaire hebdomadaire seul, sans l'absence ponctuelle (`Praticienne.unavailableToday`). */
export function isWorkingOn(p: Praticienne, d: Date, salonId?: string): boolean {
  return (salonId ? shiftsAt(p, d, salonId) : shiftsFor(p, d)).length > 0;
}

/** Vrai si l'intervalle [start, end[ (minutes) tient entier dans une de ses plages dans ce salon —
 *  un rendez-vous ne déborde jamais sur son trajet ni sur l'autre salon. */
export function coversInterval(p: Praticienne, d: Date, salonId: string, start: number, end: number): boolean {
  return shiftsAt(p, d, salonId).some((s) => start >= timeToMinutes(s.start) && end <= timeToMinutes(s.end));
}

/** Les salons où elle travaille au fil de la semaine — son ou ses salons de rattachement. */
export function salonsOf(p: Praticienne): string[] {
  const ids = new Set<string>();
  for (const shifts of Object.values(p.weeklySchedule)) for (const s of shifts ?? []) ids.add(s.salonId);
  return [...ids];
}

/** « Aux Almadies » / « À Sea Plaza » — où elle se trouve, pour les zones grisées du Planning. */
export function atSalonLabel(salonId: string): string {
  const name = salonById(salonId)?.name ?? "l'autre salon";
  return name === "Almadies" ? "Aux Almadies" : `À ${name}`;
}

/** Sea Plaza ouvre 7j/7, Almadies du mardi au dimanche (fermé le lundi, cf. `Salon.closedDays`),
 *  de 10h à 20h ; le dimanche est le jour le plus chargé — toute l'équipe y travaille. Une praticienne
 *  n'a pas de salon fixe (ADR 0036) : Adja renforce Sea Plaza le lundi, jour de fermeture
 *  d'Almadies ; Henry commence le mardi à Sea Plaza et finit la journée à Almadies. */
export const PRATICIENNES: Praticienne[] = [
  {
    id: "bineta",
    name: "Bineta",
    role: "coiffeuse",
    initial: "B",
    photoUrl: "/images/equipe/bineta.jpg",
    weeklySchedule: {
      mar: [{ start: "10:00", end: "18:00", salonId: SEA_PLAZA }],
      mer: [{ start: "10:00", end: "18:00", salonId: SEA_PLAZA }],
      jeu: [{ start: "10:00", end: "18:00", salonId: SEA_PLAZA }],
      ven: [{ start: "10:00", end: "18:00", salonId: SEA_PLAZA }],
      sam: [{ start: "10:00", end: "18:00", salonId: SEA_PLAZA }],
      dim: [{ start: "10:00", end: "18:00", salonId: SEA_PLAZA }],
    },
  },
  {
    id: "fatou",
    name: "Fatou",
    role: "coiffeuse",
    initial: "F",
    photoUrl: "/images/equipe/fatou.jpg",
    weeklySchedule: {
      lun: [{ start: "10:00", end: "19:00", salonId: SEA_PLAZA }],
      mar: [{ start: "10:00", end: "19:00", salonId: SEA_PLAZA }],
      jeu: [{ start: "10:00", end: "19:00", salonId: SEA_PLAZA }],
      ven: [{ start: "10:00", end: "19:00", salonId: SEA_PLAZA }],
      sam: [{ start: "10:00", end: "19:00", salonId: SEA_PLAZA }],
      dim: [{ start: "10:00", end: "19:00", salonId: SEA_PLAZA }],
    },
  },
  {
    id: "gnagna",
    name: "Gnagna",
    role: "estheticienne",
    initial: "G",
    photoUrl: "/images/equipe/gnagna.jpg",
    weeklySchedule: {
      mar: [{ start: "10:00", end: "17:00", salonId: ALMADIES }],
      jeu: [{ start: "10:00", end: "17:00", salonId: ALMADIES }],
      ven: [{ start: "10:00", end: "17:00", salonId: ALMADIES }],
      sam: [{ start: "10:00", end: "17:00", salonId: ALMADIES }],
      dim: [{ start: "10:00", end: "17:00", salonId: ALMADIES }],
    },
  },
  {
    id: "henry",
    name: "Henry",
    role: "coiffeuse",
    initial: "H",
    photoUrl: "/images/equipe/henry.jpg",
    weeklySchedule: {
      mar: [
        { start: "10:00", end: "14:00", salonId: SEA_PLAZA },
        { start: "15:00", end: "19:00", salonId: ALMADIES },
      ],
      mer: [{ start: "10:00", end: "17:00", salonId: ALMADIES }],
      jeu: [{ start: "10:00", end: "17:00", salonId: ALMADIES }],
      ven: [{ start: "10:00", end: "17:00", salonId: ALMADIES }],
      sam: [{ start: "10:00", end: "17:00", salonId: ALMADIES }],
      dim: [{ start: "10:00", end: "17:00", salonId: ALMADIES }],
    },
  },
  {
    id: "marie-dominique",
    name: "Marie Dominique",
    role: "estheticienne",
    initial: "MD",
    photoUrl: "/images/equipe/marie-dominique.jpg",
    weeklySchedule: {
      lun: [{ start: "11:00", end: "19:00", salonId: SEA_PLAZA }],
      mar: [{ start: "11:00", end: "19:00", salonId: SEA_PLAZA }],
      mer: [{ start: "11:00", end: "19:00", salonId: SEA_PLAZA }],
      jeu: [{ start: "11:00", end: "19:00", salonId: SEA_PLAZA }],
      ven: [{ start: "11:00", end: "19:00", salonId: SEA_PLAZA }],
      dim: [{ start: "11:00", end: "19:00", salonId: SEA_PLAZA }],
    },
  },
  {
    id: "adja",
    name: "Adja",
    role: "estheticienne",
    initial: "A",
    photoUrl: "/images/equipe/adja.jpg",
    weeklySchedule: {
      lun: [{ start: "10:00", end: "18:30", salonId: SEA_PLAZA }],
      mar: [{ start: "10:00", end: "18:30", salonId: ALMADIES }],
      mer: [{ start: "10:00", end: "18:30", salonId: ALMADIES }],
      jeu: [{ start: "10:00", end: "18:30", salonId: ALMADIES }],
      ven: [{ start: "10:00", end: "18:30", salonId: ALMADIES }],
      sam: [{ start: "10:00", end: "18:30", salonId: ALMADIES }],
      dim: [{ start: "10:00", end: "18:30", salonId: ALMADIES }],
    },
  },
  {
    id: "michelle",
    name: "Michelle",
    role: "coiffeuse",
    initial: "M",
    photoUrl: "/images/equipe/michelle.jpg",
    weeklySchedule: {
      mar: [{ start: "10:00", end: "16:30", salonId: ALMADIES }],
      mer: [{ start: "10:00", end: "16:30", salonId: ALMADIES }],
      jeu: [{ start: "10:00", end: "16:30", salonId: ALMADIES }],
      ven: [{ start: "10:00", end: "16:30", salonId: ALMADIES }],
      dim: [{ start: "10:00", end: "16:30", salonId: ALMADIES }],
    },
  },
  {
    id: "aissatou",
    name: "Aïssatou",
    role: "menage",
    initial: "AÏ",
    photoUrl: "/images/equipe/aissatou.jpg",
    weeklySchedule: {
      mar: [{ start: "10:00", end: "15:00", salonId: ALMADIES }],
      mer: [{ start: "10:00", end: "15:00", salonId: ALMADIES }],
      jeu: [{ start: "10:00", end: "15:00", salonId: ALMADIES }],
      ven: [{ start: "10:00", end: "15:00", salonId: ALMADIES }],
      sam: [{ start: "10:00", end: "15:00", salonId: ALMADIES }],
      dim: [{ start: "10:00", end: "15:00", salonId: ALMADIES }],
    },
  },
  {
    id: "ndiole",
    name: "Ndiole",
    role: "accueil",
    initial: "N",
    weeklySchedule: {
      lun: [{ start: "10:00", end: "19:00", salonId: SEA_PLAZA }],
      mar: [{ start: "10:00", end: "19:00", salonId: SEA_PLAZA }],
      jeu: [{ start: "10:00", end: "19:00", salonId: SEA_PLAZA }],
      ven: [{ start: "10:00", end: "19:00", salonId: SEA_PLAZA }],
      sam: [{ start: "10:00", end: "19:00", salonId: SEA_PLAZA }],
      dim: [{ start: "10:00", end: "19:00", salonId: SEA_PLAZA }],
    },
  },
];

/** Garde-fou de la donnée : toute plage tient dans les heures d'ouverture (10h–20h). */
for (const p of PRATICIENNES)
  for (const shifts of Object.values(p.weeklySchedule))
    for (const s of shifts ?? [])
      if (timeToMinutes(s.start) < timeToMinutes(SALON_OPENING) || timeToMinutes(s.end) > timeToMinutes(SALON_CLOSING))
        throw new Error(`Horaire hors ouverture : ${p.id} ${s.start}–${s.end}`);

export function praticienneById(id: string) {
  return PRATICIENNES.find((p) => p.id === id);
}
