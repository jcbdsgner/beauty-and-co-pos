"use client";

import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn } from "@/lib/utils";

/**
 * Produits d'une facture payée, encore à remettre à la cliente (ADR 0042). Se présente de lui-même
 * dès qu'elle est identifiée — au ticket du Comptoir comme dans son fil Messages — et se lève d'un
 * geste quand ils lui sont donnés. Rien à encaisser : c'est déjà payé.
 */
export function ProductsToHandOver({ clientId, className }: { clientId: string; className?: string }) {
  const { factures, handOverFactureProducts } = useAppData();
  const pending = factures.filter(
    (f) => f.clientId === clientId && f.status === "payee" && !f.productsHandedOverAt && f.lines.some((l) => l.kind === "produit"),
  );
  if (pending.length === 0) return null;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {pending.map((f) => {
        const products = f.lines.filter((l) => l.kind === "produit");
        return (
          <div key={f.id} className="highlight-rose flex items-center gap-3 rounded-field border bg-white py-2 pr-2 pl-4">
            <PackageOpen aria-hidden className="size-5 shrink-0 text-secondary" />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold">À lui remettre · déjà payé</p>
              <p className="truncate text-xs text-base-content/60" title={products.map((l) => l.name).join(", ")}>
                {products.map((l) => `${l.name}${l.qty > 1 ? ` ×${l.qty}` : ""}`).join(" · ")} — {f.number}
              </p>
            </div>
            <Button size="sm" onClick={() => handOverFactureProducts(f.id)}>Remis</Button>
          </div>
        );
      })}
    </div>
  );
}
