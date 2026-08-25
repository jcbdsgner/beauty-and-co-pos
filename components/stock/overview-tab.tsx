"use client";

import { Card } from "@/components/ui/card";
import { HeroNumber } from "@/components/ui/hero-number";
import { AlertTriangleIcon } from "@/components/stock/icons";
import { ProductCard } from "@/components/stock/product-card";
import { stockLevel } from "@/components/stock/stock-progress-bar";
import { ENTREPRISES, PRODUCTS, STOCK_SUMMARY, type Product } from "@/lib/data/stock";

const LEVEL_RANK: Record<ReturnType<typeof stockLevel>, number> = { rupture: 0, bas: 1, ok: 2 };

type OverviewTabProps = {
  /** Bascule vers l'onglet "Depot", qui contient la liste complete des produits filtree par entreprise. */
  onSeeDetail: () => void;
  onReappro: (product: Product) => void;
};

/** "Vue d'ensemble" — bandeau d'alerte, KPI stock, liste des produits triee par urgence de reapprovisionnement. */
export function OverviewTab({ onSeeDetail, onReappro }: OverviewTabProps) {
  const sorted = [...PRODUCTS].sort((a, b) => {
    const rankDiff = LEVEL_RANK[stockLevel(a.depotStock, a.min)] - LEVEL_RANK[stockLevel(b.depotStock, b.min)];
    if (rankDiff !== 0) return rankDiff;
    return a.depotStock - b.depotStock;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 rounded-2xl bg-[#fdece9] px-4 py-3">
        <AlertTriangleIcon className="shrink-0 text-[var(--color-error)]" />
        <p className="text-sm">
          <span className="font-semibold text-[var(--color-error)]">{STOCK_SUMMARY.ruptures} en rupture</span>
          <span className="text-[var(--color-gray-500)]"> · </span>
          <span className="font-semibold text-[var(--color-warning)]">{STOCK_SUMMARY.sousLeSeuil} sous le seuil</span>
          <span className="text-[var(--color-gray-600)]"> — à réapprovisionner</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <HeroNumber label="VALEUR DU STOCK" value={STOCK_SUMMARY.valeurStock} size="lg" />
        </Card>
        <Card className="p-5">
          <HeroNumber
            label="À COMMANDER"
            value={String(STOCK_SUMMARY.aCommander)}
            size="lg"
            className="[&>p:nth-child(2)]:text-[var(--pos-accent-dark)]"
          />
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
          {STOCK_SUMMARY.totalProducts} produits · triés par urgence
        </p>
        <button
          type="button"
          onClick={onSeeDetail}
          className="text-sm font-medium text-[var(--pos-accent-dark)] hover:underline"
        >
          Voir le détail ›
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.map((product) => (
          <ProductCard
            key={product.id}
            variant="overview"
            product={product}
            locationLabel={ENTREPRISES.find((e) => e.id === product.entrepriseId)?.label ?? product.entrepriseId}
            onReappro={onReappro}
          />
        ))}
      </div>
    </div>
  );
}
