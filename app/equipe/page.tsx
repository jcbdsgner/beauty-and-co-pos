import { PlanningBoard } from "@/components/planning/planning-board";

/**
 * Équipe — la sous-page est fondue dans le Planning (docs/adr/0005) : le roster est le rail de
 * légende du tableau. Cette route ouvre le Planning groupé « Toute l'équipe ».
 */
export default function EquipePage() {
  return <PlanningBoard initialGrouping="equipe" />;
}
