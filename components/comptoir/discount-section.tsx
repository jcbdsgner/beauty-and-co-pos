"use client";

import { useState } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, Gift, Key, ScanLine, Star } from "lucide-react";
import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { TextInput } from "@/components/ui/atoms/text-input";
import { RoundStepButton } from "@/components/ui/atoms/round-step-button";
import { useAppData, computeTotals } from "@/components/providers/app-data-provider";
import { formatFcfa } from "@/lib/utils";
import type { Sale } from "@/lib/data/types";

export function DiscountSection({ sale, onScanGiftCard }: { sale: Sale; onScanGiftCard: () => void }) {
  const { applyGiftCard, applyManagerCode, setLoyaltyPointsUsed, clients } = useAppData();
  const [giftCardCode, setGiftCardCode] = useState("");
  const [managerCode, setManagerCode] = useState("");
  const [giftCardMsg, setGiftCardMsg] = useState<string | null>(null);
  const [managerMsg, setManagerMsg] = useState<string | null>(null);

  const client = sale.clientId ? clients.find((c) => c.id === sale.clientId) : undefined;
  const redeemable = client ? Math.floor(client.points / 100) * 100 : 0;
  const hasDiscount = sale.giftCardApplied !== null || sale.managerDiscountApplied > 0 || sale.loyaltyPointsUsed > 0;
  const { loyaltyDiscount } = computeTotals(sale);

  return (
    <AccordionPrimitive.Root type="single" collapsible className="border-t border-[var(--color-gray-200)] pt-3">
      <AccordionPrimitive.Item value="remise">
        <AccordionPrimitive.Header>
          <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-2 rounded-xl py-2 text-[15px] font-medium text-[var(--color-gray-700)] transition active:scale-[0.99] hover:bg-[var(--color-gray-50)]">
            <span className="flex items-center gap-1.5">
              <Gift aria-hidden className="size-4" />
              Remise / Code cadeau
              {hasDiscount && <Badge variant="success">Actif</Badge>}
            </span>
            <ChevronDown aria-hidden className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-[accordion-down_200ms_ease-out] data-[state=closed]:animate-[accordion-up_200ms_ease-out]">
          <div className="flex flex-col gap-4 pt-3">
            <div>
              <FieldLabel variant="plain" className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-gray-500)] uppercase">
                <Gift className="size-3.5" /> Code cadeau
              </FieldLabel>
              <div className="flex gap-2">
                <TextInput size="compact" value={giftCardCode} onChange={(e) => setGiftCardCode(e.target.value)} placeholder="BACO-GIFT-25000" />
                <button
                  type="button"
                  onClick={onScanGiftCard}
                  aria-label="Scanner la carte cadeau"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-gray-200)] text-[var(--brand-taupe-muted)] transition active:scale-90 hover:border-[var(--brand-taupe-muted)] hover:bg-[var(--brand-rose-soft)]"
                >
                  <ScanLine aria-hidden className="size-4" />
                </button>
                <Button
                  variant="brand"
                  disabled={!giftCardCode.trim()}
                  onClick={() => {
                    const res = applyGiftCard(sale.id, giftCardCode);
                    setGiftCardMsg(res.message);
                    if (res.ok) setGiftCardCode("");
                  }}
                  className="w-auto shrink-0"
                >
                  OK
                </Button>
              </div>
              {giftCardMsg && (
                <p className={`mt-1 text-xs font-medium ${sale.giftCardApplied ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}>{giftCardMsg}</p>
              )}
              {sale.giftCardApplied && !giftCardMsg && (
                <p className="mt-1 text-xs font-medium text-[var(--color-success)]">
                  Carte « {sale.giftCardApplied.code} » appliquée (-{formatFcfa(sale.giftCardApplied.amount)})
                </p>
              )}
            </div>

            {client && (
              <div>
                <FieldLabel variant="plain" className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-gray-500)] uppercase">
                  <Star className="size-3.5" /> Points fidélité ({client.points} pts)
                </FieldLabel>
                {redeemable > 0 ? (
                  <>
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--brand-rose-soft)] px-3 py-2">
                      <RoundStepButton
                        size="sm"
                        direction="decrement"
                        onClick={() => setLoyaltyPointsUsed(sale.id, Math.max(0, sale.loyaltyPointsUsed - 100))}
                        disabled={sale.loyaltyPointsUsed <= 0}
                        ariaLabel="Utiliser 100 points de moins"
                      />
                      <span className="text-center">
                        <span className="block text-sm font-bold text-[var(--color-gray-900)]">{sale.loyaltyPointsUsed} pts</span>
                        {sale.loyaltyPointsUsed > 0 && <span className="block text-xs font-medium text-[var(--color-success)]">-{formatFcfa(loyaltyDiscount)}</span>}
                      </span>
                      <RoundStepButton
                        size="sm"
                        direction="increment"
                        onClick={() => setLoyaltyPointsUsed(sale.id, Math.min(redeemable, sale.loyaltyPointsUsed + 100))}
                        disabled={sale.loyaltyPointsUsed >= redeemable}
                        ariaLabel="Utiliser 100 points de plus"
                      />
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-gray-500)]">100 pts = 1 000 F</p>
                  </>
                ) : (
                  <p className="text-xs text-[var(--color-gray-500)]">Minimum 100 pts requis pour une réduction fidélité.</p>
                )}
              </div>
            )}

            <div>
              <FieldLabel variant="plain" className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-gray-500)] uppercase">
                <Key className="size-3.5" /> Code remise manager
              </FieldLabel>
              <div className="flex gap-2">
                <TextInput size="compact" value={managerCode} onChange={(e) => setManagerCode(e.target.value)} placeholder="DISC-1234" />
                <Button
                  variant="dark"
                  disabled={!managerCode.trim()}
                  onClick={() => {
                    const res = applyManagerCode(sale.id, managerCode);
                    setManagerMsg(res.message);
                    if (res.ok) setManagerCode("");
                  }}
                  className="w-auto shrink-0"
                >
                  OK
                </Button>
              </div>
              {managerMsg && (
                <p className={`mt-1 text-xs font-medium ${sale.managerDiscountApplied > 0 ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}>{managerMsg}</p>
              )}
            </div>
          </div>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  );
}
