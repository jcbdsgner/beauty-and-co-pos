import type { RendezVous } from "@/lib/data/types";

export const SLOT_START_TIMES = [
  "09:00", "09:15", "09:30", "09:45",
  "10:00", "10:15", "10:30", "10:45",
  "11:00", "11:15", "11:30", "11:45",
  "12:00", "12:15", "12:30", "12:45",
  "13:00", "13:15", "13:30", "13:45",
  "14:00", "14:15", "14:30", "14:45",
  "15:00", "15:15", "15:30", "15:45",
  "16:00", "16:15", "16:30", "16:45",
  "17:00", "17:15", "17:30", "17:45",
];

export const RENDEZ_VOUS: RendezVous[] = [
  { id: "rdv-1", clientId: "cl-7", staffId: "bineta", serviceId: "srv-2", start: "10:00", durationMin: 90, status: "confirme" },
  { id: "rdv-2", clientId: "cl-6", staffId: "fatou", serviceId: "srv-6", start: "11:30", durationMin: 60, status: "en_attente" },
  { id: "rdv-3", clientId: "cl-8", staffId: "gnagna", serviceId: "srv-11", start: "14:00", durationMin: 50, status: "confirme" },
  { id: "rdv-4", clientId: "cl-2", staffId: "michelle", serviceId: "srv-1", start: "09:30", durationMin: 45, status: "confirme" },
  { id: "rdv-5", clientId: "cl-1", staffId: "marie-dominique", serviceId: "srv-10", start: "16:00", durationMin: 60, status: "en_attente" },
];

export function appointmentsForDay() {
  return RENDEZ_VOUS;
}
