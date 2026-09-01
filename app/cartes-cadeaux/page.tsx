import { GiftCardQueue } from "@/components/journee/gift-card-queue";

/**
 * Cartes cadeaux à préparer (ADR 0012) — la file complète des cartes achetées en version
 * imprimée. Drill-in de l'Accueil (cellule « Cartes à préparer »), pas un item de sidebar.
 */
export default function CartesCadeauxPage() {
  return <GiftCardQueue />;
}
