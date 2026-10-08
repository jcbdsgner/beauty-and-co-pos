"use client";

import { useMemo, useState } from "react";
import { Building2, ChevronRight, Minus, Percent, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Dialog } from "@/components/ui/molecules/dialog";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { MenuBrowser } from "@/components/comptoir/menu-panel";
import { RemisesDialog } from "@/components/comptoir/remises-dialog";
import { documentTotals } from "@/components/devis/lib";
import { useAppData } from "@/components/providers/app-data-provider";
import { applyRemise, devisAsSale } from "@/lib/store/app-store";
import { devisLineFrom } from "@/lib/data/devis";
import { clientFullName } from "@/lib/data/clientele";
import { cn, formatFcfa, formatPhone } from "@/lib/utils";
import type { BillingCompany, DevisChannel, DevisLine, RemiseAccordee } from "@/lib/data/types";

const EMPTY_COMPANY: BillingCompany = { name: "", address: "", ninea: "" };

/**
 * « Nouveau devis » (ADR 0042) — la grammaire du Comptoir : le Menu à gauche (prestations et
 * produits, jamais de boissons ; le stock s'affiche sans bloquer), le devis à droite comme un
 * ticket. La remise accordée suit les règles du panier (même fenêtre, mêmes plafonds) et son motif
 * se saisit ici. Aucun avantage personnel. Enregistre en brouillon ou envoie dans le fil.
 * `devisId` reprend un brouillon — nouveau, ou version suivante d'un devis envoyé.
 */
