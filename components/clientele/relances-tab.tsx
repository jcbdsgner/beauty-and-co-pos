"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Mail, CalendarCheck, X, ShieldCheck, History as HistoryIcon } from "lucide-react";
import { Card } from "@/components/ui/atoms/card";
import { HeroNumber } from "@/components/ui/atoms/hero-number";
import { Button } from "@/components/ui/atoms/button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { Badge, type BadgeVariant } from "@/components/ui/atoms/badge";
import { Tabs } from "@/components/ui/molecules/tabs";
import { EmptyState } from "@/components/ui/molecules/empty-state";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { Toast } from "@/components/ui/molecules/toast";
import { RelanceCard, type RelanceAction } from "@/components/ui/molecules/relance-card";
import { useAppData } from "@/components/providers/app-data-provider";
import { RELANCES } from "@/lib/data/relances";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { styleById } from "@/lib/data/styles";
import type { Relance, RelanceStatus, RelanceType } from "@/lib/data/types";

type Batch = { id: string; sentAt: string; count: number; relanceIds: string[] };

// Singular forms for the "1 anniversaire" hint count — TYPE_LABEL below stays plural for the
// eyebrow section headings, which always read as a category name regardless of count.
const TYPE_LABEL_SINGULAR: Record<RelanceType, string> = {
  anniversaire: "anniversaire",
  fidelite: "fidélité",
  soins: "soin & rendez-vous",
  reconquete: "reconquête",
  recommandation: "recommandation",
};

const TYPE_LABEL: Record<RelanceType, string> = {
  anniversaire: "Anniversaires",
  fidelite: "Fidélité",
  soins: "Soins & rendez-vous",
  reconquete: "Reconquête",
  recommandation: "Recommandations",
};

const TYPE_ORDER: RelanceType[] = ["anniversaire", "soins", "fidelite", "reconquete", "recommandation"];

const STATUS_BADGE: Record<RelanceStatus, { label: string; variant: BadgeVariant } | null> = {
  en_attente: null,
  en_attente_autorisation: { label: "Autorisation requise", variant: "warning" },
  autorisee: { label: "Autorisée", variant: "info" },
  envoyee: { label: "Envoyée", variant: "success" },
  ignoree: { label: "Ignorée", variant: "neutral" },
};

function isActionable(status: RelanceStatus) {
  return status === "en_attente" || status === "autorisee";
}

/** True if `client`'s birthday (month/day) falls within the next `days` days, today excluded. */
function birthdayWithinDays(birthday: string | undefined, days: number) {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) next.setFullYear(next.getFullYear() + 1);
  const diffDays = Math.round((next.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000);
  return diffDays > 0 && diffDays <= days;
}

function isBirthdayToday(birthday: string | undefined) {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  return bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate();
}

/**
 * Relances (ex-Suivi) tab. Relance status ("envoyée/ignorée/autorisée") and tournée history are
 * kept in local component state — there is intentionally no shared mutation slice for this in
 * app-data-provider yet (see task brief), so nothing here persists past a refresh.
 */
