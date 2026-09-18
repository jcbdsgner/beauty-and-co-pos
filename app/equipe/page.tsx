import { redirect } from "next/navigation";

/**
 * Équipe — n'a jamais été une sous-page distincte (ADR 0005) : le roster est le Planning. Depuis
 * la refonte totale du Planning (ADR 0020), il n'existe plus qu'un seul écran — cette route
 * redirige simplement vers lui.
 */
export default function EquipePage() {
  redirect("/planning");
}
