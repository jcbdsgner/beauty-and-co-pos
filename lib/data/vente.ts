// Mock data for the Vente & Paiement (POS) module. No backend — everything here is local,
// in-memory fixture data used only by app/(app)/vente/page.tsx and components/vente/**.

export type CategoryIcon = "coiffure" | "spa" | "epilation" | "manucure" | "visage" | "onglerie" | "mini";

export type Service = {
  id: string;
  name: string;
  /** Full prestation description, straight from the b&co booking catalogue — not shown on the
   *  compact catalogue tile, surfaced as a hover title instead. */
  description?: string;
  price: number;
  /** Display duration ("150 min") — prestations only, absent on retail Produits. */
  duration?: string;
  durationMinutes?: number;
  categoryId: string;
  subcat: string;
};

export type Category = {
  id: string;
  name: string;
  icon: CategoryIcon;
  bg: string;
  count: number;
};

/** A Beauty and Co carte cadeau — a real product (see b&co's externalServices "carte-cadeau"),
 *  stored-value rather than a percentage-off promo code. Redeeming one deducts its balance
 *  (capped at the sale's subtotal) from the total. */
export type GiftCard = { code: string; balance: number };

export const GIFT_CARDS: GiftCard[] = [
  { code: "BACO-GIFT-25000", balance: 25000 },
  { code: "BACO-GIFT-50000", balance: 50000 },
  { code: "BACO-GIFT-100000", balance: 100000 },
];

export type ClientBadge = { label: string; variant: "vip" | "gold" | "silver" };

export type Client = {
  id: string;
  initial: string;
  name: string;
  phone: string;
  points: number;
  badge?: ClientBadge;
};

export type CartItem = {
  id: string;
  serviceId: string;
  name: string;
  unitPrice: number;
  qty: number;
  practitioner: string | null;
};

export type PaymentMethodId = "wave" | "orange_money" | "especes" | "carte";

export type Sale = {
  id: string;
  name: string;
  client: Client | null;
  cart: CartItem[];
  giftCardCode: string;
  giftCardApplied: { code: string; amount: number } | null;
  loyaltyPointsUsed: number;
  managerCode: string;
  managerDiscountApplied: number;
  paymentMethod: PaymentMethodId | null;
  mixedPayment: boolean;
  mixedMethod2: PaymentMethodId | null;
  mixedAmount1: string;
  mixedAmount2: string;
};

/** Raw service catalogue — sourced from the real b&co booking catalogue (lib/data/booking-services.ts
 *  there), so names/prices/durations/descriptions match what clients actually book. Category
 *  counters (below) are derived from this, single source of truth. */
