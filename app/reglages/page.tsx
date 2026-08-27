"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { Tabs } from "@/components/ui/molecules/tabs";
import { ServicesTab } from "@/components/reglages/services-tab";
import { ProduitsTab } from "@/components/reglages/produits-tab";
import { ConseillereTab } from "@/components/reglages/conseillere-tab";
import { EntreprisesTab } from "@/components/reglages/entreprises-tab";
import { ProchainementList } from "@/components/reglages/prochainement-list";

/**
 * Réglages — a tab bar of only real capabilities (Services / Produits / Contenu conseillère /
 * Entreprises & Salons), replacing the old hub of 14 cards, 9 of them dead. Per USERFLOW.md's
 * "Section Réglages" spec.
 */
export default function ReglagesPage() {
  const [tab, setTab] = useState("services");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Réglages" subtitle="Catalogue, contenu conseillère, entreprises et salons." />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "services", label: "Services", content: <ServicesTab /> },
          { value: "produits", label: "Produits", content: <ProduitsTab /> },
          { value: "conseillere", label: "Contenu conseillère", content: <ConseillereTab /> },
          { value: "entreprises", label: "Entreprises & Salons", content: <EntreprisesTab /> },
        ]}
      />

      <ProchainementList />
    </div>
  );
}
