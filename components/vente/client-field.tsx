"use client";

import { PersonCard } from "@/components/ui/person-card";
import { PersonSilhouetteIcon } from "@/components/vente/icons";
import type { Client } from "@/lib/data/vente";

type ClientFieldProps = {
  client: Client | null;
  onOpenModal: () => void;
  onRemove: () => void;
};

/** "Sélectionner un client *" dashed placeholder, or the selected client card with a "Retirer" link. */
export function ClientField({ client, onOpenModal, onRemove }: ClientFieldProps) {
  if (!client) {
    return (
      <button
        type="button"
        onClick={onOpenModal}
        className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-[var(--core-brand-color)] bg-white px-4 py-3 text-[15px] font-medium text-[var(--color-gray-600)] transition hover:bg-[var(--brand-rose-soft)]"
      >
        <PersonSilhouetteIcon className="text-[var(--brand-taupe-muted)]" />
        Sélectionner un client <span className="text-[var(--color-error)]">*</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-gray-200)] bg-white p-3 pr-4">
      <div className="min-w-0 flex-1">
        <PersonCard
          initial={client.initial}
          name={client.name}
          meta={`${client.phone} · ${client.points} pts`}
          badge={client.badge}
          className="border-0 p-0 hover:border-0"
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 text-sm font-medium text-[var(--color-error)] hover:underline"
      >
        Retirer
      </button>
    </div>
  );
}
