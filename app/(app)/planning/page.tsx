import { PlanningClient } from "@/components/planning/planning-client";

type PlanningPageProps = {
  searchParams: Promise<{ vue?: string }>;
};

export default async function PlanningPage({ searchParams }: PlanningPageProps) {
  const { vue } = await searchParams;
  // "equipe" est déjà la vue par défaut ; on ne bascule sur "rdv" que si explicitement demandé.
  const defaultView = vue === "rdv" ? "rdv" : "equipe";

  return <PlanningClient defaultView={defaultView} />;
}
