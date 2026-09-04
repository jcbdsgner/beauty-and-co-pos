"use client";

import { ChevronUp, ShoppingCart } from "lucide-react";
import { useAppData, computeTotals } from "@/components/providers/app-data-provider";
import { clientFullName } from "@/lib/data/clientele";
import { formatFcfa } from "@/lib/utils";

/**
 * The Comptoir, collapsed — a full-width dock at the foot of the working area, present on every
 * section (Accueil / Planning / Clientèle / Messages / Catalogue). This is the counter's single most
 * important affordance, so it is a real bar, not a corner pill:
 *
 * - no open sale → a rose bar, "Nouvelle vente", one tap opens a fresh tab in the deployed
 *   Comptoir
 * - ≥ 1 open sale → a taupe bar carrying the open-sale count, the active basket's client and
 *   running total, and "Ouvrir le comptoir"; one tap re-deploys the Comptoir exactly where it was
 *   left (active tab + step preserved)
 *
 * Hidden while the Comptoir is deployed — the full panel covers the screen and owns "Replier".
 * The rose → taupe flip is itself the cue that money is now on the counter.
 */
export function ComptoirBar() {
  const { sales, openTabIds, activeSaleId, comptoirDeployed, deployComptoir, openNewTab, clients } = useAppData();

  if (comptoirDeployed) return null;

  const openSales = openTabIds
    .map((id) => sales.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s && s.status === "ouverte");

  if (openSales.length === 0) {
    return (
      <div className="shrink-0 border-t border-base-300 bg-base-200 px-6 py-3">
        <button
          type="button"
          onClick={() => openNewTab()}
          className="btn btn-primary btn-lg w-full text-[17px]"
        >
          Nouvelle vente
        </button>
      </div>
    );
  }

  const active = openSales.find((s) => s.id === activeSaleId) ?? openSales[0];
  const activeTotal = computeTotals(active).amountDue;
  const activeClient = active.clientId ? clients.find((c) => c.id === active.clientId) : null;

  return (
    <button
      type="button"
      onClick={deployComptoir}
      className="flex h-[76px] w-full shrink-0 items-center gap-4 bg-primary px-6 text-left text-primary-content shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition active:scale-[0.997] hover:brightness-[1.06]"
    >
      <ShoppingCart aria-hidden className="size-5 shrink-0" />
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-sm font-semibold">
          {activeClient ? clientFullName(activeClient) : "Vente sans cliente"}
        </span>
        <span className="text-xs text-primary-content/70">
          {openSales.length > 1 ? `${openSales.length} ventes ouvertes` : "1 vente ouverte"}
        </span>
      </span>
      <span className="font-[family-name:var(--font-heading)] text-xl font-bold tabular-nums">
        {activeTotal > 0 ? formatFcfa(activeTotal) : "—"}
      </span>
      <span className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-4 text-sm font-semibold">
        <ChevronUp aria-hidden className="size-4" />
        Ouvrir le comptoir
      </span>
    </button>
  );
}
