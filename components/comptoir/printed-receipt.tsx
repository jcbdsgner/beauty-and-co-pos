import { Logo } from "@/components/ui/atoms/logo";
import { computeTotals } from "@/components/providers/app-data-provider";
import { PAYMENT_MODE_LABEL } from "@/components/comptoir/payment-modes";
import { clientFullName } from "@/lib/data/clientele";
import { formatFcfa } from "@/lib/utils";
import type { Cliente, Sale } from "@/lib/data/types";

const PRINT_DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Dashed rule of the thermal ticket — `double` stacks two, as around the title. */
function Rule({ double = false }: { double?: boolean }) {
  return (
    <div className="my-3 flex flex-col gap-[3px]">
      <div className={double ? "border-t-2 border-dashed border-black" : "border-t border-dashed border-black"} />
      {double && <div className="border-t-2 border-dashed border-black" />}
    </div>
  );
}

function Row({ label, value, strong = false }: { label: React.ReactNode; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "flex justify-between gap-3 text-[15px] font-bold" : "flex justify-between gap-3"}>
      <span className="min-w-0">{label}</span>
      <span className="shrink-0 tabular-nums">{value}</span>
    </div>
  );
}

/** Decorative barcode drawn from the sale id — deterministic, never scanned (demo, like `DemoQrBlock`). */
function Barcode({ seed }: { seed: string }) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  while (x < 196) {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    const w = 1 + (h % 3);
    bars.push({ x, w });
    x += w + 1 + ((h >>> 8) % 2);
  }
  return (
    <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="h-12 w-full" aria-hidden>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={40} fill="black" />
      ))}
    </svg>
  );
}

/**
 * Le reçu tel qu'il sort de l'imprimante thermique 80 mm — jamais rendu à l'écran (le ticket de
 * la colonne droite reste l'aperçu). Noir sur blanc, filets pointillés, logo Beauty & Co en tête,
 * MERCI et code-barres en pied. Même ventilation que `DiscountBreakdown`, sans le motif de remise
 * (interne, ADR 0003).
 */
export function PrintedReceipt({ sale, client }: { sale: Sale; client?: Cliente }) {
  const t = computeTotals(sale);
  const modes = sale.payment?.modes ?? [];
  const touched = t.totalDiscount > 0 || t.coverageDiscount > 0;

  return (
    <div className="w-[68mm] bg-white font-[family-name:var(--font-sans)] text-[13px] leading-snug text-black">
      <Logo size="footer" className="mx-auto h-[26mm] w-[56mm]" />

      <Rule double />
      <p className="text-center font-[family-name:var(--font-heading)] text-[26px] font-bold tracking-[0.08em]">REÇU</p>
      <Rule double />

      <div className="flex flex-col gap-0.5 text-[12px]">
        <Row label="Date" value={PRINT_DATE_FMT.format(new Date(sale.encaisseeAt ?? sale.createdAt))} />
        <Row label="Vente" value={sale.label} />
        {client && <Row label="Cliente" value={clientFullName(client)} />}
      </div>

      <Rule />

      <ul className="flex flex-col gap-1.5">
        {sale.cart.map((line) => {
          const covered = t.coveredAmountByService[line.refId] ?? 0;
          return (
            <li key={line.id}>
              <Row label={`${line.qty}× ${line.name}`} value={formatFcfa(line.unitPrice * line.qty)} />
              {line.beneficiary && <p className="pl-5 text-[11px]">pour {line.beneficiary}</p>}
              {covered > 0 && <p className="pl-5 text-[11px]">Déjà payé</p>}
            </li>
          );
        })}
      </ul>

      <Rule />

      {(touched || t.depositPaid > 0) && (
        <div className="mb-2 flex flex-col gap-0.5">
          <Row label="Sous-total" value={formatFcfa(t.subtotal)} />
          {t.coverageByInstance.map((c) => (
            <Row key={c.instanceId} label={`Déjà payé — ${c.planLabel}`} value={`−${formatFcfa(c.amount)}`} />
          ))}
          {t.remiseBreakdown.map((r) => (
            <Row key={r.id} label={`Remise ${r.mode === "pourcentage" ? `${r.value} %` : "accordée"}`} value={`−${formatFcfa(r.amount)}`} />
          ))}
          {t.loyaltyDiscount > 0 && (
            <Row label={`Points fidélité (${sale.loyaltyPointsUsed} pts)`} value={`−${formatFcfa(t.loyaltyDiscount)}`} />
          )}
          {t.giftCardDiscount > 0 && <Row label="Carte cadeau" value={`−${formatFcfa(t.giftCardDiscount)}`} />}
          {t.depositPaid > 0 && <Row label="Acompte versé" value={`−${formatFcfa(t.depositPaid)}`} />}
        </div>
      )}
      <Row label={t.depositPaid > 0 ? "RESTE À PAYER" : "TOTAL"} value={formatFcfa(t.amountDue)} strong />

      {modes.length > 0 && (
        <>
          <Rule />
          <div className="flex flex-col gap-0.5 text-[12px] uppercase">
            {modes.map((m, i) => (
              <Row key={i} label={PAYMENT_MODE_LABEL[m.mode]} value={formatFcfa(m.amount)} />
            ))}
            {sale.payment?.cashReceived !== undefined && (
              <>
                <Row label="Espèces reçues" value={formatFcfa(sale.payment.cashReceived)} />
                <Row label="Rendu" value={formatFcfa(sale.payment.change ?? 0)} />
              </>
            )}
          </div>
        </>
      )}

      {client && (sale.loyaltyPointsEarned ?? 0) > 0 && (
        <p className="mt-2 text-center text-[11px]">+{sale.loyaltyPointsEarned} points fidélité · solde {client.points} pts</p>
      )}
      {t.giftCardDiscount > 0 && t.giftCardRemaining > 0 && (
        <p className="mt-1 text-center text-[11px]">Reste {formatFcfa(t.giftCardRemaining)} sur la carte cadeau</p>
      )}

      <Rule />
      <p className="text-center font-[family-name:var(--font-heading)] text-[26px] font-bold tracking-[0.08em]">MERCI</p>
      <Rule />

      <Barcode seed={sale.id} />
      <p className="mt-1 text-center font-mono text-[11px] tracking-[0.2em]">{sale.id.toUpperCase()}</p>
    </div>
  );
}
