"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { Button } from "@/components/ui/atoms/button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { TextInput } from "@/components/ui/atoms/text-input";
import { formatFcfa } from "@/lib/utils";

/** Démo : montant qui doit rester en caisse à la déconnexion. */
export const CASH_FLOAT_MIN = 5000;

type CashDrawerDialogProps = {
  open: boolean;
  /** "open" : fond de caisse à la connexion. "close" : montant restant à la déconnexion (≥ CASH_FLOAT_MIN). */
  mode: "open" | "close";
  onConfirm: (amount: number) => void;
  onCancel: () => void;
};

/** Comptage de caisse — à la connexion et à la déconnexion. Démo : le montant n'est pas conservé. */
export function CashDrawerDialog({ open, mode, onConfirm, onCancel }: CashDrawerDialogProps) {
  const [value, setValue] = useState("");
  const amount = Number(value);
  const missing = mode === "close" && value !== "" ? Math.max(0, CASH_FLOAT_MIN - amount) : 0;
  const valid = value !== "" && missing === 0;

  function close(fn: () => void) {
    setValue("");
    fn();
  }

  return (
    <Dialog open={open} labelledBy="cash-drawer-title" className="max-w-sm p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) close(() => onConfirm(amount));
        }}
      >
        <h2 id="cash-drawer-title" className="font-heading text-lg font-semibold text-base-content">
          {mode === "open" ? "Fond de caisse" : "Se déconnecter ?"}
        </h2>

        <FieldLabel variant="plain" htmlFor="cash-drawer-amount" className="mt-5 mb-2">
          {mode === "open" ? "Montant en caisse" : "Montant restant en caisse"}
        </FieldLabel>
        <div className="flex items-center gap-2">
          <TextInput
            id="cash-drawer-amount"
            inputMode="numeric"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
            placeholder="0"
            className="flex-1 text-right text-lg font-semibold tabular-nums"
          />
          <span className="text-base-content/55">F</span>
        </div>
        {missing > 0 && (
          <p className="mt-2 text-sm font-medium text-destructive">Il manque {formatFcfa(missing)}</p>
        )}

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={() => close(onCancel)} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" variant="brand" disabled={!valid} className="flex-1">
            {mode === "open" ? "Valider" : "Se déconnecter"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
