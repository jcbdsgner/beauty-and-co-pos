"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/suivi/campaign-card";
import { CampaignEditDialog } from "@/components/suivi/campaign-edit-dialog";
import { MegaphoneIcon } from "@/components/suivi/icons";
import { campaigns as initialCampaigns, type Campaign } from "@/lib/data/suivi";

export default function CampagnesPage() {
  const [list, setList] = useState<Campaign[]>(initialCampaigns);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | undefined>(undefined);

  function handleCreate() {
    setEditingCampaign(undefined);
    setDialogOpen(true);
  }

  function handleEdit(campaign: Campaign) {
    setEditingCampaign(campaign);
    setDialogOpen(true);
  }

  function handleDelete(id: string) {
    setList((prev) => prev.filter((item) => item.id !== id));
  }

  function handleSave(savedCampaign: Campaign) {
    setList((prev) => {
      const exists = prev.some((item) => item.id === savedCampaign.id);
      if (exists) {
        return prev.map((item) => (item.id === savedCampaign.id ? savedCampaign : item));
      }
      return [savedCampaign, ...prev];
    });
    setDialogOpen(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/suivi"
        className="inline-flex w-fit items-center gap-1 text-xs font-semibold tracking-[0.1em] text-[var(--color-gray-500)] uppercase hover:text-[var(--color-gray-700)]"
      >
        ‹ Suivi
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]">
            <MegaphoneIcon className="size-5" />
          </span>
          <div>
            <h1 className="font-[var(--font-heading)] text-2xl text-[var(--color-gray-900)]">Campagnes</h1>
            <p className="mt-1 text-sm text-[var(--color-gray-500)]">
              Temps forts et jours creux — rédigées et validées par vous
            </p>
          </div>
        </div>
        <Button variant="brand" className="shrink-0" onClick={handleCreate}>
          + Créer
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {list.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--color-gray-300)] p-8 text-center text-sm text-[var(--color-gray-500)]">
            Aucune campagne pour le moment. Cliquez sur « + Créer » pour en rédiger une.
          </div>
        )}
      </div>

      <CampaignEditDialog
        open={dialogOpen}
        campaign={editingCampaign}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
