"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Mail, CalendarCheck, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Board, Lane, FlipChip, Legend, BoardEmpty, ChipFilter, type ChipTone, type LaneSignal } from "@/components/ui/board";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { Toast } from "@/components/ui/molecules/toast";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { styleById } from "@/lib/data/styles";
import type { Relance, RelanceStatus, RelanceType } from "@/lib/data/types";

const TYPE_LABEL: Record<RelanceType, string> = {
  anniversaire: "Anniversaires",
  soins: "Soins & rendez-vous",
  fidelite: "Fidélité",
  reconquete: "Reconquête",
  recommandation: "Recommandations",
};
const TYPE_ORDER: RelanceType[] = ["anniversaire", "soins", "fidelite", "reconquete", "recommandation"];

const STATUS: Record<RelanceStatus, { value: string; tone: ChipTone }> = {
  en_attente: { value: "Prêt", tone: "act" },
  autorisee: { value: "Autorisée", tone: "now" },
  en_attente_autorisation: { value: "Autorisation", tone: "signal" },
  envoyee: { value: "Envoyé", tone: "done" },
  ignoree: { value: "Ignoré", tone: "void" },
};

function isActionable(s: RelanceStatus) {
  return s === "en_attente" || s === "autorisee";
}

function birthdayWithinDays(birthday: string | undefined, days: number) {
  if (!birthday) return false;
  const today = new Date();
  const b = new Date(birthday);
  const next = new Date(today.getFullYear(), b.getMonth(), b.getDate());
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (next < midnight) next.setFullYear(next.getFullYear() + 1);
  const diff = Math.round((next.getTime() - midnight.getTime()) / 86_400_000);
  return diff > 0 && diff <= days;
}

/**
 * La Tournée du matin — un tableau de départs de messages (docs/REFONTE-2.md §2.3). Lit et écrit
 * le slice `relances` du store, partagé avec la Fiche cliente : une recommandation « Proposée »
 * depuis une fiche atterrit ici. Toute action individuelle → toast réversible (patron unique).
 */