export const SERVICES: Service[] = [

  // Coiffure (41)
  { id: "coiffure-defrisage-professionnel-beauty-and-co-texlax", name: "Defrisage Professionnel Beauty and Co / Texlax", description: "Cette prestation inclut une prestation du cuir chevelu , le défrisant avec ou sans soude, le soin et le shampoing neutralisant suivi du coiffage.", price: 49000, duration: "150 min", durationMinutes: 150, categoryId: "coiffure", subcat: "Défrisage" },
  { id: "coiffure-hybrid-extensions", name: "Hybrid Extensions", price: 99000, duration: "190 min", durationMinutes: 190, categoryId: "coiffure", subcat: "Luxury Extensions" },
  { id: "coiffure-extensions-tapes-2-paquets-de-cheveux-soit-100-g-18-pouces-coiffage", name: "Extensions Tapes (2 Paquets de Cheveux Soit 100 G 18 Pouces + Coiffage)", description: "Ce service inclut la pose la coupe et le coiffage lissage ou boucles. Deux paquets 18'' cheveux soit 150g pose + coiffage.", price: 249000, duration: "150 min", durationMinutes: 150, categoryId: "coiffure", subcat: "Luxury Extensions" },
  { id: "coiffure-enlever-anneaux", name: "Enlever Anneaux", price: 7000, duration: "40 min", durationMinutes: 40, categoryId: "coiffure", subcat: "Luxury Extensions" },
  { id: "coiffure-pose-perruque", name: "Pose Perruque", price: 39000, duration: "70 min", durationMinutes: 70, categoryId: "coiffure", subcat: "Perruques" },
  { id: "coiffure-soin-perruque", name: "Soin Perruque", price: 22000, duration: "120 min", durationMinutes: 120, categoryId: "coiffure", subcat: "Perruques" },
  { id: "coiffure-supplement-lisseur", name: "Supplement Lisseur", description: "Cette prestation ne peut être pris seule.", price: 5000, duration: "20 min", durationMinutes: 20, categoryId: "coiffure", subcat: "Brushing" },
  { id: "coiffure-soin-keratine", name: "Soin Kératine", price: 189000, duration: "210 min", durationMinutes: 210, categoryId: "coiffure", subcat: "Lissage" },
  { id: "coiffure-supplement-coupe-pointes", name: "Supplement Coupe Pointes", description: "Cette prestation ne peut être pris seule.", price: 9000, duration: "25 min", durationMinutes: 25, categoryId: "coiffure", subcat: "Coupe" },
  { id: "coiffure-coupe-transformation", name: "Coupe Transformation", price: 36000, duration: "40 min", durationMinutes: 40, categoryId: "coiffure", subcat: "Coupe" },
  { id: "coiffure-tresses-cheveux", name: "Tresses Cheveux +", description: "Ce service inclut les tresses sans les mèches.", price: 19000, duration: "60 min", durationMinutes: 60, categoryId: "coiffure", subcat: "Tresses" },
  { id: "coiffure-shampoing-brushing-sur-extensions-tissages-shampoing-inclus-et-obligatoire", name: "Shampoing Brushing sur Extensions / Tissages (Shampoing Inclus et Obligatoire)", description: "Ce service inclut le shampoing suivi du brushing de votre tissage ou extension.", price: 31000, duration: "100 min", durationMinutes: 100, categoryId: "coiffure", subcat: "Brushing" },
  { id: "coiffure-soin-croisiere", name: "Soin Croisière", price: 36000, duration: "90 min", durationMinutes: 90, categoryId: "coiffure", subcat: "Nos Rituels Soins" },
  { id: "coiffure-extension-aux-fils-2-paquets", name: "Extension aux Fils 2 Paquets", price: 218000, duration: "240 min", durationMinutes: 240, categoryId: "coiffure", subcat: "Luxury Extensions" },
  { id: "coiffure-soin-botox-lissant", name: "Soin Botox Lissant", price: 99000, duration: "190 min", durationMinutes: 190, categoryId: "coiffure", subcat: "Lissage" },
  { id: "coiffure-tissage-ouvert", name: "Tissage Ouvert", price: 46000, duration: "140 min", durationMinutes: 140, categoryId: "coiffure", subcat: "Tissage" },
  { id: "coiffure-tissage-rajout", name: "Tissage Rajout", price: 39000, duration: "75 min", durationMinutes: 75, categoryId: "coiffure", subcat: "Tissage" },
  { id: "coiffure-half-up-half-down", name: "Half Up Half Down", description: "Ce service inclut la coiffure sans les mèches.", price: 49000, duration: "120 min", durationMinutes: 120, categoryId: "coiffure", subcat: "Coiffure" },
  { id: "coiffure-shampoing-brushing-shampoing-inclus-et-obligatoire", name: "Shampoing Brushing (Shampoing Inclus et Obligatoire)", description: "Shampoing, protecteur thermique, brushing.", price: 23000, duration: "60 min", durationMinutes: 60, categoryId: "coiffure", subcat: "Brushing" },
  { id: "coiffure-extensions-aux-fils-1-paquet", name: "Extensions aux Fils 1 Paquet", price: 129000, duration: "240 min", durationMinutes: 240, categoryId: "coiffure", subcat: "Luxury Extensions" },
  { id: "coiffure-head-spa-ultimate-deep-relaxation", name: "Head SPA Ultimate Deep Relaxation", price: 179000, duration: "240 min", durationMinutes: 240, categoryId: "coiffure", subcat: "Head Spa" },
  { id: "coiffure-extensions-tapes-3-paquets-de-cheveux-soit-150g-18-pouces-coiffage", name: "Extensions Tapes (3 Paquets de Cheveux Soit 150G 18 Pouces + Coiffage)", description: "Ce service inclut la pose la coupe et le coiffage lissage ou boucles. Trois paquets 18'' cheveux soit 150g pose + coiffage.", price: 349000, duration: "180 min", durationMinutes: 180, categoryId: "coiffure", subcat: "Luxury Extensions" },
  { id: "coiffure-defrisage-professionnel-soin-fortifiant-anti-casse", name: "Defrisage Professionnel + Soin Fortifiant Anti Casse", description: "Cette prestation inclut une prestation du cuir chevelu , le défrisant avec ou sans soude, le soin et le shampoing neutralisant suivi du coiffage.", price: 59000, duration: "150 min", durationMinutes: 150, categoryId: "coiffure", subcat: "Défrisage" },
  { id: "coiffure-soin-complet", name: "Soin Complet", price: 46000, duration: "130 min", durationMinutes: 130, categoryId: "coiffure", subcat: "Nos Rituels Soins" },
  { id: "coiffure-soin-detox", name: "Soin Detox", price: 46000, duration: "140 min", durationMinutes: 140, categoryId: "coiffure", subcat: "Nos Rituels Soins" },
  { id: "coiffure-soin-botox-reparateur-non-lissant", name: "Soin Botox Reparateur(Non Lissant)", price: 86000, duration: "150 min", durationMinutes: 150, categoryId: "coiffure", subcat: "Nos Rituels Soins" },
  { id: "coiffure-soin-lissant-tanin", name: "Soin Lissant Tanin", price: 189000, duration: "190 min", durationMinutes: 190, categoryId: "coiffure", subcat: "Lissage" },
  { id: "coiffure-silk-press", name: "Silk Press", price: 79000, duration: "180 min", durationMinutes: 180, categoryId: "coiffure", subcat: "Brushing" },
  { id: "coiffure-extensions-anneaux-haute-couture-2-paquets", name: "Extensions Anneaux Haute Couture 2 Paquets", price: 80000, duration: "170 min", durationMinutes: 170, categoryId: "coiffure", subcat: "Luxury Extensions" },
  { id: "coiffure-pose-clips", name: "Pose Clips", price: 37000, duration: "60 min", durationMinutes: 60, categoryId: "coiffure", subcat: "Luxury Extensions" },
  { id: "coiffure-ponytail", name: "Ponytail", description: "Ce service inclut la coiffure sans les mèches.", price: 41000, duration: "90 min", durationMinutes: 90, categoryId: "coiffure", subcat: "Coiffure" },
  { id: "coiffure-supplement-hand-feet-massage-massage-pieds-mains", name: "Supplément Hand Feet Massage/ Massage Pieds-mains", description: "Supplément pour le service Head spa.", price: 19000, duration: "15 min", durationMinutes: 15, categoryId: "coiffure", subcat: "Head Spa" },
  { id: "coiffure-soin-croisiere-head-spa", name: "Soin Croisiere Head SPA", price: 84000, duration: "120 min", durationMinutes: 120, categoryId: "coiffure", subcat: "Head Spa" },
  { id: "coiffure-pose-u-part-wig", name: "Pose U-part Wig", price: 37000, duration: "70 min", durationMinutes: 70, categoryId: "coiffure", subcat: "Perruques" },
  { id: "coiffure-tissage-versatile", name: "Tissage Versatile", price: 56000, duration: "120 min", durationMinutes: 120, categoryId: "coiffure", subcat: "Tissage" },
  { id: "coiffure-shampoing-sechage", name: "Shampoing Séchage", price: 17000, duration: "60 min", durationMinutes: 60, categoryId: "coiffure", subcat: "Brushing" },
  { id: "coiffure-flip-over-sew-in-tissage-ferme", name: "Flip Over Sew In (Tissage Fermé)", price: 59000, duration: "150 min", durationMinutes: 150, categoryId: "coiffure", subcat: "Tissage" },
  { id: "coiffure-tissage-closure-behind-the-hair-line-new", name: "Tissage Closure Behind The Hair Line (New)", price: 74900, duration: "190 min", durationMinutes: 190, categoryId: "coiffure", subcat: "Tissage" },
  { id: "coiffure-supplement-express-floral-facial-soin-du-visage-relaxant", name: "Supplément Express Floral Facial/ Soin du Visage Relaxant", price: 34000, duration: "35 min", durationMinutes: 35, categoryId: "coiffure", subcat: "Nos Rituels Soins" },
  { id: "coiffure-soin-vip", name: "Soin VIP", price: 49000, duration: "160 min", durationMinutes: 160, categoryId: "coiffure", subcat: "Nos Rituels Soins" },
  { id: "coiffure-soin-reparateur-olapex-new-in", name: "Soin Réparateur Olapex (New In)", price: 69000, duration: "120 min", durationMinutes: 120, categoryId: "coiffure", subcat: "Nos Rituels Soins" },

  // Manucure / Pédicure (14)
  { id: "manucure-pedicure-gel-sur-ongle-naturel-gainage", name: "Gel sur Ongle Naturel(Gainage)", price: 33000, duration: "70 min", durationMinutes: 70, categoryId: "manucure-pedicure", subcat: "Manucure / Pédicure" },
  { id: "manucure-pedicure-supplement-decoration-chrome-cat-eye-baby-boomer", name: "Supplément Décoration (Chrome , Cat Eye , Baby Boomer)", description: "Ce service vient en supplément .", price: 7500, duration: "20 min", durationMinutes: 20, categoryId: "manucure-pedicure", subcat: "Manucure / Pédicure" },
  { id: "manucure-pedicure-manucure-permanent", name: "Manucure + Permanent", price: 32000, duration: "80 min", durationMinutes: 80, categoryId: "manucure-pedicure", subcat: "Manucure / Pédicure" },
  { id: "manucure-pedicure-jelly-pedicure", name: "Jelly Pédicure", price: 29000, duration: "65 min", durationMinutes: 65, categoryId: "manucure-pedicure", subcat: "Manucure / Pédicure" },
  { id: "manucure-pedicure-smooth-pedicure", name: "Smooth Pédicure", price: 36000, duration: "80 min", durationMinutes: 80, categoryId: "manucure-pedicure", subcat: "Manucure / Pédicure" },
  { id: "manucure-pedicure-perfect-manucure-russe-gel-sur-ongles-naturels-gainage", name: "Perfect Manucure Russe+ Gel sur Ongles Naturels (Gainage)", description: "Découvrez notre manucure russe sans eau pour des mains impeccables. Ce rituel inclut une préparation minutieuse des cuticules, une exfoliation revitalisante, et la pose du gel et le vernis permanent.", price: 43000, duration: "90 min", durationMinutes: 90, categoryId: "manucure-pedicure", subcat: "Manucure / Pédicure" },
  { id: "manucure-pedicure-manucure-russe-sans-vernis-sans-gel", name: "Manucure Russe(Sans Vernis/sans Gel)", price: 13000, duration: "30 min", durationMinutes: 30, categoryId: "manucure-pedicure", subcat: "Manucure / Pédicure" },
  { id: "manucure-pedicure-vernis-simple-mains-classique-et-halal", name: "Vernis Simple Mains (Classique et Halal)", price: 9000, duration: "30 min", durationMinutes: 30, categoryId: "manucure-pedicure", subcat: "Manucure / Pédicure" },
  { id: "manucure-pedicure-pedicure-me-spa", name: "Pédicure Me SPA", price: 26000, duration: "60 min", durationMinutes: 60, categoryId: "manucure-pedicure", subcat: "Manucure / Pédicure" },
  { id: "manucure-pedicure-manucure-spa-express", name: "Manucure SPA Express", price: 16000, duration: "45 min", durationMinutes: 45, categoryId: "manucure-pedicure", subcat: "Manucure / Pédicure" },
  { id: "manucure-pedicure-pedicure-permanent", name: "Pédicure Permanent", price: 36000, duration: "80 min", durationMinutes: 80, categoryId: "manucure-pedicure", subcat: "Manucure / Pédicure" },
  { id: "manucure-pedicure-perfect-pedicure-russe-permanent", name: "Perfect Pédicure Russe + Permanent", price: 39000, duration: "80 min", durationMinutes: 80, categoryId: "manucure-pedicure", subcat: "Manucure / Pédicure" },
  { id: "manucure-pedicure-luxury-perfect-pedicure", name: "Luxury Perfect Pédicure", price: 39000, duration: "90 min", durationMinutes: 90, categoryId: "manucure-pedicure", subcat: "Manucure / Pédicure" },
  { id: "manucure-pedicure-luxury-perfect-manucure-spa", name: "Luxury Perfect Manucure SPA", price: 32000, duration: "70 min", durationMinutes: 70, categoryId: "manucure-pedicure", subcat: "Manucure / Pédicure" },

  // Onglerie (11)
  { id: "onglerie-vernis-permanent-pieds", name: "Vernis Permanent Pieds", description: "Ce service inclut la pose du permanent sur les pieds.", price: 13000, duration: "30 min", durationMinutes: 30, categoryId: "onglerie", subcat: "Onglerie" },
  { id: "onglerie-polygel-extensions", name: "Polygel Extensions", price: 45000, duration: "120 min", durationMinutes: 120, categoryId: "onglerie", subcat: "Onglerie" },
  { id: "onglerie-reparation-ongle-1-doigt", name: "Réparation Ongle (1 Doigt)", description: "Reconstruction soignée d'ongles cassés ou gel abîmé.", price: 3500, duration: "20 min", durationMinutes: 20, categoryId: "onglerie", subcat: "Onglerie" },
  { id: "onglerie-depose-gel-gel-a-enlever", name: "Dépose Gel(Gel À Enlever)", description: "protéger vos ongles par une dépose délicate et soignée.", price: 8000, duration: "30 min", durationMinutes: 30, categoryId: "onglerie", subcat: "Onglerie" },
  { id: "onglerie-gel-x", name: "Gel X", description: "Sublimez vos ongles avec notre nouvelle technique de manucure rapide. Ce service inclut la pose de capsules en gel souple suivi d'une couleur permanente. Elle dure 3 à 4 semaines.", price: 36000, duration: "80 min", durationMinutes: 80, categoryId: "onglerie", subcat: "Onglerie" },
  { id: "onglerie-capsules-permanents-mains", name: "Capsules Permanents Mains", description: "Sublimez vos mains avec nos poses de capsules souples suivi d'une couleur permanente.", price: 21000, duration: "50 min", durationMinutes: 50, categoryId: "onglerie", subcat: "Onglerie" },
  { id: "onglerie-capsules-gel-pieds", name: "Capsules Gel Pieds", description: "Ce service inclut une pose de capsules en gel souple qui couvre tout l'ongle naturel des pieds.", price: 23000, duration: "60 min", durationMinutes: 60, categoryId: "onglerie", subcat: "Onglerie" },
  { id: "onglerie-vernis-permanent-mains", name: "Vernis Permanent Mains", description: "Ce service inclut la pose du permanent sur les mains.", price: 17000, duration: "30 min", durationMinutes: 30, categoryId: "onglerie", subcat: "Onglerie" },
  { id: "onglerie-remplissage-gel", name: "Remplissage Gel", description: "Entretenez vos ongles avec notre remplissage gel après 2 semaines de pose.", price: 27000, duration: "30 min", durationMinutes: 30, categoryId: "onglerie", subcat: "Onglerie" },
  { id: "onglerie-supplement-french", name: "Supplément French", price: 7500, duration: "30 min", durationMinutes: 30, categoryId: "onglerie", subcat: "Onglerie" },
  { id: "onglerie-supplement-decoration-chrome-cat-eye-baby-boomer", name: "Supplément Décoration (Chrome , Cat Eye , Baby Boomer)", description: "Ce service vient en supplément .", price: 10000, duration: "30 min", durationMinutes: 30, categoryId: "onglerie", subcat: "Onglerie" },

  // Spa & Massages (12)
  { id: "spa-soin-du-dos", name: "Soin du Dos", price: 65000, duration: "90 min", durationMinutes: 90, categoryId: "spa", subcat: "Spa & Massages" },
  { id: "spa-hot-stone-pierres-chaudes", name: "Hot Stone - Pierres Chaudes", price: 59000, duration: "60 min", durationMinutes: 60, categoryId: "spa", subcat: "Spa & Massages" },
  { id: "spa-reflexology", name: "Reflexology", price: 49000, duration: "60 min", durationMinutes: 60, categoryId: "spa", subcat: "Spa & Massages" },
  { id: "spa-relax-me-time", name: "Relax Me Time", price: 60000, duration: "80 min", durationMinutes: 80, categoryId: "spa", subcat: "Spa & Massages" },
  { id: "spa-energissant-sportif", name: "Energissant Sportif", price: 49000, duration: "60 min", durationMinutes: 60, categoryId: "spa", subcat: "Spa & Massages" },
  { id: "spa-black-relief-dos", name: "Black Relief Dos", price: 29000, duration: "30 min", durationMinutes: 30, categoryId: "spa", subcat: "Spa & Massages" },
  { id: "spa-de-stress-relaxant", name: "De Stress Relaxant", price: 45000, duration: "55 min", durationMinutes: 55, categoryId: "spa", subcat: "Spa & Massages" },
  { id: "spa-deep-tonique", name: "Deep Tonique", price: 49000, duration: "60 min", durationMinutes: 60, categoryId: "spa", subcat: "Spa & Massages" },
  { id: "spa-steam-time", name: "Steam Time", price: 40000, duration: "50 min", durationMinutes: 50, categoryId: "spa", subcat: "Spa & Massages" },
  { id: "spa-express-head-neck-shoulder", name: "Express Head Neck Shoulder", price: 29000, duration: "30 min", durationMinutes: 30, categoryId: "spa", subcat: "Spa & Massages" },
  { id: "spa-magic-vip-rituel-repair-and-reset", name: "Magic VIP Rituel Repair and Reset", price: 140000, duration: "190 min", durationMinutes: 190, categoryId: "spa", subcat: "Spa & Massages" },
  { id: "spa-pure-delice", name: "Pure Delice", price: 90000, duration: "130 min", durationMinutes: 130, categoryId: "spa", subcat: "Spa & Massages" },

  // Soins Visage (7)
  { id: "soin-du-visage-golden-vip-facial", name: "Golden VIP Facial", price: 80000, duration: "90 min", durationMinutes: 90, categoryId: "soin-du-visage", subcat: "Soins Visage" },
  { id: "soin-du-visage-face-lift-and-glow-raffermissant-lift-et-glow", name: "Face Lift and Glow - Raffermissant Lift et Glow", price: 59000, duration: "70 min", durationMinutes: 70, categoryId: "soin-du-visage", subcat: "Soins Visage" },
  { id: "soin-du-visage-glow-me-facial", name: "Glow Me Facial", price: 49000, duration: "60 min", durationMinutes: 60, categoryId: "soin-du-visage", subcat: "Soins Visage" },
  { id: "soin-du-visage-acne-treatment", name: "Acne Treatment", price: 49000, duration: "60 min", durationMinutes: 60, categoryId: "soin-du-visage", subcat: "Soins Visage" },
  { id: "soin-du-visage-hydrate-me-and-restore", name: "Hydrate Me and Restore", price: 54000, duration: "60 min", durationMinutes: 60, categoryId: "soin-du-visage", subcat: "Soins Visage" },
  { id: "soin-du-visage-hydrafacial-deep-clean", name: "Hydrafacial Deep Clean", price: 55000, duration: "75 min", durationMinutes: 75, categoryId: "soin-du-visage", subcat: "Soins Visage" },
  { id: "soin-du-visage-detox-me-facial", name: "Detox Me Facial", price: 45000, duration: "60 min", durationMinutes: 60, categoryId: "soin-du-visage", subcat: "Soins Visage" },

  // Épilation (12)
  { id: "epilation-epilation-menton", name: "Épilation Menton", price: 6000, duration: "25 min", durationMinutes: 25, categoryId: "epilation", subcat: "Épilation" },
  { id: "epilation-pack-epilations-completes", name: "Pack Épilations Complètes", price: 45000, duration: "60 min", durationMinutes: 60, categoryId: "epilation", subcat: "Épilation" },
  { id: "epilation-epilation-bras", name: "Épilation Bras", price: 9000, duration: "25 min", durationMinutes: 25, categoryId: "epilation", subcat: "Épilation" },
  { id: "epilation-epilation-jambes-completes", name: "Épilation Jambes Complètes", price: 14000, duration: "45 min", durationMinutes: 45, categoryId: "epilation", subcat: "Épilation" },
  { id: "epilation-epilation-maillot-integral", name: "Épilation Maillot Intégral", price: 17000, duration: "45 min", durationMinutes: 45, categoryId: "epilation", subcat: "Épilation" },
  { id: "epilation-epilation-demi-jambes", name: "Épilation Demi - Jambes", price: 11000, duration: "25 min", durationMinutes: 25, categoryId: "epilation", subcat: "Épilation" },
  { id: "epilation-epilation-duvet-ventre", name: "Épilation Duvet/ventre", price: 7000, duration: "25 min", durationMinutes: 25, categoryId: "epilation", subcat: "Épilation" },
  { id: "epilation-epilation-maillot-bresilien", name: "Épilation Maillot Brésilien", price: 12000, duration: "25 min", durationMinutes: 25, categoryId: "epilation", subcat: "Épilation" },
  { id: "epilation-epilation-aisselles", name: "Épilation Aisselles", price: 7000, duration: "25 min", durationMinutes: 25, categoryId: "epilation", subcat: "Épilation" },
  { id: "epilation-epilation-sourcils", name: "Épilation Sourcils", description: "Nettoyage des sourcils", price: 7000, duration: "15 min", durationMinutes: 15, categoryId: "epilation", subcat: "Épilation" },
  { id: "epilation-soin-vagifacial", name: "Soin Vagifacial", price: 34000, duration: "35 min", durationMinutes: 35, categoryId: "epilation", subcat: "Épilation" },
  { id: "epilation-soin-vagifacial-maillot-integral", name: "Soin Vagifacial+ Maillot Integral", price: 49000, duration: "60 min", durationMinutes: 60, categoryId: "epilation", subcat: "Épilation" },

  // Mini & Co — Coiffure (8)
  { id: "mini-co-mini-hair-treat-mini-co", name: "Mini Hair Treat (Mini&co)", description: "Un instant féerique pour les cheveux de votre princesse. On commence par un démêlage délicat en 4 parties, tout en douceur, pour ne pas faire mal aux petites filles.", price: 28000, duration: "90 min", durationMinutes: 90, categoryId: "mini-co-hair", subcat: "Mini & Co — Coiffure" },
  { id: "mini-co-mini-hair-treat-braids-mini-co", name: "Mini Hair Treat+ Braids (Mini&co)", description: "Un rituel complet pour des cheveux choyés et un style qui dure. Après le démêlage doux en 4 parties, on offre un shampoing tendre, un masque nourrissant, et un soin protecteur thermique avant un séchage léger.", price: 46000, duration: "180 min", durationMinutes: 180, categoryId: "mini-co-hair", subcat: "Mini & Co — Coiffure" },
  { id: "mini-co-supplement-coiffure-enfant", name: "Supplement Coiffure Enfant", price: 10000, duration: "50 min", durationMinutes: 50, categoryId: "mini-co-hair", subcat: "Mini & Co — Coiffure" },
  { id: "mini-co-definition-boucles-enfant", name: "Definition Boucles Enfant", price: 9000, duration: "30 min", durationMinutes: 30, categoryId: "mini-co-hair", subcat: "Mini & Co — Coiffure" },
  { id: "mini-co-defaire-tresses-enfant", name: "Defaire Tresses Enfant", price: 5000, duration: "45 min", durationMinutes: 45, categoryId: "mini-co-hair", subcat: "Mini & Co — Coiffure" },
  { id: "mini-co-coupe-pointes-enfants-mini-co", name: "Coupe Pointes Enfants (Mini&co)", price: 9000, duration: "25 min", durationMinutes: 25, categoryId: "mini-co-hair", subcat: "Mini & Co — Coiffure" },
  { id: "mini-co-supplement-brushing-enfant", name: "Supplement Brushing Enfant", description: "Occasions spéciales uniquement.", price: 9000, duration: "60 min", durationMinutes: 60, categoryId: "mini-co-hair", subcat: "Mini & Co — Coiffure" },
  { id: "mini-co-supplements-tresses-enfants-mini-and-co", name: "Suppléments Tresses Enfants Mini and Co", description: "Sans mèches, 90 min max.", price: 19000, duration: "60 min", durationMinutes: 60, categoryId: "mini-co-hair", subcat: "Mini & Co — Coiffure" },

  // Mini & Co — Spa (2)
  { id: "mini-co-mini-jely-manucure", name: "Mini Jelly Manucure", description: "Un moment ludique et tout doux pour les petites mains. Les doigts plongent dans un bain jelly coloré, à la texture amusante et sans parfum, pour une expérience sûre et agréable.", price: 12000, duration: "30 min", durationMinutes: 30, categoryId: "mini-co-spa", subcat: "Mini & Co — Spa" },
  { id: "mini-co-mini-cutie-pedicure", name: "Mini Cutie Pédicure", price: 15000, duration: "35 min", durationMinutes: 35, categoryId: "mini-co-spa", subcat: "Mini & Co — Spa" },
];

