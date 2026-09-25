"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Printer,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Globe,
  CalendarClock,
  PackageCheck,
  Receipt,
} from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Badge } from "@/components/ui/atoms/badge";
import { TIER_LABEL } from "@/lib/data/tiers";
import { Button } from "@/components/ui/atoms/button";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Select } from "@/components/ui/atoms/select";
import { PhotoPlaceholder } from "@/components/ui/atoms/photo-placeholder";
import { Board, Lane, BoardEmpty } from "@/components/ui/board";
import { DemoQrBlock } from "@/components/clientele/loyalty-card";
import { ChannelGlyph } from "@/components/messages/channel-glyph";
import { AbonnementsPacksBoard } from "@/components/clientele/abonnements-packs-board";
import { EditCoordonneesDialog } from "@/components/clientele/edit-coordonnees-dialog";
import { EditPreferencesDialog } from "@/components/clientele/edit-preferences-dialog";
import { NotationPhoto } from "@/components/clientele/notation-photo";
import { useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial, clientNumberLabel } from "@/lib/data/clientele";
import { abonnementsForClient, abonnementStatus, ABONNEMENT_STATUS_LABEL, type AbonnementStatus } from "@/lib/data/abonnements";
import { forfaitById } from "@/lib/data/forfaits";
import { packPurchasesForClient, packRemainingPrestations } from "@/lib/data/pack-purchases";
import { packById } from "@/lib/data/packs";
import { notationForDomain } from "@/lib/data/notation";
import { UTILISATEUR } from "@/lib/data/utilisateurs";
import { formatFcfa, cn } from "@/lib/utils";
import {
  PREFERENCE_DOMAINS,
  PREFERENCE_DOMAIN_LABEL,
  type Cliente,
  type ClientNote,
  type Praticienne,
  type PreferenceDomain,
} from "@/lib/data/types";

/** Where "Ajouter" files the text: the internal log, or one of the five préférence domains. */
const NOTE_TARGETS: { value: string; label: string }[] = [
  { value: "interne", label: "Journal interne" },
  ...PREFERENCE_DOMAINS.map((d) => ({
    value: d,
    label: `Préférence · ${PREFERENCE_DOMAIN_LABEL[d]}`,
  })),
];

const NOTE_DATE = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const NOTE_TIME = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

const STATUS_TONE: Record<AbonnementStatus, string> = {
  a_jour: "text-success",
  a_regler: "text-warning",
  revoque: "text-base-content/45",
};

export function FicheClienteView({ clientId }: { clientId: string }) {
  return (
    <Suspense fallback={null}>
      <FicheClienteViewInner clientId={clientId} />
    </Suspense>
  );
}

