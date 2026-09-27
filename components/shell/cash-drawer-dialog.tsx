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

/**
 * Comptage de caisse — à la connexion et à la déconnexion. Démo : le montant n'est pas conservé.
 * À la déconnexion, le minimum n'est jamais annoncé pendant la saisie : c'est seulement au clic sur
 * « Se déconnecter » que, s'il manque de l'argent, un second écran indique le montant à rajouter,
 * avec un bouton OK qui mène à l'écran de déconnexion.
 */
export function CashDrawerDialog({ open, mode, onConfirm, onCancel }: CashDrawerDialogProps) {
  const [value, setValue] = useState("");
  const [shortfall, setShortfall] = useState<number | null>(null);
  const amount = Number(value);
  const valid = value !== "";

  function close(fn: () => void) {
    setValue("");
    setShortfall(null);
    fn();
  }

  function submit() {
    if (!valid) return;
    const missing = mode === "close" ? Math.max(0, CASH_FLOAT_MIN - amount) : 0;
    if (missing > 0) setShortfall(missing);
    else close(() => onConfirm(amount));
  }

  if (shortfall !== null) {
    return (
      <Dialog open={open} labelledBy="cash-drawer-title" className="max-w-sm p-6">
        <h2 id="cash-drawer-title" className="font-heading text-lg font-semibold text-base-content">
          Montant à rajouter en caisse
        </h2>
        <p className="mt-4 font-heading text-3xl font-semibold tabular-nums text-base-content">
          {formatFcfa(shortfall)}
        </p>
        <p className="mt-2 text-sm text-base-content/70">
          Rajoutez ce montant dans la caisse avant de quitter le poste.
        </p>
        <Button type="button" variant="brand" autoFocus onClick={() => close(() => onConfirm(amount))} className="mt-6 w-full">
          OK
        </Button>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} labelledBy="cash-drawer-title" className="max-w-sm p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
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
