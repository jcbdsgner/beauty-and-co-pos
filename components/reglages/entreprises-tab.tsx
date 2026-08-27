"use client";

import { useState } from "react";
import { Accordion } from "@/components/ui/molecules/accordion";
import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { PencilIcon, PlusIcon } from "@/components/ui/atoms/icons";
import { SalonFormDialog } from "@/components/reglages/salon-form-dialog";
import { COMPANIES, SALONS } from "@/lib/data/entreprises";
import type { Salon } from "@/lib/data/types";

let uid = 0;
function nextId(prefix: string) {
  uid += 1;
  return `${prefix}-${Date.now()}-${uid}`;
}

/**
 * Entreprises & Salons — Accordion (items = entreprises, contenu = salons) with a real CRUD:
 * "+ Ajouter un salon" per company, a pencil per salon opening the edit Dialog. Becomes the real
 * source of truth the Entreprise/Salon selectors elsewhere in the app would read from.
 */
export function EntreprisesTab() {
  const [salons, setSalons] = useState<Salon[]>(SALONS);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<Salon | null>(null);
  const [addForCompanyId, setAddForCompanyId] = useState<string>(COMPANIES[0]?.id ?? "");

  return (
    <>
      <Accordion
        items={COMPANIES.map((company) => {
          const companySalons = salons.filter((s) => s.companyId === company.id);
          return {
            value: company.id,
            title: (
              <span className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-[var(--color-gray-900)]">{company.name}</span>
                <span className="text-xs font-normal text-[var(--color-gray-400)]">
                  {companySalons.length} salon{companySalons.length > 1 ? "s" : ""}
                </span>
              </span>
            ),
            content: (
              <div className="flex flex-col gap-3">
                {companySalons.length === 0 ? (
                  <p className="text-sm text-[var(--color-gray-400)]">Aucun salon pour cette entreprise.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {companySalons.map((salon) => (
                      <li key={salon.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-gray-200)] bg-white px-4 py-3">
                        <div>
                          <p className="text-[15px] font-semibold text-[var(--color-gray-900)]">{salon.name}</p>
                          <p className="text-sm text-[var(--color-gray-500)]">{salon.address}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <Badge variant={salon.active ? "success" : "neutral"}>{salon.active ? "Actif" : "Inactif"}</Badge>
                          <IconButton
                            aria-label={`Modifier ${salon.name}`}
                            onClick={() => {
                              setFormMode("edit");
                              setEditing(salon);
                              setFormOpen(true);
                            }}
                            className="size-11 rounded-full text-[var(--color-gray-400)] transition active:scale-90 active:bg-[var(--brand-rose-soft)] active:text-[var(--brand-taupe-muted)] hover:bg-[var(--brand-rose-soft)] hover:text-[var(--brand-taupe-muted)]"
                          >
                            <PencilIcon />
                          </IconButton>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  type="button"
                  variant="outline"
                  icon={<PlusIcon />}
                  onClick={() => {
                    setFormMode("add");
                    setEditing(null);
                    setAddForCompanyId(company.id);
                    setFormOpen(true);
                  }}
                  className="w-auto self-start"
                >
                  Ajouter un salon
                </Button>
              </div>
            ),
          };
        })}
      />

      <SalonFormDialog
        open={formOpen}
        mode={formMode}
        salon={editing}
        defaultCompanyId={editing?.companyId ?? addForCompanyId}
        onClose={() => setFormOpen(false)}
        onSubmit={(values) => {
          if (formMode === "add") {
            setSalons((prev) => [...prev, { ...values, id: nextId("salon") }]);
          } else if (editing) {
            setSalons((prev) => prev.map((s) => (s.id === editing.id ? { ...values, id: editing.id } : s)));
          }
          setFormOpen(false);
        }}
      />
    </>
  );
}
