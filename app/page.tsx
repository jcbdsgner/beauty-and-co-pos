"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarRange, ChevronRight, ListChecks } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { SearchInput } from "@/components/ui/atoms/search-input";
import { Pills } from "@/components/ui/molecules/pills";
import { DatePicker } from "@/components/ui/molecules/date-picker";
import { BoardHeader, ChipFilter, Legend } from "@/components/ui/board";
import { Separator } from "@/components/ui/atoms/separator";
import { AppointmentDetailSheet } from "@/components/planning/appointment-detail-sheet";
import { CreateReservationDialog } from "@/components/planning/create-reservation-dialog";
import { AccueilCalendar } from "@/components/journee/accueil-calendar";
import { AccueilDayList } from "@/components/journee/accueil-day-list";
import { AccueilGiftCards } from "@/components/journee/accueil-gift-cards";
import { useEncaissement } from "@/components/journee/use-encaissement";
import { useAppData } from "@/components/providers/app-data-provider";
import { dateISO, groupDayByReservation, reservationDate, todayISO } from "@/lib/data/planning";
import { clientFullName, clientInitial, clientMatchesQuery, searchClients } from "@/lib/data/clientele";
import { SALONS } from "@/lib/data/entreprises";
import { useSession } from "@/lib/session";
import type { Cliente, RendezVous } from "@/lib/data/types";

type AccueilView = "liste" | "calendrier";
type Period = "jour" | "semaine" | "mois" | "perso";

/** Filtre de salon de l'Accueil (ADR 0028, étendu au-delà du Planning) — "tous" montre les deux
 *  salons sans distinction, le défaut, cohérent avec le comportement historique non filtré. */
const TOUS_LES_SALONS = "tous";

const PERIOD_OPTIONS = [
  { value: "jour", label: "Aujourd'hui" },
  { value: "semaine", label: "Cette semaine" },
  { value: "mois", label: "Ce mois" },
  { value: "perso", label: "Personnalisé" },
];

const MAX_CLIENT_MATCHES = 4;

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Monday-first week containing `d`, as ["YYYY-MM-DD", "YYYY-MM-DD"] — same convention as the
 *  Planning's vue Semaine (`PlanningBoard`). */
function weekRangeISO(d: Date): [string, string] {
  const wd = (d.getDay() + 6) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - wd);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return [dateISO(start), dateISO(end)];
}

function monthRangeISO(d: Date): [string, string] {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return [dateISO(start), dateISO(end)];
}

/**
 * Accueil — l'écran d'atterrissage (Figma 242:1735). Deux sections seulement : « Cartes cadeaux »,
 * un aperçu de la file de préparation (docs/adr/0012), qui s'efface quand il n'y a rien ; puis
 * « Rendez-vous » (docs/adr/0014), plus figée sur le seul jour courant (docs/adr/0029) — une
 * recherche (cliente ou praticienne) et une période (Aujourd'hui/Semaine/Mois/Personnalisé,
 * défaut Aujourd'hui) filtrent la liste des réservations. Basculable entre **Liste** (grille de
 * cartes par réservation, groupée par jour puis par tranche de 2h, docs/adr/0018) et
 * **Calendrier** (rail heures, un bloc = une réservation, docs/adr/0019) — le Calendrier ne
 * couvrant qu'un seul jour, il n'est proposé que pour la période Aujourd'hui. Plus de bloc de
 * compteurs : la journée est là, la file a son lien.
 */
export default function AccueilPage() {
  return (
    <Suspense fallback={null}>
      <AccueilPageInner />
    </Suspense>
  );
}

