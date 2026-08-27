"use client";

import { useParams } from "next/navigation";
import { FicheClienteView } from "@/components/clientele/fiche-cliente-view";

export default function FicheClientePage() {
  const params = useParams<{ id: string }>();
  return <FicheClienteView clientId={params.id} />;
}
