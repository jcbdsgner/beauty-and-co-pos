"use client";

import { useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Search } from "lucide-react";
import { PersonCard } from "@/components/ui/molecules/person-card";
import type { BadgeVariant } from "@/components/ui/atoms/badge";
import { clientFullName, clientInitial, searchClients } from "@/lib/data/clientele";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn } from "@/lib/utils";

const TIER_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  vip: { label: "VIP", variant: "vip" },
  gold: { label: "Gold", variant: "gold" },
  silver: { label: "Silver", variant: "silver" },
};

type ClientSearchFieldProps = {
  selectedClientId: string | null;
  onSelect: (clientId: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

/**
 * The one "Chercher une cliente" mechanism (USERFLOW.md — Modèle conceptuel + Comptoir spec):
 * TextInput + Popover of PersonCard results, reused identically in the Comptoir and the
 * rendez-vous form. The Répertoire has its own always-visible grid+filters instead (a different
 * manifestation of the same underlying client list, not this popover pattern).
 */
export function ClientSearchField({ selectedClientId, onSelect, placeholder = "Chercher une cliente…", required, className }: ClientSearchFieldProps) {
  const { clients } = useAppData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = selectedClientId ? clients.find((c) => c.id === selectedClientId) : undefined;
  const results = searchClients(clients, query).slice(0, 6);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-left text-[15px] focus:outline-none",
            selected
              ? "border-[var(--color-gray-200)] bg-white text-[var(--color-gray-900)]"
              : "border-dashed border-[var(--brand-taupe-muted)]/40 bg-white text-[var(--color-gray-400)]",
            className,
          )}
        >
          <Search aria-hidden className="size-4 shrink-0 text-[var(--color-gray-400)]" />
          {selected ? clientFullName(selected) : placeholder}
          {required && !selected && <span className="text-[var(--color-error)]">*</span>}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-50 w-[26rem] rounded-2xl border border-[var(--color-gray-200)] bg-white p-3 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] focus:outline-none"
        >
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom ou téléphone…"
            className="mb-2 w-full rounded-xl border border-[var(--color-gray-200)] px-3 py-2.5 text-sm focus:border-[var(--brand-taupe-muted)] focus:outline-none"
          />
          <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
            {results.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-[var(--color-gray-400)]">Aucune cliente trouvée.</p>
            ) : (
              results.map((c) => (
                <PersonCard
                  key={c.id}
                  initial={clientInitial(c)}
                  name={clientFullName(c)}
                  meta={c.phone}
                  badge={c.tier ? TIER_BADGE[c.tier] : undefined}
                  onClick={() => {
                    onSelect(c.id);
                    setQuery("");
                    setOpen(false);
                  }}
                />
              ))
            )}
          </div>
          {clients.length > 0 && query.trim() === "" && (
            <p className="mt-1.5 px-1 text-xs text-[var(--color-gray-400)]">{clients.length} clientes au répertoire.</p>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
