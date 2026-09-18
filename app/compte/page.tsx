import { BoardHeader } from "@/components/ui/board";
import { PhotoSection } from "@/components/compte/photo-section";
import { PasswordSection } from "@/components/compte/password-section";
import { LogoutSection } from "@/components/compte/logout-section";

/**
 * Mon compte — les seuls écrans « moi » de l'app (il n'y a pas de section Réglages, voir ADR 0001).
 * Trois gestes seulement : photo de profil, mot de passe, déconnexion (ADR 0026).
 * Atteint depuis le menu identité du pied de sidebar. Tout est simulé, aucun compte réel.
 */
export default function ComptePage() {
  return (
    <div className="flex flex-col gap-7">
      <BoardHeader section="Compte" />
      <div className="flex flex-col gap-5">
        <PhotoSection />
        <PasswordSection />
        <LogoutSection />
      </div>
    </div>
  );
}
