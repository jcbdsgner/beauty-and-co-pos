"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/atoms/logo";
import { Avatar } from "@/components/ui/atoms/avatar";
import { DropdownMenu } from "@/components/ui/molecules/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { useSession } from "@/lib/session";
import { HomeIcon, CalendarIcon, PeopleIcon, GearIcon, LogoutIcon } from "@/components/ui/atoms/icons";
import { MessageCircle, Sparkles } from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Accueil", icon: HomeIcon, match: (p: string) => p === "/" || p.startsWith("/recap-ventes") || p.startsWith("/cartes-cadeaux") },
  { href: "/planning", label: "Planning", icon: CalendarIcon, match: (p: string) => p.startsWith("/planning") || p.startsWith("/equipe") },
  { href: "/clientele", label: "Clientèle", icon: PeopleIcon, match: (p: string) => p.startsWith("/clientele") },
  { href: "/messages", label: "Messages", icon: MessageCircle, match: (p: string) => p.startsWith("/messages") },
  { href: "/catalogue", label: "Catalogue", icon: Sparkles, match: (p: string) => p.startsWith("/catalogue") },
];

/** Sidebar: brand + nav (Accueil / Planning / Clientèle / Messages / Catalogue) + the identity menu at the foot.
 *  There is no Réglages section — point-de-vente has a single persona (see ADR 0001); the only
 *  "moi" screens (Profil, Sécurité) hang off this identity menu. */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, photoUrl, logout } = useSession();
  const { conversations } = useAppData();
  const unreadCount = conversations.filter((c) => c.unread).length;
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <aside className="flex h-screen w-[104px] shrink-0 flex-col items-center border-r border-base-300 bg-base-100">
      <div className="flex shrink-0 items-center justify-center pt-8 pb-6">
        <Logo size="footer" className="relative h-9 w-[78px] shrink-0" />
      </div>

      <nav className="flex w-full flex-1 flex-col justify-center gap-3 px-2.5">
        {NAV.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          const badge = item.href === "/messages" && unreadCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-[83px] flex-col items-center justify-center gap-2 rounded-box px-1 py-3 text-center transition active:scale-[0.98]",
                active ? "bg-primary text-primary-content" : "text-base-content/60 hover:bg-base-200",
              )}
            >
              <span className="relative">
                <Icon className="size-6" />
                {badge && <span className="absolute -top-1 -right-1.5 size-2 rounded-full bg-warning" />}
              </span>
              <span className="text-[10.5px] leading-tight font-semibold tracking-wide uppercase">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex w-full shrink-0 flex-col items-center px-2.5 py-5">
        <DropdownMenu
          align="start"
          side="right"
          trigger={
            <button
              type="button"
              aria-label="Mon compte"
              className="flex size-16 items-center justify-center rounded-box transition hover:bg-base-200 active:scale-[0.98]"
            >
              <Avatar photoUrl={photoUrl} initial={currentUser.initial} size={40} className="bg-accent font-semibold text-secondary" />
            </button>
          }
          items={[
            { type: "header", label: currentUser.name },
            { type: "separator" },
            { label: "Mon compte", icon: <GearIcon className="size-4" />, onSelect: () => router.push("/compte") },
            { label: "Déconnexion", icon: <LogoutIcon className="size-4" />, onSelect: () => setConfirmLogout(true) },
          ]}
        />
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Se déconnecter ?"
        description="Vous devrez ressaisir votre mot de passe pour accéder au poste."
        confirmLabel="Se déconnecter"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          logout();
        }}
      />
    </aside>
  );
}
