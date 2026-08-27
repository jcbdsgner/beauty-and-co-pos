"use client";

import { useState } from "react";
import {
  Printer,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Pencil,
  Sparkles as SparklesIcon,
  CreditCard,
  Sparkles,
  PiggyBank,
} from "lucide-react";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Badge, type BadgeVariant } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { Card } from "@/components/ui/atoms/card";
import { Textarea } from "@/components/ui/atoms/textarea";
import { StatTile, StatTileRow } from "@/components/ui/molecules/stat-tile";
import { EmptyState } from "@/components/ui/molecules/empty-state";
import { Toast } from "@/components/ui/molecules/toast";
import { DemoQrBlock } from "@/components/clientele/loyalty-card";
import { EditCoordonneesDialog } from "@/components/clientele/edit-coordonnees-dialog";
import { EditPreferencesDialog } from "@/components/clientele/edit-preferences-dialog";
import { StyleDetailDialog } from "@/components/clientele/style-detail-dialog";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { STYLES } from "@/lib/data/styles";
import { formatFcfa, cn } from "@/lib/utils";
import type { Style } from "@/lib/data/types";

const TIER_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  vip: { label: "VIP", variant: "vip" },
  gold: { label: "Gold", variant: "gold" },
  silver: { label: "Silver", variant: "silver" },
};

// No real recommendation engine exists yet — a small fixed slice of the Styles library stands in
// for "suggestions personnalisées", per the Fiche cliente's "Recommandations" section. Documented
// as a scope judgment call in the build report.
const RECOMMENDATION_COUNT = 3;

type FicheClienteViewProps = { clientId: string };