export function RelancesTab() {
  const { clients } = useAppData();
  const [relances, setRelances] = useState<Relance[]>(RELANCES);
  const [subTab, setSubTab] = useState("aujourdhui");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; action?: { label: string; onClick: () => void } } | null>(null);
  // Snapshot of statuses right before the last individual action, keyed by relance id — powers "Annuler".
  const [undoSnapshots, setUndoSnapshots] = useState<Record<string, RelanceStatus>>({});

  const clientFor = (clientId: string) => clients.find((c) => c.id === clientId);

  const buckets = useMemo(() => {
    const today: Relance[] = [];
    const upcoming: Relance[] = [];
    const history: Relance[] = [];

    for (const r of relances) {
      if (!isActionable(r.status) && r.status !== "en_attente_autorisation") {
        history.push(r);
        continue;
      }
      if (r.type === "anniversaire") {
        const client = clientFor(r.clientId);
        if (isBirthdayToday(client?.birthday)) today.push(r);
        else if (birthdayWithinDays(client?.birthday, 14)) upcoming.push(r);
        else today.push(r); // no birthday on file — treat as due today rather than hiding it
      } else {
        today.push(r);
      }
    }
    return { today, upcoming, history };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relances, clients]);

  const todayCountByType = useMemo(() => {
    const counts: Partial<Record<RelanceType, number>> = {};
    for (const r of buckets.today) counts[r.type] = (counts[r.type] ?? 0) + 1;
    return counts;
  }, [buckets.today]);

  const actionableToday = buckets.today.filter((r) => isActionable(r.status));

  function setStatus(id: string, status: RelanceStatus, previous: RelanceStatus) {
    setUndoSnapshots((prev) => ({ ...prev, [id]: previous }));
    setRelances((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  function undo(id: string) {
    const previous = undoSnapshots[id];
    if (previous === undefined) return;
    setRelances((prev) => prev.map((r) => (r.id === id ? { ...r, status: previous } : r)));
  }

  function act(relance: Relance, next: RelanceStatus, toastMessage: string) {
    const previous = relance.status;
    setStatus(relance.id, next, previous);
    setToast({ message: toastMessage, action: { label: "Annuler", onClick: () => undo(relance.id) } });
  }

  function buildActions(r: Relance): RelanceAction[] {
    const client = clientFor(r.clientId);
    const actions: RelanceAction[] = [];

    if (r.status === "en_attente_autorisation") {
      actions.push({
        label: "Autoriser la remise",
        icon: <ShieldCheck className="size-4" />,
        variant: "dark",
        onClick: () => act(r, "autorisee", `Remise autorisée pour ${client ? clientFullName(client) : "la cliente"}`),
      });
      return actions;
    }

    const channel = client?.whatsapp ?? client?.phone;
    if (channel) {
      actions.push({
        label: "WhatsApp",
        icon: <MessageCircle className="size-4" />,
        variant: "success",
        onClick: () => act(r, "envoyee", `Message envoyé à ${client ? clientFullName(client) : "la cliente"}`),
      });
    }
    if (client?.email) {
      actions.push({
        label: "Email",
        icon: <Mail className="size-4" />,
        variant: "info",
        onClick: () => act(r, "envoyee", `Email envoyé à ${client ? clientFullName(client) : "la cliente"}`),
      });
    }
    if (r.type === "anniversaire" || r.type === "soins") {
      actions.push({
        label: "RDV pris",
        icon: <CalendarCheck className="size-4" />,
        variant: "brand",
        onClick: () => act(r, "envoyee", `Marqué « RDV pris » pour ${client ? clientFullName(client) : "la cliente"}`),
      });
    }
    actions.push({
      label: "Ignorer",
      icon: <X className="size-4" />,
      variant: "outline",
      onClick: () => act(r, "ignoree", `Carte ignorée pour ${client ? clientFullName(client) : "la cliente"}`),
    });
    return actions;
  }

  function renderCard(r: Relance) {
    const client = clientFor(r.clientId);
    if (!client) return null;
    const style = r.styleId ? styleById(r.styleId) : undefined;
    const statusBadge = STATUS_BADGE[r.status];
    let context = TYPE_LABEL[r.type];
    if (r.type === "reconquete" && r.discountLabel) context += ` · ${r.discountLabel}`;
    if (r.type === "recommandation" && style) context += ` · ${style.name}`;
    if (r.lateDays) context += ` · il y a ${r.lateDays} j`;

    return (
      <RelanceCard
        key={r.id}
        initial={clientInitial(client)}
        name={clientFullName(client)}
        context={context}
        message={r.message}
        statusLabel={statusBadge?.label}
        statusVariant={statusBadge?.variant}
        actions={isActionable(r.status) || r.status === "en_attente_autorisation" ? buildActions(r) : []}
      />
    );
  }

  function renderGroupedList(list: Relance[], emptySubtitle: string) {
    if (list.length === 0) {
      return <EmptyState icon={<HistoryIcon />} title="Rien à afficher ici" subtitle={emptySubtitle} />;
    }
    return (
      <div className="flex flex-col gap-6">
        {TYPE_ORDER.map((type) => {
          const items = list.filter((r) => r.type === type);
          if (items.length === 0) return null;
          return (
            <div key={type} className="flex flex-col gap-3">
              <FieldLabel>{TYPE_LABEL[type]}</FieldLabel>
              <div className="flex flex-col gap-3">{items.map(renderCard)}</div>
            </div>
          );
        })}
      </div>
    );
  }

  function handleValiderEnvoyer() {
    const ids = actionableToday.map((r) => r.id);
    setUndoSnapshots((prev) => {
      const next = { ...prev };
      for (const r of actionableToday) next[r.id] = r.status;
      return next;
    });
    setRelances((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, status: "envoyee" } : r)));
    const batch: Batch = { id: `batch-${Date.now()}`, sentAt: new Date().toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }), count: ids.length, relanceIds: ids };
    setBatches((prev) => [batch, ...prev]);
    setConfirmOpen(false);
    setToast({
      message: `Tournée envoyée à ${ids.length} cliente${ids.length > 1 ? "s" : ""}`,
      action: {
        label: "Annuler",
        onClick: () => {
          setRelances((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, status: "en_attente" } : r)));
          setBatches((prev) => prev.filter((b) => b.id !== batch.id));
        },
      },
    });
  }

  const historyResolved = buckets.history;

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex items-center justify-between gap-6 p-6">
        <HeroNumber
          label="Tournée du matin"
          value={String(actionableToday.length)}
          hint={
            Object.entries(todayCountByType).length > 0
              ? Object.entries(todayCountByType)
                  .map(([type, count]) => {
                    const singular = TYPE_LABEL_SINGULAR[type as RelanceType];
                    const plural = count > 1 && type !== "fidelite" && type !== "reconquete" ? `${singular}s` : singular;
                    return `${count} ${plural}`;
                  })
                  .join(" · ")
              : "Aucune carte à traiter aujourd'hui"
          }
        />
        <Button variant="dark" disabled={actionableToday.length === 0} onClick={() => setConfirmOpen(true)}>
          Valider &amp; envoyer
        </Button>
      </Card>

      <Tabs
        value={subTab}
        onChange={setSubTab}
        items={[
          { value: "aujourdhui", label: "Aujourd'hui", content: renderGroupedList(buckets.today, "Aucune relance en attente pour aujourd'hui.") },
          { value: "avenir", label: "À venir", content: renderGroupedList(buckets.upcoming, "Aucune échéance dans les 14 prochains jours.") },
          {
            value: "historique",
            label: "Historique",
            content: (
              <div className="flex flex-col gap-6">
                {batches.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <FieldLabel>Tournées envoyées</FieldLabel>
                    <div className="flex flex-col gap-2">
                      {batches.map((b) => (
                        <Card key={b.id} className="flex items-center justify-between p-4">
                          <span className="text-sm text-[var(--color-gray-700)] capitalize">{b.sentAt}</span>
                          <Badge variant="success">{b.count} envoyée{b.count > 1 ? "s" : ""}</Badge>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                {renderGroupedList(historyResolved, "Aucune action passée pour l'instant.")}
              </div>
            ),
          },
        ]}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Valider la tournée du matin ?"
        description={`${actionableToday.length} cliente${actionableToday.length > 1 ? "s" : ""} recevront leur message maintenant.`}
        confirmLabel="Valider & envoyer"
        confirmVariant="dark"
        onConfirm={handleValiderEnvoyer}
        onCancel={() => setConfirmOpen(false)}
      />

      <Toast message={toast?.message ?? null} action={toast?.action} onDismiss={() => setToast(null)} />
    </div>
  );
}
