import type { Campaign } from "@/lib/data/types";

export const CAMPAIGNS: Campaign[] = [
  {
    id: "camp-1",
    title: "Tabaski — réservez vos tresses tôt",
    message: "Bonjour {prenom} 🌙 Tabaski approche ! Nos créneaux tresses et coiffures partent très vite à cette période.",
    audienceLabel: "Toutes les clientes",
    status: "brouillon",
  },
  {
    id: "camp-2",
    title: "Fêtes de fin d'année — pensez à vous",
    message: "Bonjour {prenom} ✨ Les fêtes arrivent : offrez-vous un moment beauté avant le tourbillon.",
    audienceLabel: "Toutes les clientes",
    status: "brouillon",
  },
  {
    id: "camp-3",
    title: "Jour douceur — offre du jour",
    message: "Bonjour {prenom} 🌸 Aujourd'hui seulement, profitez de -15% sur votre prestation préférée.",
    audienceLabel: "Venues ce mois-ci",
    status: "planifiee",
  },
];