/** Flat product catalogue for the "Produits" tab (retail items, not prestations). */
export const PRODUCTS: Service[] = [
  { id: "prd-shampoing", name: "Shampoing hydratant", price: 6000, categoryId: "produits", subcat: "Produits" },
  { id: "prd-apres-shampoing", name: "Après-shampoing réparateur", price: 6500, categoryId: "produits", subcat: "Produits" },
  { id: "prd-serum", name: "Sérum capillaire", price: 8000, categoryId: "produits", subcat: "Produits" },
  { id: "prd-gel-coiffant", name: "Gel coiffant", price: 4000, categoryId: "produits", subcat: "Produits" },
  { id: "prd-huile-argan", name: "Huile d'argan", price: 7000, categoryId: "produits", subcat: "Produits" },
  { id: "prd-vernis", name: "Vernis semi-permanent", price: 5000, categoryId: "produits", subcat: "Produits" },
];

function countFor(categoryId: string) {
  return SERVICES.filter((service) => service.categoryId === categoryId).length;
}

export type ServiceGroup = { subcat: string; services: Service[] };

/** Groups a flat service list into subcategory sections (first-appearance order) — used by the
 * "categories" landing step to show the full browsable catalogue under the category grid,
 * matching the Figma capture where the grid isn't the only way to reach a service. */
