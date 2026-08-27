"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/atoms/logo";
import { HomeIcon, PeopleIcon, GearIcon } from "@/components/ui/atoms/icons";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Journée", icon: HomeIcon, match: (p: string) => p === "/" || p.startsWith("/planning") || p.startsWith("/equipe") || p.startsWith("/recap-ventes") },
  { href: "/clientele", label: "Clientèle", icon: PeopleIcon, match: (p: string) => p.startsWith("/clientele") },
  { href: "/reglages", label: "Réglages", icon: GearIcon, match: (p: string) => p.startsWith("/reglages") },
];

/** 3-item sidebar (Journée / Clientèle / Réglages) — down from the old app's 6 flat modules, per USERFLOW.md's "organiser par rythme d'usage" rework. Identity/déconnexion moved to the header (see Header). */
export function Sidebar() {
  const pathname = usePathname();

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
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-6 py-5">
        <p className="text-center text-[11px] text-[var(--color-gray-300)]">Point de vente v2.0</p>
      </div>
    </aside>
  );
}
