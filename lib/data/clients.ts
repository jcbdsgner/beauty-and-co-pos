import type { BadgeVariant } from "@/components/ui/badge";

export type ClientTier = "classic" | "vip" | "gold" | "silver";

export type SubscriptionCredit = {
  label: string;
  count: number;
  icon: "diamond" | "sparkle";
};

export type FollowUpSuggestion = {
  name: string;
  category: string;
  reason: string;
};

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  profession?: string;
  birthday?: string;
  drink?: string;
  preferredServices?: string;
  hairType?: string;
  colorReference?: string;
  skinNotes?: string;
  preferencesNotes?: string;
  tier: ClientTier;
  /** Precomputed relative-tenure label as shown on the directory card ("Il y a 6j", "Jamais"…). */
  tenureLabel: string;
  isNew?: boolean;
  hasHistory?: boolean;
  visits: number;
  spend: number;
  points: number;
  lastVisit?: { label: string };
  subscription?: {
    name: string;
    since: string;
    renewsOn: string;
    credits: SubscriptionCredit[];
  };
  followUp?: {
    dueLabel: string;
    dueService: string;
    overdueDays: number;
    rewardLabel: string;
    rewardOverdueDays: number;
    suggestions: FollowUpSuggestion[];
    recommendationSent?: string;
  };
};

export const CLIENTS: Client[] = [
  {
    id: "CLT-4E7CAB",
    firstName: "Awa",
    lastName: "Test",
    phone: "+221781208686",
    whatsapp: "+221781208686",
    email: "awa.test@gmail.com",
    address: undefined,
    profession: undefined,
    birthday: "23 août 1992",
    drink: undefined,
    preferredServices: undefined,
    hairType: "Crépu",
    tier: "classic",
    tenureLabel: "Il y a 6j",
    hasHistory: true,
    visits: 0,
    spend: 0,
    points: 180,
    lastVisit: { label: "18 août 2026 (Il y a 6 jours)" },
    subscription: {
      name: "Cercle Ongles",
      since: "Membre depuis 1 mois",
      renewsOn: "17 septembre",
      credits: [
        { label: "Remplissage / Pose", count: 1, icon: "diamond" },
        { label: "Finition Fr. / Chrome", count: 1, icon: "sparkle" },
      ],
    },
    followUp: {
      dueLabel: "Rappel — Perfect Manucure Russe",
      dueService: "Perfect Manucure Russe",
      overdueDays: 3,
      rewardLabel: "Récompense à réclamer — Brushing offert",
      rewardOverdueDays: 3,
      suggestions: [
        { name: "Glow Me — Coup d'Éclat", category: "SOIN VISAGE", reason: "Adapté à sa peau sèche" },
        { name: "Closure Behind The Hair Line", category: "COIFFURE", reason: "Parfait pour ses cheveux crépu" },
        { name: "Knotless Braids", category: "COIFFURE", reason: "Parfait pour ses cheveux crépu" },
      ],
      recommendationSent: "Perfect Manucure Russe",
    },
  },
  {
    id: "CLT-91A2FD",
    firstName: "Fatou",
    lastName: "Test",
    phone: "+221771122334",
    whatsapp: "+221771122334",
    email: undefined,
    tier: "classic",
    tenureLabel: "1 sem.",
    isNew: true,
    visits: 0,
    spend: 0,
    points: 20,
  },
  {
    id: "CLT-3B8C10",
    firstName: "Coumba",
    lastName: "Test",
    phone: "+221765544332",
    tier: "classic",
    tenureLabel: "4 sem.",
    isNew: true,
    visits: 0,
    spend: 0,
    points: 0,
  },
  {
    id: "CLT-6D45E2",
    firstName: "Bineta",
    lastName: "Test",
    phone: "+221709988776",
    whatsapp: "+221709988776",
    tier: "classic",
    tenureLabel: "1 mois",
    visits: 1,
    spend: 15000,
    points: 15,
    hasHistory: true,
    lastVisit: { label: "24 juillet 2026 (Il y a 1 mois)" },
  },
  {
    id: "CLT-7F12AA",
    firstName: "Mariam",
    lastName: "Test",
    phone: "+221781234567",
    tier: "classic",
    tenureLabel: "2 mois",
    visits: 0,
    spend: 0,
    points: 0,
  },
  {
    id: "CLT-2C9E77",
    firstName: "Awa",
    lastName: "Niang",
    phone: "+221776543210",
    whatsapp: "+221776543210",
    email: "awa.niang@gmail.com",
    address: "Sacré-Cœur, Dakar",
    profession: "Directrice",
    birthday: "12 mars 1988",
    hairType: "Lisse",
    tier: "vip",
    tenureLabel: "2 mois",
    hasHistory: true,
    visits: 14,
    spend: 890000,
    points: 1175,
    lastVisit: { label: "10 août 2026 (Il y a 14 jours)" },
    subscription: {
      name: "Cercle Ongles",
      since: "Membre depuis 4 mois",
      renewsOn: "3 septembre",
      credits: [
        { label: "Remplissage / Pose", count: 2, icon: "diamond" },
        { label: "Finition Fr. / Chrome", count: 1, icon: "sparkle" },
      ],
    },
  },
  {
    id: "CLT-5A6B33",
    firstName: "Sokhna",
    lastName: "Ndiaye",
    phone: "+221703216549",
    whatsapp: "+221703216549",
    email: "sokhna.ndiaye@gmail.com",
    tier: "gold",
    tenureLabel: "2 mois",
    isNew: true,
    hasHistory: true,
    visits: 6,
    spend: 320000,
    points: 540,
    lastVisit: { label: "2 août 2026 (Il y a 22 jours)" },
  },
  {
    id: "CLT-8E23C4",
    firstName: "Ndèye",
    lastName: "Diop",
    phone: "+221781239900",
    tier: "silver",
    tenureLabel: "5 mois",
    visits: 3,
    spend: 95000,
    points: 90,
    hasHistory: true,
    lastVisit: { label: "1 avril 2026 (Il y a 5 mois)" },
  },
];

export function getClientById(id: string): Client {
  return CLIENTS.find((client) => client.id === id) ?? CLIENTS[0];
}

export function fullName(client: Client) {
  return `${client.firstName} ${client.lastName}`;
}

export function initials(client: Client) {
  return `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();
}

export function tierBadge(tier: ClientTier): { label: string; variant: BadgeVariant } | undefined {
  switch (tier) {
    case "vip":
      return { label: "VIP", variant: "vip" };
    case "gold":
      return { label: "GOLD", variant: "gold" };
    case "silver":
      return { label: "SILVER", variant: "silver" };
    default:
      return undefined;
  }
}

export function tierMemberLabel(tier: ClientTier) {
  switch (tier) {
    case "vip":
      return "MEMBRE VIP";
    case "gold":
      return "MEMBRE GOLD";
    case "silver":
      return "MEMBRE SILVER";
    default:
      return "MEMBRE CLASSIC";
  }
}

export function tierCardLabel(tier: ClientTier) {
  switch (tier) {
    case "vip":
      return "★ VIP";
    case "gold":
      return "★ Gold";
    case "silver":
      return "★ Silver";
    default:
      return "☆ Classique";
  }
}

export function formatFCFA(amount: number) {
  return `${amount.toLocaleString("fr-FR")} F`;
}
