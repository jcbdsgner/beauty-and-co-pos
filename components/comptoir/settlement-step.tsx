"use client";

import { useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { NumericKeypad } from "@/components/ui/molecules/numeric-keypad";
import { SettlementTicket } from "@/components/comptoir/settlement-ticket";
import { PAYMENT_MODES, PAYMENT_MODE_LABEL, PaymentModeGlyph } from "@/components/comptoir/payment-modes";
import { computeTotals, useAppData } from "@/components/providers/app-data-provider";
import { cn, formatFcfa } from "@/lib/utils";
import type { PaymentMode, Sale } from "@/lib/data/types";

const MAX_PARTS = 3;

type Part = { id: number; mode: PaymentMode | null; amount: string };
/** What the keypad is typing into: a part's amount, or the cash the cliente handed over. */
type KeypadTarget = { kind: "amount"; index: number } | { kind: "cash" } | null;

/**
 * La station Règlement (ADR 0031). Same two-column sheet as the panier: the ticket keeps the right
 * column (now carrying remises, avantages and the confirm button), and the Menu on the left gives
 * way to the payment itself.
 *
 * Payment is a list of 1 to 3 *parts*. One part = the whole amount, no typing. Split it and every
 * part but the last is typed on the keypad; **the last part is always "le reste"**, computed — so
 * a split can never be off by a franc, only over-allotted (which is said plainly). The same mode
 * may appear twice (two cards); Espèces only once, since it carries the change calculation.
 */
export function SettlementStep({ sale }: { sale: Sale }) {
  const { confirmPayment, updateSale } = useAppData();
  const { amountDue } = computeTotals(sale);

  const [parts, setParts] = useState<Part[]>([{ id: 1, mode: null, amount: "" }]);
  const [active, setActive] = useState(0);
  const [target, setTarget] = useState<KeypadTarget>(null);
  const [cashReceived, setCashReceived] = useState("");

  const split = parts.length > 1;
  const typedSum = parts.slice(0, -1).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const amounts = parts.map((p, i) => (!split ? amountDue : i < parts.length - 1 ? Number(p.amount) || 0 : amountDue - typedSum));
  const overAllotted = split && amounts[amounts.length - 1] < 0;
  const cashIndex = parts.findIndex((p) => p.mode === "especes");
  const cashDue = cashIndex >= 0 ? Math.max(0, amounts[cashIndex]) : 0;
  const cashGiven = Number(cashReceived) || 0;
  const change = cashIndex >= 0 && cashReceived !== "" ? Math.max(0, cashGiven - cashDue) : 0;

  const missingMode = parts.findIndex((p) => p.mode === null);
  const zeroPart = split ? amounts.findIndex((a) => a <= 0) : -1;
  const cashShort = cashIndex >= 0 && amountDue > 0 && cashGiven < cashDue;

  const hint =
    amountDue === 0
      ? null
      : missingMode >= 0
        ? split
          ? `Choisissez le moyen de la part ${missingMode + 1}.`
          : "Choisissez le moyen de paiement."
        : overAllotted
          ? `Les parts dépassent le total de ${formatFcfa(-amounts[amounts.length - 1])}.`
          : zeroPart >= 0
            ? `Indiquez le montant de la part ${zeroPart + 1}.`
            : cashShort
              ? cashReceived === ""
                ? "Saisissez le montant reçu en espèces."
                : `Il manque ${formatFcfa(cashDue - cashGiven)} en espèces.`
              : null;
  const canConfirm = hint === null;

  function pickMode(mode: PaymentMode) {
    const leavingCash = parts[active].mode === "especes" && mode !== "especes";
    const next = parts.map((p, i) => (i === active ? { ...p, mode } : p));
    setParts(next);
    if (leavingCash) setCashReceived("");
    if (mode === "especes") return setTarget({ kind: "cash" });
    // A typed part whose amount is still empty: stay on it, the keypad asks for its amount next.
    const editable = (i: number) => next.length > 1 && i < next.length - 1;
    if (editable(active) && next[active].amount === "") return setTarget({ kind: "amount", index: active });
    // Otherwise move on to the next part still without a mode.
    const nextEmpty = next.findIndex((p) => p.mode === null);
    const nextActive = nextEmpty >= 0 ? nextEmpty : active;
    setActive(nextActive);
    setTarget(editable(nextActive) ? { kind: "amount", index: nextActive } : null);
  }

  function addPart() {
    if (parts.length >= MAX_PARTS) return;
    // The part that stops being "le reste" becomes a typed one, and starts empty: the keypad asks
    // for it right away, the new last part takes whatever is left.
    const kept = parts.map((p, i) => (i === parts.length - 1 ? { ...p, amount: "" } : p));
    const next = [...kept, { id: Date.now(), mode: null, amount: "" }];
    setParts(next);
    const editIndex = next.length - 2;
    setActive(editIndex);
    setTarget({ kind: "amount", index: editIndex });
  }

  function removePart(index: number) {
    const next = parts.filter((_, i) => i !== index);
    setParts(next);
    setActive(0);
    setTarget(next.some((p) => p.mode === "especes") ? { kind: "cash" } : null);
    if (!next.some((p) => p.mode === "especes")) setCashReceived("");
  }

  function keypadValue() {
    if (target?.kind === "cash") return cashReceived;
    if (target?.kind === "amount") return parts[target.index]?.amount ?? "";
    return "";
  }
  function keypadChange(v: string) {
    if (target?.kind === "cash") return setCashReceived(v);
    if (target?.kind === "amount") setParts(parts.map((p, i) => (i === target.index ? { ...p, amount: v } : p)));
  }

  function confirm() {
    const modes = parts.map((p, i) => ({ mode: p.mode!, amount: amounts[i] }));
    confirmPayment(
      sale.id,
      amountDue === 0 ? [] : modes,
      cashIndex >= 0 && cashReceived !== "" ? { cashReceived: cashGiven, change } : undefined,
    );
  }

  const activeMode = parts[active]?.mode;
  const keypadOn = target !== null && !(target.kind === "amount" && (!split || target.index === parts.length - 1));
  const activeMeta = PAYMENT_MODES.find((m) => m.value === activeMode);

  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)_440px] gap-5 p-5">
      <section
        aria-labelledby="reglement-title"
        className="flex min-h-0 flex-col overflow-hidden rounded-[14px] border border-border bg-white"
      >
        {/* Head — back to the panier, what is owed */}
        <div className="flex shrink-0 items-start justify-between gap-6 border-b border-border px-6 pt-5 pb-5">
          <div>
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="size-4" />}
              onClick={() => updateSale(sale.id, { step: "vente" })}
            >
              Panier
            </Button>
            <h2 id="reglement-title" className="mt-4 text-xs font-semibold tracking-[0.12em] text-base-content/55 uppercase">
              Règlement · {sale.depositPaid ? "reste à encaisser" : "à encaisser"}
            </h2>
            <p
              key={amountDue}
              className="animate-total-pulse origin-left font-[family-name:var(--font-heading)] font-semibold text-[4rem] leading-none text-base-content tabular-nums"
            >
              {formatFcfa(amountDue)}
            </p>
          </div>
          {split && (
            <p className="mt-1 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-secondary">
              En {parts.length} fois
            </p>
          )}
        </div>

        {amountDue === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="font-[family-name:var(--font-heading)] text-xl font-semibold text-base-content">Rien à encaisser</p>
            <p className="max-w-sm text-sm text-base-content/55">
              Remises, avantages et acompte couvrent tout le ticket. Confirmez pour clôturer la vente.
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
            {/* Modes */}
            <div>
              <p className="mb-3 text-[15px] font-medium text-base-content/70">
                {split ? (
                  <>
                    Moyen de la <span className="font-semibold text-base-content">part {active + 1}</span>
                  </>
                ) : (
                  "Comment règle la cliente ?"
                )}
              </p>
              <div className="grid grid-cols-4 gap-3">
                {PAYMENT_MODES.map((m) => {
                  const selected = activeMode === m.value;
                  const cashTaken = m.value === "especes" && cashIndex >= 0 && cashIndex !== active;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      aria-pressed={selected}
                      disabled={cashTaken}
                      onClick={() => pickMode(m.value)}
                      className={cn(
                        "group relative flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition active:scale-[0.97]",
                        "outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
                        selected
                          ? "border-primary bg-accent"
                          : "border-border bg-white hover:border-primary/40",
                        cashTaken && "opacity-40",
                      )}
                    >
                      {selected && (
                        <span className="absolute top-2.5 right-2.5 size-3 rounded-full bg-primary" aria-hidden />
                      )}
                      <span className="flex h-16 items-center justify-center">
                        <PaymentModeGlyph
                          mode={m.value}
                          className={cn(m.logo ? "max-h-14 max-w-[7rem]" : "size-16", !m.logo && (selected ? "text-primary" : "text-secondary"))}
                        />
                      </span>
                      <span className="font-[family-name:var(--font-heading)] text-lg font-semibold text-base-content">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Parts */}
              <div className="flex flex-col gap-2">
                {parts.map((p, i) => {
                  const isLast = i === parts.length - 1;
                  const isActive = i === active;
                  const amountEditable = split && !isLast;
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "rounded-2xl border-2 transition",
                        isActive ? "border-primary bg-accent/60" : "border-border bg-white",
                      )}
                    >
                      <div className="flex items-center gap-2 pr-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActive(i);
                            setTarget(amountEditable ? { kind: "amount", index: i } : p.mode === "especes" ? { kind: "cash" } : null);
                          }}
                          className="flex min-h-16 flex-1 items-center gap-3 px-4 text-left"
                        >
                          {split && (
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-secondary tabular-nums">
                              {i + 1}
                            </span>
                          )}
                          {p.mode ? (
                            <PaymentModeGlyph
                              mode={p.mode}
                              className={cn("shrink-0 text-secondary", p.mode === "carte" || p.mode === "especes" ? "size-6" : "max-h-6 max-w-10")}
                            />
                          ) : null}
                          <span className="min-w-0 flex-1">
                            <span className={cn("block text-[15px] font-semibold", p.mode ? "text-base-content" : "text-base-content/45")}>
                              {p.mode ? PAYMENT_MODE_LABEL[p.mode] : "Moyen à choisir"}
                            </span>
                            {split && isLast && <span className="block text-xs text-base-content/55">le reste, calculé</span>}
                          </span>
                          <span
                            className={cn(
                              "text-xl font-semibold tabular-nums",
                              amounts[i] < 0 ? "text-destructive" : "text-base-content",
                              amountEditable && target?.kind === "amount" && target.index === i && "underline decoration-primary decoration-2 underline-offset-8",
                            )}
                          >
                            {amountEditable && p.amount === "" ? "— F" : formatFcfa(amounts[i])}
                          </span>
                        </button>
                        {split && (
                          <button
                            type="button"
                            onClick={() => removePart(i)}
                            aria-label={`Retirer la part ${i + 1}`}
                            className="flex size-11 shrink-0 items-center justify-center rounded-full text-base-content/45 transition active:scale-90 hover:bg-white hover:text-destructive"
                          >
                            <X aria-hidden className="size-4" />
                          </button>
                        )}
                      </div>

                      {p.mode === "especes" && (
                        <div className="grid grid-cols-2 border-t border-border/80">
                          <button
                            type="button"
                            onClick={() => {
                              setActive(i);
                              setTarget({ kind: "cash" });
                            }}
                            className={cn(
                              "flex flex-col items-start px-4 py-2.5 text-left",
                              target?.kind === "cash" && "bg-white/70",
                            )}
                          >
                            <span className="text-xs font-medium text-base-content/55">Reçu</span>
                            <span
                              className={cn(
                                "text-lg font-semibold tabular-nums text-base-content",
                                target?.kind === "cash" && "underline decoration-primary decoration-2 underline-offset-8",
                              )}
                            >
                              {cashReceived === "" ? "— F" : formatFcfa(cashGiven)}
                            </span>
                          </button>
                          <div className="flex flex-col items-end px-4 py-2.5">
                            <span className="text-xs font-medium text-base-content/55">Rendu</span>
                            <span className={cn("text-lg font-semibold tabular-nums", cashReceived !== "" && !cashShort ? "text-success" : "text-base-content/45")}>
                              {cashReceived === "" || cashShort ? "—" : formatFcfa(change)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {parts.length < MAX_PARTS && (
                  <button
                    type="button"
                    onClick={addPart}
                    className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-base-300 text-[15px] font-semibold text-secondary transition active:scale-[0.99] hover:border-primary/40 hover:bg-accent/40"
                  >
                    <Plus aria-hidden className="size-4" />
                    {split ? "Ajouter une 3ᵉ part" : "Payer en plusieurs fois"}
                    <span className="font-medium text-base-content/45">· jusqu&apos;à 3</span>
                  </button>
                )}
              </div>

              {/* Keypad, or what to check on the terminal / phone */}
              <div>
                {keypadOn ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold tracking-[0.12em] text-base-content/55 uppercase">
                      {target?.kind === "cash" ? "Espèces reçues" : `Montant de la part ${(target?.kind === "amount" ? target.index : 0) + 1}`}
                    </p>
                    <NumericKeypad value={keypadValue()} onChange={keypadChange} />
                  </div>
                ) : activeMeta ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl bg-base-200 p-6 text-center">
                    <PaymentModeGlyph
                      mode={activeMeta.value}
                      className={activeMeta.logo ? "max-h-12 max-w-[8rem]" : "size-12 text-secondary"}
                    />
                    <p className="text-[15px] font-medium text-base-content/80">{activeMeta.hint}</p>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-base-300 p-6 text-center text-sm text-base-content/55">
                    Touchez le moyen choisi par la cliente.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <SettlementTicket sale={sale} onConfirm={confirm} canConfirm={canConfirm} confirmHint={hint} />
    </div>
  );
}