function FicheClienteViewInner({ clientId }: { clientId: string }) {
  const searchParams = useSearchParams();
  // Arrivée depuis la recherche rapide de l'Accueil (`ClientMatchCard`, passe impeccable du 22/09) :
  // "Retour" pointe vers l'Accueil avec la même recherche plutôt que Clientèle par défaut.
  const fromAccueil = searchParams.get("from") === "accueil";
  const accueilQuery = searchParams.get("q") ?? "";
  const backHref = fromAccueil ? (accueilQuery ? `/?q=${encodeURIComponent(accueilQuery)}` : "/") : "/clientele";
  const backLabel = fromAccueil ? "Accueil" : "Clientèle";
  const { clients, praticiennes, conversations, openNewTab, noteClientViewed } = useAppData();
  const client = clients.find((c) => c.id === clientId);
  const clientExists = Boolean(client);

  useEffect(() => {
    if (clientExists) noteClientViewed(clientId);
  }, [clientId, clientExists, noteClientViewed]);

  const [editCoordOpen, setEditCoordOpen] = useState(false);
  const [editPrefOpen, setEditPrefOpen] = useState(false);

  if (!client) {
    return (
      <div className="flex flex-col gap-6">
        <Board legend="Fiche introuvable">
          <BoardEmpty
            title="Cette cliente est introuvable"
            hint="La fiche demandée n'existe pas."
            action={
              <Button href="/clientele" variant="outline">
                Retour à la Clientèle
              </Button>
            }
          />
        </Board>
      </div>
    );
  }

  const canContact = Boolean(client.whatsapp || client.phone || client.email);

  function contact() {
    if (!client) return;
    if (client.whatsapp) window.open(`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`, "_blank");
    else if (client.phone) window.open(`tel:${client.phone.replace(/\s/g, "")}`, "_self");
    else if (client.email) window.open(`mailto:${client.email}`, "_self");
  }

  return (
    <div className="flex flex-col">
      {/* Bandeau d'identité collant : qui elle est, son numéro, et ce qu'elle a déjà payé d'avance. */}
      <div className="sticky top-0 z-30 isolate -mx-8 -mt-8 mb-7 border-b border-base-300 bg-white px-8 pt-4 shadow-[0_8px_10px_-6px_rgba(0,0,0,0.07)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href={backHref}
              aria-label={`Retour à ${backLabel}`}
              className="flex h-12 shrink-0 items-center gap-1.5 rounded-full border border-base-300 bg-accent pr-4 pl-3 text-sm font-medium text-secondary transition active:scale-[0.97] hover:bg-base-300/60"
            >
              <ChevronLeft aria-hidden className="size-5" />
              {backLabel}
            </Link>
            <Avatar initial={clientInitial(client)} size={60} className="bg-accent text-xl font-semibold text-secondary" />
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="truncate font-[family-name:var(--font-heading)] text-[28px] font-semibold leading-tight tracking-[-0.01em] text-base-content">
                  {clientFullName(client)}
                </h1>
                {client.tier && <Badge variant={client.tier}>{TIER_LABEL[client.tier]}</Badge>}
              </div>
              <p className="mt-1 flex items-center gap-2 text-sm text-base-content/60">
                <span className="rounded-md bg-base-200 px-2 py-0.5 font-semibold tabular-nums text-base-content">
                  {clientNumberLabel(client)}
                </span>
                <span className="truncate">
                  Cliente depuis{" "}
                  {new Date(client.createdAt).toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                  {client.lastVisit
                    ? ` · dernière visite ${client.lastVisit.charAt(0).toLowerCase()}${client.lastVisit.slice(1)}`
                    : ""}
                </span>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" icon={<MessageCircle className="size-5" />} disabled={!canContact} onClick={contact}>
              Contacter
            </Button>
            <Button variant="brand" icon={<Receipt className="size-5" />} onClick={() => openNewTab({ clientId: client.id })}>
              Nouvelle vente
            </Button>
          </div>
        </div>
        {!canContact && (
          <p className="mt-2 text-xs text-base-content/50">
            Aucune coordonnée enregistrée — ajoutez un téléphone pour pouvoir la contacter.
          </p>
        )}
        <AtAGlance client={client} />
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        {/* Ce qui sert au passage : prépayé, goûts, ce que l'équipe a noté. */}
        <div className="flex flex-col gap-7">
          <AbonnementsPacksBoard clientId={client.id} />
          <PreferencesBoard client={client} onEdit={() => setEditPrefOpen(true)} />
          <NotesBoard client={client} praticiennes={praticiennes} />
        </div>

        {/* La référence : la joindre, l'identifier, et — en dernier — ce qu'on s'est écrit. */}
        <div className="flex flex-col gap-7">
          <CoordonneesBoard
            client={client}
            preferredStaff={client.preferredStaffId ? praticiennes.find((p) => p.id === client.preferredStaffId) : undefined}
            onEdit={() => setEditCoordOpen(true)}
          />
          <Board legend="Carte de fidélité">
            <div className="flex items-center justify-between gap-4 p-4">
              <div className="flex flex-col gap-3">
                <p className="text-sm text-base-content/60">{"Le QR d'identification de la cliente."}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" icon={<Printer className="size-5" />} onClick={() => window.print()}>
                    Imprimer
                  </Button>
                  <Button variant="outline" size="sm" href={`/clientele/${client.id}/fidelite`}>
                    Ouvrir
                  </Button>
                </div>
              </div>
              <DemoQrBlock seed={client.id} size={76} />
            </div>
          </Board>
          <EchangesBoard client={client} conversation={conversations.find((c) => c.clientId === client.id)} />
        </div>
      </div>

      <EditCoordonneesDialog open={editCoordOpen} client={client} onClose={() => setEditCoordOpen(false)} />
      <EditPreferencesDialog open={editPrefOpen} client={client} onClose={() => setEditPrefOpen(false)} />
    </div>
  );
}

/** One line of facts under the name — what the receptionist must know before anything else:
 *  prepaid coverage first, then points and value. Dense on purpose: it rides the sticky band. */
function AtAGlance({ client }: { client: Cliente }) {
  const abonnements = abonnementsForClient(client.id);
  const packs = packPurchasesForClient(client.id);
  const activeAbos = abonnements.filter((ab) => abonnementStatus(ab) !== "revoque");
  const openPacks = packs.filter((pp) => packRemainingPrestations(pp).length > 0);
  const packsLeft = openPacks.reduce((sum, pp) => sum + packRemainingPrestations(pp).length, 0);

  return (
    <dl className="-mx-8 mt-4 flex divide-x divide-base-300 border-t border-base-300 px-4">
      <Fact icon={<CalendarClock className="size-5" />} label="Abonnement" grow>
        {activeAbos.length === 0 ? (
          <span className="text-base-content/50">Aucun</span>
        ) : (
          activeAbos.map((ab, i) => {
            const status = abonnementStatus(ab);
            return (
              <span key={ab.id}>
                {i > 0 && ", "}
                {forfaitById(ab.forfaitId)?.label}{" "}
                <span className={cn("font-semibold", STATUS_TONE[status])}>· {ABONNEMENT_STATUS_LABEL[status]}</span>
              </span>
            );
          })
        )}
      </Fact>
      <Fact icon={<PackageCheck className="size-5" />} label="Pack" grow>
        {openPacks.length === 0 ? (
          <span className="text-base-content/50">Aucun</span>
        ) : (
          <>
            {openPacks.map((pp) => packById(pp.packId)?.label).join(", ")}{" "}
            <span className="font-semibold text-success">
              · {packsLeft} prestation{packsLeft > 1 ? "s" : ""} restante
              {packsLeft > 1 ? "s" : ""}
            </span>
          </>
        )}
      </Fact>
      <Fact label="Points fidélité" figure>
        {client.points}
      </Fact>
      <Fact label="Visites" figure>
        {client.totalVisits}
      </Fact>
      <Fact label="Total dépensé" figure>
        {formatFcfa(client.totalSpent)}
      </Fact>
    </dl>
  );
}

function Fact({
  icon,
  label,
  grow,
  figure,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  grow?: boolean;
  figure?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3 px-4 py-3", grow ? "flex-1" : "shrink-0")}>
      {icon && <span className="shrink-0 text-secondary">{icon}</span>}
      <div className="min-w-0">
        <dt className="text-xs font-medium text-base-content/55">{label}</dt>
        <dd
          className={cn(
            "truncate text-base-content",
            figure ? "font-[family-name:var(--font-heading)] text-lg font-semibold tabular-nums" : "text-[15px] font-medium",
          )}
        >
          {children}
        </dd>
      </div>
    </div>
  );
}

function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" icon={<Pencil className="size-4" />} onClick={onClick} aria-label={label}>
      Modifier
    </Button>
  );
}

