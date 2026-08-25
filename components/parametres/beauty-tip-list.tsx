"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pills, type PillOption } from "@/components/ui/pills";
import { SearchInput } from "@/components/ui/search-input";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import {
  BEAUTY_TIPS,
  CARE_FAMILY_LABELS,
  CARE_FAMILY_TAB_OPTIONS,
  SERVICE_CYCLE_TIPS,
  type BeautyTip,
  type ServiceCycleTip,
} from "@/lib/data/parametres-catalogue";
import { BeautyTipDialog, ServiceCycleDialog } from "@/components/parametres/beauty-tip-dialog";

const FAMILY_PILLS: PillOption[] = [{ value: "tous", label: "Tous" }, ...CARE_FAMILY_TAB_OPTIONS];

/** Back arrow, styled identically to `PageHeader`'s (out of scope to extend — it only accepts a
 * plain string title, and this screen's title carries a leading ampoule icon per spec). */
function BackArrow() {
  return (
    <Link
      href="/parametres"
      aria-label="Retour"
      className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--color-gray-500)] hover:bg-[var(--color-gray-100)]"
    >
      <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-5">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

/** Orchestrateur client de "Conseils beauté" : section "Mes conseils" (filtrable, CRUD complet)
 * + section "Cycles & conseils par service" (délai de relance éditable par service). */
export function BeautyTipList() {
  const [family, setFamily] = useState("tous");
  const [tips, setTips] = useState(BEAUTY_TIPS);
  const [cycles, setCycles] = useState(SERVICE_CYCLE_TIPS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<BeautyTip | undefined>(undefined);
  const [cycleQuery, setCycleQuery] = useState("");
  const [editingCycle, setEditingCycle] = useState<ServiceCycleTip | undefined>(undefined);

  const filteredTips = useMemo(
    () => (family === "tous" ? tips : tips.filter((tip) => tip.family === family)),
    [family, tips],
  );

  const filteredCycles = useMemo(() => {
    const q = cycleQuery.trim().toLowerCase();
    if (!q) return cycles;
    return cycles.filter((cycle) => cycle.serviceName.toLowerCase().includes(q));
  }, [cycleQuery, cycles]);

  function openCreate() {
    setEditingTip(undefined);
    setDialogOpen(true);
  }

  function openEditTip(tip: BeautyTip) {
    setEditingTip(tip);
    setDialogOpen(true);
  }

  function handleSaveTip(tip: BeautyTip) {
    setTips((prev) => {
      const exists = prev.some((item) => item.id === tip.id);
      return exists ? prev.map((item) => (item.id === tip.id ? tip : item)) : [tip, ...prev];
    });
    setDialogOpen(false);
  }

  function handleDelete(id: string) {
    setTips((prev) => prev.filter((tip) => tip.id !== id));
  }

  function handleSaveCycle(cycle: ServiceCycleTip) {
    setCycles((prev) => prev.map((item) => (item.id === cycle.id ? cycle : item)));
    setEditingCycle(undefined);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <BackArrow />
        <div>
          <h1 className="flex items-center gap-2 font-[var(--font-heading)] text-2xl text-[var(--color-gray-900)]">
            <span aria-hidden>💡</span> Conseils beauté
          </h1>
          <p className="mt-1 text-sm text-[var(--color-gray-500)]">
            Vos connaissances, injectées dans les messages de la conseillère.
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-[var(--font-heading)] text-lg text-[var(--color-gray-900)]">✨ Mes conseils</h2>
          <Button variant="brand" onClick={openCreate} icon={<PlusIcon />}>
            Ajouter
          </Button>
        </div>

        <Pills options={FAMILY_PILLS} value={family} onChange={setFamily} />

        <div className="space-y-2">
          {filteredTips.length === 0 && (
            <p className="py-6 text-center text-sm text-[var(--color-gray-400)]">Aucun conseil pour cette famille.</p>
          )}
          {filteredTips.map((tip) => (
            <Card key={tip.id} className="flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Badge variant="dark" className="mb-1.5">
                  {CARE_FAMILY_LABELS[tip.family].toUpperCase()}
                </Badge>
                <p className="text-[15px] text-[var(--color-gray-800)]">{tip.text}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => openEditTip(tip)}
                  aria-label={`Modifier le conseil ${tip.text}`}
                  className="flex size-8 items-center justify-center rounded-full text-[var(--color-gray-400)] hover:bg-[var(--color-gray-100)] hover:text-[var(--brand-taupe-muted)]"
                >
                  <PencilIcon />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tip.id)}
                  aria-label={`Supprimer le conseil ${tip.text}`}
                  className="flex size-8 items-center justify-center rounded-full text-[var(--color-gray-400)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-error)]"
                >
                  <TrashIcon />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-[var(--font-heading)] text-lg text-[var(--color-gray-900)]">🕐 Cycles &amp; conseils par service</h2>
          <p className="mt-1 text-sm text-[var(--color-gray-500)]">
            Délai de relance automatique après chaque prestation.
          </p>
        </div>

        <SearchInput
          placeholder="Rechercher un service..."
          value={cycleQuery}
          onChange={(event) => setCycleQuery(event.target.value)}
        />

        <div className="space-y-2">
          {filteredCycles.length === 0 && (
            <p className="py-6 text-center text-sm text-[var(--color-gray-400)]">Aucun service trouvé.</p>
          )}
          {filteredCycles.map((cycle) => (
            <Card key={cycle.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[var(--color-gray-900)]">{cycle.serviceName}</p>
                {cycle.text && <p className="mt-0.5 truncate text-sm text-[var(--color-gray-500)]">{cycle.text}</p>}
              </div>
              <Badge variant="neutral" icon={<span aria-hidden>⏱</span>}>
                {cycle.delayDays ? `J+${cycle.delayDays}` : "—"}
              </Badge>
              <button
                type="button"
                onClick={() => setEditingCycle(cycle)}
                aria-label={`Modifier le cycle ${cycle.serviceName}`}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--color-gray-400)] hover:bg-[var(--color-gray-100)] hover:text-[var(--brand-taupe-muted)]"
              >
                <PencilIcon />
              </button>
            </Card>
          ))}
        </div>
      </section>

      <BeautyTipDialog open={dialogOpen} tip={editingTip} onClose={() => setDialogOpen(false)} onSave={handleSaveTip} />
      <ServiceCycleDialog
        open={!!editingCycle}
        cycle={editingCycle}
        onClose={() => setEditingCycle(undefined)}
        onSave={handleSaveCycle}
      />
    </div>
  );
}
