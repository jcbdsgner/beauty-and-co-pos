"use client";

import { CalendarClock, PackageCheck } from "lucide-react";
import { Board, BoardEmpty, Legend } from "@/components/ui/board";
import { serviceById } from "@/lib/data/menu";
import { forfaitById } from "@/lib/data/forfaits";
import { packById, packPrice } from "@/lib/data/packs";
import {
  abonnementsForClient,
  abonnementStatus,
  abonnementNextDueDate,
  ABONNEMENT_STATUS_LABEL,
  type AbonnementStatus,
} from "@/lib/data/abonnements";
import { packPurchasesForClient, packRemainingPrestations } from "@/lib/data/pack-purchases";
import { cn, formatFcfa } from "@/lib/utils";

const FR_DATE = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const STATUS_CLASS: Record<AbonnementStatus, string> = {
  a_jour: "bg-success/12 text-success",
  a_regler: "bg-warning/15 text-warning",
  revoque: "bg-base-200 text-base-content/45",
};

/**
 * The cliente's Abonnements & Packs (ADR 0017) — the only place the salon sees the whole of what
 * she has prepaid; at the Comptoir only what touches the open sale shows. Read-only: souscription,
 * paiement de cycle et révocation vivent sur la plateforme b&co.
 */
export function AbonnementsPacksBoard({ clientId }: { clientId: string }) {
  const abonnements = abonnementsForClient(clientId);
  const packs = packPurchasesForClient(clientId);

  if (abonnements.length === 0 && packs.length === 0) {
    return (
      <Board legend="Abonnements & Packs">
        <BoardEmpty
          title="Aucun abonnement ni pack"
          hint="Souscription et achat se font sur la plateforme b&co."
        />
      </Board>
    );
  }

  return (
    <Board legend="Abonnements & Packs">
      <div className="flex flex-col divide-y divide-border">
        {abonnements.map((ab) => {
          const forfait = forfaitById(ab.forfaitId);
          if (!forfait) return null;
          const status = abonnementStatus(ab);
          const due = abonnementNextDueDate(ab);
          return (
            <div key={ab.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <Legend>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock aria-hidden className="size-3.5" /> Abonnement
                  </span>
                </Legend>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                    STATUS_CLASS[status],
                  )}
                >
                  {ABONNEMENT_STATUS_LABEL[status]}
                </span>
              </div>
              <p className="font-[family-name:var(--font-heading)] font-semibold text-base-content">{forfait.label}</p>
              <p className="text-xs text-base-content/55">
                {forfait.cycleLabel} · {formatFcfa(forfait.price)} / cycle
                {status !== "revoque" && due && (
                  <> · {status === "a_regler" ? "échéance passée le" : "prochaine échéance le"} {FR_DATE.format(due)}</>
                )}
                {status === "revoque" && ab.revokedAt && <> · révoqué le {FR_DATE.format(new Date(ab.revokedAt))}</>}
              </p>
              <ul className="flex flex-col gap-0.5 text-sm text-base-content/90">
                {forfait.prestationIds.map((id) => {
                  const consumed = ab.redeemedPrestationIds.includes(id) && status === "a_jour";
                  return (
                    <li key={id} className={cn("flex items-center gap-2", consumed && "text-base-content/40")}>
                      <span className={cn("size-1.5 shrink-0 rounded-full", consumed ? "bg-base-300" : "bg-success")} />
                      <span className={cn(consumed && "line-through")}>{serviceById(id)?.name ?? id}</span>
                      {consumed && <span className="text-[11px] uppercase tracking-wide">pris ce cycle</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {packs.map((pp) => {
          const pack = packById(pp.packId);
          if (!pack) return null;
          const remaining = packRemainingPrestations(pp);
          const used = pack.prestationIds.length - remaining.length;
          return (
            <div key={pp.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <Legend>
                  <span className="inline-flex items-center gap-1.5">
                    <PackageCheck aria-hidden className="size-3.5" /> Pack
                  </span>
                </Legend>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                    remaining.length === 0 ? "bg-base-200 text-base-content/45" : "bg-success/12 text-success",
                  )}
                >
                  {remaining.length === 0 ? "Épuisé" : `${used} / ${pack.prestationIds.length} utilisées`}
                </span>
              </div>
              <p className="font-[family-name:var(--font-heading)] font-semibold text-base-content">{pack.label}</p>
              <p className="text-xs text-base-content/55">
                Acheté le {FR_DATE.format(new Date(pp.purchasedAt))} · {formatFcfa(packPrice(pack))}
              </p>
              <ul className="flex flex-col gap-0.5 text-sm text-base-content/90">
                {pack.prestationIds.map((id) => {
                  const consumed = pp.redeemedPrestationIds.includes(id);
                  return (
                    <li key={id} className={cn("flex items-center gap-2", consumed && "text-base-content/40")}>
                      <span className={cn("size-1.5 shrink-0 rounded-full", consumed ? "bg-base-300" : "bg-success")} />
                      <span className={cn(consumed && "line-through")}>{serviceById(id)?.name ?? id}</span>
                      {consumed && <span className="text-[11px] uppercase tracking-wide">utilisée</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </Board>
  );
}
