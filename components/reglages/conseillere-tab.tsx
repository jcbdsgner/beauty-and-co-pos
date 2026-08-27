"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/molecules/tabs";
import { PhotosReferenceTab } from "@/components/reglages/photos-reference-tab";
import { ConseilsCyclesTab } from "@/components/reglages/conseils-cycles-tab";

/** Contenu conseillère — fuses Photos de référence + Conseils beauté, the two feed the same client conversations at the counter or in a relance message. */
export function ConseillereTab() {
  const [tab, setTab] = useState("photos");

  return (
    <Tabs
      value={tab}
      onChange={setTab}
      items={[
        { value: "photos", label: "Photos de référence", content: <PhotosReferenceTab /> },
        { value: "conseils", label: "Conseils & cycles", content: <ConseilsCyclesTab /> },
      ]}
    />
  );
}
