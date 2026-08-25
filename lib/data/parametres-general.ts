import {
  Bell,
  Building2,
  CircleHelp,
  Coffee,
  Crown,
  Droplet,
  Hand,
  Image,
  Lightbulb,
  Lock,
  Package,
  Palette,
  Scissors,
  Sparkles,
  SprayCan,
  Store,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

// Mock data for the "Paramètres" hub, "Photos de référence" and "Entreprises & Salons"
// screens only (docs/figma-userflow-part2.md, sections 2 to 9). Other Paramètres sub-modules
// (services, produits, conseils beauté) keep their own data files.

export type SettingsProfile = {
  initials: string;
  name: string;
  role: string;
  company: string;
};

export const PARAMETRES_PROFILE: SettingsProfile = {
  initials: "P",
  name: "Propriétaire",
  role: "Admin",
  company: "Beauty and Co",
};

export type SettingsCard = {
  key: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  /** Tailwind background class for the icon pastille — brand tokens only, cycled for visual variety. */
  bg: string;
  /** Present only for cards with a real sub-page in this build. */
  href?: string;
};

// Row-major order so a 2-column grid reproduces the spec's two stated columns:
// left = Mon Profil, Gestion Services, Photos de référence, Tendances soins, Entreprises & Salons,
// Notifications, Apparence — right = Gestion Utilisateurs, Gestion Produits, Conseils beauté,
// Gestion Stock Central, Gestion Salon, Securite, Aide & Support.
export const SETTINGS_CARDS: SettingsCard[] = [
  { key: "mon-profil", title: "Mon Profil", subtitle: "Informations personnelles", icon: User, bg: "bg-[var(--brand-rose-soft)]" },
  { key: "gestion-utilisateurs", title: "Gestion Utilisateurs", subtitle: "Équipe, rôles, accès", icon: Users, bg: "bg-[var(--core-brand-color-2)]" },
  { key: "gestion-services", title: "Gestion Services", subtitle: "Catégories, prix, durées", icon: Scissors, bg: "bg-[var(--brand-lilac)]/35", href: "/parametres/services" },
  { key: "gestion-produits", title: "Gestion Produits", subtitle: "Stock, prix, photos", icon: SprayCan, bg: "bg-[var(--pos-accent-dark-soft)]", href: "/parametres/produits" },
  { key: "photos-reference", title: "Photos de référence", subtitle: "Couleurs, formes, marques", icon: Image, bg: "bg-[var(--core-brand-color)]/55", href: "/parametres/photos-reference" },
  { key: "conseils-beaute", title: "Conseils beauté", subtitle: "Tips & cycles de votre conseillère", icon: Lightbulb, bg: "bg-[var(--color-gray-100)]", href: "/parametres/conseils-beaute" },
  { key: "tendances-soins", title: "Tendances soins", subtitle: "Vernis, soins cheveux, lissage, visage...", icon: Sparkles, bg: "bg-[var(--brand-rose-soft)]" },
  { key: "gestion-stock-central", title: "Gestion Stock Central", subtitle: "Dépôt, transferts, demandes", icon: Package, bg: "bg-[var(--core-brand-color-2)]" },
  { key: "entreprises-salons", title: "Entreprises & Salons", subtitle: "Multi-entreprise, salons", icon: Building2, bg: "bg-[var(--brand-lilac)]/35", href: "/parametres/entreprises" },
  { key: "gestion-salon", title: "Gestion Salon", subtitle: "Horaires, fermetures", icon: Store, bg: "bg-[var(--pos-accent-dark-soft)]" },
  { key: "notifications", title: "Notifications", subtitle: "Alertes et rappels", icon: Bell, bg: "bg-[var(--color-gray-100)]" },
  { key: "securite", title: "Sécurité", subtitle: "Code PIN, mot de passe", icon: Lock, bg: "bg-[var(--brand-rose-soft)]" },
  { key: "apparence", title: "Apparence", subtitle: "Langue, thème", icon: Palette, bg: "bg-[var(--core-brand-color-2)]" },
  { key: "aide-support", title: "Aide & Support", subtitle: "FAQ, contact", icon: CircleHelp, bg: "bg-[var(--brand-lilac)]/35" },
];

// --- Photos de référence -----------------------------------------------------------------

export type PhotoCategoryKey = "couleurs-ongles" | "formes-ongles" | "types-cheveux" | "marques-cheveux" | "boissons";

export type PhotoCategory = { key: PhotoCategoryKey; label: string; icon: LucideIcon };

export const PHOTO_CATEGORIES: PhotoCategory[] = [
  { key: "couleurs-ongles", label: "Couleurs ongles", icon: Palette },
  { key: "formes-ongles", label: "Formes ongles", icon: Hand },
  { key: "types-cheveux", label: "Types de cheveux", icon: Crown },
  { key: "marques-cheveux", label: "Marques cheveux", icon: Droplet },
  { key: "boissons", label: "Boissons", icon: Coffee },
];

export type PhotoReferenceItem = {
  label: string;
  /** true = demo photo already uploaded (rendered as a filled swatch card); false = empty "Ajouter" slot. */
  filled: boolean;
  /** Representative colour for a filled item — demo photo content (an actual nail-polish shade), not a UI/brand colour. */
  swatch?: string;
};

function emptySlots(labels: string[]): PhotoReferenceItem[] {
  return labels.map((label) => ({ label, filled: false }));
}

export const PHOTO_REFERENCE_ITEMS: Record<PhotoCategoryKey, PhotoReferenceItem[]> = {
  "couleurs-ongles": [
    { label: "Rouge classique", filled: true, swatch: "#7c1d1d" },
    { label: "Rouge bordeaux", filled: true, swatch: "#5a1620" },
    { label: "Noir", filled: true, swatch: "#c81d25" },
    { label: "Rouge corail", filled: true, swatch: "#e0432b" },
    { label: "Nude", filled: false },
    { label: "Rose poudré", filled: false },
  ],
  "formes-ongles": emptySlots(["Amande", "Carré", "Carré arrondi", "Ovale", "Pointu", "Stiletto"]),
  "types-cheveux": emptySlots(["Naturel", "Lisse", "Bouclé", "Crépu", "Défrisé", "Tressé"]),
  boissons: emptySlots(["Eau", "Thé", "Café", "Café au lait", "Jus d'orange", "Bissap"]),
  "marques-cheveux": emptySlots(["Kérastase", "Mizani", "L'Oréal Professionnel", "Saryna Keys", "Olaplex", "Redken"]),
};

// --- Entreprises & Salons -----------------------------------------------------------------

export type Salon = {
  name: string;
  address: string;
  active: boolean;
};

export type Company = {
  key: string;
  name: string;
  slug: string;
  expandedDefault: boolean;
  salons: Salon[];
};

// Deux entreprises distinctes, qui se partagent l'emplacement Sea Plaza : Beauty and Co
// (Almadies + Sea Plaza) et Michele Ka (Sea Plaza uniquement, pas de salon Almadies).
export const COMPANIES: Company[] = [
  {
    key: "beauty-and-co",
    name: "Beauty and Co",
    slug: "beauty-and-co",
    expandedDefault: true,
    salons: [
      { name: "Almadies", address: "Route des Almadies, Dakar", active: true },
      { name: "Sea Plaza", address: "Sea Plaza, Corniche Ouest, Dakar", active: true },
    ],
  },
  {
    key: "michele-ka",
    name: "Michele Ka",
    slug: "michele-ka",
    expandedDefault: false,
    salons: [{ name: "Sea Plaza", address: "Sea Plaza, Corniche Ouest, Dakar", active: true }],
  },
];
