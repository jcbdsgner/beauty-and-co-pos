import { FieldLabel } from "@/components/ui/atoms/field-label";

const UPCOMING = ["Mon Profil", "Gestion Utilisateurs", "Tendances soins", "Gestion Salon", "Notifications", "Sécurité", "Apparence", "Aide & Support"];

/**
 * Prochainement — a single compact text list, deliberately no Card/Button/clickable affordance.
 * Per USERFLOW.md: "matérialise délibérément l'absence d'affordance plutôt que de simuler une
 * tuile cliquable qui ne mène nulle part." Replaces the old grid of 14 cards, 9 of them dead.
 */
export function ProchainementList() {
  return (
    <div className="border-t border-[var(--color-gray-200)] pt-6">
      <FieldLabel>Prochainement</FieldLabel>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 marker:text-[var(--color-gray-300)]">
        {UPCOMING.map((label) => (
          <li key={label} className="text-[15px] text-[var(--color-gray-500)]">
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
