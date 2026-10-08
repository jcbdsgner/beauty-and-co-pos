"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Plus, Search } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Dialog } from "@/components/ui/molecules/dialog";
import { NewClientDialog } from "@/components/clientele/new-client-dialog";
import { DevisComposer } from "@/components/devis/devis-composer";
import { buildDossiers } from "@/components/devis/lib";
import { useAppData } from "@/components/providers/app-data-provider";
import { useAppStore } from "@/lib/store/app-store";
import { clientFullName, clientInitial, searchClients } from "@/lib/data/clientele";
import { formatPhone } from "@/lib/utils";

/** Ce qu'on a tapé, réparti dans la fiche à créer : un numéro, ou un prénom + nom. */
function draftFromQuery(query: string): { firstName?: string; lastName?: string; phone?: string } {
  const q = query.trim();
  if (!q) return {};
  if (/\d/.test(q) && /^[+\d\s().-]+$/.test(q)) return { phone: q };
  const [first, ...rest] = q.split(/\s+/);
  return { firstName: first, lastName: rest.join(" ") || undefined };
}

/**
 * « Nouveau devis » de l'en-tête de Messages (ADR 0042) — la seule entrée de la section. La cliente
 * du fil ouvert est proposée d'abord ; sinon on en cherche une, ou on crée une fiche à compléter
 * (nom, téléphone, e-mail). La recherche est dans la fenêtre même, pas dans un popover : le piège à
 * focus d'une fenêtre lui volerait la frappe. Le devis enregistré ouvre son fil.
 */
export function NewDevisLauncher() {
  const router = useRouter();
  const suggestedClientId = useSearchParams().get("client");
  const { clients, devis, factures } = useAppData();
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [target, setTarget] = useState<{ clientId: string; devisId?: string } | null>(null);

  const suggested = suggestedClientId ? clients.find((c) => c.id === suggestedClientId) : undefined;
  const results = query.trim() ? searchClients(clients, query).slice(0, 6) : [];

  // Ce que la cliente a déjà d'ouvert : un brouillon se reprend (choose), un devis envoyé ou une
  // facture à payer se signale — sans quoi on en ouvrait un second sans le savoir.
  function openNote(clientId: string): string | null {
    const draft = devis.find((d) => d.clientId === clientId && d.status === "brouillon");
    if (draft) return `Brouillon en cours · ${draft.number}`;
    const live = buildDossiers(devis.filter((d) => d.clientId === clientId), factures).find((d) => d.stage === "envoye" || d.stage === "a_payer");
    if (!live) return null;
    return live.stage === "a_payer" ? `Facture à payer · ${live.facture!.number}` : `Devis en attente · ${live.number}`;
  }

  function choose(clientId: string) {
    setPicking(false);
    setQuery("");
    // Un brouillon déjà commencé pour elle se reprend au lieu d'en ouvrir un second.
    const draft = devis.find((d) => d.clientId === clientId && d.status === "brouillon");
    setTarget({ clientId, devisId: draft?.id });
  }

  return (
    <>
      <Button variant="outline" size="sm" icon={<FileText className="size-4" />} onClick={() => setPicking(true)}>
        Nouveau devis
      </Button>

      {picking && (
        <Dialog open labelledBy="new-devis-title" className="relative flex max-w-[520px] flex-col gap-4 p-7">
          <CloseButton onClick={() => setPicking(false)} className="top-4 right-4" />
          <h2 id="new-devis-title" className="text-[22px] font-semibold">Devis pour…</h2>

          {suggested && (
            <button
              type="button"
              onClick={() => choose(suggested.id)}
              className="highlight-rose flex min-h-16 items-center py-2 gap-3 rounded-field border bg-white px-4 text-left transition active:scale-[0.99]"
            >
              <Avatar initial={clientInitial(suggested)} size={40} className="bg-accent font-semibold text-secondary" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{clientFullName(suggested)}</span>
                <span className="block text-sm text-base-content/65">Conversation ouverte</span>
                {openNote(suggested.id) && <span className="mt-0.5 flex items-center gap-1 text-sm font-medium text-secondary"><FileText aria-hidden className="size-3.5" />{openNote(suggested.id)}</span>}
              </span>
            </button>
          )}

          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-base-content/45" />
            <TextInput
              autoFocus={!suggested}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={suggested ? "Autre cliente : nom ou téléphone" : "Nom ou téléphone"}
              aria-label="Chercher une cliente"
              className="pl-12"
            />
          </div>

          {query.trim() && (
            <ul className="flex flex-col">
              {results.map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => choose(c.id)} className="flex min-h-14 w-full items-center gap-3 rounded-field px-2 text-left hover:bg-base-200">
                    <Avatar initial={clientInitial(c)} size={36} className="bg-accent font-semibold text-secondary" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{clientFullName(c)}</span>
                      <span className="block text-sm tabular-nums text-base-content/65">{formatPhone(c.phone)}</span>
                      {openNote(c.id) && <span className="flex items-center gap-1 text-sm font-medium text-secondary"><FileText aria-hidden className="size-3.5" />{openNote(c.id)}</span>}
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={() => setCreating(true)} className="flex min-h-14 w-full items-center gap-3 rounded-field px-2 text-left font-semibold text-secondary hover:bg-base-200">
                  <span className="grid size-9 place-items-center rounded-full bg-accent"><Plus className="size-4" /></span>
                  Nouvelle cliente « {query.trim()} »
                </button>
              </li>
            </ul>
          )}

          {creating && (
            <NewClientDialog
              open
              minimal
              initialValues={draftFromQuery(query)}
              onClose={() => setCreating(false)}
              onCreated={(id) => {
                setCreating(false);
                choose(id);
              }}
            />
          )}
        </Dialog>
      )}

      {target && (
        <DevisComposer
          clientId={target.clientId}
          devisId={target.devisId}
          onClose={() => {
            const id = target.clientId;
            setTarget(null);
            if (useAppStore.getState().conversations.some((c) => c.clientId === id)) router.replace(`/messages?client=${id}`);
          }}
        />
      )}
    </>
  );
}
