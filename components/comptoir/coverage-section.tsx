"use client";

import { CheckCircle2, CalendarClock, PackageCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/atoms/checkbox";
import { useAppData, computeTotals } from "@/components/providers/app-data-provider";
import { serviceById } from "@/lib/data/menu";
import { abonnementById, abonnementAvailablePrestations } from "@/lib/data/abonnements";
import { packPurchaseById, packRemainingPrestations } from "@/lib/data/pack-purchases";
import { formatFcfa } from "@/lib/utils";
import type { Sale, SaleCoverage } from "@/lib/data/types";

/**
 * « Prestations déjà payées » (ADR 0017) — le Pack / l'Abonnement de la payeuse. Ce n'est pas une
 * Remise : c'est du prépayé, comme l'acompte. Rien à faire — les lignes couvrables sont cochées
 * d'office, groupées par instrument ; la réceptionniste valide l'encaissement et avance. Elle
 * décoche une ligne (ou tout un groupe, en un clic) quand la cliente préfère la garder pour plus
 * tard. Toujours visible, jamais replié : zéro friction au comptoir.
 */
export function CoverageSection({ sale }: { sale: Sale }) {
  const { setCoverageChecked } = useAppData();
  const totals = computeTotals(sale);
  if (sale.coverage.length === 0) return null;

  return (
    <div className="mb-3 overflow-hidden rounded-[10px] border border-success/40 bg-success/[0.06]">
      <div className="flex items-center justify-between gap-2 px-4 py-3 text-[15px] font-medium text-success">
        <span className="flex items-center gap-2">
          <CheckCircle2 aria-hidden className="size-4" />
          Prestations déjà payées
        </span>
        {totals.coverageDiscount > 0 && (
          <span className="tabular-nums font-semibold">−{formatFcfa(totals.coverageDiscount)}</span>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-success/25 px-4 pt-3 pb-4">
        {sale.coverage.map((cov) => (
          <CoverageGroup
            key={cov.instanceId}
            sale={sale}
            cov={cov}
            onSet={(ids) => setCoverageChecked(sale.id, cov.instanceId, ids)}
          />
        ))}
      </div>
    </div>
  );
}

function CoverageGroup({
  sale,
  cov,
  onSet,
}: {
  sale: Sale;
  cov: SaleCoverage;
  onSet: (checkedServiceIds: string[]) => void;
}) {
  const inCart = cov.serviceIds.filter((id) => sale.cart.some((l) => l.kind === "service" && l.refId === id));
  if (inCart.length === 0) return null;

  const allChecked = inCart.every((id) => cov.checkedServiceIds.includes(id));
  const noneChecked = inCart.every((id) => !cov.checkedServiceIds.includes(id));

  const isAbo = cov.source === "abonnement";
  const ab = isAbo ? abonnementById(cov.instanceId) : undefined;
  const pp = !isAbo ? packPurchaseById(cov.instanceId) : undefined;
  const checkedCount = inCart.filter((id) => cov.checkedServiceIds.includes(id)).length;
  const poolAfter = ab
    ? abonnementAvailablePrestations(ab).length - checkedCount
    : pp
      ? packRemainingPrestations(pp).length - checkedCount
      : 0;

  function toggleOne(id: string, next: boolean) {
    const set = new Set(cov.checkedServiceIds);
    if (next) set.add(id);
    else set.delete(id);
    onSet([...set]);
  }

  return (
    <section>
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-success">
          {isAbo ? <CalendarClock aria-hidden className="size-3.5 shrink-0" /> : <PackageCheck aria-hidden className="size-3.5 shrink-0" />}
          <span className="truncate">{cov.planLabel}</span>
        </p>
        <button
          type="button"
          onClick={() => onSet(allChecked ? [] : inCart)}
          className="-mr-1 inline-flex min-h-11 shrink-0 items-center rounded-full bg-success/15 px-3 text-xs font-semibold text-success transition active:scale-95 hover:bg-success/25"
        >
          {allChecked ? "Tout décocher" : "Tout cocher"}
        </button>
      </div>

      <div className="flex flex-col rounded-lg bg-white/70">
        {inCart.map((id) => {
          const svc = serviceById(id);
          const checked = cov.checkedServiceIds.includes(id);
          return (
            <Checkbox
              key={id}
              className="min-h-12 text-[13px]"
              checked={checked}
              onChange={(c) => toggleOne(id, c)}
              label={`${svc?.name ?? id}`}
            />
          );
        })}
      </div>

      <p className="mt-1 text-[11px] text-success/80">
        {noneChecked
          ? isAbo
            ? "Gardé pour ce cycle — rien décompté."
            : "Gardé sur le pack — rien décompté."
          : isAbo
            ? `Décompté ce cycle · reste ${poolAfter} prestation${poolAfter > 1 ? "s" : ""} disponible${poolAfter > 1 ? "s" : ""}`
            : poolAfter <= 0
              ? "Décompté · pack entièrement utilisé après cette vente"
              : `Décompté · reste ${poolAfter} prestation${poolAfter > 1 ? "s" : ""} sur le pack`}
      </p>
    </section>
  );
}
