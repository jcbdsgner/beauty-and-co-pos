"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Dialog } from "@/components/ui/dialog";
import { CloseButton } from "@/components/ui/icon-button";
import { SearchInput } from "@/components/ui/search-input";
import { PersonCard } from "@/components/ui/person-card";
import { CameraIcon, PersonSilhouetteIcon } from "@/components/vente/icons";
import { CLIENTS, type Client } from "@/lib/data/vente";

type ClientModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (client: Client) => void;
  onScanQr: () => void;
};

/** "Sélectionner un client" modal — search, quick actions (scan / new) and the client list. */
export function ClientModal({ open, onClose, onSelect, onScanQr }: ClientModalProps) {
  const [search, setSearch] = useState("");

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return CLIENTS;
    return CLIENTS.filter(
      (client) => client.name.toLowerCase().includes(query) || client.phone.replace(/\s/g, "").includes(query.replace(/\s/g, "")),
    );
  }, [search]);

  return (
    <Dialog open={open} labelledBy="client-modal-title" className="max-h-[85vh] max-w-md overflow-y-auto rounded-2xl p-6 shadow-2xl">
      <div className="relative mb-4">
        <h2 id="client-modal-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
          Sélectionner un client
        </h2>
        <CloseButton onClick={onClose} />
      </div>

      <SearchInput
        placeholder="Rechercher par nom ou téléphone..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mb-3 focus-within:border-[var(--brand-taupe-muted)]"
      />

      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onScanQr}
          className="flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-cream)] px-3 py-3 text-sm font-medium text-[var(--color-gray-800)] transition hover:opacity-90"
        >
          <CameraIcon className="size-5" />
          Scanner QR
        </button>
        <Link
          href="/clients/nouveau"
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--brand-taupe-muted)] px-3 py-3 text-sm font-medium text-[var(--brand-taupe-muted)] transition hover:bg-[var(--brand-rose-soft)]"
        >
          <PersonSilhouetteIcon className="size-5" />+ Nouveau
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {results.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--color-gray-500)]">Aucun client ne correspond à cette recherche.</p>
        )}
        {results.map((client) => (
          <PersonCard
            key={client.id}
            initial={client.initial}
            name={client.name}
            meta={`${client.phone} · ${client.points} pts`}
            badge={client.badge}
            onClick={() => onSelect(client)}
          />
        ))}
      </div>
    </Dialog>
  );
}