export function FicheClienteView({ clientId }: FicheClienteViewProps) {
  const { clients, updateClient, openNewTab } = useAppData();
  const client = clients.find((c) => c.id === clientId);

  const [editCoordonneesOpen, setEditCoordonneesOpen] = useState(false);
  const [editPreferencesOpen, setEditPreferencesOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [recommendedStyle, setRecommendedStyle] = useState<Style | null>(null);
  const [proposedIds, setProposedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  if (!client) {
    return (
      <EmptyState
        icon={<SparklesIcon />}
        title="Cette cliente est introuvable"
        subtitle="La fiche demandée n'existe pas ou a été supprimée."
        action={
          <Button href="/clientele" variant="outline">
            Retour au répertoire
          </Button>
        }
      />
    );
  }

  const recommendations = STYLES.slice(0, RECOMMENDATION_COUNT);

  function handleAddNote() {
    if (!client || !noteDraft.trim()) return;
    const stamp = new Date().toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    const entry = `[${stamp}] ${noteDraft.trim()}`;
    const next = client.internalNotes ? `${entry}\n\n${client.internalNotes}` : entry;
    updateClient(client.id, { internalNotes: next });
    setNoteDraft("");
  }

  function handlePropose(style: Style) {
    if (!client) return;
    setProposedIds((prev) => new Set(prev).add(style.id));
    setToast(`Suggestion « ${style.name} » proposée à ${clientFullName(client)}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={clientFullName(client)}
        backHref="/clientele"
        action={
          <Button variant="dark" onClick={() => openNewTab({ clientId: client.id })}>
            Nouvelle vente pour cette cliente
          </Button>
        }
      />

      {/* Identité */}
      <Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            initial={clientInitial(client)}
            size={72}
            className="bg-[var(--brand-rose-soft)] text-2xl font-semibold text-[var(--brand-taupe-muted)]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">{clientFullName(client)}</h2>
              {client.tier && <Badge variant={TIER_BADGE[client.tier].variant}>{TIER_BADGE[client.tier].label}</Badge>}
            </div>
            <p className="text-sm text-[var(--color-gray-500)]">
              Cliente depuis {new Date(client.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DemoQrBlock seed={client.id} size={72} />
          <div className="flex flex-col gap-2">
            <Button variant="outline" icon={<Printer className="size-4" />} onClick={() => window.print()}>
              Imprimer carte
            </Button>
            <div>
              <Button
                variant={client.whatsapp ? "success" : "outline"}
                icon={<MessageCircle className="size-4" />}
                disabled={!client.whatsapp}
                onClick={() => client.whatsapp && window.open(`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`, "_blank")}
                className="w-full"
              >
                WhatsApp
              </Button>
              {!client.whatsapp && <FieldLabel variant="plain" className="mt-1 font-normal">Aucun numéro WhatsApp enregistré</FieldLabel>}
            </div>
          </div>
        </div>
      </Card>

      {/* Coordonnées */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <FieldLabel>Coordonnées</FieldLabel>
          <IconButton
            aria-label="Modifier les coordonnées"
            className="size-11 rounded-full text-[var(--color-gray-500)] transition active:scale-90 active:bg-[var(--brand-rose-soft)] hover:bg-[var(--brand-rose-soft)]"
            onClick={() => setEditCoordonneesOpen(true)}
          >
            <Pencil className="size-4" />
          </IconButton>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <CoordonneeRow icon={<Phone className="size-4" />} label="Téléphone" value={client.phone} />
          <CoordonneeRow icon={<MessageCircle className="size-4" />} label="WhatsApp" value={client.whatsapp} />
          <CoordonneeRow icon={<Mail className="size-4" />} label="Email" value={client.email} />
          <CoordonneeRow icon={<Briefcase className="size-4" />} label="Profession" value={client.profession} />
          <CoordonneeRow icon={<MapPin className="size-4" />} label="Adresse" value={client.address} />
        </div>
      </Card>

      {/* Stats */}
      <StatTileRow>
        <StatTile value={client.totalVisits} label="Visites" />
        <StatTile value={formatFcfa(client.totalSpent)} label="Dépenses" />
        <StatTile value={client.points} label="Points" />
      </StatTileRow>

      {/* Abonnement — toujours rendue, état vide honnête (aucune donnée d'abonnement n'existe encore) */}
      <Card className="p-6">
        <FieldLabel className="mb-4">Abonnement</FieldLabel>
        <EmptyState icon={<CreditCard />} title="Aucun abonnement actif" subtitle="Cette cliente n'a pas d'abonnement en cours." className="py-8" />
      </Card>

      {/* Recommandations */}
      <Card className="p-6">
        <FieldLabel className="mb-4">Recommandations</FieldLabel>
        <div className="flex flex-col gap-3">
          {recommendations.map((style) => (
            <div key={style.id} className="flex items-center gap-3 rounded-2xl border border-[var(--color-gray-200)] p-3">
              <button
                type="button"
                onClick={() => setRecommendedStyle(style)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]">
                  <Sparkles className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-[var(--color-gray-900)]">{style.name}</span>
                  <span className="block text-sm text-[var(--color-gray-500)]">{formatFcfa(style.price)}</span>
                </span>
              </button>
              <Button
                variant="success"
                onClick={() => handlePropose(style)}
                disabled={proposedIds.has(style.id)}
                className="shrink-0"
              >
                {proposedIds.has(style.id) ? "Proposée" : "Proposer"}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Notes internes */}
      <Card className="p-6">
        <FieldLabel className="mb-4">Notes internes</FieldLabel>
        {client.internalNotes && (
          <div className="mb-3 max-h-40 overflow-y-auto rounded-xl bg-[var(--color-gray-50)] p-3 text-sm whitespace-pre-line text-[var(--color-gray-700)]">
            {client.internalNotes}
          </div>
        )}
        <Textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Ajouter une observation, une préférence exprimée en salon…" rows={3} />
        <Button variant="brand" onClick={handleAddNote} disabled={!noteDraft.trim()} className="mt-3">
          Ajouter une note
        </Button>
      </Card>

      {/* Préférences beauté */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <FieldLabel>Préférences beauté</FieldLabel>
          <IconButton
            aria-label="Modifier les préférences beauté"
            className="size-11 rounded-full text-[var(--color-gray-500)] transition active:scale-90 active:bg-[var(--brand-rose-soft)] hover:bg-[var(--brand-rose-soft)]"
            onClick={() => setEditPreferencesOpen(true)}
          >
            <Pencil className="size-4" />
          </IconButton>
        </div>
        {client.hairType || client.colorReference || client.skinNotes || client.preferencesNotes ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <PreferenceRow label="Type de cheveux" value={client.hairType} />
            <PreferenceRow label="Référence couleur" value={client.colorReference} />
            <PreferenceRow label="Notes peau" value={client.skinNotes} span />
            <PreferenceRow label="Préférences" value={client.preferencesNotes} span />
          </div>
        ) : (
          <EmptyState icon={<PiggyBank />} title="Aucune préférence enregistrée" subtitle="Renseignez le profil beauté de cette cliente." className="py-8" />
        )}
      </Card>

      <div className="flex justify-center pb-4">
        <Button href={`/clientele/${client.id}/fidelite`} variant="outline">
          Voir la carte de fidélité
        </Button>
      </div>

      <EditCoordonneesDialog open={editCoordonneesOpen} client={client} onClose={() => setEditCoordonneesOpen(false)} />
      <EditPreferencesDialog open={editPreferencesOpen} client={client} onClose={() => setEditPreferencesOpen(false)} />
      <StyleDetailDialog style={recommendedStyle} onClose={() => setRecommendedStyle(null)} />
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function CoordonneeRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-gray-100)] text-[var(--color-gray-500)]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-[var(--color-gray-400)] uppercase">{label}</p>
        <p className={cn("truncate text-sm", value ? "text-[var(--color-gray-900)]" : "text-[var(--color-gray-400)]")}>{value ?? "Non renseigné"}</p>
      </div>
    </div>
  );
}

function PreferenceRow({ label, value, span }: { label: string; value?: string; span?: boolean }) {
  if (!value) return null;
  return (
    <div className={span ? "col-span-2" : undefined}>
      <p className="text-xs font-semibold tracking-wide text-[var(--color-gray-400)] uppercase">{label}</p>
      <p className="mt-0.5 text-[var(--color-gray-800)]">{value}</p>
    </div>
  );
}