/** Préférences : chaque domaine sur sa ligne, les réponses de « Noter la cliente » en photos — les
 *  mêmes que sur le questionnaire — puis le texte libre et les photos de référence. */
function PreferencesBoard({ client, onEdit }: { client: Cliente; onEdit: () => void }) {
  const preferenceNotes = client.preferenceNotes ?? {};
  const preferencePhotos = client.preferencePhotos ?? {};
  const domains = PREFERENCE_DOMAINS.filter(
    (d) => preferenceNotes[d] || preferencePhotos[d]?.length || notationForDomain(client, d).length > 0,
  );
  const hasBasics = Boolean(client.hairType || client.colorReference);

  return (
    <Board legend="Préférences" legendRight={<EditButton label="Modifier les préférences" onClick={onEdit} />}>
      {!hasBasics && domains.length === 0 ? (
        <BoardEmpty title="Aucune préférence notée" hint="Elles se remplissent à chaque encaissement, ou via « Modifier »." />
      ) : (
        <div className="flex flex-col divide-y divide-base-300">
          {hasBasics && (
            <div className="grid grid-cols-2 gap-4 px-5 py-4">
              <Pref label="Type de cheveux" value={client.hairType} />
              <Pref label="Référence couleur" value={client.colorReference} />
            </div>
          )}
          {domains.map((domain) => (
            <PreferenceDomainRow key={domain} client={client} domain={domain} />
          ))}
        </div>
      )}
    </Board>
  );
}