export function groupServicesBySubcat(services: Service[]): ServiceGroup[] {
  const order: string[] = [];
  const map = new Map<string, Service[]>();
  for (const service of services) {
    if (!map.has(service.subcat)) {
      map.set(service.subcat, []);
      order.push(service.subcat);
    }
    map.get(service.subcat)!.push(service);
  }
  return order.map((subcat) => ({ subcat, services: map.get(subcat)! }));
}

export const CATEGORIES: Category[] = [
  { id: "coiffure", name: "Coiffure", icon: "coiffure", bg: "bg-[var(--brand-rose-soft)]", count: countFor("coiffure") },
  { id: "manucure-pedicure", name: "Manucure / Pédicure", icon: "manucure", bg: "bg-[var(--brand-lilac)]/30", count: countFor("manucure-pedicure") },
  { id: "onglerie", name: "Onglerie", icon: "onglerie", bg: "bg-[var(--color-gray-100)]", count: countFor("onglerie") },
  { id: "spa", name: "Spa & Massages", icon: "spa", bg: "bg-[var(--pos-accent-dark-soft)]", count: countFor("spa") },
  { id: "soin-du-visage", name: "Soins Visage", icon: "visage", bg: "bg-[var(--brand-rose-soft)]", count: countFor("soin-du-visage") },
  { id: "epilation", name: "Épilation", icon: "epilation", bg: "bg-[var(--brand-lilac)]/30", count: countFor("epilation") },
  { id: "mini-co-hair", name: "Mini & Co — Coiffure", icon: "mini", bg: "bg-[var(--color-gray-100)]", count: countFor("mini-co-hair") },
  { id: "mini-co-spa", name: "Mini & Co — Spa", icon: "mini", bg: "bg-[var(--pos-accent-dark-soft)]", count: countFor("mini-co-spa") },
];

