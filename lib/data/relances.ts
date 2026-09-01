import type { Relance } from "@/lib/data/types";

/**
 * Relances that the direction's back-office fires automatically. point-de-vente only reads this
 * list — see ADR 0010. `date` is when the message went out (`envoyee`) or is due to (`a_venir`).
 */
export const RELANCES: Relance[] = [
  // À venir — anniversaires en tête côté écran
  {
    id: "rel-1",
    clientId: "cl-9",
    type: "anniversaire",
    status: "a_venir",
    channel: "whatsapp",
    date: "2026-09-03T08:00:00",
    message: "Joyeux anniversaire Yacine 🎂 Toute l'équipe Beauty and Co vous souhaite une journée aussi rayonnante que vous.",
  },
  {
    id: "rel-2",
    clientId: "cl-6",
    type: "fidelite",
    status: "a_venir",
    channel: "whatsapp",
    date: "2026-09-01T09:30:00",
    message: "Awa, vous êtes à 80 points du prochain palier ✨ Une prestation vous attend pour en profiter.",
  },
  {
    id: "rel-3",
    clientId: "cl-3",
    type: "soins",
    status: "a_venir",
    channel: "sms",
    date: "2026-09-04T09:00:00",
    message: "Coumba, cela fait 4 semaines depuis votre dernier soin — le moment idéal pour reprendre rendez-vous.",
    lateDays: 28,
  },
  {
    id: "rel-4",
    clientId: "cl-8",
    type: "reconquete",
    status: "a_venir",
    channel: "email",
    date: "2026-09-05T10:00:00",
    message: "Ndèye, on ne vous a pas vue depuis 5 mois — une remise de bienvenue vous attend pour votre retour.",
    discountLabel: "-15% prochaine visite",
  },
  // Déjà envoyées
  {
    id: "rel-5",
    clientId: "cl-1",
    type: "recommandation",
    status: "envoyee",
    channel: "whatsapp",
    date: "2026-08-30T10:12:00",
    message: "Awa, ce style pourrait vous plaire pour votre prochain rendez-vous.",
    styleId: "sty-2",
  },
  {
    id: "rel-6",
    clientId: "cl-4",
    type: "soins",
    status: "envoyee",
    channel: "sms",
    date: "2026-08-28T08:30:00",
    message: "Bineta, votre soin visage remonte à un mois — on vous garde un créneau cette semaine ?",
    lateDays: 30,
  },
  {
    id: "rel-7",
    clientId: "cl-7",
    type: "fidelite",
    status: "envoyee",
    channel: "whatsapp",
    date: "2026-08-27T09:05:00",
    message: "Sokhna, 680 points à votre compte — de quoi vous offrir un moment rien qu'à vous.",
  },
  {
    id: "rel-8",
    clientId: "cl-5",
    type: "reconquete",
    status: "envoyee",
    channel: "email",
    date: "2026-08-25T11:40:00",
    message: "Mariam, cela fait deux mois — revenez quand vous voulez, votre place est prête.",
    discountLabel: "-10% prochaine visite",
  },
];
