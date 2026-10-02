import { GiftCardQueue } from "@/components/journee/gift-card-queue";

/**
 * Cartes cadeaux à préparer (ADR 0012) — la file complète des cartes achetées en version
 * imprimée. Item de sidebar depuis l'ADR 0040 ; l'alerte « Carte cadeau à imprimer » de l'Accueil y mène aussi.
 */
export default function CartesCadeauxPage() {
  return <GiftCardQueue />;
}