export const CLIENTS: Client[] = [
  { id: "cli-awa-sarr", initial: "AS", name: "Awa Sarr", phone: "+221784455661", points: 180 },
  { id: "cli-fatou-camara", initial: "FC", name: "Fatou Camara", phone: "+221771122334", points: 0 },
  { id: "cli-coumba-thiam", initial: "CT", name: "Coumba Thiam", phone: "+221765544332", points: 75 },
  { id: "cli-bineta-diagne", initial: "BD", name: "Bineta Diagne", phone: "+221709988776", points: 25 },
  { id: "cli-mariam-kane", initial: "MK", name: "Mariam Kane", phone: "+221781234567", points: 0 },
  {
    id: "cli-awa-niang",
    initial: "AN",
    name: "Awa Niang",
    phone: "+221 78 100 00 05",
    points: 1175,
    badge: { label: "VIP", variant: "vip" },
  },
  {
    id: "cli-sokhna-ndiaye",
    initial: "SN",
    name: "Sokhna Ndiaye",
    phone: "+221 77 500 00 12",
    points: 620,
    badge: { label: "GOLD", variant: "gold" },
  },
];

// The logged-in cashier ("Propriétaire", per SALON.cashier below) always heads the list — cart
// lines default to them (see createCartItem) rather than an unassigned placeholder, matching the
// Figma capture where every new line already reads "✂ Propriétaire" until reassigned.
export const PRACTITIONERS: string[] = ["Propriétaire", "Fatou", "Bineta", "William", "Michelle", "Codou"];