export function TourneeMatinTab() {
  const { clients, relances, tourneeBatches, setRelanceStatus, sendTourneeBatch, revertTourneeBatch } = useAppData();
  const [view, setView] = useState("aujourdhui");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; action?: { label: string; onClick: () => void } } | null>(null);

  const clientFor = (id: string) => clients.find((c) => c.id === id);

  const buckets = useMemo(() => {
    const today: Relance[] = [];
    const upcoming: Relance[] = [];
    const history: Relance[] = [];
    for (const r of relances) {
      if (r.status === "envoyee" || r.status === "ignoree") {
        history.push(r);
        continue;
      }
      const isFutureBirthday =
        r.type === "anniversaire" &&
        birthdayWithinDays(clientFor(r.clientId)?.birthday, 14);
      (isFutureBirthday ? upcoming : today).push(r);
    }
    return { today, upcoming, history };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relances, clients]);

  const actionableToday = buckets.today.filter((r) => isActionable(r.status));

  function act(relance: Relance, next: RelanceStatus, message: string) {
    const previous = relance.status;
    setRelanceStatus(relance.id, next);
    setToast({ message, action: { label: "Annuler", onClick: () => setRelanceStatus(relance.id, previous) } });
  }

  function handleValider() {
    const ids = actionableToday.map((r) => r.id);
    const { batchId } = sendTourneeBatch(ids);
    setConfirmOpen(false);
    setToast({
      message: `Tournée envoyée à ${ids.length} cliente${ids.length > 1 ? "s" : ""}.`,
      action: { label: "Annuler", onClick: () => revertTourneeBatch(batchId, ids) },
    });
  }

  function actionsFor(r: Relance): React.ReactNode {
    const client = clientFor(r.clientId);
    const who = client ? clientFullName(client) : "la cliente";

    if (r.status === "en_attente_autorisation") {
      return (
        <Button size="sm" variant="dark" icon={<ShieldCheck className="size-4" />} onClick={() => act(r, "autorisee", `Remise autorisée pour ${who}.`)}>
          Autoriser la remise
        </Button>
      );
    }
    if (!isActionable(r.status)) return null;

    const channel = client?.whatsapp ?? client?.phone;
    return (
      <>
        {channel && (
          <Button size="sm" variant="success" icon={<MessageCircle className="size-4" />} onClick={() => act(r, "envoyee", `Message envoyé à ${who}.`)}>
            WhatsApp
          </Button>
        )}
        {client?.email && (
          <Button size="sm" variant="info" icon={<Mail className="size-4" />} onClick={() => act(r, "envoyee", `Email envoyé à ${who}.`)}>
            Email
          </Button>
        )}
        {(r.type === "anniversaire" || r.type === "soins") && (
          <Button size="sm" variant="outline" icon={<CalendarCheck className="size-4" />} onClick={() => act(r, "envoyee", `Marqué « RDV pris » pour ${who}.`)}>
            RDV pris
          </Button>
        )}
        <Button size="sm" variant="outline" icon={<X className="size-4" />} onClick={() => act(r, "ignoree", `Carte ignorée pour ${who}.`)}>
          Ignorer
        </Button>
      </>
    );
  }

  function laneFor(r: Relance) {
    const client = clientFor(r.clientId);
    if (!client) return null;
    const style = r.styleId ? styleById(r.styleId) : undefined;
    const status = STATUS[r.status];
    let context = "";
    if (r.type === "reconquete" && r.discountLabel) context = r.discountLabel;
    else if (r.type === "recommandation" && style) context = style.name;
    else if (r.lateDays) context = `il y a ${r.lateDays} j`;
    const signal: LaneSignal = r.status === "en_attente_autorisation" ? "hold" : "none";

    return (
      <Lane
        key={r.id}
        leading={<Avatar initial={clientInitial(client)} size={34} className="bg-accent text-xs font-semibold text-secondary" />}
        title={clientFullName(client)}
        meta={
          <span className="flex flex-col gap-0.5">
            {context && <span className="text-[var(--brand-taupe-muted)]">{context}</span>}
            <span className="line-clamp-1">{r.message}</span>
          </span>
        }
        chip={<FlipChip value={status.value} tone={status.tone} />}
        actions={actionsFor(r)}
        signal={signal}
        className="items-start py-3"
      />
    );
  }

  function groupedBoard(list: Relance[], emptyTitle: string, emptyHint?: string) {
    if (list.length === 0) return <BoardEmpty title={emptyTitle} hint={emptyHint} />;
    return TYPE_ORDER.map((type) => {
      const items = list.filter((r) => r.type === type);
      if (items.length === 0) return null;
      return (
        <div key={type}>
          <div className="border-b border-[var(--board-groove)] bg-black/[0.02] px-4 py-2">
            <Legend>
              {TYPE_LABEL[type]} · {items.length}
            </Legend>
          </div>
          {items.map(laneFor)}
        </div>
      );
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Board tone="now" legend="La tournée du jour">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="font-[family-name:var(--font-heading)] text-[2.4rem] font-semibold leading-none tabular-nums text-[var(--color-gray-900)]">
              {actionableToday.length}
            </p>
            <p className="mt-1 text-sm text-[var(--color-gray-500)]">
              {actionableToday.length === 0 ? "Rien à envoyer ce matin." : "message(s) prêt(s) à partir en bloc."}
            </p>
          </div>
          <Button variant="dark" disabled={actionableToday.length === 0} onClick={() => setConfirmOpen(true)}>
            Valider &amp; envoyer
          </Button>
        </div>
      </Board>

      <ChipFilter
        value={view}
        onChange={setView}
        options={[
          { value: "aujourdhui", label: "Aujourd'hui", count: buckets.today.length },
          { value: "avenir", label: "À venir", count: buckets.upcoming.length },
          { value: "historique", label: "Historique", count: buckets.history.length + tourneeBatches.length },
        ]}
      />

      {view === "aujourdhui" && (
        <Board legend="À traiter">{groupedBoard(buckets.today, "Tournée à jour", "Aucune relance en attente pour aujourd'hui.")}</Board>
      )}
      {view === "avenir" && (
        <Board legend="Échéances proches">{groupedBoard(buckets.upcoming, "Rien en vue", "Aucune échéance dans les 14 prochains jours.")}</Board>
      )}
      {view === "historique" && (
        <div className="flex flex-col gap-6">
          {tourneeBatches.length > 0 && (
            <Board legend="Tournées envoyées">
              {tourneeBatches.map((b) => (
                <Lane
                  key={b.id}
                  title={<span className="capitalize">{b.sentAt}</span>}
                  chip={<FlipChip value={`${b.count} envoyé${b.count > 1 ? "s" : ""}`} tone="done" className="min-w-0 px-2" />}
                />
              ))}
            </Board>
          )}
          <Board legend="Cartes résolues">{groupedBoard(buckets.history, "Aucune action passée", "Les envois et cartes ignorées apparaîtront ici.")}</Board>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Valider la tournée du matin ?"
        description={`${actionableToday.length} cliente${actionableToday.length > 1 ? "s" : ""} recevront leur message maintenant. Une reconquête non autorisée reste dans la tournée du lendemain.`}
        confirmLabel="Valider & envoyer"
        confirmVariant="dark"
        onConfirm={handleValider}
        onCancel={() => setConfirmOpen(false)}
      />
      <Toast message={toast?.message ?? null} action={toast?.action} onDismiss={() => setToast(null)} />
    </div>
  );
}
