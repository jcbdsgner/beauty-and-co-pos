"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Pills } from "@/components/ui/pills";
import { SearchInput } from "@/components/ui/search-input";
import { SaleTabs } from "@/components/vente/sale-tabs";
import { ClientField } from "@/components/vente/client-field";
import { ClientModal } from "@/components/vente/client-modal";
import { ScanModal } from "@/components/vente/scan-modal";
import { CategoryGrid } from "@/components/vente/category-grid";
import { ServiceCatalog } from "@/components/vente/service-catalog";
import { CartPanel } from "@/components/vente/cart-panel";
import { PaymentScreen } from "@/components/vente/payment-screen";
import { ReceiptScreen, type NextVisitSuggestion, type PaymentLine } from "@/components/vente/receipt-screen";
import {
  CATEGORIES,
  PAYMENT_METHODS,
  PRACTITIONERS,
  PRODUCTS,
  SERVICES,
  computeTotals,
  createSale,
  resetSaleCounter,
  type Client,
  type PaymentMethodId,
  type Sale,
  type Service,
} from "@/lib/data/vente";

type Step = "categories" | "catalog" | "payment" | "receipt";

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
  const [sales, setSales] = useState<Sale[]>(() => [createSale()]);
  const [activeSaleId, setActiveSaleId] = useState(sales[0].id);
  const [step, setStep] = useState<Step>("categories");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"services" | "produits">("services");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("tous");
  const [showClientModal, setShowClientModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
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
    setStep("categories");
    resetBrowsing();
  }

  function handleCloseSaleTab(id: string) {
    setSales((prev) => {
      const next = prev.filter((sale) => sale.id !== id);
      if (next.length === 0) return prev;
      if (id === activeSaleId) {
        setActiveSaleId(next[0].id);
        setStep("categories");
        resetBrowsing();
      }
      return next;
    });
  }

  function handleAddSale() {
    const sale = createSale();
    setSales((prev) => [...prev, sale]);
    setActiveSaleId(sale.id);
    setStep("categories");
    resetBrowsing();
  }

  function handleSelectCategory(categoryId: string) {
    setActiveCategory(categoryId);
    setActiveFilter("tous");
    setSearch("");
    setStep("catalog");
  }

  function handleBackToCategories() {
    setStep("categories");
    setActiveCategory(null);
    setActiveFilter("tous");
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
          { id: `item-${service.id}-${Date.now()}`, serviceId: service.id, name: service.name, unitPrice: service.price, qty: 1, practitioner: null },
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

  function handleApplyPromo() {
    updateActiveSale((sale) => {
      const code = sale.discountCode.trim();
      if (!code) return sale;
      return { ...sale, promoApplied: { code: code.toUpperCase(), percent: 0.1 } };
    });
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
    resetSaleCounter();
    const sale = createSale();
    setSales([sale]);
    setActiveSaleId(sale.id);
    setStep("categories");
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
        onBack={() => setStep(activeCategory ? "catalog" : "categories")}
        onSelectMethod={(method) => updateActiveSale((sale) => ({ ...sale, paymentMethod: method }))}
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
  const searching = activeTab === "services" && step === "categories" && search.trim() !== "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nouvelle Vente" backHref="/" />

      <SaleTabs sales={sales} activeSaleId={activeSaleId} onSelect={handleSelectSaleTab} onClose={handleCloseSaleTab} onAdd={handleAddSale} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-5">
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

          {activeTab === "produits" ? (
            <ServiceCatalog
              category={null}
              services={catalogServices}
              search={search}
              activeFilter="tous"
              onFilterChange={() => {}}
              onBack={handleBackToCategories}
              onAdd={handleAddToCart}
              hideFilters
            />
          ) : searching ? (
            <ServiceCatalog
              category={null}
              services={catalogServices}
              search={search}
              activeFilter="tous"
              onFilterChange={() => {}}
              onBack={handleBackToCategories}
              onAdd={handleAddToCart}
              hideFilters
            />
          ) : step === "categories" ? (
            <CategoryGrid categories={CATEGORIES} onSelect={handleSelectCategory} />
          ) : (
            <ServiceCatalog
              category={category}
              services={catalogServices}
              search={search}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onBack={handleBackToCategories}
              onAdd={handleAddToCart}
            />
          )}
        </div>

        <CartPanel
          sale={activeSale}
          practitioners={PRACTITIONERS}
          onQtyChange={handleQtyChange}
          onRemove={handleRemoveItem}
          onAssignPractitioner={handleAssignPractitioner}
          onDiscountCodeChange={(value) => updateActiveSale((sale) => ({ ...sale, discountCode: value }))}
          onApplyPromo={handleApplyPromo}
          onLoyaltyChange={(value) => updateActiveSale((sale) => ({ ...sale, loyaltyPointsUsed: value }))}
          onManagerCodeChange={(value) => updateActiveSale((sale) => ({ ...sale, managerCode: value }))}
          onApplyManagerCode={handleApplyManagerCode}
          onCheckout={handleCheckout}
        />
      </div>

      <ClientModal
        open={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSelect={handleSelectClient}
        onScanQr={() => {
          setShowClientModal(false);
          setShowScanModal(true);
        }}
      />

      <ScanModal open={showScanModal} onClose={() => setShowScanModal(false)} onDetected={handleSelectClient} />
    </div>
  );
}