export const PAYMENT_METHODS: { id: PaymentMethodId; label: string }[] = [
  { id: "wave", label: "Wave" },
  { id: "orange_money", label: "Orange Money" },
  { id: "especes", label: "Espèces" },
  { id: "carte", label: "Carte" },
];

export const SALON = {
  name: "Beauty and Co",
  area: "Almadies",
  address: "Route des Almadies, Dakar",
  phone: "+221 33 820 00 01",
  cashier: "Propriétaire",
};

export function formatFcfa(amount: number) {
  return `${Math.round(amount).toLocaleString("fr-FR")} F`;
}

/**
 * Fresh empty sale — used both for the first tab and every "+" click. `seq` (1-based) drives
 * the "Vente N" label and must be supplied by the caller (sales.length + 1, or 1 to reset) —
 * deliberately NOT a module-level counter, which under React Strict Mode's double-invocation
 * of state initializers produced a server/client hydration mismatch (SSR saw "Vente 1", the
 * client's doubled initializer call landed on "Vente 2"). `Date.now()` is safe here since it
 * only feeds the id (never rendered as text), giving uniqueness without affecting hydration.
 */
export function createSale(seq: number): Sale {
  return {
    id: `sale-${seq}-${Date.now()}`,
    name: `Vente ${seq}`,
    client: null,
    cart: [],
    giftCardCode: "",
    giftCardApplied: null,
    loyaltyPointsUsed: 0,
    managerCode: "",
    managerDiscountApplied: 0,
    paymentMethod: null,
    mixedPayment: false,
    mixedMethod2: null,
    mixedAmount1: "",
    mixedAmount2: "",
  };
}

export type SaleTotals = {
  subtotal: number;
  giftCardDiscount: number;
  managerDiscount: number;
  loyaltyDiscount: number;
  total: number;
};

export function computeTotals(sale: Sale): SaleTotals {
  const subtotal = sale.cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const giftCardDiscount = sale.giftCardApplied ? Math.min(sale.giftCardApplied.amount, subtotal) : 0;
  const managerDiscount = sale.managerDiscountApplied;
  const loyaltyDiscount = Math.floor(sale.loyaltyPointsUsed / 100) * 1000;
  const total = Math.max(0, subtotal - giftCardDiscount - managerDiscount - loyaltyDiscount);
  return { subtotal, giftCardDiscount, managerDiscount, loyaltyDiscount, total };
}