function PreferenceDomainRow({ client, domain }: { client: Cliente; domain: PreferenceDomain }) {
  const note = client.preferenceNotes?.[domain];
  const photos = client.preferencePhotos?.[domain] ?? [];
  const notation = notationForDomain(client, domain);
  return (
    <div className="grid grid-cols-[9.5rem_minmax(0,1fr)] gap-5 px-5 py-4">
      <p className="pt-0.5 text-sm font-semibold text-base-content">{PREFERENCE_DOMAIN_LABEL[domain]}</p>
      <div className="flex min-w-0 flex-col gap-3">
        {notation.length > 0 && (
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {notation.map(({ question, options }) => (
              <div key={question.id}>
                <p className="mb-2 text-xs font-medium text-base-content/55">{question.noteLabel}</p>
                <ul className="flex flex-wrap gap-3">
                  {options.map((option) => (
                    <li key={option.id} className="w-24">
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-accent">
                        <NotationPhoto question={question} option={option} />
                      </div>
                      <p className="mt-1.5 text-center text-[13px] font-medium leading-tight text-base-content/85">
                        {option.label}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        {note && <p className="whitespace-pre-line text-[15px] leading-relaxed text-base-content/90">{note}</p>}
        {photos.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {photos.map((ref) => (
              <PhotoPlaceholder key={ref} className="size-24 rounded-2xl" label="" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Pref({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-base-content/55">{label}</p>
      <p className={cn("mt-0.5 text-[15px]", value ? "text-base-content" : "text-base-content/45")}>{value ?? "Non renseigné"}</p>
    </div>
  );
}

/** Journal interne : une saisie en tête, puis chaque note signée et datée, la plus récente d'abord. */
function NotesBoard({ client, praticiennes }: { client: Cliente; praticiennes: Praticienne[] }) {
  const { updateClient, addClientNote } = useAppData();
  const [draft, setDraft] = useState("");
  const [target, setTarget] = useState("interne");
  const [authorId, setAuthorId] = useState(UTILISATEUR.praticienneId);
  const notes = client.notes ?? [];
  const toInterne = target === "interne";

  function add() {
    const text = draft.trim();
    if (!text) return;
    if (toInterne) {
      addClientNote(client.id, { authorId, text, origin: "fiche" });
    } else {
      const domain = target as PreferenceDomain;
      const current = client.preferenceNotes?.[domain];
      updateClient(client.id, {
        preferenceNotes: {
          ...client.preferenceNotes,
          [domain]: current ? `${current}\n${text}` : text,
        },
      });
    }
    setDraft("");
  }

  return (
    <Board
      legend="Notes internes"
      legendRight={
        notes.length > 0 && (
          <span className="text-sm text-base-content/55">
            {notes.length} note{notes.length > 1 ? "s" : ""}
          </span>
        )
      }
    >
      <div className="flex flex-col gap-3 border-b border-base-300 bg-black/[0.015] p-4">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Une observation, une préférence exprimée en salon…"
          rows={2}
          aria-label="Nouvelle note"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select value={target} onChange={setTarget} options={NOTE_TARGETS} size="compact" className="w-auto min-w-[14rem]" />
          {toInterne && (
            <Select
              value={authorId}
              onChange={setAuthorId}
              options={praticiennes.map((p) => ({
                value: p.id,
                label: `Par ${p.name}`,
              }))}
              size="compact"
              className="w-auto min-w-[11rem]"
            />
          )}
          <Button variant="brand" size="sm" className="ml-auto min-w-28" onClick={add} disabled={!draft.trim()}>
            Ajouter
          </Button>
        </div>
        {!toInterne && (
          <p className="text-xs text-base-content/55">
            Ajoutée à la préférence « {PREFERENCE_DOMAIN_LABEL[target as PreferenceDomain]} », pas au journal.
          </p>
        )}
      </div>
      {notes.length === 0 ? (
        <BoardEmpty title="Aucune note" hint="Les notes prises ici ou après un encaissement s'affichent ici, signées." />
      ) : (
        <ol className="flex flex-col divide-y divide-base-300">
          {notes.map((note) => (
            <NoteEntry key={note.id} note={note} author={praticiennes.find((p) => p.id === note.authorId)} />
          ))}
        </ol>
      )}
    </Board>
  );
}

function NoteEntry({ note, author }: { note: ClientNote; author?: Praticienne }) {
  const at = new Date(note.at);
  return (
    <li className="flex gap-3 px-4 py-4">
      <Avatar
        photoUrl={author?.photoUrl}
        initial={author?.initial ?? "?"}
        size={40}
        className="bg-accent font-semibold text-secondary"
      />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-semibold text-base-content">{author?.name ?? "Équipe"}</span>
          <span className="tabular-nums text-base-content/55">
            {NOTE_DATE.format(at)} · {NOTE_TIME.format(at)}
          </span>
          {note.origin === "encaissement" && (
            <span className="rounded-md bg-base-200 px-1.5 py-0.5 text-xs font-medium text-base-content/65">
              Après encaissement
            </span>
          )}
        </p>
        <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-base-content/90">{note.text}</p>
      </div>
    </li>
  );
}

function CoordonneesBoard({
  client,
  preferredStaff,
  onEdit,
}: {
  client: Cliente;
  preferredStaff?: Praticienne;
  onEdit: () => void;
}) {
  const router = useRouter();
  return (
    <Board legend="Coordonnées" legendRight={<EditButton label="Modifier les coordonnées" onClick={onEdit} />}>
      <div className="flex flex-col gap-4 p-4">
        <Row icon={<Phone className="size-5" />} label="Téléphone" value={client.phone} />
        <Row icon={<MessageCircle className="size-5" />} label="WhatsApp" value={client.whatsapp} />
        <Row icon={<Mail className="size-5" />} label="E-mail" value={client.email} />
        <Row icon={<Briefcase className="size-5" />} label="Profession" value={client.profession} />
        <Row icon={<MapPin className="size-5" />} label="Adresse" value={client.address} />
        <Row icon={<Globe className="size-5" />} label="Pays de résidence" value={client.residenceCountry} />
        {preferredStaff && (
          <button
            type="button"
            onClick={() => router.push(`/planning?staff=${preferredStaff.id}`)}
            className="flex items-center gap-3 rounded-xl text-left transition active:scale-[0.99]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-secondary">
              <Sparkles className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-medium text-base-content/55">Praticienne préférée</span>
              <span className="flex items-center gap-1 text-[15px] font-medium text-primary underline underline-offset-2">
                {preferredStaff.name}
                <ChevronRight className="size-4" />
              </span>
            </span>
          </button>
        )}
      </div>
    </Board>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-secondary">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-base-content/55">{label}</p>
        <p className={cn("truncate text-[15px]", value ? "text-base-content" : "text-base-content/45")}>
          {value ?? "Non renseigné"}
        </p>
      </div>
    </div>
  );
}

function EchangesBoard({
  client,
  conversation,
}: {
  client: Cliente;
  conversation?: ReturnType<typeof useAppData>["conversations"][number];
}) {
  const lastMessages = conversation ? [...conversation.messages].sort((a, b) => a.at.localeCompare(b.at)).slice(-2) : [];
  return (
    <Board
      legend="Échanges"
      legendRight={
        lastMessages.length > 0 && (
          <Button variant="outline" size="sm" href={`/messages?client=${client.id}`}>
            Voir tout
          </Button>
        )
      }
    >
      {lastMessages.length === 0 ? (
        <BoardEmpty title="Aucun échange" hint="Rien n'a encore été envoyé à cette cliente." />
      ) : (
        lastMessages.map((m) => {
          const who = m.sender === "cliente" ? client.firstName : m.sender === "receptionniste" ? "Vous" : "Conseillère";
          return (
            <Lane
              key={m.id}
              title={
                <span className="flex items-center gap-1.5">
                  {who}
                  {conversation && <ChannelGlyph channel={conversation.channel} className="size-4" />}
                </span>
              }
              meta={<span className="line-clamp-2 whitespace-normal">{m.body}</span>}
              className="items-start py-3"
            />
          );
        })
      )}
    </Board>
  );
}
