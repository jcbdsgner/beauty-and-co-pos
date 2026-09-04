import { PlanningBoard } from "@/components/planning/planning-board";

/**
 * Équipe — plus de sous-page distincte : le roster est l'écran « Planning » du Planning (la
 * grille heures × praticiennes). Cette route ouvre le Planning directement sur cette bascule.
 */
export default function EquipePage() {
  return <PlanningBoard initialView="planning" />;
}
