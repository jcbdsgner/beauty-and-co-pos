"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  BagIcon,
  CalendarIcon,
  DiamondIcon,
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
  { href: "/parametres", label: "Parametres", icon: GearIcon },
];

/**
 * Fixed left navigation — identical on every authenticated screen (dashboard, POS,
 * back-office). Reskinned from the Figma "Elite privé / gold" identity onto the
 * Beauty and Co brand: active item + wordmark accent use taupe instead of gold.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-[var(--color-gray-200)] bg-white">
      <div className="flex flex-col items-center gap-1 border-b border-[var(--color-gray-200)] px-6 py-6 text-center">
        <DiamondIcon className="size-6 text-[var(--brand-taupe-muted)]" />
        <p className="mt-2 font-[var(--font-heading)] text-xl tracking-wide text-[var(--color-gray-900)]">
          Point de vente
        </p>
        <p className="font-[var(--font-benedict)] text-sm text-[var(--brand-taupe-muted)]">privé</p>
        <p className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-[var(--color-gray-400)] uppercase">
          Beauty and Co
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-full px-4 py-2.5 text-[15px] font-medium transition",
                active
                  ? "bg-[var(--pos-accent-dark-soft)] text-[var(--brand-taupe-muted)]"
                  : "text-[var(--color-gray-500)] hover:bg-[var(--color-gray-50)]",
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
            initial="PE"
            size={36}
            className="border-2 border-[var(--brand-taupe-muted)] bg-[var(--brand-rose-soft)] font-semibold text-[var(--brand-taupe-muted)]"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--color-gray-900)]">Proprietaire</p>
            <p className="text-[11px] font-semibold tracking-wide text-[var(--color-gray-400)] uppercase">Admin</p>
          </div>
        </div>
        <button
          type="button"
          className="mt-3 flex w-full items-center gap-2 rounded-full px-2 py-2 text-sm text-[var(--color-gray-500)] hover:bg-[var(--color-gray-50)]"
        >
          <LogoutIcon className="size-4" />
          Deconnexion
        </button>
        <p className="mt-2 px-2 text-[11px] text-[var(--color-gray-300)]">Point de vente v1.0</p>
      </div>
    </aside>
  );
}
