"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Pills } from "@/components/ui/pills";
import { SearchInput } from "@/components/ui/search-input";
import { SaleTabs } from "@/components/vente/sale-tabs";
import { ClientField } from "@/components/vente/client-field";
import { ClientModal } from "@/components/vente/client-modal";
import { ScanModal } from "@/components/vente/scan-modal";
import { CategoryRail } from "@/components/vente/category-rail";
import { FullCatalog } from "@/components/vente/full-catalog";
import { ServiceCatalog } from "@/components/vente/service-catalog";
import { CartTray } from "@/components/vente/cart-tray";
import { PaymentScreen } from "@/components/vente/payment-screen";
import { ReceiptScreen, type NextVisitSuggestion, type PaymentLine } from "@/components/vente/receipt-screen";
import { CameraIcon } from "@/components/vente/icons";
import {
  CATEGORIES,
  CLIENTS,
  GIFT_CARDS,
  PAYMENT_METHODS,
  PRACTITIONERS,
  PRODUCTS,
  SALON,
  SERVICES,
  computeTotals,
  createSale,
  type Client,
  type PaymentMethodId,
  type Sale,
  type Service,
} from "@/lib/data/vente";

type Step = "browse" | "payment" | "receipt";

type ReceiptSnapshot = {
  sale: Sale;
  invoiceNumber: string;
  dateLabel: string;
  paymentLines: PaymentLine[];
  loyaltyEarned: number;
  loyaltyBalance: number | null;
  nextVisit: NextVisitSuggestion | null;
};

function methodLabel(id: PaymentMethodId | null) {
  return PAYMENT_METHODS.find((method) => method.id === id)?.label ?? "—";
}

