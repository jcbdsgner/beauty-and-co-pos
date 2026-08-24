import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ChevronIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { PARAMETRES_PROFILE, SETTINGS_CARDS } from "@/lib/data/parametres-general";

/** Profile summary card at the top of the Paramètres hub (avatar, name, role, company). */
export function SettingsProfileCard() {
  const { initials, name, role, company } = PARAMETRES_PROFILE;

  return (
    <Card className="flex items-center gap-4 p-5">
      <Avatar
        initial={initials}
        size={56}
        className="border-2 border-[var(--brand-taupe-muted)] bg-[var(--brand-rose-soft)] text-lg font-semibold text-[var(--brand-taupe-muted)]"
      />
      <div className="min-w-0">
        <p className="truncate font-semibold text-[var(--color-gray-900)]">{name}</p>
        <p className="text-sm text-[var(--color-gray-500)]">{role}</p>
        <p className="text-sm font-semibold text-[var(--brand-taupe-muted)]">{company}</p>
      </div>
    </Card>
  );
}

/** 2-column "app launcher" grid of settings cards — cards with a real sub-page are links, the rest are shown dimmed and non-interactive. */
export function SettingsHubGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {SETTINGS_CARDS.map((item) => {
        const inner = (
          <Card
            className={cn(
              "flex h-full items-center gap-4 p-4 transition",
              item.href ? "hover:border-[var(--brand-taupe-muted)]" : "opacity-55",
            )}
          >
            <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl text-xl", item.bg)}>
              <span aria-hidden>{item.emoji}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-[var(--color-gray-900)]">{item.title}</span>
              <span className="block truncate text-sm text-[var(--color-gray-500)]">{item.subtitle}</span>
            </span>
            <ChevronIcon
              className={cn("shrink-0", item.href ? "text-[var(--color-gray-400)]" : "text-[var(--color-gray-300)]")}
            />
          </Card>
        );

        if (item.href) {
          return (
            <Link key={item.key} href={item.href}>
              {inner}
            </Link>
          );
        }

        return (
          <div key={item.key} aria-disabled className="cursor-default select-none">
            {inner}
          </div>
        );
      })}
    </div>
  );
}
