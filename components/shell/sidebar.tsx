"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/atoms/logo";
import { Avatar } from "@/components/ui/atoms/avatar";
import { DropdownMenu } from "@/components/ui/molecules/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { SwitchUserDialog } from "@/components/compte/switch-user-dialog";
import { useSession } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/data/utilisateurs";
import { HomeIcon, CalendarIcon, PeopleIcon, GearIcon, LogoutIcon } from "@/components/ui/atoms/icons";
import { MessageCircle, Sparkles, ArrowLeftRight } from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Accueil", icon: HomeIcon, match: (p: string) => p === "/" || p.startsWith("/recap-ventes") || p.startsWith("/cartes-cadeaux") },
  { href: "/planning", label: "Planning", icon: CalendarIcon, match: (p: string) => p.startsWith("/planning") || p.startsWith("/equipe") },
  { href: "/clientele", label: "Clientèle", icon: PeopleIcon, match: (p: string) => p.startsWith("/clientele") },
  { href: "/messages", label: "Messages", icon: MessageCircle, match: (p: string) => p.startsWith("/messages") },
  { href: "/catalogue", label: "Catalogue", icon: Sparkles, match: (p: string) => p.startsWith("/catalogue") },
];

/** Sidebar: brand + nav (Accueil / Planning / Clientèle / Relances / Catalogue) + the identity menu at the foot.
 *  There is no Réglages section — point-de-vente has a single persona (see ADR 0001); the only
 *  "moi" screens (Profil, Sécurité) hang off this identity menu. */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useSession();
  const { conversations } = useAppData();
  const unreadCount = conversations.filter((c) => c.unread).length;
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-[var(--color-gray-200)] bg-white">
      <div className="flex flex-col items-center gap-2 px-6 pt-8 pb-6">
        <Logo className="relative h-16 w-16 shrink-0" />
        <p className="text-xs font-semibold tracking-wide text-[var(--color-gray-400)] uppercase">Point de vente</p>
      </div>

      <nav className="flex flex-col gap-1 px-4">
        {NAV.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition active:scale-[0.98]",
                active ? "bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]" : "text-[var(--color-gray-500)] hover:bg-[var(--color-gray-50)]",
              )}
            >
              <Icon className="size-5" />
              <span className="flex-1">{item.label}</span>
              {item.href === "/messages" && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--board-amber)] px-1 text-[11px] font-semibold text-white tabular-nums">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 px-4 py-5">
        <DropdownMenu
          align="start"
          trigger={
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-[var(--color-gray-50)] active:scale-[0.98]"
            >
              <Avatar initial={currentUser.initial} size={36} className="bg-accent font-semibold text-secondary" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[var(--color-gray-900)]">{currentUser.name}</span>
                <span className="block text-xs text-[var(--color-gray-500)]">{ROLE_LABEL[currentUser.role]}</span>
              </span>
            </button>
          }
          items={[
            { label: "Mon compte", icon: <GearIcon className="size-4" />, onSelect: () => router.push("/compte") },
            { label: "Changer d'utilisateur", icon: <ArrowLeftRight className="size-4" />, onSelect: () => setSwitchOpen(true) },
            { type: "separator" },
            { label: "Déconnexion", icon: <LogoutIcon className="size-4" />, tone: "danger", onSelect: () => setConfirmLogout(true) },
          ]}
        />
      </div>

      <SwitchUserDialog open={switchOpen} onClose={() => setSwitchOpen(false)} />

      <ConfirmDialog
        open={confirmLogout}
        title="Se déconnecter ?"
        description="Vous devrez vous reconnecter pour accéder au poste."
        confirmLabel="Se déconnecter"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => setConfirmLogout(false)}
      />
    </aside>
  );
}
