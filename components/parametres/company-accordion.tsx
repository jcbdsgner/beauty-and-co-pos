"use client";

import { useState } from "react";
import { Building2, Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { COMPANIES } from "@/lib/data/parametres-general";

/** Accordion of companies, each expandable to reveal its salons — "Entreprises & Salons" screen. */
export function CompanyAccordion() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(COMPANIES.map((company) => [company.key, company.expandedDefault])),
  );

  return (
    <div className="flex flex-col gap-4">
      {COMPANIES.map((company) => {
        const isOpen = Boolean(expanded[company.key]);

        return (
          <Card key={company.key} className="overflow-hidden p-0">
            <button
              type="button"
              onClick={() => setExpanded((prev) => ({ ...prev, [company.key]: !prev[company.key] }))}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 rounded-2xl p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-taupe-muted)] focus-visible:ring-offset-2"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--core-brand-color-2)] text-[var(--brand-taupe-muted)]">
                <Building2 aria-hidden className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-[var(--color-gray-900)]">{company.name}</span>
                <span className="block text-sm text-[var(--color-gray-400)]">{company.slug}</span>
              </span>
              <ChevronIcon
                className={cn(
                  "shrink-0 text-[var(--color-gray-400)] transition-transform",
                  isOpen ? "-rotate-90" : "rotate-90",
                )}
              />
            </button>

            {isOpen && (
              <div className="border-t border-[var(--color-gray-200)] bg-[var(--color-gray-50)] p-3">
                {company.salons.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {company.salons.map((salon) => (
                      <div key={salon.name} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]">
                          <Store aria-hidden className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-[var(--color-gray-900)]">{salon.name}</span>
                          <span className="block truncate text-xs text-[var(--color-gray-500)]">{salon.address}</span>
                        </span>
                        <Badge variant={salon.active ? "success" : "neutral"} className="shrink-0">
                          {salon.active ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-1 py-2 text-sm text-[var(--color-gray-400)]">Aucun salon pour le moment.</p>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
