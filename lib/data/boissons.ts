import type { Boisson } from "@/lib/data/types";

/**
 * Le Bar Beauty & Co — sa propre famille au Menu, ni prestation ni produit (ADR 0016). Pas de
 * catégorie, pas de stock. Mêmes références que la carte du bar sur la plateforme de réservation
 * b&co (`b&co/lib/data/bar-beauty.ts`). Éditées hors de cette app — point-de-vente ne fait que lire.
 */
export const BOISSONS: Boisson[] = [
  { id: "boisson-pure-glow", name: "Pure Glow", price: 4500, active: true, description: "Collagène, passion, orange amer, ruby grape", image: "/images/boissons/pure-glow.jpg" },
  { id: "boisson-dragon-mystic", name: "Dragon Mystic", price: 4500, active: true, description: "Dragon fruit, timer berry, eau pétillante", image: "/images/boissons/dragon-mystic.jpg" },
  { id: "boisson-pause-tropical", name: "Pause Tropical", price: 4500, active: true, description: "Magnésium, ananas, menthe, citron", image: "/images/boissons/pause-tropical.jpg" },
  { id: "boisson-eclat-matcha", name: "L'Éclat Matcha", price: 4500, active: true, description: "Matcha fraise ou vanille au choix", image: "/images/boissons/eclat-matcha.jpg" },
  { id: "boisson-ice-coffee-caramel", name: "Ice Coffee Caramel", price: 4500, active: true, description: "Caramel, expresso, lait au choix", image: "/images/boissons/ice-coffee-caramel.jpg" },
  { id: "boisson-soin-glace-ice-tea", name: "Soin Glacé Ice Tea", price: 3500, active: true, description: "Pêche citron", image: "/images/boissons/soin-glace-ice-tea.jpg" },
  { id: "boisson-pretty-latte", name: "Pretty Latte", price: 3900, active: true, description: "Lait froid ou chaud au choix et garniture au choix (caramel, vanille, cookies, spéculos)" },
];