function AccueilPageInner() {
  const { reservations, praticiennes, clients, markReservationSeen } = useAppData();
  const { requestEncaissement, encaissementDialog } = useEncaissement();
  const { currentUser, salon } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [detail, setDetail] = useState<RendezVous | null>(null);
  const openReservation = (rv: RendezVous) => {
    markReservationSeen(rv.reservationId);
    setDetail(rv);
  };
  const [view, setView] = useState<AccueilView>("liste");
  const [creatingRdv, setCreatingRdv] = useState(false);

  // Recherche (cliente ou praticienne) + période — remplace le filtre figé sur « aujourd'hui »
  // pour retrouver un rendez-vous au-delà du jour courant. Le Calendrier (rail journalier) ne se
  // prête qu'à un seul jour : il reste réservé à la période « Aujourd'hui », voir plus bas.
  // `query` vit dans l'URL (`?q=`), pas un simple useState : un clic sur un résultat "Clientes"
  // quitte l'Accueil vers la fiche, et sans ça la recherche se perdait au retour (passe impeccable
  // du 22/09). `ClientMatchCard` relaie `q` à la fiche pour reconstruire le lien "Retour à l'Accueil".
  const query = searchParams.get("q") ?? "";
  function setQuery(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("q", next);
    else params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }
  const [period, setPeriod] = useState<Period>("jour");
  const [salonFilter, setSalonFilter] = useState<string>(TOUS_LES_SALONS);
  const todayIso = todayISO();
  const [persoStart, setPersoStart] = useState(todayIso);
  const [persoEnd, setPersoEnd] = useState(todayIso);

  const [rangeStart, rangeEnd] = useMemo(() => {
    const today = new Date();
    if (period === "jour") return [todayIso, todayIso] as const;
    if (period === "semaine") return weekRangeISO(today);
    if (period === "mois") return monthRangeISO(today);
    return persoStart <= persoEnd ? ([persoStart, persoEnd] as const) : ([persoEnd, persoStart] as const);
  }, [period, todayIso, persoStart, persoEnd]);

  const reservationRows = useMemo(() => {
    const inRange = reservations.filter((r) => {
      const d = reservationDate(r);
      return d >= rangeStart && d <= rangeEnd;
    });
    const grouped = groupDayByReservation(inRange);
    const bySalon =
      salonFilter === TOUS_LES_SALONS
        ? grouped
        : grouped.filter((row) =>
            row.staffIds.some((id) => praticiennes.find((p) => p.id === id)?.salonId === salonFilter),
          );
    const q = query.trim().toLowerCase();
    if (!q) return bySalon;
    return bySalon.filter((row) => {
      const payer = clients.find((c) => c.id === row.reservation.payerClientId);
      const payerMatch = payer ? clientMatchesQuery(payer, q) : false;
      // Une réservation se retrouve aussi par la personne servie (« Salématou (7 ans) ») — pas
      // seulement par la payeuse.
      const beneficiaryMatch = row.reservation.rendezVous.some((rdv) =>
        rdv.beneficiaryName?.toLowerCase().includes(q),
      );
      const staffMatch = row.staffIds.some((id) => praticiennes.find((p) => p.id === id)?.name.toLowerCase().includes(q));
      return payerMatch || beneficiaryMatch || staffMatch;
    });
  }, [reservations, clients, praticiennes, rangeStart, rangeEnd, query, salonFilter]);

  // La même recherche retrouve aussi la fiche cliente directement — utile quand elle n'a aucun
  // rendez-vous dans la période affichée (ou pas de rendez-vous du tout).
  const clientMatches = useMemo(
    () => (query.trim() ? searchClients(clients, query).slice(0, MAX_CLIENT_MATCHES) : []),
    [clients, query],
  );

  // Le rail journalier de l'AccueilCalendar n'a de forme utile que sur un seul jour — le
  // Calendrier reste donc réservé à la période « Aujourd'hui » ; toute autre période retombe sur
  // la Liste (qui, elle, sait grouper par date).
  const canShowCalendar = period === "jour";
  const effectiveView: AccueilView = canShowCalendar ? view : "liste";
  const periodLabel =
    period === "jour" ? "aujourd'hui" : period === "semaine" ? "cette semaine" : period === "mois" ? "ce mois" : "sur cette période";

  const greeting = [currentUser.name, salon?.name].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col gap-6">
      <BoardHeader
        section={greeting}
        action={
          <div className="flex items-center gap-2">
            <ChipFilter
              value={salonFilter}
              onChange={setSalonFilter}
              options={[
                { value: TOUS_LES_SALONS, label: "Tous les salons" },
                ...SALONS.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" onClick={() => setCreatingRdv(true)}>
              Créer un rendez-vous
            </Button>
          </div>
        }
      />

      <AccueilGiftCards />

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 pl-1">
          <Legend size="section">Rendez-vous</Legend>
          {canShowCalendar && reservationRows.length > 0 && (
            <SegmentedToggle
              value={view}
              onChange={(v) => setView(v as AccueilView)}
              options={[
                { value: "liste", label: "Liste", icon: <ListChecks className="size-4" /> },
                { value: "calendrier", label: "Calendrier", icon: <CalendarRange className="size-4" /> },
              ]}
            />
          )}
        </div>

        <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            placeholder="Cliente (nom, téléphone, e-mail) ou praticienne…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 sm:max-w-sm"
          />
          <Pills options={PERIOD_OPTIONS} value={period} onChange={(v) => setPeriod(v as Period)} wrap={false} />
          {period === "perso" && (
            <div className="flex items-center gap-2">
              <DatePicker value={isoToDate(persoStart)} onChange={(d) => setPersoStart(dateISO(d))} placeholder="Du" className="sm:w-44" />
              <span className="text-sm text-base-content/45">au</span>
              <DatePicker value={isoToDate(persoEnd)} onChange={(d) => setPersoEnd(dateISO(d))} placeholder="Au" className="sm:w-44" />
            </div>
          )}
        </div>

        {clientMatches.length > 0 && (
          <div className="mb-5 flex flex-col gap-2">
            <Legend size="section">Clientes</Legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {clientMatches.map((c) => (
                <ClientMatchCard key={c.id} client={c} query={query} />
              ))}
            </div>
          </div>
        )}

        {reservationRows.length === 0 ? (
          <div className="rounded-field border border-dashed border-base-300 px-4 py-12 text-center">
            <p className="font-[family-name:var(--font-heading)] text-[15px] font-semibold text-base-content/60">
              {query ? "Aucun résultat" : "Journée libre"}
            </p>
            <p className="mt-1 text-sm text-base-content/45">
              {query
                ? `Aucun rendez-vous pour « ${query} » ${periodLabel}.`
                : `Aucun rendez-vous ${periodLabel}.`}
            </p>
          </div>
        ) : effectiveView === "liste" ? (
          <AccueilDayList
            rows={reservationRows}
            clients={clients}
            praticiennes={praticiennes}
            onOpenReservation={openReservation}
            onEncaisser={requestEncaissement}
          />
        ) : (
          <AccueilCalendar
            rows={reservationRows}
            clients={clients}
            praticiennes={praticiennes}
            onOpenReservation={openReservation}
          />
        )}
      </section>

      <AppointmentDetailSheet
        appointment={detail}
        onClose={() => setDetail(null)}
        onEncaisser={(id) => {
          setDetail(null);
          requestEncaissement(id);
        }}
      />

      {encaissementDialog}

      <CreateReservationDialog open={creatingRdv} onClose={() => setCreatingRdv(false)} />
    </div>
  );
}

/** Résultat "Clientes" de la recherche — mène droit à la fiche, même sans rendez-vous dans la
 *  période affichée. Même carte que le Répertoire (`ClientCard`), en plus compact. `from=accueil`
 *  + `q` (la recherche en cours) permettent à la fiche de proposer "Retour à l'Accueil" et de
 *  restituer la même recherche au retour, plutôt qu'une redirection sèche vers Clientèle (passe
 *  impeccable du 22/09). Le chevron est le signal permanent (pas seulement au survol — comptoir
 *  tactile, pas de hover) que la carte quitte l'Accueil, contrairement aux cartes de rendez-vous
 *  juste en dessous qui ouvrent un panneau sur place. */
function ClientMatchCard({ client: c, query }: { client: Cliente; query: string }) {
  const params = new URLSearchParams({ from: "accueil" });
  if (query) params.set("q", query);
  return (
    <Link
      href={`/clientele/${c.id}?${params.toString()}`}
      className="flex items-center gap-3 rounded-lg border border-base-300 bg-base-100 p-3 transition hover:-translate-y-0.5 hover:border-secondary hover:shadow-[0px_7px_16px_0px_rgba(0,0,0,0.06)]"
    >
      <Avatar initial={clientInitial(c)} size={36} className="shrink-0 bg-accent text-xs font-semibold text-secondary" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-base-content">{clientFullName(c)}</span>
        <span className="block truncate text-xs text-base-content/55">{c.phone}</span>
      </span>
      <ChevronRight aria-hidden className="size-4 shrink-0 text-base-content/35" />
    </Link>
  );
}
