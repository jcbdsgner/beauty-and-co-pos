"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import {
  BagIcon,
  CalendarIcon,
  GearIcon,
  HeartPulseIcon,
  HomeIcon,
  LogoutIcon,
  PeopleIcon,
  TagHeartIcon,
} from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/", label: "Accueil", icon: HomeIcon },
  { href: "/planning", label: "Planning", icon: CalendarIcon },
  { href: "/clients", label: "Clients", icon: PeopleIcon },
  { href: "/suivi", label: "Suivi", icon: HeartPulseIcon },
  { href: "/lookbook", label: "Lookbook", icon: TagHeartIcon },
  { href: "/stock", label: "Stock", icon: BagIcon },
  { href: "/parametres", label: "Paramètres", icon: GearIcon },
];

/**
 * Fixed left navigation — identical on every authenticated screen (dashboard, POS,
 * back-office). The real Beauty and Co logo leads the identity block (brand outranks the
 * "Point de vente" product label).
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-[var(--color-gray-200)] bg-white">
      <div className="flex flex-col items-center gap-3 border-b border-[var(--color-gray-200)] px-6 py-7 text-center">
        <Logo className="relative h-16 w-16 shrink-0" />
        <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--color-gray-400)] uppercase">
          Point de vente
        </p>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 rounded-full px-4 py-2.5 text-[15px] transition",
                active
                  ? "bg-[rgba(136,102,102,0.16)] font-semibold text-[var(--brand-taupe-muted)]"
                  : "font-medium text-[var(--color-gray-500)] hover:bg-[var(--color-gray-50)]",
              )}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--color-gray-200)] px-4 py-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar
            initial="P"
            size={36}
            className="border-2 border-[var(--brand-taupe-muted)] bg-[var(--brand-rose-soft)] font-semibold text-[var(--brand-taupe-muted)]"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--color-gray-900)]">Propriétaire</p>
            <p className="text-[11px] font-semibold tracking-wide text-[var(--color-gray-400)] uppercase">Admin</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Se déconnecter de Point de vente ?")) {
              // No auth session to clear yet — this is where sign-out would run.
            }
          }}
          className="mt-3 flex w-full items-center gap-2 rounded-full px-2 py-2 text-sm text-[var(--color-gray-500)] hover:bg-[var(--color-gray-50)]"
        >
          <LogoutIcon className="size-4" />
          Déconnexion
        </button>
        <p className="mt-3 px-2 text-[11px] text-[var(--color-gray-300)]">Point de vente v1.0</p>
      </div>
    </aside>
  );
}
