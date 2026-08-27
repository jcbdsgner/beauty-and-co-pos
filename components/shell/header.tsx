"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SaleTrayTrigger } from "@/components/ui/molecules/sale-tray-trigger";
import { DropdownMenu } from "@/components/ui/molecules/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { Avatar } from "@/components/ui/atoms/avatar";
import { GearIcon, LogoutIcon } from "@/components/ui/atoms/icons";
import { useAppData, computeTotals } from "@/components/providers/app-data-provider";
import { formatFcfa } from "@/lib/utils";

/** Fixed top bar over the content column — left is empty (the sidebar already carries the logo), right holds the Comptoir pastille + identity menu, per USERFLOW.md's Comptoir spec. */
export function Header() {
  const router = useRouter();
  const { sales, openTabIds, deployComptoir } = useAppData();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const openSales = sales.filter((s) => openTabIds.includes(s.id) && s.status === "ouverte");
  const total = openSales.reduce((sum, s) => sum + computeTotals(s).total, 0);

  return (
    <>
      <header className="flex h-[76px] shrink-0 items-center justify-end gap-3 border-b border-[var(--color-gray-200)] bg-[var(--brand-cream)] px-8">
        <SaleTrayTrigger itemCount={openSales.length} total={formatFcfa(total)} onClick={deployComptoir} />

        <DropdownMenu
          trigger={
            <button type="button" className="flex items-center gap-2 rounded-full py-1 pr-3 pl-1 transition hover:bg-white active:scale-[0.98]">
              <Avatar initial="P" size={40} className="bg-[var(--brand-rose-soft)] font-semibold text-[var(--brand-taupe-muted)]" />
              <span className="text-left">
                <span className="block text-sm font-semibold text-[var(--color-gray-900)]">Propriétaire</span>
                <span className="block text-xs text-[var(--color-gray-500)]">Admin</span>
              </span>
            </button>
          }
          items={[
            { label: "Mon Profil", icon: <GearIcon className="size-4" />, onSelect: () => router.push("/reglages") },
            { type: "separator" },
            { label: "Déconnexion", icon: <LogoutIcon className="size-4" />, tone: "danger", onSelect: () => setConfirmLogout(true) },
          ]}
        />
      </header>

      <ConfirmDialog
        open={confirmLogout}
        title="Se déconnecter ?"
        description="Vous devrez vous reconnecter pour accéder au poste."
        confirmLabel="Se déconnecter"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => setConfirmLogout(false)}
      />
    </>
  );
}
