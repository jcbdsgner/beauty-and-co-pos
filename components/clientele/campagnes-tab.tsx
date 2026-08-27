"use client";

import { useState } from "react";
import { Megaphone, Send, Pencil, Trash2 } from "lucide-react";
import { Toolbar } from "@/components/ui/organisms/toolbar";
import { Card } from "@/components/ui/atoms/card";
import { Badge, type BadgeVariant } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { EmptyState } from "@/components/ui/molecules/empty-state";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { Alert } from "@/components/ui/molecules/alert";
import { Toast } from "@/components/ui/molecules/toast";
import { CampaignFormDialog, type CampaignDraft } from "@/components/clientele/campaign-form-dialog";
import { CAMPAIGNS } from "@/lib/data/campagnes";
import { useAppData } from "@/components/providers/app-data-provider";
import type { Campaign, CampaignStatus } from "@/lib/data/types";

const STATUS_BADGE: Record<CampaignStatus, { label: string; variant: BadgeVariant }> = {
  brouillon: { label: "Brouillon", variant: "neutral" },
  planifiee: { label: "Planifiée", variant: "info" },
  envoyee: { label: "Envoyée", variant: "success" },
};

let localId = 0;
function nextId() {
  localId += 1;
  return `camp-local-${Date.now()}-${localId}`;
}

// Deterministic simulated failure count so a repeated "Envoyer" on the same title always shows
// the same demo report — illustrates the "rapport par destinataire, jamais un statut global qui
// masque des échecs" rule from USERFLOW.md without pretending a real send provider exists.
function simulateFailures(title: string, audienceSize: number) {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return Math.min(audienceSize, h % 4);
}

export function CampagnesTab() {
  const { clients } = useAppData();
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [reports, setReports] = useState<Record<string, { sent: number; failed: number }>>({});
  const [toast, setToast] = useState<string | null>(null);

  function audienceSize(audienceLabel: string) {
    if (audienceLabel === "VIP & Gold") return clients.filter((c) => c.tier === "vip" || c.tier === "gold").length;
    return clients.length;
  }

  function handleCreateOrEdit(draft: CampaignDraft) {
    if (editing) {
      setCampaigns((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...draft } : c)));
      setToast("Campagne mise à jour");
    } else {
      const campaign: Campaign = { id: nextId(), status: "brouillon", ...draft };
      setCampaigns((prev) => [campaign, ...prev]);
      setToast("Campagne créée");
    }
    setFormOpen(false);
    setEditing(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setCampaigns((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setToast("Campagne supprimée");
    setDeleteTarget(null);
  }

  function handleSend(campaign: Campaign) {
    const size = audienceSize(campaign.audienceLabel);
    const failed = simulateFailures(campaign.title, size);
    setReports((prev) => ({ ...prev, [campaign.id]: { sent: size - failed, failed } }));
    setCampaigns((prev) => prev.map((c) => (c.id === campaign.id ? { ...c, status: "envoyee" } : c)));
    setToast(`Campagne envoyée à ${size} cliente${size > 1 ? "s" : ""}`);
  }

  function handleRetryFailed(campaign: Campaign) {
    const report = reports[campaign.id];
    if (!report) return;
    setReports((prev) => ({ ...prev, [campaign.id]: { sent: report.sent + report.failed, failed: 0 } }));
    setToast("Envois relancés avec succès");
  }

  return (
    <div className="flex flex-col gap-6">
      <Toolbar
        action={
          <Button
            variant="brand"
            className="ml-auto"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            + Créer
          </Button>
        }
      />

      {campaigns.length === 0 ? (
        <EmptyState icon={<Megaphone />} title="Aucune campagne" subtitle="Créez votre première campagne pour vos clientes." />
      ) : (
        <div className="flex flex-col gap-4">
          {campaigns.map((c) => {
            const report = reports[c.id];
            return (
              <Card key={c.id} className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--color-gray-900)]">{c.title}</h3>
                      <Badge variant={STATUS_BADGE[c.status].variant}>{STATUS_BADGE[c.status].label}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--color-gray-500)]">{c.message}</p>
                    <p className="mt-2 text-xs font-semibold tracking-wide text-[var(--color-gray-400)] uppercase">Audience · {c.audienceLabel}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {c.status !== "envoyee" && (
                      <Button variant="dark" icon={<Send className="size-4" />} onClick={() => handleSend(c)}>
                        Envoyer
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      icon={<Pencil className="size-4" />}
                      onClick={() => {
                        setEditing(c);
                        setFormOpen(true);
                      }}
                    >
                      Modifier
                    </Button>
                    <IconButton
                      aria-label={`Supprimer ${c.title}`}
                      className="size-11 rounded-full text-[var(--color-error)] transition active:scale-90 active:bg-[var(--color-error-soft)] hover:bg-[var(--color-error-soft)]"
                      onClick={() => setDeleteTarget(c)}
                    >
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </div>

                {report && report.failed > 0 && (
                  <Alert
                    tone="warning"
                    title={`${report.sent} envoyés, ${report.failed} échoués`}
                    description="Certains messages n'ont pas pu être délivrés."
                    action={
                      <Button variant="outline" onClick={() => handleRetryFailed(c)}>
                        Réessayer les échecs
                      </Button>
                    }
                  />
                )}
              </Card>
            );
          })}
        </div>
      )}

      <CampaignFormDialog
        open={formOpen}
        editing={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleCreateOrEdit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer cette campagne ?"
        description={deleteTarget ? `« ${deleteTarget.title} » sera définitivement supprimée.` : undefined}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
