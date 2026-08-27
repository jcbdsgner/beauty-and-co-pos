"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CLIENTS } from "@/lib/data/clientele";
import { RENDEZ_VOUS } from "@/lib/data/planning";
import { serviceById } from "@/lib/data/catalogue";
import type { AppointmentStatus, CartLine, Cliente, PaymentMode, RendezVous, Sale } from "@/lib/data/types";
import { PRATICIENNES } from "@/lib/data/praticiennes";

let uid = 0;
function nextId(prefix: string) {
  uid += 1;
  return `${prefix}-${Date.now()}-${uid}`;
}

function emptySale(label: string): Sale {
  return {
    id: nextId("sale"),
    label,
    clientId: null,
    cart: [],
    giftCardCode: "",
    giftCardApplied: null,
    loyaltyPointsUsed: 0,
    managerCode: "",
    managerDiscountApplied: 0,
    status: "ouverte",
    step: "vente",
    createdAt: new Date().toISOString(),
  };
}

export function computeTotals(sale: Sale) {
  const subtotal = sale.cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const giftCardDiscount = sale.giftCardApplied?.amount ?? 0;
  const loyaltyDiscount = Math.floor(sale.loyaltyPointsUsed / 100) * 1000;
  const managerDiscount = sale.managerDiscountApplied;
  const total = Math.max(0, subtotal - giftCardDiscount - loyaltyDiscount - managerDiscount);
  return { subtotal, giftCardDiscount, loyaltyDiscount, managerDiscount, total };
}

type NewTabPrefill = {
  clientId?: string;
  appointmentId?: string;
  /** Replacement praticienne id — set when "Accueillir" follows a "Marquer indisponible"
   *  guard (cf. Équipe § last-minute absence). Patches the rendez-vous' staffId and the
   *  prefilled cart line's staffId atomically, avoiding the read-after-stale-write race a
   *  separate updateAppointment() + openNewTab() call pair would hit under React's batching. */
  staffOverride?: string;
};

