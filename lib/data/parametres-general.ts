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
  initials: "PE",
  name: "Proprietaire Elite",
  role: "admin",
  company: "Beauty and Co",
};

export type SettingsCard = {
  key: string;
  title: string;
  subtitle: string;
  emoji: string;
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
  { key: "mon-profil", title: "Mon Profil", subtitle: "Informations personnelles", emoji: "👤", bg: "bg-[var(--brand-rose-soft)]" },
  { key: "gestion-utilisateurs", title: "Gestion Utilisateurs", subtitle: "Equipe, roles, acces", emoji: "👥", bg: "bg-[var(--core-brand-color-2)]" },
  { key: "gestion-services", title: "Gestion Services", subtitle: "Categories, prix, durees", emoji: "✂️", bg: "bg-[var(--brand-lilac)]/35", href: "/parametres/services" },
  { key: "gestion-produits", title: "Gestion Produits", subtitle: "Stock, prix, photos", emoji: "🧴", bg: "bg-[var(--pos-accent-dark-soft)]", href: "/parametres/produits" },
  { key: "photos-reference", title: "Photos de référence", subtitle: "Couleurs, formes, marques", emoji: "🖼️", bg: "bg-[var(--core-brand-color)]/55", href: "/parametres/photos-reference" },
  { key: "conseils-beaute", title: "Conseils beauté", subtitle: "Tips & cycles de votre conseillère", emoji: "💡", bg: "bg-[var(--color-gray-100)]", href: "/parametres/conseils-beaute" },
  { key: "tendances-soins", title: "Tendances soins", subtitle: "Vernis, soins cheveux, lissage, visage...", emoji: "✨", bg: "bg-[var(--brand-rose-soft)]" },
  { key: "gestion-stock-central", title: "Gestion Stock Central", subtitle: "Depot, transferts, demandes", emoji: "📦", bg: "bg-[var(--core-brand-color-2)]" },
  { key: "entreprises-salons", title: "Entreprises & Salons", subtitle: "Multi-entreprise, salons", emoji: "🏢", bg: "bg-[var(--brand-lilac)]/35", href: "/parametres/entreprises" },
  { key: "gestion-salon", title: "Gestion Salon", subtitle: "Horaires, fermetures", emoji: "🏠", bg: "bg-[var(--pos-accent-dark-soft)]" },
  { key: "notifications", title: "Notifications", subtitle: "Alertes et rappels", emoji: "🔔", bg: "bg-[var(--color-gray-100)]" },
  { key: "securite", title: "Securite", subtitle: "Code PIN, mot de passe", emoji: "🔒", bg: "bg-[var(--brand-rose-soft)]" },
  { key: "apparence", title: "Apparence", subtitle: "Langue, theme", emoji: "🎨", bg: "bg-[var(--core-brand-color-2)]" },
  { key: "aide-support", title: "Aide & Support", subtitle: "FAQ, contact", emoji: "❓", bg: "bg-[var(--brand-lilac)]/35" },
];

// --- Photos de référence -----------------------------------------------------------------

export type PhotoCategoryKey = "couleurs-ongles" | "formes-ongles" | "types-cheveux" | "marques-cheveux" | "boissons";

export type PhotoCategory = { key: PhotoCategoryKey; label: string; emoji: string };

export const PHOTO_CATEGORIES: PhotoCategory[] = [
  { key: "couleurs-ongles", label: "Couleurs ongles", emoji: "🎨" },
  { key: "formes-ongles", label: "Formes ongles", emoji: "💅" },
  { key: "types-cheveux", label: "Types de cheveux", emoji: "👑" },
  { key: "marques-cheveux", label: "Marques cheveux", emoji: "🧴" },
  { key: "boissons", label: "Boissons", emoji: "☕" },
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
    { label: "Rouge corail", filled: false },
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
    salons: [],
  },
];
