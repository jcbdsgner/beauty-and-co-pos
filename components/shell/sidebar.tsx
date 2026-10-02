"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/atoms/logo";
import { Avatar } from "@/components/ui/atoms/avatar";
import { DropdownMenu } from "@/components/ui/molecules/dropdown-menu";
import { CashDrawerDialog } from "@/components/shell/cash-drawer-dialog";
import { useSession } from "@/lib/session";
import { HomeIcon, CalendarIcon, PeopleIcon, GearIcon, LogoutIcon } from "@/components/ui/atoms/icons";
import { Gift, MessageCircle, Sparkles } from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import { isUnseenReservation } from "@/lib/data/planning";
import { unseenBirthdayWish } from "@/components/messages/lib";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Accueil", icon: HomeIcon, match: (p: string) => p === "/" || p.startsWith("/recap-ventes") },
  { href: "/planning", label: "Planning", icon: CalendarIcon, match: (p: string) => p.startsWith("/planning") || p.startsWith("/equipe") },
  { href: "/clientele", label: "Clientèle", icon: PeopleIcon, match: (p: string) => p.startsWith("/clientele") },
  { href: "/messages", label: "Messages", icon: MessageCircle, match: (p: string) => p.startsWith("/messages") },
  // Section à part entière depuis l'ADR 0040 (l'aperçu de l'Accueil a cédé la place aux alertes).
  { href: "/cartes-cadeaux", label: "Cartes cadeaux", icon: Gift, match: (p: string) => p.startsWith("/cartes-cadeaux") },
  { href: "/catalogue", label: "Catalogue", icon: Sparkles, match: (p: string) => p.startsWith("/catalogue") },
];

/** Sidebar: brand + nav (Accueil / Planning / Clientèle / Messages / Cartes cadeaux / Catalogue) + the identity menu at the foot.
 *  There is no Réglages section — point-de-vente has a single persona (see ADR 0001); the only
 *  "moi" screens (Profil, Sécurité) hang off this identity menu. */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, photoUrl, logout } = useSession();
  const { conversations, reservations, giftCardOrders } = useAppData();
  const unreadCount = conversations.filter((c) => c.unread).length;
  const hasUnseenBirthday = conversations.some((c) => unseenBirthdayWish(c.messages));
  // Quel que soit le jour réservé — comme la bande « Réservations reçues » de l'Accueil qui le résout.
  const hasUnseenReservation = reservations.some(isUnseenReservation);
  const hasGiftCardToPrint = giftCardOrders.some((o) => o.status === "a_imprimer");
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
          // Messages porte le signal ambre (« Non lu » — needs action). Accueil porte le même point
          // en taupe (« Non vue », ADR 0030) : une réservation en ligne vient d'arriver — la bande rose
          // en tête de l'Accueil la montre —, à noter
          // mais pas à encaisser — l'ambre reste réservé à « à encaisser » sur cette même page.
          // Messages prend ce même point taupe pour un anniversaire souhaité pas encore vu (l'ambre
          // du « Non lu » passe devant).
          const badge =
            item.href === "/messages" && unreadCount > 0
              ? "warning"
              : (item.href === "/messages" && hasUnseenBirthday) ||
                  (item.href === "/" && hasUnseenReservation) ||
                  // Une carte attend l'impression — même point taupe : à faire, pas urgent (ADR 0040).
                  (item.href === "/cartes-cadeaux" && hasGiftCardToPrint)
                ? "primary"
                : null;
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
                {badge && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -top-1 -right-1.5 size-2 rounded-full",
                      badge === "warning"
                        ? "bg-warning"
                        : // Anneau clair : sans lui, le point taupe de l'Accueil disparaîtrait
                          // sur le fond déjà taupe de l'item actif (contrairement à l'ambre de
                          // Messages, qui contraste avec le taupe sans y avoir besoin).
                          "bg-primary ring-2 ring-base-100",
                    )}
                  />
                )}
              </span>
              {/* Casse de phrase, sans espacement : en capitales, « CATALOGUE » remplissait la tuile de bord à bord. */}
              <span className="text-xs leading-tight font-semibold">{item.label}</span>
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

      <CashDrawerDialog
        open={confirmLogout}
        mode="close"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          logout();
        }}
      />
    </aside>
  );
}
