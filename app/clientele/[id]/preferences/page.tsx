"use client";

import { useParams } from "next/navigation";
import { PreferencesView } from "@/components/clientele/preferences-view";

export default function PreferencesPage() {
  const params = useParams<{ id: string }>();
  return <PreferencesView clientId={params.id} />;
}
