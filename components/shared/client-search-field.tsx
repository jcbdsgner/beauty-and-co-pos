"use client";

import { useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Search, UserPlus } from "lucide-react";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/molecules/command";
import { PersonCard } from "@/components/ui/molecules/person-card";
import type { BadgeVariant } from "@/components/ui/atoms/badge";
import { NewClientDialog } from "@/components/clientele/new-client-dialog";
import { clientFullName, clientInitial, searchClients } from "@/lib/data/clientele";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn } from "@/lib/utils";

/**
 * Turn the raw "Chercher une cliente" text into a head start for the Nouvelle cliente form:
 * a phone-looking query pre-fills Téléphone, anything else splits on the first space into
 * Prénom / Nom.
 */
function draftFromQuery(query: string): { firstName?: string; lastName?: string; phone?: string } {
  const q = query.trim();
  if (!q) return {};
  if (/\d/.test(q) && /^[+\d\s().-]+$/.test(q)) return { phone: q };
  const [first, ...rest] = q.split(/\s+/);
  return { firstName: first, lastName: rest.join(" ") || undefined };
}

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
 * a Popover of cmdk-driven results (`Command`), reused identically in the Comptoir and the
 * rendez-vous form. cmdk's own filtering is off — `searchClients` (name + phone) stays the single
 * source of matching logic across the app.
 */
export function ClientSearchField({ selectedClientId, onSelect, placeholder = "Chercher une cliente…", required, className }: ClientSearchFieldProps) {
  const { clients } = useAppData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const selected = selectedClientId ? clients.find((c) => c.id === selectedClientId) : undefined;
  const results = searchClients(clients, query).slice(0, 6);
  const trimmedQuery = query.trim();

  return (
    <>
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-14 w-full items-center gap-2 rounded-xl border px-4 text-left text-[15px] transition outline-none focus-visible:ring-4 focus-visible:ring-ring/15",
            selected
              ? "border-border bg-white text-[var(--color-gray-900)]"
              : "border-dashed border-secondary/40 bg-white text-[var(--color-gray-400)]",
            className,
          )}
        >
          <Search aria-hidden className="size-4 shrink-0 text-[var(--color-gray-400)]" />
          {selected ? clientFullName(selected) : placeholder}
          {required && !selected && <span className="text-destructive">*</span>}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-50 w-[26rem] rounded-2xl border border-border bg-white p-0 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] focus:outline-none"
        >
          <Command shouldFilter={false} className="border-0">
            <CommandInput value={query} onValueChange={setQuery} placeholder="Nom ou téléphone…" autoFocus />
            <CommandList>
              {results.length === 0 ? (
                <div className="px-2 py-3">
                  <p className="px-2 pb-2 text-center text-sm text-[var(--color-gray-500)]">Aucune cliente trouvée.</p>
                  {trimmedQuery !== "" && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setCreating(true);
                      }}
                      className="flex min-h-14 w-full items-center gap-3 rounded-xl bg-accent px-3 text-left text-[15px] font-semibold text-secondary transition active:scale-[0.99]"
                    >
                      <UserPlus aria-hidden className="size-4 shrink-0" />
                      Ajouter «&nbsp;{trimmedQuery}&nbsp;» comme nouvelle cliente
                    </button>
                  )}
                </div>
              ) : (
                results.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={c.id}
                    onSelect={() => {
                      onSelect(c.id);
                      setQuery("");
                      setOpen(false);
                    }}
                    className="p-0"
                  >
                    <PersonCard
                      initial={clientInitial(c)}
                      name={clientFullName(c)}
                      meta={c.phone}
                      badge={c.tier ? TIER_BADGE[c.tier] : undefined}
                      className="w-full border-0"
                    />
                  </CommandItem>
                ))
              )}
              {clients.length > 0 && query.trim() === "" && (
                <p className="mt-1.5 px-3 pb-1 text-xs text-[var(--color-gray-400)]">{clients.length} clientes au répertoire.</p>
              )}
            </CommandList>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>

    {creating && (
      <NewClientDialog
        open
        initialValues={draftFromQuery(query)}
        onClose={() => setCreating(false)}
        onCreated={(id) => {
          onSelect(id);
          setCreating(false);
          setQuery("");
        }}
      />
    )}
    </>
  );
}