export function DevisComposer({ clientId, devisId, onClose }: { clientId: string; devisId?: string; onClose: () => void }) {
  const { clients, devis, createDevis, updateDevisDraft, sendDevis, updateClient } = useAppData();
  const client = clients.find((c) => c.id === clientId);
  const existing = devisId ? devis.find((d) => d.id === devisId && d.status === "brouillon") : undefined;

  const [lines, setLines] = useState<DevisLine[]>(existing?.lines ?? []);
  const [remises, setRemises] = useState<RemiseAccordee[]>(existing?.remises ?? []);
  const [reason, setReason] = useState(existing?.remiseReason ?? "");
  const initialCompany = existing ? existing.billTo : client?.billingCompany;
  const [toCompany, setToCompany] = useState(Boolean(initialCompany));
  const [company, setCompany] = useState<BillingCompany>(initialCompany ?? client?.billingCompany ?? EMPTY_COMPANY);
  const [channel, setChannel] = useState<DevisChannel>(existing?.sentChannel ?? "whatsapp");
  const [remisesOpen, setRemisesOpen] = useState(false);

  const countByRef = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of lines) m[l.refId] = (m[l.refId] ?? 0) + l.qty;
    return m;
  }, [lines]);

  if (!client) return null;

  const sale = { ...devisAsSale({ lines, remises }), id: "devis-draft" };
  const totals = documentTotals(lines, remises);
  const hasRemise = totals.discount > 0;
  const companyOk = !toCompany || (company.name.trim() && company.address.trim() && company.ninea.trim());
  const ready = lines.length > 0 && Boolean(companyOk) && (!hasRemise || reason.trim().length > 0);

  const add = (refId: string) =>
    setLines((ls) =>
      ls.some((l) => l.refId === refId) ? ls.map((l) => (l.refId === refId ? { ...l, qty: l.qty + 1 } : l)) : [...ls, devisLineFrom(refId)],
    );
  const setQty = (id: string, qty: number) => {
    setLines((ls) => (qty <= 0 ? ls.filter((l) => l.id !== id) : ls.map((l) => (l.id === id ? { ...l, qty } : l))));
    if (qty <= 0) setRemises((rs) => rs.map((r) => ({ ...r, lineIds: r.lineIds.filter((x) => x !== id) })).filter((r) => r.lineIds.length > 0));
  };

  function save(send: boolean) {
    if (!ready) return;
    const billTo = toCompany ? { ...company, rccm: company.rccm?.trim() || undefined } : undefined;
    const data = { lines, remises, remiseReason: hasRemise ? reason.trim() : null, billTo };
    const id = existing ? (updateDevisDraft(existing.id, data), existing.id) : createDevis({ clientId, ...data }).id;
    // La société facturée se retient sur la fiche, pour le devis suivant.
    if (billTo) updateClient(clientId, { billingCompany: billTo });
    if (send) sendDevis(id, channel);
    onClose();
  }

  const title = existing && existing.version > 1 ? `Devis ${existing.number} · v${existing.version}` : "Nouveau devis";

  return (
    <Dialog open onClose={onClose} labelledBy="devis-title" className="relative flex h-[90vh] max-w-[1200px] flex-col overflow-hidden">
      <CloseButton onClick={onClose} className="top-4 right-4" />
      <header className="shrink-0 border-b border-base-300 px-8 pt-7 pb-5">
        <h2 id="devis-title" className="text-[24px] font-semibold tracking-[-0.01em]">{title}</h2>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-h-0 p-6">
          <MenuBrowser countByRef={countByRef} onAdd={(l) => add(l.refId)} families={["services", "produits"]} initialMode="services" stockGuard={false} />
        </div>

        <aside className="flex min-h-0 flex-col border-l border-base-300 bg-base-200/50">
          <div className="flex flex-col gap-3 border-b border-base-300 p-5">
            <div>
              <p className="font-semibold">{clientFullName(client)}</p>
              <p className="text-sm text-base-content/55 tabular-nums">{formatPhone(client.phone)} · {client.email}</p>
            </div>
            <label className="flex min-h-12 cursor-pointer items-center gap-3">
              <input type="checkbox" className="checkbox checkbox-primary" checked={toCompany} onChange={(e) => setToCompany(e.target.checked)} />
              <Building2 aria-hidden className="size-5 text-base-content/50" />
              <span className="font-medium">Facturer une société</span>
            </label>
            {toCompany && (
              <div className="grid gap-2">
                <TextInput placeholder="Raison sociale" aria-label="Raison sociale" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                <TextInput placeholder="Adresse" aria-label="Adresse" value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <TextInput placeholder="NINEA" aria-label="NINEA" value={company.ninea} onChange={(e) => setCompany({ ...company, ninea: e.target.value })} />
                  <TextInput placeholder="RCCM (facultatif)" aria-label="RCCM" value={company.rccm ?? ""} onChange={(e) => setCompany({ ...company, rccm: e.target.value })} />
                </div>
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5">
            {lines.length === 0 ? (
              <p className="py-10 text-center text-sm text-base-content/50">Touchez une prestation ou un produit pour l&apos;ajouter.</p>
            ) : (
              lines.map((l) => (
                <LineRow key={l.id} line={l} discount={totals.lineDiscount[l.id] ?? 0} onQty={(q) => setQty(l.id, q)} />
              ))
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-base-300 p-5">
            <button
              type="button"
              disabled={!lines.some((l) => l.kind === "service")}
              onClick={() => setRemisesOpen(true)}
              className="flex min-h-14 w-full items-center gap-3 rounded-field border border-border bg-white px-4 text-left transition hover:bg-base-200 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
            >
              <Percent aria-hidden className="size-4 shrink-0 text-secondary" />
              <span className="flex-1 text-[15px] font-semibold text-secondary">Remise accordée</span>
              <span className={cn("text-sm tabular-nums", hasRemise ? "font-semibold text-success" : "text-base-content/55")}>
                {hasRemise ? `−${formatFcfa(totals.discount)}` : "Aucune"}
              </span>
              <ChevronRight aria-hidden className="size-4 shrink-0 text-base-content/40" />
            </button>
            {hasRemise && (
              <TextInput placeholder="Motif de la remise" aria-label="Motif de la remise" value={reason} onChange={(e) => setReason(e.target.value)} />
            )}
            <div className="flex items-baseline justify-between pt-1">
              <span className="font-semibold">Total</span>
              <span className="font-[family-name:var(--font-heading)] text-2xl font-semibold tabular-nums">{formatFcfa(totals.total)}</span>
            </div>
            <SegmentedToggle
              options={[
                { value: "whatsapp", label: "WhatsApp" },
                { value: "email", label: "E-mail" },
              ]}
              value={channel}
              onChange={(v) => setChannel(v as DevisChannel)}
            />
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <Button variant="outline" disabled={!ready} onClick={() => save(false)}>Brouillon</Button>
              <Button disabled={!ready} onClick={() => save(true)}>Envoyer le devis</Button>
            </div>
          </div>
        </aside>
      </div>

      <RemisesDialog
        sale={sale}
        open={remisesOpen}
        onClose={() => setRemisesOpen(false)}
        title="Remise accordée"
        handlers={{
          grant: (lineIds, mode, value, managerCode) => {
            const res = applyRemise(sale, lineIds, mode, value, managerCode);
            if (!res.ok) return res;
            setRemises(res.remises);
            return { ok: true, message: "Remise accordée." };
          },
          remove: (remiseId) => setRemises((rs) => rs.filter((r) => r.id !== remiseId)),
        }}
      />
    </Dialog>
  );
}

function LineRow({ line, discount, onQty }: { line: DevisLine; discount: number; onQty: (qty: number) => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-base-300 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium" title={line.name}>{line.name}</p>
        <p className="text-sm text-base-content/55">
          {line.kind === "service" ? "Prestation" : "Produit"} · <span className="whitespace-nowrap">{formatFcfa(line.unitPrice)}</span>
          {discount > 0 && <span className="whitespace-nowrap text-success"> · −{formatFcfa(discount)}</span>}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" aria-label={line.qty === 1 ? "Retirer la ligne" : "Un de moins"} onClick={() => onQty(line.qty - 1)} className="grid size-11 place-items-center rounded-full border border-base-300 bg-white hover:bg-base-200">
          {line.qty === 1 ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
        </button>
        <span className="w-7 text-center font-semibold tabular-nums">{line.qty}</span>
        <button type="button" aria-label="Un de plus" onClick={() => onQty(line.qty + 1)} className="grid size-11 place-items-center rounded-full border border-base-300 bg-white hover:bg-base-200">
          <Plus className="size-4" />
        </button>
      </div>
      <span className="w-24 text-right font-semibold tabular-nums">{formatFcfa(line.unitPrice * line.qty)}</span>
    </div>
  );
}