type AppDataContextValue = {
  clients: Cliente[];
  appointments: RendezVous[];
  praticiennes: typeof PRATICIENNES;
  sales: Sale[];
  openTabIds: string[];
  activeSaleId: string | null;
  comptoirDeployed: boolean;

  // Clients
  addClient: (data: Omit<Cliente, "id" | "points" | "totalSpent" | "totalVisits" | "createdAt" | "tier">) => Cliente;
  updateClient: (id: string, patch: Partial<Cliente>) => void;
  findDuplicatePhone: (phone: string) => Cliente | undefined;

  // Appointments
  confirmAppointment: (id: string) => void;
  cancelAppointment: (id: string) => void;
  createAppointment: (data: Omit<RendezVous, "id" | "saleId">) => void;
  updateAppointment: (id: string, patch: Partial<RendezVous>) => void;
  markStaffUnavailable: (staffId: string) => void;

  // Comptoir / Sales
  deployComptoir: () => void;
  collapseComptoir: () => void;
  openNewTab: (prefill?: NewTabPrefill) => void;
  switchTab: (saleId: string) => void;
  closeTab: (saleId: string) => void;
  updateSale: (saleId: string, patch: Partial<Sale>) => void;
  addCartLine: (saleId: string, line: Omit<CartLine, "id" | "qty">) => void;
  updateCartQty: (saleId: string, lineId: string, qty: number) => void;
  removeCartLine: (saleId: string, lineId: string) => void;
  assignPractitioner: (saleId: string, lineId: string, staffId: string | null) => void;
  applyGiftCard: (saleId: string, code: string) => { ok: boolean; message: string };
  applyManagerCode: (saleId: string, code: string) => { ok: boolean; message: string };
  setLoyaltyPointsUsed: (saleId: string, points: number) => void;
  confirmPayment: (saleId: string, modes: { mode: PaymentMode; amount: number }[]) => void;
  activeSale: () => Sale | undefined;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Cliente[]>(CLIENTS);
  const [appointments, setAppointments] = useState<RendezVous[]>(RENDEZ_VOUS);
  const [praticiennes, setPraticiennes] = useState(PRATICIENNES);
  const [sales, setSales] = useState<Sale[]>([]);
  const [openTabIds, setOpenTabIds] = useState<string[]>([]);
  const [activeSaleId, setActiveSaleId] = useState<string | null>(null);
  const [comptoirDeployed, setComptoirDeployed] = useState(false);

  const addClient: AppDataContextValue["addClient"] = useCallback((data) => {
    const client: Cliente = { ...data, id: nextId("cl"), tier: null, points: 0, totalSpent: 0, totalVisits: 0, createdAt: new Date().toISOString() };
    setClients((prev) => [client, ...prev]);
    return client;
  }, []);

  const updateClient: AppDataContextValue["updateClient"] = useCallback((id, patch) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const findDuplicatePhone: AppDataContextValue["findDuplicatePhone"] = useCallback(
    (phone) => clients.find((c) => c.phone.replace(/\s/g, "") === phone.replace(/\s/g, "")),
    [clients],
  );

  const confirmAppointment: AppDataContextValue["confirmAppointment"] = useCallback((id) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "confirme" as AppointmentStatus } : a)));
  }, []);

  const cancelAppointment: AppDataContextValue["cancelAppointment"] = useCallback((id) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "annule" as AppointmentStatus } : a)));
  }, []);

  const createAppointment: AppDataContextValue["createAppointment"] = useCallback((data) => {
    setAppointments((prev) => [...prev, { ...data, id: nextId("rdv") }]);
  }, []);

  const updateAppointment: AppDataContextValue["updateAppointment"] = useCallback((id, patch) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const markStaffUnavailable: AppDataContextValue["markStaffUnavailable"] = useCallback((staffId) => {
    setPraticiennes((prev) => prev.map((p) => (p.id === staffId ? { ...p, unavailableToday: true } : p)));
  }, []);

  const deployComptoir = useCallback(() => setComptoirDeployed(true), []);
  const collapseComptoir = useCallback(() => setComptoirDeployed(false), []);

  const openNewTab: AppDataContextValue["openNewTab"] = useCallback(
    (prefill) => {
      // Re-tapping "Accueillir" on an appointment that already has an open sale switches to
      // that existing tab instead of opening a duplicate — per USERFLOW.md's Journée section.
      if (prefill?.appointmentId) {
        const existing = appointments.find((a) => a.id === prefill.appointmentId);
        if (existing?.saleId) {
          setActiveSaleId(existing.saleId);
          setComptoirDeployed(true);
          return;
        }
      }

      const label = `Vente ${sales.length + 1}`;
      const sale = emptySale(label);
      sale.clientId = prefill?.clientId ?? null;

      if (prefill?.appointmentId) {
        const appt = appointments.find((a) => a.id === prefill.appointmentId);
        if (appt) {
          const staffId = prefill.staffOverride ?? appt.staffId;
          sale.clientId = appt.clientId;
          sale.originAppointmentId = appt.id;
          const service = serviceById(appt.serviceId);
          if (service) {
            sale.cart = [
              { id: nextId("line"), refId: service.id, kind: "service", name: service.name, unitPrice: service.price, qty: 1, staffId },
            ];
          }
          setAppointments((prev) => prev.map((a) => (a.id === appt.id ? { ...a, saleId: sale.id, staffId } : a)));
        }
      }

      setSales((prev) => [...prev, sale]);
      setOpenTabIds((prev) => [...prev, sale.id]);
      setActiveSaleId(sale.id);
      setComptoirDeployed(true);
    },
    [appointments, sales.length],
  );

  const switchTab: AppDataContextValue["switchTab"] = useCallback((saleId) => setActiveSaleId(saleId), []);

  const closeTab: AppDataContextValue["closeTab"] = useCallback(
    (saleId) => {
      setSales((prev) => prev.map((s) => (s.id === saleId && s.status === "ouverte" ? { ...s, status: "abandonnee" } : s)));
      setOpenTabIds((prev) => {
        const next = prev.filter((id) => id !== saleId);
        setActiveSaleId((current) => (current === saleId ? (next[next.length - 1] ?? null) : current));
        return next;
      });
    },
    [],
  );

  const updateSale: AppDataContextValue["updateSale"] = useCallback((saleId, patch) => {
    setSales((prev) => prev.map((s) => (s.id === saleId ? { ...s, ...patch } : s)));
  }, []);

  const addCartLine: AppDataContextValue["addCartLine"] = useCallback((saleId, line) => {
    setSales((prev) =>
      prev.map((s) => {
        if (s.id !== saleId) return s;
        const existing = s.cart.find((l) => l.refId === line.refId);
        if (existing) {
          return { ...s, cart: s.cart.map((l) => (l.id === existing.id ? { ...l, qty: Math.min(20, l.qty + 1) } : l)) };
        }
        return { ...s, cart: [...s.cart, { ...line, id: nextId("line"), qty: 1 }] };
      }),
    );
  }, []);

  const updateCartQty: AppDataContextValue["updateCartQty"] = useCallback((saleId, lineId, qty) => {
    setSales((prev) => prev.map((s) => (s.id === saleId ? { ...s, cart: s.cart.map((l) => (l.id === lineId ? { ...l, qty } : l)) } : s)));
  }, []);

  const removeCartLine: AppDataContextValue["removeCartLine"] = useCallback((saleId, lineId) => {
    setSales((prev) => prev.map((s) => (s.id === saleId ? { ...s, cart: s.cart.filter((l) => l.id !== lineId) } : s)));
  }, []);

  const assignPractitioner: AppDataContextValue["assignPractitioner"] = useCallback((saleId, lineId, staffId) => {
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, cart: s.cart.map((l) => (l.id === lineId ? { ...l, staffId: staffId ?? undefined } : l)) } : s)),
    );
  }, []);

  const applyGiftCard: AppDataContextValue["applyGiftCard"] = useCallback(
    (saleId, code) => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return { ok: false, message: "Saisissez un code." };
      if (trimmed === "EXPIRED") return { ok: false, message: "Cette carte a expiré." };
      if (trimmed === "USED") return { ok: false, message: "Cette carte a déjà été utilisée." };
      if (!trimmed.startsWith("BACO")) return { ok: false, message: "Ce code n'est pas reconnu — vérifiez-le ou continuez sans remise." };
      const sale = sales.find((s) => s.id === saleId);
      const replaced = sale?.giftCardApplied;
      updateSale(saleId, { giftCardApplied: { code: trimmed, amount: 25000 }, giftCardCode: "" });
      return { ok: true, message: replaced ? `Remplace le code « ${replaced.code} »` : `Carte « ${trimmed} » appliquée` };
    },
    [sales, updateSale],
  );

  const applyManagerCode: AppDataContextValue["applyManagerCode"] = useCallback(
    (saleId, code) => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return { ok: false, message: "Saisissez un code." };
      if (!trimmed.startsWith("DISC")) return { ok: false, message: "Ce code n'est pas reconnu — vérifiez-le ou continuez sans remise." };
      updateSale(saleId, { managerDiscountApplied: 5000, managerCode: "" });
      return { ok: true, message: "Remise manager appliquée" };
    },
    [updateSale],
  );

  const setLoyaltyPointsUsed: AppDataContextValue["setLoyaltyPointsUsed"] = useCallback(
    (saleId, points) => updateSale(saleId, { loyaltyPointsUsed: points }),
    [updateSale],
  );

  const confirmPayment: AppDataContextValue["confirmPayment"] = useCallback(
    (saleId, modes) => {
      const sale = sales.find((s) => s.id === saleId);
      if (!sale) return;
      const { total } = computeTotals(sale);
      const earned = Math.floor(total / 1000) * 10;
      setSales((prev) =>
        prev.map((s) =>
          s.id === saleId
            ? { ...s, status: "encaissee", step: "recu", payment: { modes }, loyaltyPointsEarned: earned, encaisseeAt: new Date().toISOString() }
            : s,
        ),
      );
      if (sale.clientId) {
        setClients((prev) =>
          prev.map((c) =>
            c.id === sale.clientId
              ? { ...c, points: c.points - sale.loyaltyPointsUsed + earned, totalSpent: c.totalSpent + total, totalVisits: c.totalVisits + 1, lastVisit: "Aujourd'hui" }
              : c,
          ),
        );
      }
    },
    [sales],
  );

  const activeSale = useCallback(() => sales.find((s) => s.id === activeSaleId), [sales, activeSaleId]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      clients,
      appointments,
      praticiennes,
      sales,
      openTabIds,
      activeSaleId,
      comptoirDeployed,
      addClient,
      updateClient,
      findDuplicatePhone,
      confirmAppointment,
      cancelAppointment,
      createAppointment,
      updateAppointment,
      markStaffUnavailable,
      deployComptoir,
      collapseComptoir,
      openNewTab,
      switchTab,
      closeTab,
      updateSale,
      addCartLine,
      updateCartQty,
      removeCartLine,
      assignPractitioner,
      applyGiftCard,
      applyManagerCode,
      setLoyaltyPointsUsed,
      confirmPayment,
      activeSale,
    }),
    [
      clients,
      appointments,
      praticiennes,
      sales,
      openTabIds,
      activeSaleId,
      comptoirDeployed,
      addClient,
      updateClient,
      findDuplicatePhone,
      confirmAppointment,
      cancelAppointment,
      createAppointment,
      updateAppointment,
      markStaffUnavailable,
      deployComptoir,
      collapseComptoir,
      openNewTab,
      switchTab,
      closeTab,
      updateSale,
      addCartLine,
      updateCartQty,
      removeCartLine,
      assignPractitioner,
      applyGiftCard,
      applyManagerCode,
      setLoyaltyPointsUsed,
      confirmPayment,
      activeSale,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
