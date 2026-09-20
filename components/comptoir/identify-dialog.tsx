"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { Button } from "@/components/ui/atoms/button";
import { TextInput } from "@/components/ui/atoms/text-input";
import { ScanCamera } from "@/components/shared/scan-camera";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientByLoyaltyCode } from "@/lib/data/clientele";
import type { Sale } from "@/lib/data/types";

/** Prototype: no real card carries a resolvable QR payload, so any QR the camera reads stands in
 *  for this sample loyalty card. Replaced by a real lookup once cards are printed with real codes. */
const DEMO_QR_FALLBACK = "BACO-FID-1042"; // Awa Sarr

/**
 * One dialog, reached from the ticket's "Scanner". A real `<video>` feed behind a viewfinder, and a
 * single code field below it for a carte de fidélité code → attaches the cliente fiche. Her gift
 * card, if any, then links itself to the sale off her fiche (ADR 0013) — nothing to scan for it.
 * The camera reads QR codes on its own (BarcodeDetector where available); in this prototype any
 * QR read stands in for the sample card. A wrong identification is undone from the ticket
 * ("Retirer" on the cliente row).
 */
export function IdentifyDialog({ open, sale, onClose }: { open: boolean; sale: Sale; onClose: () => void }) {
  const { clients, updateSale } = useAppData();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const saleId = sale.id;

  function resolve(raw: string, fromScan: boolean) {
    const value = raw.trim();
    if (!value) return;
    setError(null);

    const client = clientByLoyaltyCode(clients, value);
    if (client) {
      updateSale(saleId, { clientId: client.id });
      onClose();
      return;
    }

    if (fromScan) {
      // Any QR read counts in the prototype — fall back to the sample loyalty card.
      const demo = clientByLoyaltyCode(clients, DEMO_QR_FALLBACK);
      if (demo) {
        updateSale(saleId, { clientId: demo.id });
        onClose();
        return;
      }
    }

    setError("Code non reconnu — vérifiez-le ou cherchez la cliente par son nom.");
  }

  return (
    <Dialog open={open} labelledBy="identify-title" className="max-w-sm rounded-3xl p-6">
      <h2
        id="identify-title"
        className="font-[family-name:var(--font-heading)] font-semibold text-xl text-base-content"
      >
        Identifier la cliente
      </h2>

      <ScanCamera
        active={open}
        onDetect={(raw) => resolve(raw, true)}
        hint="Présentez le QR de la carte de fidélité, ou saisissez son code."
      />

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          resolve(code, false);
        }}
      >
        <TextInput
          size="compact"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code de la carte"
          autoCapitalize="characters"
          spellCheck={false}
          aria-label="Code de la carte de fidélité"
        />
        <Button type="submit" variant="brand" size="sm" className="shrink-0" disabled={!code.trim()}>
          Valider
        </Button>
      </form>

      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}

      <Button variant="outline" size="default" className="mt-5 w-full" onClick={onClose}>
        Annuler
      </Button>
    </Dialog>
  );
}
