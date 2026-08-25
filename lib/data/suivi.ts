import { Cake, Heart, Sparkles, Star, Tag, type LucideIcon } from "lucide-react";

/**
 * Mock data for the Suivi module (CRM / relances automatisées) — dashboard "Tournée du
 * matin", ses sections classées par urgence, et la liste des campagnes.
 *
 * Voir docs/figma-userflow-part3.md sections 12-14 pour la spec source.
 */

export type SuiviTier = "vip" | "gold";

export type SuiviAction =
  | { kind: "contact" }
  | { kind: "pending" }
  | { kind: "discount"; percent: number; code: string };

type SuiviCardBase = {
  id: string;
  initials: string;
  name: string;
  tier?: SuiviTier;
};

export type SuiviCompactCard = SuiviCardBase & {
  variant: "compact";
  /** Sous-titre affiché sous le nom, ex. "Dans 6 jours". */
  subtitle: string;
};

export type SuiviExpandedCard = SuiviCardBase & {
  variant: "expanded";
  /** Sous-titre affiché sous le nom, ex. "Anniversaire — Yacine". */
  subtitle: string;
  /** Libellé petites capitales, ex. "ANNIVERSAIRE". */
  typeLabel: string;
  lateDays: number;
  message: string;
  action: SuiviAction;
};

export type SuiviCard = SuiviCompactCard | SuiviExpandedCard;

export type SuiviSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
  cards: SuiviCard[];
};

/** Contenu du bandeau CTA "Tournée du matin". */
export const tourneeDuMatin = {
  messagesReady: 41,
  toValidate: 40,
  discounts15: 6,
};

/** Les 4 tuiles stats sous le bandeau. */
export const suiviStats = [
  { key: "late", label: "En retard", value: "41" },
  { key: "today", label: "Aujourd'hui", value: "0" },
  { key: "week", label: "Cette semaine", value: "0" },
  { key: "winback", label: "À reconquérir", value: "11" },
] as const;

