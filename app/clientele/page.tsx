"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { Tabs } from "@/components/ui/molecules/tabs";
import { RepertoireTab } from "@/components/clientele/repertoire-tab";
import { RelancesTab } from "@/components/clientele/relances-tab";
import { CampagnesTab } from "@/components/clientele/campagnes-tab";
import { StylesTab } from "@/components/clientele/styles-tab";

/**
 * Clientèle — fusion des anciens Clients + Suivi + Campagnes + Lookbook en 4 onglets partageant
 * une même porte d'entrée, per USERFLOW.md's "Section Clientèle". Chaque onglet reste un job
 * story indépendant (cf. sa "Note de discipline de breadboard") — ils ne partagent que le
 * vocabulaire et cette coquille, pas un état commun.
 */
export default function ClientelePage() {
  const [tab, setTab] = useState("repertoire");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Clientèle" />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "repertoire", label: "Répertoire", content: <RepertoireTab /> },
          { value: "relances", label: "Relances", content: <RelancesTab /> },
          { value: "campagnes", label: "Campagnes", content: <CampagnesTab /> },
          { value: "styles", label: "Styles", content: <StylesTab /> },
        ]}
      />
    </div>
  );
}
