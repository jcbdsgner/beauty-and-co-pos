"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { COMPANIES } from "@/lib/data/parametres-general";

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 20V5.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1V20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13 10.5h4a1 1 0 0 1 1 1V20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 20h18M7.5 8h1.5M7.5 11.5h1.5M7.5 15h1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 9.5l1-4.5h14l1 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="M4.5 9.5a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M5.5 10.5V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-8.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 20v-4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

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
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--core-brand-color-2)] text-[var(--brand-taupe-muted)]">
                <BuildingIcon className="size-5" />
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
                          <StoreIcon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-[var(--color-gray-900)]">{salon.name}</span>
                          <span className="block truncate text-xs text-[var(--color-gray-500)]">{salon.address}</span>
                        </span>
                        {salon.active && (
                          <span
                            aria-label="Salon actif"
                            className="size-2 shrink-0 rounded-full bg-[var(--color-success)]"
                          />
                        )}
                        <ChevronIcon className="shrink-0 text-[var(--color-gray-300)]" />
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
