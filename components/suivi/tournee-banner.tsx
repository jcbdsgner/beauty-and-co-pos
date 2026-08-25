"use client";

import { Button } from "@/components/ui/button";
import { useSuiviValidation } from "@/components/suivi/suivi-validation-context";

type TourneeBannerProps = {
  messagesReady: number;
  toValidate: number;
  discounts15: number;
};

/**
 * Bandeau CTA "Tournée du matin" — aplat `--pos-accent-dark` (jamais de gradient, refusé
 * par le client). Quelques cercles décoratifs blancs à faible opacité apportent la texture
 * à la place du dégradé doré du Figma d'origine.
 *
 * L'état "envoyé" vient du contexte partagé `SuiviValidationProvider` : valider ici met aussi
 * à jour chaque carte "en attente de validation" plus bas dans la liste, pour que le feedback
 * ne se limite pas au bouton lui-même.
 */
export function TourneeBanner({ messagesReady, toValidate, discounts15 }: TourneeBannerProps) {
  const { sent, markSent } = useSuiviValidation();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[var(--pos-accent-dark)] p-6 text-white sm:p-8">
      <span aria-hidden className="pointer-events-none absolute -top-10 -right-6 size-40 rounded-full bg-white/10" />
      <span aria-hidden className="pointer-events-none absolute -bottom-14 right-24 size-28 rounded-full bg-white/10" />
      <span aria-hidden className="pointer-events-none absolute top-6 right-48 size-14 rounded-full bg-white/10" />

      <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-white/70 uppercase">Tournée du matin</p>
          <p className="mt-1 font-[var(--font-heading)] text-4xl leading-none">{messagesReady} messages prêts</p>
          <p className="mt-2 text-sm text-white/80" role="status">
            {sent ? "✓ Tournée envoyée avec succès" : `${toValidate} à valider · ${discounts15} remises -15 %`}
          </p>
        </div>
        <Button
          variant="brand"
          className="bg-white! text-[var(--pos-accent-dark)]! shrink-0"
          onClick={markSent}
          disabled={sent}
        >
          {sent ? "✓ Envoyé" : "✈ Valider & envoyer"}
        </Button>
      </div>
    </div>
  );
}
