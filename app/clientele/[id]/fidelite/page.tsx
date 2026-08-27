"use client";

import { useParams } from "next/navigation";
import { FideliteView } from "@/components/clientele/fidelite-view";

export default function FidelitePage() {
  const params = useParams<{ id: string }>();
  return <FideliteView clientId={params.id} />;
}
