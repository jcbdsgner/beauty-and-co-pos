import type { Conversation } from "@/lib/data/types";

/**
 * One thread per cliente (ADR 0011). A thread carries, on a single timeline: automatic relances
 * already sent, relances still `pending`, and the messages exchanged once someone replied. The
 * prototype never actually *fires* a relance — the schedule lives in the direction's back-office —
 * so `pending` messages are simply seeded here with their due date in `at`.
 *
 * point-de-vente reads and mutates this list only through the store (take-over, hand-back,
 * transfer, send). Client and conseillère replies are scripted, like the payment and scan flows.
 */
export const CONVERSATIONS: Conversation[] = [
  // ── Programmées, jamais touchées (auto) ──────────────────────────────────
  {
    id: "conv-1",
    clientId: "cl-9",
    channel: "whatsapp",
    state: "auto",
    unread: false,
    messages: [
      {
        id: "m-1-1",
        sender: "conseillere",
        channel: "whatsapp",
        at: "2026-09-03T08:00:00",
        relanceType: "anniversaire",
        pending: true,
        body: "Joyeux anniversaire Yacine 🎂 Toute l'équipe Beauty and Co vous souhaite une journée aussi rayonnante que vous.",
      },
    ],
  },
  {
    id: "conv-2",
    clientId: "cl-2",
    channel: "whatsapp",
    state: "auto",
    unread: false,
    messages: [
      {
        id: "m-2-1",
        sender: "conseillere",
        channel: "whatsapp",
        at: "2026-09-01T08:00:00",
        relanceType: "anniversaire",
        pending: true,
        body: "Joyeux anniversaire Fatou 🎂 On vous souhaite une très belle journée — et on serait ravies de vous chouchouter pour l'occasion.",
      },
    ],
  },
  {
    id: "conv-3",
    clientId: "cl-6",
    channel: "whatsapp",
    state: "auto",
    unread: false,
    messages: [
      {
        id: "m-3-1",
        sender: "conseillere",
        channel: "whatsapp",
        at: "2026-09-01T09:30:00",
        relanceType: "fidelite",
        pending: true,
        body: "Awa, vous êtes à 80 points du prochain palier ✨ Une prestation vous attend pour en profiter.",
      },
    ],
  },
  // ── Relance envoyée, jamais de réponse (auto) ────────────────────────────
  {
    id: "conv-4",
    clientId: "cl-4",
    channel: "sms",
    state: "auto",
    unread: false,
    messages: [
      {
        id: "m-4-1",
        sender: "conseillere",
        channel: "sms",
        at: "2026-08-28T08:30:00",
        relanceType: "soins",
        lateDays: 30,
        body: "Bineta, votre soin visage remonte à un mois — on vous garde un créneau cette semaine ?",
      },
    ],
  },
  // ── Réponse cliente, la Conseillère a répondu (lu) ───────────────────────
  {
    id: "conv-5",
    clientId: "cl-3",
    channel: "sms",
    state: "conseillere",
    unread: false,
    messages: [
      {
        id: "m-5-1",
        sender: "conseillere",
        channel: "sms",
        at: "2026-08-30T09:00:00",
        relanceType: "soins",
        lateDays: 28,
        body: "Coumba, cela fait 4 semaines depuis votre dernier soin — le moment idéal pour reprendre rendez-vous.",
      },
      {
        id: "m-5-2",
        sender: "cliente",
        channel: "sms",
        at: "2026-08-30T14:20:00",
        body: "D'accord, je passe cette semaine 🙏",
      },
      {
        id: "m-5-3",
        sender: "conseillere",
        channel: "sms",
        at: "2026-08-30T14:21:00",
        body: "Parfait Coumba, on vous garde un créneau. À très vite ✨",
      },
    ],
  },
  {
    id: "conv-6",
    clientId: "cl-5",
    channel: "email",
    state: "conseillere",
    unread: false,
    messages: [
      {
        id: "m-6-1",
        sender: "conseillere",
        channel: "email",
        at: "2026-08-25T11:40:00",
        relanceType: "reconquete",
        discountLabel: "-10% prochaine visite",
        body: "Mariam, cela fait deux mois — revenez quand vous voulez, votre place est prête.",
      },
      {
        id: "m-6-2",
        sender: "cliente",
        channel: "email",
        at: "2026-08-26T09:15:00",
        body: "Merci, c'est gentil 🙏",
      },
      {
        id: "m-6-3",
        sender: "conseillere",
        channel: "email",
        at: "2026-08-26T09:16:00",
        body: "Avec plaisir Mariam. Votre place est prête quand vous le souhaitez 🌸",
      },
    ],
  },
  // ── Réponse cliente pas encore vue (non lu, signal ambre) ────────────────
  {
    id: "conv-7",
    clientId: "cl-8",
    channel: "email",
    state: "conseillere",
    unread: true,
    messages: [
      {
        id: "m-7-1",
        sender: "conseillere",
        channel: "email",
        at: "2026-08-29T10:00:00",
        relanceType: "reconquete",
        discountLabel: "-15% prochaine visite",
        body: "Ndèye, on ne vous a pas vue depuis 5 mois — une remise de bienvenue vous attend pour votre retour.",
      },
      {
        id: "m-7-2",
        sender: "cliente",
        channel: "email",
        at: "2026-08-31T18:05:00",
        body: "Bonjour, la remise est valable jusqu'à quand ?",
      },
    ],
  },
  // ── Prise en main par la réceptionniste (relance pending → en pause) ─────
  {
    id: "conv-8",
    clientId: "cl-1",
    channel: "whatsapp",
    state: "receptionniste",
    unread: false,
    messages: [
      {
        id: "m-8-1",
        sender: "conseillere",
        channel: "whatsapp",
        at: "2026-08-30T10:12:00",
        relanceType: "recommandation",
        styleId: "sty-2",
        body: "Awa, ce style pourrait vous plaire pour votre prochain rendez-vous.",
      },
      {
        id: "m-8-2",
        sender: "cliente",
        channel: "whatsapp",
        at: "2026-08-30T11:00:00",
        body: "Ah oui j'aime beaucoup, c'est possible pour samedi ?",
      },
      {
        id: "m-8-3",
        sender: "receptionniste",
        channel: "whatsapp",
        at: "2026-08-30T11:15:00",
        body: "Bonjour Awa, samedi 14h avec Bineta, ça vous convient ?",
      },
      {
        id: "m-8-4",
        sender: "cliente",
        channel: "whatsapp",
        at: "2026-08-30T11:40:00",
        body: "Parfait, merci !",
      },
      {
        id: "m-8-5",
        sender: "conseillere",
        channel: "whatsapp",
        at: "2026-09-04T09:00:00",
        relanceType: "fidelite",
        pending: true,
        body: "Awa, 520 points à votre compte — de quoi vous offrir un moment rien qu'à vous.",
      },
    ],
  },
  // ── Transférée à la direction (terminal, lecture seule) ─────────────────
  {
    id: "conv-9",
    clientId: "cl-7",
    channel: "whatsapp",
    state: "direction",
    unread: false,
    messages: [
      {
        id: "m-9-1",
        sender: "conseillere",
        channel: "whatsapp",
        at: "2026-08-27T09:05:00",
        relanceType: "fidelite",
        body: "Sokhna, 680 points à votre compte — de quoi vous offrir un moment rien qu'à vous.",
      },
      {
        id: "m-9-2",
        sender: "cliente",
        channel: "whatsapp",
        at: "2026-08-27T15:00:00",
        body: "Je ne suis pas satisfaite de ma dernière visite, j'aimerais en parler à un responsable.",
      },
      {
        id: "m-9-3",
        sender: "receptionniste",
        channel: "whatsapp",
        at: "2026-08-27T15:30:00",
        body: "Je comprends Sokhna, je transmets votre message à la direction qui reviendra vers vous rapidement.",
      },
    ],
  },
];

export function conversationById(id: string) {
  return CONVERSATIONS.find((c) => c.id === id);
}

export function conversationByClientId(clientId: string) {
  return CONVERSATIONS.find((c) => c.clientId === clientId);
}
