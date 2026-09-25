"use client";

import { useState } from "react";
import { Check, Percent, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { TextInput } from "@/components/ui/atoms/text-input";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { AdvantagesSection } from "@/components/comptoir/advantages-section";
import { TicketClientCard, TicketFrame, TicketHead, TicketLineBody, TicketTotals } from "@/components/comptoir/ticket-parts";
import { useAppData, computeTotals } from "@/components/providers/app-data-provider";
import { MAX_REMISE_PCT, RECEPTIONIST_MAX_PCT } from "@/lib/store/app-store";
import { cn, formatFcfa } from "@/lib/utils";
import type { RemiseAccordee, RemiseMode, Sale } from "@/lib/data/types";

const PCT_PRESETS = [5, 10, 15, MAX_REMISE_PCT];

/**
 * The ticket at the règlement (ADR 0031) — the same block as on the panier, same place, same
 * total, same button spot. What changes is what the lines let you do: quantities are frozen (that
 * was the panier's job), and prestation lines become *selectable* so a remise can target exactly
 * the ones the receptionist means — one line, a few, or all of them.
 *
 * Remise flow, all inside the ticket (no modal: the cliente is in front of her, the ticket is
 * what they both look at):
 *   « Accorder une remise » → lines grow a check → tick the prestations → the composer takes the
 *   foot (% or montant, code manager past 10 %) → « Appliquer » → each ticked line shows its new
 *   price and a remise tag. Tapping a tag reopens that remise for editing or removal.
 */
export function SettlementTicket({
  sale,
  onConfirm,
  canConfirm,
  confirmHint,
}: {
  sale: Sale;
  onConfirm: () => void;
  canConfirm: boolean;
  confirmHint: string | null;
}) {
  const { clients } = useAppData();
  const client = sale.clientId ? clients.find((c) => c.id === sale.clientId) : undefined;
  const totals = computeTotals(sale);

  // null = not composing; otherwise the draft remise being built (or the one being edited).
  const [draft, setDraft] = useState<{ remise: RemiseAccordee | null; selected: string[] } | null>(null);
  const eligible = (lineId: string) => (totals.lineAssiette[lineId] ?? 0) > 0;
  const eligibleIds = sale.cart.filter((l) => eligible(l.id)).map((l) => l.id);
  const remiseOf = (lineId: string) => sale.remises.find((r) => r.lineIds.includes(lineId));

  function startNew() {
    setDraft({ remise: null, selected: [] });
  }
  function startEdit(r: RemiseAccordee) {
    setDraft({ remise: r, selected: r.lineIds.filter(eligible) });
  }
  function toggle(lineId: string) {
    if (!draft) return;
    setDraft({
      ...draft,
      selected: draft.selected.includes(lineId) ? draft.selected.filter((x) => x !== lineId) : [...draft.selected, lineId],
    });
  }

  const composing = draft !== null;
  const allSelected = composing && eligibleIds.length > 0 && eligibleIds.every((id) => draft.selected.includes(id));

  return (
    <TicketFrame>
      <TicketHead sale={sale}>
        {client ? (
          <TicketClientCard client={client} />
        ) : (
          <p className="rounded-2xl bg-base-200 px-3 py-3 text-sm text-base-content/55">Vente sans cliente identifiée</p>
        )}
      </TicketHead>

      {/* Remise bar — the entry point, then the selection header while composing */}
      <div className="shrink-0 border-b border-border px-5 py-3">
        {!composing ? (
          <button
            type="button"
            disabled={eligibleIds.length === 0}
            onClick={startNew}
            className="flex min-h-14 w-full items-center gap-3 rounded-[10px] border border-border px-4 text-left transition active:scale-[0.99] hover:bg-base-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
          >
            <Percent aria-hidden className="size-4 shrink-0 text-secondary" />
            <span className="flex-1 whitespace-nowrap text-[15px] font-semibold text-secondary">Accorder une remise</span>
            <span className="text-xs text-base-content/55">
              {eligibleIds.length === 0 ? "Aucune prestation remisable" : "par prestation"}
            </span>
          </button>
        ) : (
          <div className="flex min-h-14 items-center justify-between gap-3">
            <p className="text-sm font-semibold text-base-content">
              {draft.remise ? "Modifier la remise" : "Quelles prestations remiser ?"}
            </p>
            <button
              type="button"
              onClick={() => setDraft({ ...draft, selected: allSelected ? [] : eligibleIds })}
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-semibold text-secondary transition active:scale-95"
            >
              {allSelected ? "Tout désélectionner" : "Tout le ticket"}
            </button>
          </div>
        )}
      </div>

      {/* Lines, then what the cliente holds — one scroll */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5">
        <ul className="flex flex-col divide-y divide-border">
          {sale.cart.map((line) => {
            const covered = totals.coveredAmountByService[line.refId] ?? 0;
            const discount = totals.lineDiscount[line.id] ?? 0;
            const r = remiseOf(line.id);
            const breakdown = r ? totals.remiseBreakdown.find((b) => b.id === r.id) : undefined;
            const canPick = eligible(line.id);
            const picked = composing && draft.selected.includes(line.id);

            const tag =
              !composing && r && discount > 0 ? (
                <button
                  type="button"
                  onClick={() => startEdit(r)}
                  className="mt-1.5 inline-flex min-h-9 items-center gap-1 rounded-full bg-accent px-3 text-xs font-semibold text-secondary transition active:scale-95 hover:bg-base-300"
                >
                  Remise {r.mode === "pourcentage" ? `−${r.value} %` : `−${formatFcfa(discount)}`}
                  {breakdown && breakdown.lineIds.length > 1 && (
                    <span className="font-medium text-secondary/70">· {breakdown.lineIds.length} lignes</span>
                  )}
                  <span className="font-medium text-secondary/70">· modifier</span>
                </button>
              ) : composing && !canPick ? (
                <span className="mt-0.5 block text-xs text-base-content/55">
                  {line.kind === "service" ? "Déjà payée — pas remisable" : "Pas remisable"}
                </span>
              ) : null;

            if (composing && canPick) {
              return (
                <li key={line.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={picked}
                    onClick={() => toggle(line.id)}
                    className={cn(
                      "-mx-3 my-1 flex w-[calc(100%+1.5rem)] items-start gap-3 rounded-xl px-3 py-3 text-left transition active:scale-[0.99]",
                      picked ? "bg-accent" : "hover:bg-base-200",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition",
                        picked ? "border-primary bg-primary text-primary-content" : "border-base-content/30 bg-white",
                      )}
                    >
                      {picked && <Check aria-hidden className="size-4" strokeWidth={3} />}
                    </span>
                    <TicketLineBody line={line} covered={covered} discount={discount} />
                  </button>
                </li>
              );
            }

            return (
              <li key={line.id} className="flex py-3.5">
                <TicketLineBody line={line} covered={covered} discount={discount} tag={tag} muted={composing} />
              </li>
            );
          })}
        </ul>

        {!composing && <AdvantagesSection sale={sale} />}
      </div>

      {/* Foot — the composer while a remise is being set, the total and the confirm otherwise */}
      <div className="shrink-0 border-t border-border bg-white px-5 pt-3 pb-5">
        {composing ? (
          <RemiseComposer
            key={draft.remise?.id ?? "new"}
            sale={sale}
            editing={draft.remise}
            selected={draft.selected}
            onDone={() => setDraft(null)}
          />
        ) : (
          <>
            <TicketTotals sale={sale} className="mb-3" />
            <Button
              variant="brand"
              size="xl"
              className="w-full"
              icon={<Check className="size-5" />}
              disabled={!canConfirm}
              onClick={onConfirm}
            >
              Confirmer l&apos;encaissement
            </Button>
            {confirmHint && <p className="mt-1.5 text-center text-xs font-medium text-base-content/55">{confirmHint}</p>}
          </>
        )}
      </div>
    </TicketFrame>
  );
}

/**
 * The remise itself, docked in the ticket's foot while lines are being ticked. Its assiette is the
 * ticked lines' net; the 10 % (no code) / 20 % (code manager) ceilings are read against it
 * (ADR 0008, 0031). The motif is not asked here — only after the sale is cashed in.
 */
function RemiseComposer({
  sale,
  editing,
  selected,
  onDone,
}: {
  sale: Sale;
  editing: RemiseAccordee | null;
  selected: string[];
  onDone: () => void;
}) {
  const { grantDiscount, removeRemise } = useAppData();
  const totals = computeTotals(sale);
  const base = selected.reduce((sum, id) => sum + (totals.lineAssiette[id] ?? 0), 0);

  const [mode, setMode] = useState<RemiseMode>(editing?.mode ?? "pourcentage");
  const [pct, setPct] = useState(editing?.mode === "pourcentage" ? editing.value : 10);
  const [montant, setMontant] = useState(editing?.mode === "montant" ? String(editing.value) : "");
  const [managerCode, setManagerCode] = useState(editing?.managerCode ?? "");
  const [msg, setMsg] = useState<string | null>(null);

  const value = mode === "pourcentage" ? pct : Number(montant) || 0;
  const requestedPct = base > 0 ? (mode === "pourcentage" ? pct : (value / base) * 100) : 0;
  const needsManager = requestedPct > RECEPTIONIST_MAX_PCT + 1e-6;
  const overCeiling = requestedPct > MAX_REMISE_PCT + 1e-6;
  const preview = mode === "pourcentage" ? Math.round((base * pct) / 100) : value;
  const canApply = selected.length > 0 && value > 0 && !overCeiling && (!needsManager || /^\d{4,6}$/.test(managerCode));

  function apply() {
    const res = grantDiscount(sale.id, selected, mode, value, needsManager ? managerCode : undefined);
    if (!res.ok) return setMsg(res.message);
    onDone();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-base-content/70">
          {selected.length === 0 ? (
            "Touchez les prestations à remiser"
          ) : (
            <>
              {selected.length} {selected.length > 1 ? "prestations" : "prestation"} ·{" "}
              <span className="tabular-nums">{formatFcfa(base)}</span>
            </>
          )}
        </p>
        <SegmentedToggle
          className="shrink-0"
          value={mode}
          onChange={(v) => {
            setMode(v as RemiseMode);
            setMsg(null);
          }}
          options={[
            { value: "pourcentage", label: "%" },
            { value: "montant", label: "Montant" },
          ]}
        />
      </div>

      {mode === "pourcentage" ? (
        <div className="grid grid-cols-4 gap-2">
          {PCT_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={pct === p}
              onClick={() => {
                setPct(p);
                setMsg(null);
              }}
              className={cn(
                "flex h-14 flex-col items-center justify-center rounded-xl border text-base font-bold tabular-nums transition active:scale-[0.97]",
                pct === p ? "border-primary bg-primary text-primary-content" : "border-border bg-white text-base-content",
              )}
            >
              {p} %
              {p > RECEPTIONIST_MAX_PCT && (
                <span className={cn("text-xs font-semibold", pct === p ? "text-primary-content/80" : "text-base-content/45")}>
                  code manager
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <label className="flex items-center gap-2">
          <TextInput
            inputMode="numeric"
            autoFocus
            value={montant}
            onChange={(e) => {
              setMontant(e.target.value.replace(/\D/g, ""));
              setMsg(null);
            }}
            placeholder="0"
            aria-label="Montant de la remise"
            className="flex-1 text-right text-lg font-semibold tabular-nums"
          />
          <span className="text-base-content/55">F</span>
        </label>
      )}

      {needsManager && !overCeiling && (
        <div className="flex items-center gap-3 rounded-xl bg-accent p-2.5 pl-3">
          <ShieldCheck aria-hidden className="size-4 shrink-0 text-secondary" />
          <span className="flex-1 text-xs font-medium text-secondary">
            Au-delà de {RECEPTIONIST_MAX_PCT} % — code manager
          </span>
          <TextInput
            size="compact"
            inputMode="numeric"
            value={managerCode}
            onChange={(e) => setManagerCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="4 à 6 chiffres"
            aria-label="Code manager"
            className="w-40 tabular-nums tracking-[0.25em]"
          />
        </div>
      )}
      {overCeiling && (
        <p className="text-xs font-medium text-destructive">
          {MAX_REMISE_PCT} % est le plafond — au plus {formatFcfa(Math.round((base * MAX_REMISE_PCT) / 100))} sur ces prestations.
        </p>
      )}
      {msg && <p className="text-xs font-medium text-destructive">{msg}</p>}

      <div className="flex gap-2">
        {editing ? (
          <Button
            variant="danger-outline"
            size="default"
            icon={<X className="size-4" />}
            onClick={() => {
              removeRemise(sale.id, editing.id);
              onDone();
            }}
          >
            Retirer
          </Button>
        ) : (
          <Button variant="outline" size="default" onClick={onDone}>
            Annuler
          </Button>
        )}
        <Button variant="brand" size="default" className="flex-1" disabled={!canApply} onClick={apply}>
          {preview > 0 && selected.length > 0 && !overCeiling ? `Appliquer −${formatFcfa(preview)}` : "Appliquer"}
        </Button>
      </div>
      {editing && (
        <button type="button" onClick={onDone} className="min-h-11 text-sm font-medium text-secondary">
          Garder la remise telle quelle
        </button>
      )}
    </div>
  );
}