export const suiviSections: SuiviSection[] = [
  {
    id: "anniversaires",
    label: "Anniversaires",
    icon: Cake,
    count: 4,
    cards: [
      {
        id: "anniv-yacine-wade",
        variant: "expanded",
        initials: "YW",
        name: "Yacine Wade",
        tier: "vip",
        subtitle: "Anniversaire — Yacine",
        typeLabel: "ANNIVERSAIRE",
        lateDays: 48,
        message:
          "Joyeux anniversaire Yacine 🎂✨ Toute l'équipe de Beauty and Co vous souhaite une journée aussi rayonnante que vous. Ce mois-ci, laissez-nous vous chouchouter : dites-moi quand vous passez et je vous prépare un accueil spécial. Votre conseillère beauté · Beauty and Co",
        action: { kind: "contact" },
      },
      {
        id: "anniv-coumba-sarr",
        variant: "expanded",
        initials: "CS",
        name: "Coumba Sarr",
        subtitle: "Anniversaire — Coumba",
        typeLabel: "ANNIVERSAIRE",
        lateDays: 41,
        message:
          "Joyeux anniversaire Coumba 🎂✨ Toute l'équipe de Beauty and Co vous souhaite une journée aussi rayonnante que vous. Ce mois-ci, laissez-nous vous chouchouter : dites-moi quand vous passez et je vous prépare un accueil spécial. Votre conseillère beauté · Beauty and Co",
        action: { kind: "contact" },
      },
      {
        id: "anniv-mame-diarra-sy",
        variant: "compact",
        initials: "MD",
        name: "Mame Diarra Sy",
        subtitle: "Dans 6 jours",
      },
      {
        id: "anniv-aminata-diop",
        variant: "compact",
        initials: "AD",
        name: "Aminata Diop",
        subtitle: "Dans 10 jours",
      },
    ],
  },
  {
    id: "soins-rdv",
    label: "Soins & rendez-vous",
    icon: Sparkles,
    count: 3,
    cards: [
      {
        id: "soin-bineta-diagne",
        variant: "expanded",
        initials: "BD",
        name: "Bineta Diagne",
        subtitle: "Fenêtre gel se referme — Bineta",
        typeLabel: "FENÊTRE GEL",
        lateDays: 3,
        message:
          "Bonjour Bineta 💅 C'est votre conseillère beauté de Beauty and Co. Votre pose gel approche de sa 4ᵉ semaine : c'est le tout dernier moment idéal pour un simple remplissage. Au-delà, la pose se soulève, fragilise votre ongle naturel — et il faudra une dépose complète puis une nouvelle pose, plus longue et plus coûteuse. Je vous garde un créneau cette semaine pour vous ?",
        action: { kind: "pending" },
      },
      {
        id: "soin-fatou-ndoye",
        variant: "expanded",
        initials: "FN",
        name: "Fatou Ndoye",
        subtitle: "Fenêtre kératine se referme — Fatou",
        typeLabel: "FENÊTRE KÉRATINE",
        lateDays: 5,
        message:
          "Bonjour Fatou 💅 C'est votre conseillère beauté de Beauty and Co. Votre lissage kératine arrive en fin de tenue : c'est le bon moment pour un soin d'entretien avant que les racines ne marquent trop la repousse. Je vous garde un créneau cette semaine pour prolonger l'effet ?",
        action: { kind: "pending" },
      },
      {
        id: "soin-sokhna-diagne",
        variant: "expanded",
        initials: "SD",
        name: "Sokhna Diagne",
        subtitle: "Rappel pose cils — Sokhna",
        typeLabel: "RAPPEL CILS",
        lateDays: 2,
        message:
          "Bonjour Sokhna 💅 C'est votre conseillère beauté de Beauty and Co. Votre pose de cils arrive à échéance de renouvellement pour garder un regard impeccable. Je vous propose un créneau cette semaine pour un remplissage ?",
        action: { kind: "pending" },
      },
    ],
  },
  {
    id: "fidelite",
    label: "Fidélité",
    icon: Star,
    count: 25,
    cards: [
      {
        id: "fidelite-adja-niang",
        variant: "expanded",
        initials: "AN",
        name: "Adja Niang",
        tier: "vip",
        subtitle: "Récompense à réclamer — Soin VIP",
        typeLabel: "POINTS FIDÉLITÉ",
        lateDays: 48,
        message:
          "Bonjour Adja 💛 C'est votre conseillère beauté de Beauty and Co. Bonne nouvelle : avec vos 8500 points de fidélité, votre récompense « Soin VIP » vous attend déjà ! Elle est à vous dès votre prochaine visite. Je vous réserve un créneau cette semaine ? 🎁",
        action: { kind: "pending" },
      },
      {
        id: "fidelite-yacine-wade",
        variant: "expanded",
        initials: "YW",
        name: "Yacine Wade",
        tier: "vip",
        subtitle: "Récompense à réclamer — Soin VIP",
        typeLabel: "POINTS FIDÉLITÉ",
        lateDays: 48,
        message:
          "Bonjour Yacine 💛 C'est votre conseillère beauté de Beauty and Co. Bonne nouvelle : avec vos 7200 points de fidélité, votre récompense « Soin VIP » vous attend déjà ! Elle est à vous dès votre prochaine visite. Je vous réserve un créneau cette semaine ? 🎁",
        action: { kind: "pending" },
      },
      {
        id: "fidelite-awa-thiam",
        variant: "expanded",
        initials: "AT",
        name: "Awa Thiam",
        tier: "gold",
        subtitle: "Récompense à réclamer — Soin VIP",
        typeLabel: "POINTS FIDÉLITÉ",
        lateDays: 48,
        message:
          "Bonjour Awa 💛 C'est votre conseillère beauté de Beauty and Co. Bonne nouvelle : avec vos 6100 points de fidélité, votre récompense « Soin VIP » vous attend déjà ! Elle est à vous dès votre prochaine visite. Je vous réserve un créneau cette semaine ? 🎁",
        action: { kind: "pending" },
      },
    ],
  },
  {
    id: "reconquete",
    label: "Reconquête",
    icon: Heart,
    count: 11,
    cards: [
      {
        id: "reconquete-mariama-ba",
        variant: "expanded",
        initials: "MB",
        name: "Mariama Ba",
        tier: "gold",
        subtitle: "Reconquête (remise -15 % à autoriser) — Mariama",
        typeLabel: "RECONQUÊTE",
        lateDays: 48,
        message:
          "Bonjour Mariama 🌸 C'est votre conseillère beauté de Beauty and Co. Vous nous manquez vraiment ! Pour vous retrouver, j'ai une attention rien que pour vous : -15 % sur la prestation de votre choix, valable 30 jours avec le code RETOUR30UR. Répondez-moi ici, je vous réserve le meilleur créneau 🤗",
        action: { kind: "discount", percent: 15, code: "RETOUR30UR" },
      },
      {
        id: "reconquete-aissatou-diallo",
        variant: "expanded",
        initials: "AD",
        name: "Aissatou Diallo",
        tier: "gold",
        subtitle: "Reconquête (remise -15 % à autoriser) — Aissatou",
        typeLabel: "RECONQUÊTE",
        lateDays: 48,
        message:
          "Bonjour Aissatou 🌸 C'est votre conseillère beauté de Beauty and Co. Vous nous manquez vraiment ! Pour vous retrouver, j'ai une attention rien que pour vous : -15 % sur la prestation de votre choix, valable 30 jours avec le code RETOURV2VA. Répondez-moi ici, je vous réserve le meilleur créneau 🤗",
        action: { kind: "discount", percent: 15, code: "RETOURV2VA" },
      },
      {
        id: "reconquete-coumba-fall",
        variant: "expanded",
        initials: "CF",
        name: "Coumba Fall",
        tier: "gold",
        subtitle: "Reconquête (remise -15 % à autoriser) — Coumba",
        typeLabel: "RECONQUÊTE",
        lateDays: 48,
        message:
          "Bonjour Coumba 🌸 C'est votre conseillère beauté de Beauty and Co. Vous nous manquez vraiment ! Pour vous retrouver, j'ai une attention rien que pour vous : -15 % sur la prestation de votre choix, valable 30 jours avec le code RETOURC0MBA. Répondez-moi ici, je vous réserve le meilleur créneau 🤗",
        action: { kind: "discount", percent: 15, code: "RETOURC0MBA" },
      },
      {
        id: "reconquete-mariam-kane",
        variant: "expanded",
        initials: "MK",
        name: "Mariam Kane",
        subtitle: "Reconquête (remise -15 % à autoriser) — Mariam",
        typeLabel: "RECONQUÊTE",
        lateDays: 3,
        message:
          "Bonjour Mariam 🌸 C'est votre conseillère beauté de Beauty and Co. Vous nous manquez vraiment ! Pour vous retrouver, j'ai une attention rien que pour vous : -15 % sur la prestation de votre choix, valable 30 jours avec le code RETOURA1NS. Répondez-moi ici, je vous réserve le meilleur créneau 🤗",
        action: { kind: "discount", percent: 15, code: "RETOURA1NS" },
      },
    ],
  },
  {
    id: "rappels-lookbook",
    label: "Rappels Lookbook",
    icon: Tag,
    count: 1,
    cards: [
      {
        id: "lookbook-awa-sarr",
        variant: "expanded",
        initials: "AS",
        name: "Awa Sarr",
        subtitle: "Rappel — Perfect Manucure Russe",
        typeLabel: "RECOMMANDATION",
        lateDays: 3,
        message:
          "Bonjour Awa ✨ C'est votre conseillère beauté de Beauty and Co. Je repensais à « Perfect Manucure Russe » que je vous avais proposé — j'ai un joli créneau qui se libère cette semaine, ce serait l'occasion parfaite. Ça vous tente toujours ? 💛",
        action: { kind: "pending" },
      },
    ],
  },
];

