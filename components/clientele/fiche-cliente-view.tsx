"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Printer,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Pencil,
  ChevronRight,
  Sparkles,
  Globe,
} from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Select } from "@/components/ui/atoms/select";
import { PhotoPlaceholder } from "@/components/ui/atoms/photo-placeholder";
import { Board, Lane, Legend, BoardEmpty, FlipChip } from "@/components/ui/board";
import { DemoQrBlock } from "@/components/clientele/loyalty-card";
import { EditCoordonneesDialog } from "@/components/clientele/edit-coordonnees-dialog";
import { EditPreferencesDialog } from "@/components/clientele/edit-preferences-dialog";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { formatFcfa, cn } from "@/lib/utils";
import {
  PREFERENCE_DOMAINS,
  PREFERENCE_DOMAIN_LABEL,
  type PreferenceDomain,
} from "@/lib/data/types";

const TIER_LABEL: Record<string, string> = { vip: "VIP", gold: "Gold", silver: "Silver" };

/** Where "Ajouter une note" files the text: the internal log, or one of the five préférence domains. */
const NOTE_TARGETS: { value: string; label: string }[] = [
  { value: "interne", label: "Note interne" },
  ...PREFERENCE_DOMAINS.map((d) => ({ value: d, label: `Préférence · ${PREFERENCE_DOMAIN_LABEL[d]}` })),
];

