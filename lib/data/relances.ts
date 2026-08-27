import type { Relance } from "@/lib/data/types";

export const RELANCES: Relance[] = [
  {
    id: "rel-1",
    clientId: "cl-9",
    type: "anniversaire",
    status: "en_attente",
    message: "Joyeux anniversaire Yacine 🎂 Toute l'équipe Beauty and Co vous souhaite une journée aussi rayonnante que vous.",
    lateDays: 48,
  },
  {
    id: "rel-2",
    clientId: "cl-6",
    type: "fidelite",
    status: "en_attente",
    message: "Awa, vous êtes à 80 points du prochain palier ✨ Une prestation vous attend pour en profiter.",
  },
  {
    id: "rel-3",
    clientId: "cl-3",
    type: "soins",
    status: "en_attente",
    message: "Coumba, cela fait 4 semaines depuis votre dernier soin — le moment idéal pour reprendre rendez-vous.",
  },
  {
    id: "rel-4",
    clientId: "cl-8",
    type: "reconquete",
    status: "en_attente_autorisation",
    message: "Ndèye, on ne vous a pas vue depuis 5 mois — une remise de bienvenue vous attend pour votre retour.",
    discountLabel: "-15% prochaine visite",
  },
  {
    id: "rel-5",
    clientId: "cl-1",
    type: "recommandation",
    status: "en_attente",
    message: "Awa, ce style pourrait vous plaire pour votre prochain rendez-vous.",
    styleId: "sty-2",
  },
];