export type Campaign = {
  id: string;
  title: string;
  message: string;
  audience: string;
  status: "brouillon";
};

export const campaigns: Campaign[] = [
  {
    id: "campagne-tabaski",
    title: "Tabaski — réservez vos tresses tôt",
    message:
      "Bonjour {prenom} 🌙 Tabaski approche ! Nos créneaux tresses et coiffures partent très vite à cette période. Réservez dès maintenant pour être magnifique le jour J…",
    audience: "Toutes les clientes",
    status: "brouillon",
  },
  {
    id: "campagne-fetes",
    title: "Fêtes de fin d'année — pensez à vous",
    message:
      "Bonjour {prenom} ✨ Les fêtes arrivent : offrez-vous un moment beauté avant le tourbillon. Coiffure, ongles, soin éclat — dites-nous votre envie, on s'occupe de…",
    audience: "Toutes les clientes",
    status: "brouillon",
  },
  {
    id: "campagne-jour-douceur",
    title: "Jour douceur — offre du jour",
    message:
      "Bonjour {prenom} 🌸 Aujourd'hui seulement, profitez de -15 % sur votre prestation préférée. Une pause beauté improvisée ? Répondez-nous vite, les places du jour…",
    audience: "Venues ce mois-ci",
    status: "brouillon",
  },
];
