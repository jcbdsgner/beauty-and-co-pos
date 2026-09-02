"use client";

import { useEffect, useRef, useState } from "react";
import { Gift, ScanLine, Star } from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Button } from "@/components/ui/atoms/button";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Alert } from "@/components/ui/molecules/alert";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientByLoyaltyCode, clientFullName } from "@/lib/data/clientele";
import { carteCadeauByCode } from "@/lib/data/cartes-cadeaux";
import type { Sale } from "@/lib/data/types";

/** Demo payloads for "Simuler la détection" — one per card kind, always explicitly labelled demo. */
const DEMO_LOYALTY = "BACO-FID-1042"; // Awa Sarr
const DEMO_GIFT = "BACO-GIFT-25000";

/**
 * One dialog, reached from the ticket's "Scanner" and from the Remise panel's scan icon. A real
 * `<video>` feed behind a viewfinder, and below it two code fields:
 *  · carte de fidélité → identifies the cliente (attaches her fiche to the sale);
 *  · carte cadeau → applies the prepaid instrument to the sale.
 * Possession of the card is the authorisation — a bearer credential, never a password (ADR 0013).
 * A scanned QR is routed by what its payload resolves to.
 */
export function IdentifyDialog({ open, sale, onClose }: { open: boolean; sale: Sale; onClose: () => void }) {
  const { clients, updateSale, applyGiftCard } = useAppData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState(false);
  const [loyaltyInput, setLoyaltyInput] = useState("");
  const [giftInput, setGiftInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setCameraError(false);
      })
      .catch(() => setCameraError(true));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [open]);

  const saleId = sale.id;
  const identifiedClient = sale.clientId ? clients.find((c) => c.id === sale.clientId) : undefined;

  function identifyByLoyalty(raw: string) {
    const client = clientByLoyaltyCode(clients, raw);
    if (!client) {
      setError("Ce code de fidélité n'est reconnu pour aucune cliente — utilisez la recherche par nom.");
      return;
    }
    updateSale(saleId, { clientId: client.id });
    onClose();
  }

  function applyGift(raw: string) {
    const res = applyGiftCard(saleId, raw);
    if (res.ok) {
      onClose();
      return;
    }
    setError(res.message);
  }

  // A scanned QR could be either card — route by what the payload resolves to.
  function routeScan(raw: string) {
    if (carteCadeauByCode(raw)) applyGift(raw);
    else identifyByLoyalty(raw);
  }

  return (
    <Dialog open={open} labelledBy="identify-title" className="max-w-sm rounded-3xl p-6">
      <CloseButton onClick={onClose} />
      <h2
        id="identify-title"
        className="font-[family-name:var(--font-heading)] font-semibold text-xl text-[var(--color-gray-900)]"
      >
        Scanner ou saisir une carte
      </h2>
      <p className="mt-1 text-sm text-[var(--color-gray-500)]">
        La carte de fidélité identifie la cliente. La carte cadeau s&apos;applique au paiement.
      </p>

      <div className="relative mt-4 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-gray-900)]">
        <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 size-full object-cover opacity-80" />
        <svg viewBox="0 0 200 200" className="relative size-3/4 text-[var(--core-brand-color)]">
          <path
            d="M16 16 L16 56 M16 16 L56 16 M184 16 L144 16 M184 16 L184 56 M16 184 L16 144 M16 184 L56 184 M184 184 L184 144 M184 184 L144 184"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {cameraError && (
        <Alert tone="error" title="Caméra indisponible — saisissez le code ci-dessous." className="mt-4" />
      )}

      <p className="mt-4 text-center text-xs font-semibold tracking-wide text-[var(--color-gray-400)] uppercase">Mode démo</p>
      <div className="mt-2 flex gap-2">
        <Button variant="dark" size="sm" className="flex-1" onClick={() => routeScan(DEMO_LOYALTY)}>
          <ScanLine className="size-4" />
          Fidélité
        </Button>
        <Button variant="dark" size="sm" className="flex-1" onClick={() => routeScan(DEMO_GIFT)}>
          <ScanLine className="size-4" />
          Carte cadeau
        </Button>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <section>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
            <Star className="size-3.5" /> Code carte de fidélité
          </p>
          <div className="flex gap-2">
            <TextInput
              size="compact"
              value={loyaltyInput}
              onChange={(e) => setLoyaltyInput(e.target.value)}
              placeholder="BACO-FID-0000"
              autoCapitalize="characters"
              spellCheck={false}
            />
            <Button
              variant="brand"
              size="sm"
              className="shrink-0"
              disabled={!loyaltyInput.trim()}
              onClick={() => identifyByLoyalty(loyaltyInput)}
            >
              Identifier
            </Button>
          </div>
        </section>

        <section>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
            <Gift className="size-3.5" /> Code carte cadeau
          </p>
          <div className="flex gap-2">
            <TextInput
              size="compact"
              value={giftInput}
              onChange={(e) => setGiftInput(e.target.value)}
              placeholder="BACO-GIFT-00000"
              autoCapitalize="characters"
              spellCheck={false}
            />
            <Button
              variant="brand"
              size="sm"
              className="shrink-0"
              disabled={!giftInput.trim()}
              onClick={() => applyGift(giftInput)}
            >
              Appliquer
            </Button>
          </div>
        </section>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}

      {identifiedClient && (
        <p className="mt-3 text-sm text-[var(--color-success)]">Cliente identifiée : {clientFullName(identifiedClient)}.</p>
      )}
    </Dialog>
  );
}
