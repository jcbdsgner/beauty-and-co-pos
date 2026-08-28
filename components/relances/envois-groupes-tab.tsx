"use client";

import { useState } from "react";
import { Send, Pencil, Trash2 } from "lucide-react";
import { Board, Lane, FlipChip, BoardEmpty, type ChipTone } from "@/components/ui/board";
import { Button } from "@/components/ui/atoms/button";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { Alert } from "@/components/ui/molecules/alert";
import { Toast } from "@/components/ui/molecules/toast";
import { CampaignFormDialog, type CampaignDraft } from "@/components/relances/campaign-form-dialog";
import { CAMPAIGNS } from "@/lib/data/campagnes";
import { useAppData } from "@/components/providers/app-data-provider";
import type { Campaign, CampaignStatus } from "@/lib/data/types";

const STATUS: Record<CampaignStatus, { value: string; tone: ChipTone }> = {
  brouillon: { value: "Brouillon", tone: "neutral" },
  planifiee: { value: "Planifiée", tone: "act" },
  envoyee: { value: "Envoyée", tone: "done" },
};

let localId = 0;
const nextId = () => `camp-local-${Date.now()}-${(localId += 1)}`;

/** Deterministic simulated failure count — a repeated "Envoyer" on the same title always shows the
 *  same demo report ("rapport par destinataire, jamais un statut global qui masque des échecs"). */
function simulateFailures(title: string, audienceSize: number) {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return Math.min(audienceSize, h % 4);
}

/** Envois groupés — le volet qui porte l'objet Campagne (message à une audience calculée). */
export function EnvoisGroupesTab() {
  const { clients } = useAppData();
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [reports, setReports] = useState<Record<string, { sent: number; failed: number }>>({});
  const [toast, setToast] = useState<string | null>(null);

  function audienceSize(label: string) {
    if (label === "VIP & Gold") return clients.filter((c) => c.tier === "vip" || c.tier === "gold").length;
    return clients.length;
  }

  function handleSubmitCampaign(draft: CampaignDraft) {
    if (editing) {
      setCampaigns((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...draft } : c)));
      setToast("Campagne mise à jour.");
    } else {
      setCampaigns((prev) => [{ id: nextId(), status: "brouillon", ...draft }, ...prev]);
      setToast("Campagne créée.");
    }
    setFormOpen(false);
    setEditing(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setCampaigns((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setToast("Campagne supprimée.");
    setDeleteTarget(null);
  }

  function handleSend(c: Campaign) {
    const size = audienceSize(c.audienceLabel);
    const failed = simulateFailures(c.title, size);
    setReports((prev) => ({ ...prev, [c.id]: { sent: size - failed, failed } }));
    setCampaigns((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: "envoyee" } : x)));
    setToast(`Campagne envoyée à ${size} cliente${size > 1 ? "s" : ""}.`);
  }

  function retryFailed(c: Campaign) {
    const report = reports[c.id];
    if (!report) return;
    setReports((prev) => ({ ...prev, [c.id]: { sent: report.sent + report.failed, failed: 0 } }));
    setToast("Envois relancés.");
  }

  return (
    <div className="flex flex-col gap-6">
      <Board
        legend={`${campaigns.length} campagne${campaigns.length > 1 ? "s" : ""}`}
        legendRight={
          <Button size="sm" variant="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
            + Créer
          </Button>
        }
      >
        {campaigns.length === 0 ? (
          <BoardEmpty title="Aucune campagne" hint="Créez un premier envoi groupé pour vos clientes." />
        ) : (
          campaigns.map((c) => {
            const report = reports[c.id];
            return (
              <div key={c.id}>
                <Lane
                  title={c.title}
                  meta={
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[var(--brand-taupe-muted)]">Audience · {c.audienceLabel}</span>
                      <span className="line-clamp-1">{c.message}</span>
                    </span>
                  }
                  chip={<FlipChip value={STATUS[c.status].value} tone={STATUS[c.status].tone} />}
                  className="items-start py-3"
                  actions={
                    <>
                      {c.status !== "envoyee" && (
                        <Button size="sm" variant="dark" icon={<Send className="size-4" />} onClick={() => handleSend(c)}>
                          Envoyer
                        </Button>
                      )}
                      <Button size="sm" variant="outline" icon={<Pencil className="size-4" />} onClick={() => { setEditing(c); setFormOpen(true); }}>
                        Modifier
                      </Button>
                      <IconButton
                        aria-label={`Supprimer ${c.title}`}
                        onClick={() => setDeleteTarget(c)}
                        className="size-11 rounded-full text-[var(--color-error)] transition active:scale-90 hover:bg-[var(--color-error-soft)]"
                      >
                        <Trash2 className="size-4" />
                      </IconButton>
                    </>
                  }
                />
                {report && report.failed > 0 && (
                  <div className="border-b border-[var(--board-groove)] px-4 py-3">
                    <Alert
                      tone="warning"
                      title={`${report.sent} envoyés, ${report.failed} échoués`}
                      description="Certains messages n'ont pas pu être délivrés."
                      action={
                        <Button size="sm" variant="outline" onClick={() => retryFailed(c)}>
                          Réessayer les échecs
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </Board>

      <CampaignFormDialog
        open={formOpen}
        editing={editing}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={handleSubmitCampaign}
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
