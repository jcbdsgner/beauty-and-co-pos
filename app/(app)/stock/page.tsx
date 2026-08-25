"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Pills, type PillOption } from "@/components/ui/pills";
import { BuildingIcon, StoreIcon } from "@/components/stock/icons";
import { EntitySelect } from "@/components/stock/entity-select";
import { OverviewTab } from "@/components/stock/overview-tab";
import { DemandesTab } from "@/components/stock/demandes-tab";
import { DepotTab } from "@/components/stock/depot-tab";
import { SalonTab } from "@/components/stock/salon-tab";
import { HistoriqueTab } from "@/components/stock/historique-tab";
import { SendToSalonDialog } from "@/components/stock/send-to-salon-dialog";
import { Toast } from "@/components/stock/toast";
import {
  ENTREPRISES,
  SALONS,
  STOCK_MOVEMENTS,
  STOCK_REQUESTS,
  type Product,
  type StockMovement,
  type StockRequest,
} from "@/lib/data/stock";

type StockTab = "overview" | "demandes" | "depot" | "salon" | "historique";

/** Page "Gestion Depot" — vue d'ensemble multi-entreprises/salons du stock, avec 5 onglets internes (state, pas de sous-routes). */
export default function StockPage() {
  const [activeTab, setActiveTab] = useState<StockTab>("overview");
  const [selectedEntreprise, setSelectedEntreprise] = useState(ENTREPRISES[0].id);
  const [selectedSalon, setSelectedSalon] = useState("tous");
  const [requests, setRequests] = useState<StockRequest[]>(STOCK_REQUESTS);
  const [movements, setMovements] = useState<StockMovement[]>(STOCK_MOVEMENTS);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendDialogDefaultSalon, setSendDialogDefaultSalon] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const salonsForEntreprise = useMemo(
    () => SALONS.filter((s) => s.id === "tous" || s.entrepriseId === selectedEntreprise),
    [selectedEntreprise],
  );

  const dialogSalons = useMemo(() => SALONS.filter((s) => s.id !== "tous"), []);

  const pendingCount = requests.filter((r) => r.status === "en_attente").length;

  const TABS: PillOption[] = [
    { value: "overview", label: "Vue d'ensemble" },
    { value: "demandes", label: "Demandes", count: pendingCount },
    { value: "depot", label: "Dépôt" },
    { value: "salon", label: "Salon" },
    { value: "historique", label: "Historique" },
  ];

  function handleEntrepriseChange(id: string) {
    setSelectedEntreprise(id);
    setSelectedSalon("tous");
  }

  function handlePrepareRequest(id: string) {
    const request = requests.find((r) => r.id === id);
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "preparation" as const, sentBy: "Gestionnaire Stock", sentAt: "Aujourd'hui" }
          : r,
      ),
    );
    if (request) setToastMessage(`"${request.productName}" passée en préparation`);
  }

  function handleCancelRequest(id: string) {
    const request = requests.find((r) => r.id === id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    if (request) setToastMessage(`Demande "${request.productName}" annulée`);
  }

  function handleEditRequestQty(id: string, qty: number) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, qty } : r)));
  }

  function handleEditRequestComment(id: string, comment: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, comment: comment || undefined } : r)));
  }

  function handleReappro(product: Product) {
    const entrepriseLabel = ENTREPRISES.find((e) => e.id === product.entrepriseId)?.label ?? product.entrepriseId;
    const salonLabel = product.salonId
      ? (SALONS.find((s) => s.id === product.salonId)?.label ?? "Salon")
      : "Dépôt central";

    const newRequest: StockRequest = {
      id: `req-${Date.now()}`,
      productName: product.name,
      salonLabel,
      entrepriseLabel,
      qty: product.toOrder > 0 ? product.toOrder : Math.max(product.min - product.depotStock, 1),
      salonStock: product.salonStock ?? 0,
      depotStock: product.depotStock,
      status: "en_attente",
      requestedBy: "Vous",
      requestedAt: "Aujourd'hui",
    };

    setRequests((prev) => [newRequest, ...prev]);
    setToastMessage(`Demande de réapprovisionnement créée pour "${product.name}"`);
  }

  function handleOpenSendDialog(defaultSalonId?: string) {
    setSendDialogDefaultSalon(defaultSalonId);
    setSendDialogOpen(true);
  }

  function handleSendToSalon(payload: { salonId: string; items: { name: string; qty: number }[]; note: string }) {
    const salon = SALONS.find((s) => s.id === payload.salonId);
    const salonLabel = salon?.label ?? "Salon";
    const movementEntrepriseLabel = ENTREPRISES.find((e) => e.id === salon?.entrepriseId)?.label ?? entrepriseLabel;

    const newMovements: StockMovement[] = payload.items.map((item, index) => ({
      id: `mov-${Date.now()}-${index}`,
      type: "transfert",
      productName: item.name,
      qty: item.qty,
      salonLabel,
      entrepriseLabel: movementEntrepriseLabel,
      date: "Aujourd'hui",
      note: payload.note || undefined,
    }));

    setMovements((prev) => [...newMovements, ...prev]);
    setToastMessage(
      payload.items.length === 1
        ? `1 produit envoyé vers ${salonLabel}`
        : `${payload.items.length} produits envoyés vers ${salonLabel}`,
    );
  }

  const entrepriseLabel = ENTREPRISES.find((e) => e.id === selectedEntreprise)?.label ?? "";
  const salonLabel = SALONS.find((s) => s.id === selectedSalon)?.label ?? "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Gestion Dépôt" backHref="/" align="center" />

      <div className="flex flex-col gap-3 sm:flex-row">
        <EntitySelect
          icon={<BuildingIcon />}
          value={selectedEntreprise}
          options={ENTREPRISES.map((e) => ({ id: e.id, label: e.label }))}
          onChange={handleEntrepriseChange}
        />
        <EntitySelect
          icon={<StoreIcon />}
          value={selectedSalon}
          options={salonsForEntreprise.map((s) => ({ id: s.id, label: s.label }))}
          onChange={setSelectedSalon}
        />
      </div>

      <div className="rounded-2xl bg-[var(--color-gray-100)] p-1.5">
        <Pills options={TABS} value={activeTab} onChange={(v) => setActiveTab(v as StockTab)} />
      </div>

      {activeTab === "overview" && (
        <OverviewTab onSeeDetail={() => setActiveTab("depot")} onReappro={handleReappro} />
      )}

      {activeTab === "demandes" && (
        <DemandesTab
          requests={requests}
          onPrepare={handlePrepareRequest}
          onCancel={handleCancelRequest}
          onEditQty={handleEditRequestQty}
          onEditComment={handleEditRequestComment}
        />
      )}

      {activeTab === "depot" && (
        <DepotTab
          entrepriseId={selectedEntreprise}
          entrepriseLabel={entrepriseLabel}
          onReappro={handleReappro}
          onOpenSendDialog={() => handleOpenSendDialog(selectedSalon !== "tous" ? selectedSalon : undefined)}
          onOpenHistorique={() => setActiveTab("historique")}
        />
      )}

      {activeTab === "salon" && (
        <SalonTab
          salonId={selectedSalon}
          salonLabel={salonLabel}
          onReappro={handleReappro}
          onOpenSendDialog={() => handleOpenSendDialog(selectedSalon !== "tous" ? selectedSalon : undefined)}
        />
      )}

      {activeTab === "historique" && <HistoriqueTab movements={movements} />}

      <SendToSalonDialog
        open={sendDialogOpen}
        salons={dialogSalons}
        defaultSalonId={sendDialogDefaultSalon}
        onClose={() => setSendDialogOpen(false)}
        onSend={handleSendToSalon}
      />

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </div>
  );
}