export function FicheClienteView({ clientId }: { clientId: string }) {
  const router = useRouter();
  const { clients, praticiennes, conversations, openNewTab, updateClient, noteClientViewed } = useAppData();
  const client = clients.find((c) => c.id === clientId);
  const clientExists = Boolean(client);

  useEffect(() => {
    if (clientExists) noteClientViewed(clientId);
  }, [clientId, clientExists, noteClientViewed]);

  const [editCoordOpen, setEditCoordOpen] = useState(false);
  const [editPrefOpen, setEditPrefOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteTarget, setNoteTarget] = useState("interne");

  if (!client) {
    return (
      <div className="flex flex-col gap-6">
        <Board legend="Fiche introuvable">
          <BoardEmpty
            title="Cette cliente est introuvable"
            hint="La fiche demandée n'existe pas."
            action={
              <Button href="/clientele" variant="outline">
                Retour au répertoire
              </Button>
            }
          />
        </Board>
      </div>
    );
  }

  const preferredStaff = client.preferredStaffId ? praticiennes.find((p) => p.id === client.preferredStaffId) : undefined;
  const conversation = conversations.find((c) => c.clientId === client.id);
  const lastMessages = conversation
    ? [...conversation.messages].sort((a, b) => a.at.localeCompare(b.at)).slice(-2)
    : [];
  const preferenceNotes = client.preferenceNotes ?? {};
  const preferencePhotos = client.preferencePhotos ?? {};
  const hasPreferences = Boolean(
    client.hairType ||
      client.colorReference ||
      PREFERENCE_DOMAINS.some((d) => preferenceNotes[d] || preferencePhotos[d]?.length),
  );
  const canContact = Boolean(client.whatsapp || client.phone || client.email);

  function addNote() {
    if (!client || !noteDraft.trim()) return;
    const text = noteDraft.trim();
    if (noteTarget === "interne") {
      const stamp = new Date().toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      const entry = `[${stamp}] ${text}`;
      updateClient(client.id, { internalNotes: client.internalNotes ? `${entry}\n\n${client.internalNotes}` : entry });
    } else {
      const domain = noteTarget as PreferenceDomain;
      const current = client.preferenceNotes?.[domain];
      updateClient(client.id, {
        preferenceNotes: { ...client.preferenceNotes, [domain]: current ? `${current}\n${text}` : text },
      });
    }
    setNoteDraft("");
  }

  function contact() {
    if (!client) return;
    if (client.whatsapp) window.open(`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`, "_blank");
    else if (client.phone) window.open(`tel:${client.phone.replace(/\s/g, "")}`, "_self");
    else if (client.email) window.open(`mailto:${client.email}`, "_self");
  }

  return (
    <div className="flex flex-col">
      {/* Bandeau d'identité collant — la plaque ardoise de la cliente. Isolé dans son propre contexte
          d'empilement et sorti du flux `gap` : au scroll il couvre proprement le contenu qui passe
          dessous, sans bande morte ni coin de plaque qui dépasse. */}
      <div className="sticky top-0 z-30 isolate -mx-8 -mt-8 mb-6 border-b border-[var(--board-slate-line)] bg-[var(--board-slate)] px-8 py-4 shadow-[0_12px_24px_-14px_rgba(0,0,0,0.55)]">
        <Link href="/clientele" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.11em] text-white/50 transition hover:text-white/80">
          ← Clientèle
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar initial={clientInitial(client)} size={48} className="bg-white/10 text-lg font-semibold text-white" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate font-[family-name:var(--font-heading)] text-2xl font-bold text-white">{clientFullName(client)}</h1>
                {client.tier && <FlipChip value={TIER_LABEL[client.tier]} tone={client.tier === "vip" ? "act" : "now"} className="min-w-0 px-2" />}
              </div>
              <p className="truncate text-sm text-white/55">
                Cliente depuis {new Date(client.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                {client.lastVisit ? ` · dernière visite ${client.lastVisit}` : ""}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" icon={<MessageCircle className="size-4" />} disabled={!canContact} onClick={contact}>
              Contacter
            </Button>
            <Button variant="brand" onClick={() => openNewTab({ clientId: client.id })}>
              Nouvelle vente
            </Button>
          </div>
        </div>
        {!canContact && <p className="mt-2 text-xs text-white/40">Aucune coordonnée enregistrée — ajoutez un téléphone pour pouvoir la contacter.</p>}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Le maintenant */}
        <div className="flex flex-col gap-6">
          <Board legend="Valeur cliente">
            <div className="grid grid-cols-3 gap-px bg-[var(--board-groove)]">
              {[
                { k: "Total dépensé", v: formatFcfa(client.totalSpent) },
                { k: "Visites", v: String(client.totalVisits) },
                { k: "Points fidélité", v: String(client.points) },
              ].map((m) => (
                <div key={m.k} className="bg-white px-4 py-4">
                  <Legend>{m.k}</Legend>
                  <p className="mt-1 font-[family-name:var(--font-heading)] text-lg font-semibold tabular-nums text-[var(--color-gray-900)]">{m.v}</p>
                </div>
              ))}
            </div>
            <p className="px-4 py-3 text-sm text-[var(--color-gray-500)]">
              {client.lastVisit ? `Dernière visite ${client.lastVisit}.` : "Aucune visite enregistrée."}{" "}
              {"L'historique détaillé arrivera avec les ventes réelles."}
            </p>
          </Board>

          <Board
            legend="Échanges"
            legendRight={
              lastMessages.length > 0 && (
                <a
                  href={`/messages?client=${client.id}`}
                  className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--brand-taupe-muted)] underline underline-offset-2"
                >
                  Voir les échanges
                </a>
              )
            }
          >
            {lastMessages.length === 0 ? (
              <BoardEmpty title="Aucun échange" hint="Rien n'a encore été envoyé à cette cliente." />
            ) : (
              lastMessages.map((m) => {
                const who =
                  m.sender === "cliente" ? client.firstName : m.sender === "receptionniste" ? "Vous" : "Conseillère";
                return (
                  <Lane
                    key={m.id}
                    title={who}
                    meta={<span className="line-clamp-2">{m.body}</span>}
                    className="items-start py-3"
                  />
                );
              })
            )}
          </Board>

          <Board legend="Notes">
            {client.internalNotes && (
              <div className="max-h-48 overflow-y-auto whitespace-pre-line border-b border-[var(--board-groove)] bg-black/[0.015] px-4 py-3 text-sm text-[var(--color-gray-700)]">
                {client.internalNotes}
              </div>
            )}
            <div className="flex flex-col gap-3 p-4">
              <Textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Une observation, une préférence exprimée en salon…"
                rows={3}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={noteTarget}
                  onChange={setNoteTarget}
                  options={NOTE_TARGETS}
                  size="compact"
                  className="w-auto min-w-[15rem]"
                />
                <Button variant="brand" onClick={addNote} disabled={!noteDraft.trim()}>
                  Ajouter
                </Button>
              </div>
              <p className="text-xs text-[var(--color-gray-400)]">
                {noteTarget === "interne"
                  ? "Rangée dans le journal interne de la fiche."
                  : `Ajoutée à la préférence « ${PREFERENCE_DOMAIN_LABEL[noteTarget as PreferenceDomain]} ».`}
              </p>
            </div>
          </Board>

        </div>

        {/* La référence */}
        <div className="flex flex-col gap-6">
          <Board legend="Carte de fidélité">
            <div className="flex items-center justify-between gap-4 p-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-[var(--color-gray-500)]">{"Le QR d'identification de la cliente."}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" icon={<Printer className="size-4" />} onClick={() => window.print()}>
                    Imprimer
                  </Button>
                  <Button variant="outline" size="sm" href={`/clientele/${client.id}/fidelite`}>
                    Ouvrir
                  </Button>
                </div>
              </div>
              <DemoQrBlock seed={client.id} size={68} />
            </div>
          </Board>

          <Board
            legend="Coordonnées"
            legendRight={
              <IconButton
                aria-label="Modifier les coordonnées"
                className="size-10 rounded-full text-[var(--color-gray-500)] transition active:scale-90 hover:bg-accent"
                onClick={() => setEditCoordOpen(true)}
              >
                <Pencil className="size-4" />
              </IconButton>
            }
          >
            <div className="flex flex-col gap-3 p-4">
              <Row icon={<Phone className="size-4" />} label="Téléphone" value={client.phone} />
              <Row icon={<MessageCircle className="size-4" />} label="WhatsApp" value={client.whatsapp} />
              <Row icon={<Mail className="size-4" />} label="Email" value={client.email} />
              <Row icon={<Briefcase className="size-4" />} label="Profession" value={client.profession} />
              <Row icon={<MapPin className="size-4" />} label="Adresse" value={client.address} />
              <Row icon={<Globe className="size-4" />} label="Pays de résidence" value={client.residenceCountry} />
              {preferredStaff && (
                <button
                  type="button"
                  onClick={() => router.push(`/planning?staff=${preferredStaff.id}`)}
                  className="flex items-center gap-3 text-left"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-gray-100)] text-[var(--color-gray-500)]">
                    <Sparkles className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <Legend>Praticienne préférée</Legend>
                    <span className="flex items-center gap-1 text-sm text-[var(--brand-taupe-muted)] underline underline-offset-2">
                      {preferredStaff.name}
                      <ChevronRight className="size-3.5" />
                    </span>
                  </span>
                </button>
              )}
            </div>
          </Board>

          <Board
            legend="Préférences beauté"
            legendRight={
              <IconButton
                aria-label="Modifier les préférences beauté"
                className="size-10 rounded-full text-[var(--color-gray-500)] transition active:scale-90 hover:bg-accent"
                onClick={() => setEditPrefOpen(true)}
              >
                <Pencil className="size-4" />
              </IconButton>
            }
          >
            {hasPreferences ? (
              <div className="flex flex-col divide-y divide-[var(--board-groove)] text-sm">
                {(client.hairType || client.colorReference) && (
                  <div className="flex flex-col gap-3 p-4">
                    <Pref label="Type de cheveux" value={client.hairType} />
                    <Pref label="Référence couleur" value={client.colorReference} />
                  </div>
                )}
                {PREFERENCE_DOMAINS.map((domain) => {
                  const note = preferenceNotes[domain];
                  const photos = preferencePhotos[domain] ?? [];
                  if (!note && photos.length === 0) return null;
                  return (
                    <div key={domain} className="flex flex-col gap-2 p-4">
                      <Legend>{PREFERENCE_DOMAIN_LABEL[domain]}</Legend>
                      {note && <p className="whitespace-pre-line text-[var(--color-gray-800)]">{note}</p>}
                      {photos.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {photos.map((ref) => (
                            <PhotoPlaceholder key={ref} className="size-16" label="" />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <BoardEmpty title="Aucune préférence enregistrée" hint="Type de cheveux, référence couleur et goûts par domaine." />
            )}
          </Board>

          <Board legend="Abonnement">
            <BoardEmpty title="Aucun abonnement actif" hint="Cette cliente n'a pas d'abonnement en cours." />
          </Board>
        </div>
      </div>

      <EditCoordonneesDialog open={editCoordOpen} client={client} onClose={() => setEditCoordOpen(false)} />
      <EditPreferencesDialog open={editPrefOpen} client={client} onClose={() => setEditPrefOpen(false)} />
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-gray-100)] text-[var(--color-gray-500)]">{icon}</span>
      <div className="min-w-0">
        <Legend>{label}</Legend>
        <p className={cn("truncate text-sm", value ? "text-[var(--color-gray-900)]" : "text-[var(--color-gray-400)]")}>{value ?? "Non renseigné"}</p>
      </div>
    </div>
  );
}

function Pref({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <Legend>{label}</Legend>
      <p className="mt-0.5 text-[var(--color-gray-800)]">{value}</p>
    </div>
  );
}
