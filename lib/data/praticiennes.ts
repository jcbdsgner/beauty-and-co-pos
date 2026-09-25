import { salonById } from "@/lib/data/entreprises";
import type { DayHours, DayOfWeek, Praticienne } from "@/lib/data/types";

/** `Date.getDay()` (0 = dimanche) -> jour du glossaire, dans cet ordre. */
const DAY_KEYS: DayOfWeek[] = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];

export function dayOfWeek(d: Date): DayOfWeek {
  return DAY_KEYS[d.getDay()];
}

/** L'horaire de présence d'une praticienne pour cette date — absent ⇒ jour de repos ce jour-là
 *  (le sien, ou la fermeture hebdomadaire de son salon). */
export function scheduleFor(p: Praticienne, d: Date): DayHours | undefined {
  const day = dayOfWeek(d);
  if (salonById(p.salonId)?.closedDays?.includes(day)) return undefined;
  return p.weeklySchedule[day];
}

/** Vrai si la praticienne est censée être au salon ce jour-là (horaire hebdomadaire seul — ne
 *  tient pas compte d'une absence ponctuelle, voir `Praticienne.unavailableToday`). */
export function isWorkingOn(p: Praticienne, d: Date): boolean {
  return scheduleFor(p, d) !== undefined;
}

/** Sea Plaza ouvre 7j/7, Almadies du mardi au dimanche (fermé le lundi, cf. `Salon.closedDays`),
 *  de 10h à 20h ; le dimanche est le jour le plus chargé — toute l'équipe y travaille. */
export const PRATICIENNES: Praticienne[] = [
  {
    id: "bineta",
    name: "Bineta",
    role: "coiffeuse",
    initial: "B",
    salonId: "sea-plaza-bco",
    weeklySchedule: {
      mar: { start: "10:00", end: "18:00" },
      mer: { start: "10:00", end: "18:00" },
      jeu: { start: "10:00", end: "18:00" },
      ven: { start: "10:00", end: "18:00" },
      sam: { start: "10:00", end: "18:00" },
      dim: { start: "10:00", end: "18:00" },
    },
  },
  {
    id: "fatou",
    name: "Fatou",
    role: "coiffeuse",
    initial: "F",
    salonId: "sea-plaza-bco",
    weeklySchedule: {
      lun: { start: "10:00", end: "19:00" },
      mar: { start: "10:00", end: "19:00" },
      jeu: { start: "10:00", end: "19:00" },
      ven: { start: "10:00", end: "19:00" },
      sam: { start: "10:00", end: "19:00" },
      dim: { start: "10:00", end: "19:00" },
    },
  },
  {
    id: "gnagna",
    name: "Gnagna",
    role: "estheticienne",
    initial: "G",
    salonId: "almadies",
    weeklySchedule: {
      mar: { start: "10:00", end: "17:00" },
      jeu: { start: "10:00", end: "17:00" },
      ven: { start: "10:00", end: "17:00" },
      sam: { start: "10:00", end: "17:00" },
      dim: { start: "10:00", end: "17:00" },
    },
  },
  {
    id: "henry",
    name: "Henry",
    role: "coiffeuse",
    initial: "H",
    salonId: "almadies",
    weeklySchedule: {
      mer: { start: "10:00", end: "17:00" },
      jeu: { start: "10:00", end: "17:00" },
      ven: { start: "10:00", end: "17:00" },
      sam: { start: "10:00", end: "17:00" },
      dim: { start: "10:00", end: "17:00" },
    },
  },
  {
    id: "marie-dominique",
    name: "Marie Dominique",
    role: "estheticienne",
    initial: "MD",
    salonId: "sea-plaza-bco",
    weeklySchedule: {
      lun: { start: "11:00", end: "19:00" },
      mar: { start: "11:00", end: "19:00" },
      mer: { start: "11:00", end: "19:00" },
      jeu: { start: "11:00", end: "19:00" },
      ven: { start: "11:00", end: "19:00" },
      dim: { start: "11:00", end: "19:00" },
    },
  },
  {
    id: "adja",
    name: "Adja",
    role: "estheticienne",
    initial: "A",
    salonId: "almadies",
    weeklySchedule: {
      mar: { start: "10:00", end: "18:30" },
      mer: { start: "10:00", end: "18:30" },
      jeu: { start: "10:00", end: "18:30" },
      ven: { start: "10:00", end: "18:30" },
      sam: { start: "10:00", end: "18:30" },
      dim: { start: "10:00", end: "18:30" },
    },
  },
  {
    id: "michelle",
    name: "Michelle",
    role: "coiffeuse",
    initial: "M",
    salonId: "almadies",
    weeklySchedule: {
      mar: { start: "10:00", end: "16:30" },
      mer: { start: "10:00", end: "16:30" },
      jeu: { start: "10:00", end: "16:30" },
      ven: { start: "10:00", end: "16:30" },
      dim: { start: "10:00", end: "16:30" },
    },
  },
  {
    id: "aissatou",
    name: "Aïssatou",
    role: "menage",
    initial: "AÏ",
    salonId: "almadies",
    weeklySchedule: {
      mar: { start: "08:00", end: "13:00" },
      mer: { start: "08:00", end: "13:00" },
      jeu: { start: "08:00", end: "13:00" },
      ven: { start: "08:00", end: "13:00" },
      sam: { start: "08:00", end: "13:00" },
      dim: { start: "08:00", end: "13:00" },
    },
  },
  {
    id: "ndiole",
    name: "Ndiole",
    role: "accueil",
    initial: "N",
    salonId: "sea-plaza-bco",
    weeklySchedule: {
      lun: { start: "08:30", end: "17:30" },
      mar: { start: "08:30", end: "17:30" },
      jeu: { start: "08:30", end: "17:30" },
      ven: { start: "08:30", end: "17:30" },
      sam: { start: "08:30", end: "17:30" },
      dim: { start: "08:30", end: "17:30" },
    },
  },
];

export function praticienneById(id: string) {
  return PRATICIENNES.find((p) => p.id === id);
}