function buildReceipt(sale: Sale, invoiceSeq: number): ReceiptSnapshot {
  const totals = computeTotals(sale);
  const now = new Date();
  const invoiceNumber = `INV-2026-${String(invoiceSeq).padStart(6, "0")}`;
  const dateLabel = `${now.toLocaleDateString("fr-FR")} à ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;

  const paymentLines: PaymentLine[] = sale.mixedPayment
    ? [
        { label: methodLabel(sale.paymentMethod), amount: Number(sale.mixedAmount1) || 0 },
        { label: methodLabel(sale.mixedMethod2), amount: Number(sale.mixedAmount2) || 0 },
      ]
    : [{ label: methodLabel(sale.paymentMethod), amount: totals.total }];

  const loyaltyEarned = Math.round(totals.total / 1000);
  const loyaltyBalance = sale.client ? sale.client.points - sale.loyaltyPointsUsed + loyaltyEarned : null;

  let nextVisit: NextVisitSuggestion | null = null;
  if (sale.client && sale.cart.length > 0) {
    const suggested = new Date(now);
    suggested.setDate(suggested.getDate() + 28);
    nextVisit = {
      dateLabel: suggested.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
      serviceName: sale.cart[0].name,
    };
  }

  return { sale, invoiceNumber, dateLabel, paymentLines, loyaltyEarned, loyaltyBalance, nextVisit };
}

/** Vente & Paiement — the caisse module. A single-screen wizard: everything (multi-sale tabs,
 * category/catalogue browsing, cart, payment, receipt) lives in local state, matching the
 * Figma flow where the whole tunnel happens as interactions on one POS screen rather than
 * client-side route navigation. */
export default function VentePage() {
  return (
    <Suspense>
      <VentePageContent />
    </Suspense>
  );
}

function VentePageContent() {
  const searchParams = useSearchParams();
  const [sales, setSales] = useState<Sale[]>(() => [createSale(1)]);
  const [activeSaleId, setActiveSaleId] = useState(sales[0].id);
  const [step, setStep] = useState<Step>("browse");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"services" | "produits">("services");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("tous");
  const [showClientModal, setShowClientModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(searchParams.get("scan") === "1");
  const [showGiftScanModal, setShowGiftScanModal] = useState(false);
  const [invoiceSeq, setInvoiceSeq] = useState(18);
  const [receipt, setReceipt] = useState<ReceiptSnapshot | null>(null);

  const activeSale = sales.find((sale) => sale.id === activeSaleId) ?? sales[0];

  function updateActiveSale(updater: (sale: Sale) => Sale) {
    setSales((prev) => prev.map((sale) => (sale.id === activeSaleId ? updater(sale) : sale)));
  }

  function resetBrowsing() {
    setActiveCategory(null);
    setActiveFilter("tous");
    setSearch("");
  }

  function handleSelectSaleTab(id: string) {
    setActiveSaleId(id);
    setStep("browse");
    resetBrowsing();
  }

  function handleCloseSaleTab(id: string) {
    const sale = sales.find((s) => s.id === id);
    if (sale && sale.cart.length > 0) {
      const itemCount = sale.cart.reduce((sum, item) => sum + item.qty, 0);
      const confirmed = window.confirm(
        `Fermer « ${sale.name} » ? Le panier (${itemCount} article${itemCount > 1 ? "s" : ""}) sera perdu.`,
      );
      if (!confirmed) return;
    }
    const next = sales.filter((s) => s.id !== id);
    if (next.length === 0) return;
    setSales(next);
    if (id === activeSaleId) {
      setActiveSaleId(next[0].id);
      setStep("browse");
      resetBrowsing();
    }
  }

  function handleAddSale() {
    const sale = createSale(sales.length + 1);
    setSales((prev) => [...prev, sale]);
    setActiveSaleId(sale.id);
    setStep("browse");
    resetBrowsing();
  }

  function handleSelectCategory(categoryId: string | null) {
    setActiveCategory(categoryId);
    setActiveFilter("tous");
    setSearch("");
  }

  function handleSelectClient(client: Client) {
    updateActiveSale((sale) => ({ ...sale, client, loyaltyPointsUsed: 0 }));
    setShowClientModal(false);
    setShowScanModal(false);
  }

  function handleRemoveClient() {
    updateActiveSale((sale) => ({ ...sale, client: null, loyaltyPointsUsed: 0 }));
  }

  function handleAddToCart(service: Service) {
    updateActiveSale((sale) => {
      const existing = sale.cart.find((item) => item.serviceId === service.id);
      if (existing) {
        return { ...sale, cart: sale.cart.map((item) => (item.id === existing.id ? { ...item, qty: item.qty + 1 } : item)) };
      }
      return {
        ...sale,
        cart: [
          ...sale.cart,
          // New lines default to the logged-in cashier (matches the Figma capture, where every
          // cart line already reads the cashier's name until reassigned to another praticien).
          { id: `item-${service.id}-${Date.now()}`, serviceId: service.id, name: service.name, unitPrice: service.price, qty: 1, practitioner: SALON.cashier },
        ],
      };
    });
  }

  function handleQtyChange(itemId: string, qty: number) {
    updateActiveSale((sale) => ({ ...sale, cart: sale.cart.map((item) => (item.id === itemId ? { ...item, qty } : item)) }));
  }

  function handleRemoveItem(itemId: string) {
    updateActiveSale((sale) => ({ ...sale, cart: sale.cart.filter((item) => item.id !== itemId) }));
  }

  function handleAssignPractitioner(itemId: string, practitioner: string | null) {
    updateActiveSale((sale) => ({ ...sale, cart: sale.cart.map((item) => (item.id === itemId ? { ...item, practitioner } : item)) }));
  }

  function handleApplyGiftCard() {
    updateActiveSale((sale) => {
      const code = sale.giftCardCode.trim().toUpperCase();
      const giftCard = GIFT_CARDS.find((card) => card.code === code);
      if (!giftCard) return sale;
      return { ...sale, giftCardCode: giftCard.code, giftCardApplied: { code: giftCard.code, amount: giftCard.balance } };
    });
  }

  function handleScanGiftCard() {
    // No real payload behind the carte cadeau's QR yet — same "simuler la détection" stand-in as
    // the client scan, but a scan applies the card immediately instead of just filling the field,
    // since the whole point of scanning is skipping the manual code entry + "OK" tap.
    const giftCard = GIFT_CARDS[0];
    updateActiveSale((sale) => ({ ...sale, giftCardCode: giftCard.code, giftCardApplied: { code: giftCard.code, amount: giftCard.balance } }));
    setShowGiftScanModal(false);
  }

  function handleApplyManagerCode() {
    updateActiveSale((sale) => {
      if (!sale.managerCode.trim()) return sale;
      return { ...sale, managerDiscountApplied: 5000 };
    });
  }

  function handleCheckout() {
    setStep("payment");
  }

  function handleConfirmPayment() {
    const snapshot = buildReceipt(activeSale, invoiceSeq);
    setReceipt(snapshot);
    setInvoiceSeq((seq) => seq + 1);
    setStep("receipt");
  }

  function handleNewSale() {
    // The just-completed sale is done — drop it, but any other sale tabs the cashier had open
    // in parallel (e.g. "Vente 2" being served by another practitioner) must survive untouched.
    const remaining = sales.filter((sale) => sale.id !== activeSaleId);
    if (remaining.length > 0) {
      setSales(remaining);
      setActiveSaleId(remaining[0].id);
    } else {
      const sale = createSale(1);
      setSales([sale]);
      setActiveSaleId(sale.id);
    }
    setStep("browse");
    setActiveTab("services");
    resetBrowsing();
    setReceipt(null);
  }

  if (step === "receipt" && receipt) {
    return (
      <ReceiptScreen
        sale={receipt.sale}
        invoiceNumber={receipt.invoiceNumber}
        dateLabel={receipt.dateLabel}
        paymentLines={receipt.paymentLines}
        loyaltyEarned={receipt.loyaltyEarned}
        loyaltyBalance={receipt.loyaltyBalance}
        nextVisit={receipt.nextVisit}
        onNewSale={handleNewSale}
      />
    );
  }

  if (step === "payment") {
    return (
      <PaymentScreen
        sale={activeSale}
        onBack={() => setStep("browse")}
        onSelectMethod={(method) =>
          updateActiveSale((sale) => ({
            ...sale,
            paymentMethod: method,
            // Switching method 1 onto whatever method 2 currently holds would silently make
            // the mixed split "pay twice with the same method" — clear method 2 so it must be
            // re-picked deliberately.
            mixedMethod2: sale.mixedMethod2 === method ? null : sale.mixedMethod2,
            mixedAmount2: sale.mixedMethod2 === method ? "" : sale.mixedAmount2,
          }))
        }
        onToggleMixed={(checked) =>
          updateActiveSale((sale) => ({
            ...sale,
            mixedPayment: checked,
            mixedMethod2: checked ? sale.mixedMethod2 : null,
            mixedAmount1: checked ? sale.mixedAmount1 : "",
            mixedAmount2: checked ? sale.mixedAmount2 : "",
          }))
        }
        onSelectMethod2={(method) => updateActiveSale((sale) => ({ ...sale, mixedMethod2: method }))}
        onAmountChange={(which, value) =>
          updateActiveSale((sale) => (which === 1 ? { ...sale, mixedAmount1: value } : { ...sale, mixedAmount2: value }))
        }
        onConfirm={handleConfirmPayment}
      />
    );
  }

  const category = CATEGORIES.find((c) => c.id === activeCategory) ?? null;
  const catalogServices = activeTab === "produits" ? PRODUCTS : category ? SERVICES.filter((s) => s.categoryId === category.id) : SERVICES;
  const searching = activeTab === "services" && search.trim() !== "";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-6">
      <PageHeader
        title="Nouvelle Vente"
        backHref="/"
        action={
          <button
            type="button"
            onClick={() => setShowScanModal(true)}
            aria-label="Scanner la carte de fidélité d'un client"
            className="flex size-9 items-center justify-center rounded-full text-[var(--color-gray-500)] transition hover:bg-[var(--color-gray-100)] hover:text-[var(--brand-taupe-muted)]"
          >
            <CameraIcon />
          </button>
        }
      />

      <SaleTabs sales={sales} activeSaleId={activeSaleId} onSelect={handleSelectSaleTab} onClose={handleCloseSaleTab} onAdd={handleAddSale} />

      <ClientField client={activeSale.client} onOpenModal={() => setShowClientModal(true)} onRemove={handleRemoveClient} />

      <Pills
        options={[
          { value: "services", label: "Services" },
          { value: "produits", label: "Produits" },
        ]}
        value={activeTab}
        onChange={(value) => {
          setActiveTab(value as "services" | "produits");
          resetBrowsing();
        }}
      />

      <SearchInput
        placeholder={activeTab === "produits" ? "Rechercher un produit..." : "Rechercher un service..."}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {activeTab === "services" && !searching && (
        <CategoryRail categories={CATEGORIES} activeId={activeCategory} onSelect={handleSelectCategory} />
      )}

      <div className="flex-1">
        {activeTab === "produits" ? (
          <ServiceCatalog services={catalogServices} search={search} activeFilter="tous" onFilterChange={() => {}} onAdd={handleAddToCart} hideFilters />
        ) : searching ? (
          <ServiceCatalog services={catalogServices} search={search} activeFilter="tous" onFilterChange={() => {}} onAdd={handleAddToCart} hideFilters />
        ) : category ? (
          <ServiceCatalog
            services={catalogServices}
            search={search}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onAdd={handleAddToCart}
          />
        ) : (
          <FullCatalog services={SERVICES} onAdd={handleAddToCart} />
        )}
      </div>

      <CartTray
        sale={activeSale}
        practitioners={PRACTITIONERS}
        onQtyChange={handleQtyChange}
        onRemove={handleRemoveItem}
        onAssignPractitioner={handleAssignPractitioner}
        onGiftCardCodeChange={(value) => updateActiveSale((sale) => ({ ...sale, giftCardCode: value }))}
        onApplyGiftCard={handleApplyGiftCard}
        onScanGiftCard={() => setShowGiftScanModal(true)}
        onLoyaltyChange={(value) => updateActiveSale((sale) => ({ ...sale, loyaltyPointsUsed: value }))}
        onManagerCodeChange={(value) => updateActiveSale((sale) => ({ ...sale, managerCode: value }))}
        onApplyManagerCode={handleApplyManagerCode}
        onCheckout={handleCheckout}
      />

      <ClientModal
        open={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSelect={handleSelectClient}
        onScanQr={() => {
          setShowClientModal(false);
          setShowScanModal(true);
        }}
      />

      <ScanModal
        open={showScanModal}
        onClose={() => setShowScanModal(false)}
        title="Scanner QR Client"
        instructions="Pointez la caméra vers le QR code de la carte client"
        onSimulateDetect={() => handleSelectClient(CLIENTS[0])}
      />

      <ScanModal
        open={showGiftScanModal}
        onClose={() => setShowGiftScanModal(false)}
        title="Scanner la carte cadeau"
        instructions="Pointez la caméra vers le code de la carte cadeau"
        onSimulateDetect={handleScanGiftCard}
      />
    </div>
  );
}
