"use client";

import { useMemo, useState } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CalendarDays, Check, ChevronDown, MapPin, Plus, UserRound, Users, X } from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { DatePicker } from "@/components/ui/molecules/date-picker";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Button } from "@/components/ui/atoms/button";
import { SearchInput } from "@/components/ui/atoms/search-input";
import { Switch } from "@/components/ui/atoms/switch";
import { Textarea } from "@/components/ui/atoms/textarea";
import { RdvQuestions, missingAnswers, rdvAnswerKey, type RdvAnswers } from "@/components/planning/rdv-questions";
import { BOOKING_QUESTIONS } from "@/lib/data/booking-questions";
import { NewClientDialog } from "@/components/clientele/new-client-dialog";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn, formatFcfa } from "@/lib/utils";
import { clientFullName, clientMatchesQuery, clientNumberLabel } from "@/lib/data/clientele";
import { SALONS, salonById } from "@/lib/data/entreprises";
import { SERVICES, SERVICE_CATEGORIES, serviceOfferedAt } from "@/lib/data/menu";
import { isSalonClosed } from "@/lib/data/praticiennes";
import { SALON_CLOSING, SALON_OPENING, dateISO, reservationById, reservationDate, todayISO } from "@/lib/data/planning";
import type { Cliente, RendezVous, Service } from "@/lib/data/types";
import { availableTimes, planAt, type PlanContext, type PlanItem } from "@/lib/prise-rdv/planifier";
import { POSTE_SALON_ID } from "@/lib/session";

// Le bloc unique de rendez-vous, recopié du back-office (`rendezvous/RdvDialog`) :
// « Nouveau rendez-vous » (sans `reservationId`) et « Reprogrammer le rendez-vous »
// (« Modifier », avec `reservationId`) sont la même fenêtre — date, salon, horaire
// et les prestations par personne. La création ajoute seulement le choix de la
// cliente, en tête. Les praticiennes suivent (affectation automatique) : à la
// reprogrammation, l'actuelle est gardée si elle reste libre. Une prestation
// « réalisable à 2 » se fait, au choix ligne par ligne, avec 2 praticiennes :
// durée divisée par deux, et seuls les horaires où deux sont libres ensemble.
// 1. Elle arrive souvent au téléphone (« la cliente veut samedi ») : les
//    choix dans l'ordre où on les dicte.
// 2. Ce qui compte : les horaires réellement libres ce jour-là, dans ce salon,
//    pour toutes les prestations — on ne propose jamais un horaire impossible.
// 3. Quand ça coince : salon fermé, aucun horaire libre, prestation non
//    proposée dans l'autre salon → dit en clair, sans bloquer les autres choix.

const isoToDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// « jeudi 3 septembre 2026 »
const frFullDate = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(isoToDate(iso));

// « jeu. 3 sept. » — résumé du pied, sur une ligne.
const shortDay = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(isoToDate(iso));

const durationLabel = (min: number) => {
  if (!Number.isFinite(min) || min <= 0) return "—";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
};

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

// Une ligne en cours d'édition : un rendez-vous existant (gardé tel quel,
// praticienne comprise si elle reste libre) ou une prestation du Menu ajoutée
// pour une personne. `duo` : faite à 2 praticiennes (prestation « réalisable à 2 » seulement).
type Line = { key: string; personKey: string; serviceId: string; duo: boolean; existing?: RendezVous };

// `source` : un rendez-vous existant de la personne (reprogrammation) ; absent
// pour la payeuse d'un nouveau rendez-vous ou une personne ajoutée.
type Person = { key: string; label: string; source?: RendezVous; added?: boolean };

const PAYER = "__payer__";

let seq = 1;
const newLineId = () => `l-rdv-${Date.now().toString(36)}-${seq++}`;

const personKeyOf = (rv: RendezVous) =>
  rv.beneficiaryClientId ? `c:${rv.beneficiaryClientId}` : rv.beneficiaryName ? `n:${rv.beneficiaryName}` : PAYER;

function openingLabel(salonId: string, iso: string): string | null {
  return isSalonClosed(salonId, isoToDate(iso)) ? null : `Ouvert de ${SALON_OPENING} à ${SALON_CLOSING}`;
}

type RdvDialogProps = {
  open: boolean;
  /** Absent ⇒ création ; présent ⇒ reprogrammation de cette réservation. */
  reservationId?: string | null;
  /** Création : salon pré-choisi (le salon filtré à l'Accueil). Absent ⇒ salon du poste ;
   *  `null` ⇒ le premier salon actif. */
  defaultSalonId?: string | null;
  /** Création : cliente déjà posée (ex. reprise de rendez-vous depuis le reçu), modifiable. */
  payerClientId?: string;
  /** Création : créneau cliqué au Planning — jour, heure et praticienne posée d'office si libre. */
  pickedSlot?: { date: Date; time: string; staffId?: string };
  onClose: () => void;
};

export function RdvDialog(props: RdvDialogProps) {
  if (!props.open) return null;
  return <RdvDialogBody key={props.reservationId ?? "new"} {...props} />;
}

function RdvDialogBody({ reservationId, defaultSalonId = POSTE_SALON_ID, payerClientId, pickedSlot, onClose }: RdvDialogProps) {
  const { reservations, praticiennes, clients, saveParcoursReservation } = useAppData();
  const catalog = SERVICES;
  const reservation = reservationId ? reservationById(reservations, reservationId) : undefined;
  const isCreate = !reservation;
  const activeSalons = SALONS.filter((s) => s.active);

  // La réservation telle qu'ouverte — figée pour la durée de la fenêtre.
  const [initial] = useState(() => {
    const rvs = reservation
      ? reservation.rendezVous.filter((rv) => rv.status !== "annule").sort((a, b) => a.start.localeCompare(b.start))
      : [];
    return {
      day: reservation ? reservationDate(reservation) : null,
      time: rvs[0]?.start ?? null,
      salon: rvs[0]?.salonId ?? null,
      rvs,
    };
  });
  const currentDay = initial.day;
  const currentTime = initial.time;

  /* ---- cliente (création) ---- */

  const [clientId, setClientId] = useState<string | null>(reservation?.payerClientId ?? payerClientId ?? null);
  const client: Cliente | null = clientId ? (clients.find((c) => c.id === clientId) ?? null) : null;
  const payerName = client ? clientFullName(client) : "Cliente";

  // Personnes servies, dans l'ordre du rendez-vous (la payeuse d'abord).
  const initialPeople = useMemo<Person[]>(() => {
    if (!reservation) return [{ key: PAYER, label: "Cliente" }];
    const map = new Map<string, Person>([[PAYER, { key: PAYER, label: payerName }]]);
    for (const rv of initial.rvs) {
      const key = personKeyOf(rv);
      if (map.has(key)) continue;
      const fiche = rv.beneficiaryClientId ? clients.find((c) => c.id === rv.beneficiaryClientId) : undefined;
      map.set(key, { key, label: fiche ? clientFullName(fiche) : (rv.beneficiaryName ?? payerName), source: rv });
    }
    return [...map.values()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialLines = useMemo<Line[]>(
    () =>
      initial.rvs.map((rv) => ({
        key: rv.id,
        personKey: personKeyOf(rv),
        serviceId: rv.serviceId,
        duo: Boolean(rv.secondStaffId),
        existing: rv,
      })),
    [initial],
  );

  const [day, setDay] = useState(currentDay ?? (pickedSlot ? dateISO(pickedSlot.date) : todayISO()));
  const [salon, setSalon] = useState<string>(initial.salon ?? defaultSalonId ?? activeSalons[0]?.id ?? "almadies");
  const [time, setTime] = useState<string | null>(currentTime ?? pickedSlot?.time ?? null);
  const [lines, setLines] = useState<Line[]>(initialLines);
  const [people, setPeople] = useState<Person[]>(initialPeople);
  // Un nouveau rendez-vous n'a rien à résumer : les prestations sont ouvertes d'emblée.
  const [editingOpen, setEditingOpen] = useState(isCreate);
  const [person, setPerson] = useState(initialPeople[0]?.key ?? PAYER);
  const [query, setQuery] = useState("");
  const [newClient, setNewClient] = useState<Partial<Record<"firstName" | "lastName" | "phone", string>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Réponses aux questions de catégorie, reprises des rendez-vous existants (prise en ligne ou
  // saisie précédente), et note libre de la réceptionniste.
  const initialAnswers = useMemo<RdvAnswers>(() => {
    const out: RdvAnswers = {};
    for (const rv of initial.rvs) {
      const cat = SERVICES.find((x) => x.id === rv.serviceId)?.categoryId;
      const k = cat ? rdvAnswerKey(personKeyOf(rv), cat) : null;
      if (k && rv.bookingAnswers && !out[k]) out[k] = { ...rv.bookingAnswers };
    }
    return out;
  }, [initial]);
  const [answers, setAnswers] = useState<RdvAnswers>(initialAnswers);
  const initialStaffNote = reservation?.staffNote ?? "";
  const [staffNote, setStaffNote] = useState(initialStaffNote);
  const answer = (personKey: string, categoryId: string, questionId: string, value: string) =>
    setAnswers((prev) => {
      const k = rdvAnswerKey(personKey, categoryId);
      return { ...prev, [k]: { ...(prev[k] ?? {}), [questionId]: value } };
    });
  const personLabel = (p: Person) => (p.key === PAYER ? payerName : p.label);
  const addedName = (p: Person, i: number) => p.label.trim() || `Personne ${i + 1}`;

  const byId = useMemo(() => new Map(catalog.map((s) => [s.id, s])), [catalog]);
  const categoryName = (categoryId: string) =>
    SERVICE_CATEGORIES.find((c) => c.id === categoryId)?.name ?? "Autres prestations";

  // Durée seule d'une ligne : celle du rendez-vous pour une ligne gardée (celle
  // du Menu si elle était « à deux », sa durée y étant déjà divisée), celle du
  // Menu pour une ligne ajoutée. `lineDuration` : la durée réelle, à deux comprise.
  const soloDuration = (l: Line) => {
    const menu = byId.get(l.serviceId)?.durationMinutes;
    if (l.existing && !l.existing.secondStaffId) return l.existing.durationMin;
    return menu ?? (l.existing ? l.existing.durationMin * 2 : 0);
  };
  const lineDuration = (l: Line) => (l.duo ? Math.round(soloDuration(l) / 2) : soloDuration(l));
  const canDuo = (l: Line) => Boolean(byId.get(l.serviceId)?.twoPractitionersEligible);
  const linePrice = (l: Line) => byId.get(l.serviceId)?.price ?? 0;
  const lineName = (l: Line) => byId.get(l.serviceId)?.name ?? "Prestation";

  const excludeRvIds = useMemo(() => new Set(reservation?.rendezVous.map((rv) => rv.id) ?? []), [reservation]);
  const ctx: PlanContext = useMemo(
    () => ({ date: day, salonId: salon, praticiennes, reservations, excludeRvIds }),
    [day, salon, praticiennes, reservations, excludeRvIds],
  );

  const items: PlanItem[] = lines.map((l) => ({
    key: l.key,
    personId: l.personKey,
    serviceId: l.serviceId,
    categoryId: byId.get(l.serviceId)?.categoryId ?? "",
    durationMinutes: soloDuration(l),
    // Le planificateur divise et demande 2 praticiennes pour les lignes marquées : ici, celles
    // passées « à deux » (`planAt(…, true)`), pas toutes les éligibles.
    twoPractitionersEligible: l.duo && canDuo(l),
  }));
  // Les intervenantes actuelles sont gardées tant qu'elles restent libres.
  const overrides = Object.fromEntries(
    lines
      .filter((l) => l.existing)
      .map((l) => [l.key, [l.existing!.staffId, ...(l.existing!.secondStaffId ? [l.existing!.secondStaffId] : [])]]),
  );

  // Prestations que le salon choisi ne propose pas : bloquant, dit en clair.
  const notOffered = lines.filter((l) => {
    const s = byId.get(l.serviceId);
    return s ? !serviceOfferedAt(s, salon) : false;
  });

  const opening = openingLabel(salon, day);
  const itemsKey = JSON.stringify(items);
  const times = useMemo(
    () => (opening && notOffered.length === 0 ? availableTimes(ctx, items, true) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctx, opening, notOffered.length, itemsKey],
  );
  const chosenTime = time && times.includes(time) ? time : null;

  const totalMin = (() => {
    // Amplitude de la visite : chaque personne enchaîne ses prestations, en parallèle des autres.
    const perPerson = new Map<string, number>();
    for (const l of lines) perPerson.set(l.personKey, (perPerson.get(l.personKey) ?? 0) + lineDuration(l));
    return Math.max(0, ...perPerson.values());
  })();
  const totalPrice = lines.reduce((s, l) => s + linePrice(l), 0);

  const duoCount = lines.filter((l) => l.duo).length;
  const sameLines =
    lines.length === initialLines.length && lines.every((l, i) => l.key === initialLines[i].key && l.duo === initialLines[i].duo);
  // Personnes servies × catégories choisies : ce sur quoi portent les questions.
  const questionPeople = people
    .map((p, i) => ({
      key: p.key,
      label: p.added ? addedName(p, i) : personLabel(p),
      categoryIds: [
        ...new Set(lines.filter((l) => l.personKey === p.key).map((l) => byId.get(l.serviceId)?.categoryId ?? "")),
      ].filter((c) => BOOKING_QUESTIONS[c]),
    }))
    .filter((p) => p.categoryIds.length > 0);
  const unanswered = missingAnswers(questionPeople, answers);
  // Réponses à porter par une ligne : celles de sa personne pour sa catégorie, sans les vides.
  const answersFor = (l: Line) => {
    const cat = byId.get(l.serviceId)?.categoryId;
    const raw = cat ? answers[rdvAnswerKey(l.personKey, cat)] : undefined;
    const kept = Object.entries(raw ?? {}).filter(([, v]) => v.trim());
    return kept.length > 0 ? Object.fromEntries(kept.map(([k, v]) => [k, v.trim()])) : undefined;
  };
  const answersChanged = JSON.stringify(answers) !== JSON.stringify(initialAnswers);
  const dirty =
    isCreate ||
    day !== currentDay ||
    salon !== initial.salon ||
    chosenTime !== currentTime ||
    !sameLines ||
    answersChanged ||
    staffNote.trim() !== initialStaffNote.trim();
  const canConfirm =
    (!isCreate || Boolean(client)) && Boolean(chosenTime) && lines.length > 0 && notOffered.length === 0 && dirty;

  const blocker =
    isCreate && !client
      ? "Choisissez la cliente."
      : lines.length === 0
        ? isCreate
          ? "Choisissez au moins une prestation."
          : "Gardez au moins une prestation."
        : !chosenTime
          ? "Choisissez un horaire."
          : !dirty
            ? "Rien n'a changé."
            : null;

  /* ---- prestations ---- */

  const personLines = lines.filter((l) => l.personKey === person);
  const activePerson = people.find((p) => p.key === person);

  const addPerson = () => {
    const key = `new-${Date.now().toString(36)}-${seq++}`;
    setPeople((list) => [...list, { key, label: "", added: true }]);
    setPerson(key);
  };
  const removePerson = (key: string) => {
    setPeople((list) => list.filter((p) => p.key !== key));
    setLines((list) => list.filter((l) => l.personKey !== key));
    setPerson(PAYER);
  };
  const renamePerson = (key: string, label: string) =>
    setPeople((list) => list.map((p) => (p.key === key ? { ...p, label } : p)));
  const selectedIds = new Set(personLines.map((l) => l.serviceId));

  const toggle = (s: Service) => {
    const existing = personLines.find((l) => l.serviceId === s.id);
    if (existing) {
      setLines((list) => list.filter((l) => l.key !== existing.key));
      return;
    }
    // Une ligne retirée puis recochée retrouve sa place (et sa praticienne).
    const original = initialLines.find((l) => l.personKey === person && l.serviceId === s.id);
    setLines((list) => [...list, original ?? { key: newLineId(), personKey: person, serviceId: s.id, duo: false }]);
  };
  const setDuo = (key: string, duo: boolean) => setLines((list) => list.map((l) => (l.key === key ? { ...l, duo } : l)));

  const groups = useMemo(() => {
    const q = fold(query.trim());
    const visible = catalog.filter(
      (s) =>
        serviceOfferedAt(s, salon) &&
        (s.active || selectedIds.has(s.id)) &&
        (!q || fold(s.name).includes(q) || fold(categoryName(s.categoryId)).includes(q)),
    );
    return SERVICE_CATEGORIES.map((c) => ({ id: c.id, name: c.name, items: visible.filter((s) => s.categoryId === c.id) })).filter(
      (g) => g.items.length > 0,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, query, salon, person, lines]);

  /* ---- confirmation ---- */

  const confirm = () => {
    if (!chosenTime || !client) return;
    const plan = planAt(ctx, items, chosenTime, true, overrides, pickedSlot?.staffId);
    if (!plan) return;
    const result = saveParcoursReservation({
      reservationId: reservation?.id,
      payerClientId: client.id,
      date: day,
      salonId: salon,
      lines: plan.map((pl) => {
        const line = lines.find((l) => l.key === pl.key)!;
        const [staffId, secondStaffId] = pl.staffIds;
        const personIndex = people.findIndex((x) => x.key === line.personKey);
        const target = people[personIndex];
        const who = line.existing ?? target?.source;
        return {
          serviceId: line.serviceId,
          staffId,
          start: pl.start,
          durationMin: pl.durationMin,
          ...(secondStaffId ? { secondStaffId } : {}),
          bookingAnswers: answersFor(line),
          ...(target?.added
            ? { beneficiaryName: addedName(target, personIndex) }
            : who
              ? {
                  ...(who.beneficiaryClientId ? { beneficiaryClientId: who.beneficiaryClientId } : {}),
                  ...(who.beneficiaryName ? { beneficiaryName: who.beneficiaryName } : {}),
                  ...(who.beneficiaryKind ? { beneficiaryKind: who.beneficiaryKind } : {}),
                }
              : {}),
        };
      }),
      staffNote,
    });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onClose();
  };

  const morning = times.filter((t) => t < "12:00");
  const afternoon = times.filter((t) => t >= "12:00" && t < "17:00");
  const evening = times.filter((t) => t >= "17:00");

  return (
    <>
      <Dialog open onClose={onClose} labelledBy="resched-title" className="relative flex max-h-[90vh] max-w-3xl flex-col">
        <CloseButton onClick={onClose} className="top-4 right-4" />

        <header className="shrink-0 px-8 pt-7 pb-5">
          <h2 id="resched-title" className="text-[24px] font-semibold tracking-[-0.01em] text-base-content">
            {isCreate ? "Nouveau rendez-vous" : "Modifier le rendez-vous"}
          </h2>
          <p className="mt-1 text-[15px] text-base-content/60">
            {!isCreate
              ? `${payerName} · actuellement ${frFullDate(currentDay!)} à ${currentTime}, ${salonById(initial.salon ?? "")?.name ?? ""}`
              : client
                ? `Pour ${payerName} · ${clientNumberLabel(client)}`
                : "Choisissez la cliente, la date, le salon, l'horaire et les prestations."}
          </p>
        </header>

        <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-8 pb-8">
          {/* Cliente (création seulement) */}
          {isCreate && (
            <ClientPicker clients={clients} value={client} onChange={setClientId} onCreateNew={(prefill) => setNewClient(prefill)} />
          )}

          {/* Date */}
          <section aria-labelledby="resched-date">
            <h3 id="resched-date" className="mb-3 text-[17px] font-semibold text-base-content">
              {isCreate ? "Date" : "Nouvelle date"}
            </h3>
            <DatePicker
              value={isoToDate(day)}
              minDate={isoToDate(todayISO())}
              onChange={(d) => setDay(dateISO(d))}
              trigger={
                <button
                  type="button"
                  className="input h-14 w-full items-center gap-3 bg-base-100 text-left text-[17px] first-letter:uppercase"
                >
                  <CalendarDays aria-hidden className="size-5 shrink-0 text-base-content/45" />
                  <span className="first-letter:uppercase">{frFullDate(day)}</span>
                </button>
              }
            />
          </section>

          {/* Salon */}
          <section aria-labelledby="resched-salon">
            <h3 id="resched-salon" className="mb-3 text-[17px] font-semibold text-base-content">
              Salon
            </h3>
            <div role="radiogroup" aria-labelledby="resched-salon" className="grid grid-cols-2 gap-3">
              {activeSalons.map((s) => {
                const selected = s.id === salon;
                const hours = openingLabel(s.id, day);
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSalon(s.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-box border px-4 py-4 text-left transition",
                      selected ? "border-primary bg-accent ring-1 ring-primary" : "border-base-300 bg-base-100 hover:border-base-content/25",
                    )}
                  >
                    <MapPin aria-hidden className={cn("mt-0.5 size-5 shrink-0", selected ? "text-primary" : "text-base-content/45")} />
                    <span className="min-w-0">
                      <span className="block text-[16px] font-semibold text-base-content">{s.name}</span>
                      <span className="block truncate text-sm text-base-content/60">{s.address}</span>
                      <span className={cn("mt-1 block text-sm", hours ? "text-base-content/70" : "font-medium text-error")}>
                        {hours ?? "Fermé ce jour-là"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Horaire */}
          <section aria-labelledby="resched-time">
            <h3 id="resched-time" className="text-[17px] font-semibold text-base-content">
              Horaire
            </h3>
            <p className="mt-0.5 mb-3 text-sm text-base-content/60">
              Seuls les horaires où les praticiennes nécessaires sont libres sont proposés.
            </p>
            {!opening ? (
              <p className="rounded-box bg-base-200 px-4 py-4 text-[15px] text-base-content/70">
                {salonById(salon)?.name} est fermé {frFullDate(day)}. Choisissez un autre jour ou l&apos;autre salon.
              </p>
            ) : notOffered.length > 0 ? (
              <p className="rounded-box bg-warning/10 px-4 py-4 text-[15px] text-warning">
                {notOffered.map(lineName).join(", ")} {notOffered.length > 1 ? "ne sont pas proposées" : "n'est pas proposée"} à{" "}
                {salonById(salon)?.name}. Retirez-{notOffered.length > 1 ? "les" : "la"} dans « Prestations » ci-dessous ou gardez
                l&apos;autre salon.
              </p>
            ) : lines.length === 0 ? (
              <p className="rounded-box bg-base-200 px-4 py-4 text-[15px] text-base-content/70">
                Ajoutez au moins une prestation pour voir les horaires.
              </p>
            ) : times.length === 0 ? (
              <p className="rounded-box bg-base-200 px-4 py-4 text-[15px] text-base-content/70">
                Aucun horaire libre ce jour-là pour {lines.length > 1 ? "ces prestations" : "cette prestation"} : les praticiennes
                compétentes sont absentes ou déjà prises.{" "}
                {duoCount > 0
                  ? "À 2 praticiennes, il en faut deux libres en même temps : repassez à une seule dans « Prestations » ou essayez un autre jour."
                  : "Essayez un autre jour ou l'autre salon."}
              </p>
            ) : (
              <div className="space-y-3">
                {(
                  [
                    ["Matin", morning],
                    ["Après-midi", afternoon],
                    ["Soir", evening],
                  ] as const
                ).map(([label, list]) =>
                  list.length === 0 ? null : (
                    <div key={label} className="flex items-start gap-4">
                      <span className="w-24 shrink-0 pt-2.5 text-sm text-base-content/60">{label}</span>
                      <div className="flex flex-wrap gap-2">
                        {list.map((t) => {
                          const selected = t === chosenTime;
                          const isCurrent = t === currentTime && day === currentDay && salon === initial.salon;
                          return (
                            <button
                              key={t}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setTime(t)}
                              title={isCurrent ? "Horaire actuel" : undefined}
                              className={cn(
                                "h-10 min-w-[72px] rounded-field border px-3 text-[15px] font-medium tabular-nums transition",
                                selected
                                  ? "border-primary bg-primary text-primary-content"
                                  : "border-base-300 bg-base-100 text-base-content hover:border-base-content/30",
                                isCurrent && !selected && "border-dashed border-primary/60",
                              )}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          {/* Prestations (repliées) */}
          <section aria-labelledby="resched-prestations" className="rounded-box border border-base-300">
            <button
              type="button"
              aria-expanded={editingOpen}
              onClick={() => setEditingOpen((v) => !v)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left"
            >
              <span className="min-w-0 flex-1">
                <span id="resched-prestations" className="block text-[17px] font-semibold text-base-content">
                  Prestations
                </span>
                <span className="block truncate text-sm text-base-content/60">
                  {lines.length === 0
                    ? "Aucune prestation"
                    : `${lines.length} prestation${lines.length > 1 ? "s" : ""}${duoCount > 0 ? ` dont ${duoCount} à 2 praticiennes` : ""} · ${durationLabel(totalMin)} · ${formatFcfa(totalPrice)}`}
                  {!sameLines && !isCreate && " · modifiées"}
                </span>
              </span>
              <span className="text-[15px] font-medium text-secondary">{editingOpen ? "Replier" : "Modifier les prestations"}</span>
              <ChevronDown aria-hidden className={cn("size-4 text-secondary transition", editingOpen && "rotate-180")} />
            </button>

            {editingOpen && (
              <div className="border-t border-base-300 px-5 pt-4 pb-5">
                <div className="-mt-1 mb-4 flex items-end gap-6 border-b border-base-300">
                  <div role="tablist" aria-label="Prestations de" className="flex min-w-0 gap-6">
                    {people.map((p, i) => {
                      const count = lines.filter((l) => l.personKey === p.key).length;
                      const active = p.key === person;
                      return (
                        <button
                          key={p.key}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setPerson(p.key)}
                          className={cn(
                            "-mb-px truncate border-b-2 pb-2.5 text-[15px] font-medium transition",
                            active ? "border-primary text-base-content" : "border-transparent text-base-content/60 hover:text-base-content",
                          )}
                        >
                          {p.added ? addedName(p, i) : personLabel(p)} <span className="tabular-nums text-base-content/45">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={addPerson}
                    className="mb-2 ml-auto inline-flex shrink-0 items-center gap-1.5 text-[15px] font-medium text-secondary hover:underline"
                  >
                    <Plus aria-hidden className="size-4" />
                    Ajouter une personne
                  </button>
                </div>

                {activePerson?.added && (
                  <div className="mb-4 flex items-center gap-3">
                    <input
                      value={activePerson.label}
                      onChange={(e) => renamePerson(activePerson.key, e.target.value)}
                      placeholder="Prénom de la personne (facultatif)"
                      aria-label="Prénom de la personne"
                      className="input h-11 flex-1 bg-base-100 text-[15px]"
                    />
                    <Button variant="outline" onClick={() => removePerson(activePerson.key)}>
                      Retirer cette personne
                    </Button>
                  </div>
                )}

                {personLines.length > 0 && (
                  <ul className="mb-4 divide-y divide-base-300 rounded-field bg-accent" aria-label="Prestations choisies">
                    {personLines.map((l) => {
                      const eligible = canDuo(l);
                      return (
                        <li key={l.key} className="flex min-h-14 items-center gap-3 py-1 pr-1 pl-4">
                          <span className="min-w-0 flex-1 py-2">
                            <span className="block text-[15px] font-medium text-base-content">{lineName(l)}</span>
                            <span className="block text-sm tabular-nums text-secondary">
                              {l.duo ? (
                                <>
                                  <s className="mr-1.5 text-secondary/60">{durationLabel(soloDuration(l))}</s>
                                  {durationLabel(lineDuration(l))}
                                </>
                              ) : (
                                durationLabel(lineDuration(l))
                              )}
                            </span>
                          </span>
                          {eligible && (
                            <label className="flex shrink-0 items-center gap-0.5 pl-2 text-sm font-medium text-secondary">
                              <Users aria-hidden className="size-4" />
                              <span className="ml-1">2 praticiennes</span>
                              <Switch
                                checked={l.duo}
                                onChange={(on) => setDuo(l.key, on)}
                                label={`${lineName(l)} à 2 praticiennes`}
                              />
                            </label>
                          )}
                          <button
                            type="button"
                            aria-label={`Retirer ${lineName(l)}`}
                            onClick={() => setLines((list) => list.filter((x) => x.key !== l.key))}
                            className="flex size-12 shrink-0 items-center justify-center rounded-full text-secondary/70 hover:bg-base-100 hover:text-secondary"
                          >
                            <X aria-hidden className="size-4" strokeWidth={2.5} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <SearchInput
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher une prestation"
                  aria-label="Rechercher une prestation"
                />

                <div className="mt-3 max-h-[340px] overflow-y-auto rounded-field border border-base-300">
                  {groups.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-base-content/60">
                      Aucune prestation ne correspond à « {query.trim()} ».
                    </p>
                  ) : (
                    groups.map((g) => (
                      <div key={g.id}>
                        <p className="sticky top-0 z-10 bg-base-200 px-4 py-2 text-xs font-semibold tracking-wide text-base-content/60 uppercase">
                          {g.name}
                        </p>
                        <ul>
                          {g.items.map((s) => {
                            const checked = selectedIds.has(s.id);
                            return (
                              <li key={s.id}>
                                <label className="flex min-h-12 cursor-pointer items-center gap-3 border-t border-base-300 px-4 py-2 first:border-t-0 hover:bg-base-200/60">
                                  <CheckboxPrimitive.Root
                                    checked={checked}
                                    onCheckedChange={() => toggle(s)}
                                    className="checkbox checkbox-primary size-5 shrink-0 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                                  >
                                    <CheckboxPrimitive.Indicator>
                                      <Check aria-hidden className="size-3.5 text-primary-content" strokeWidth={3} />
                                    </CheckboxPrimitive.Indicator>
                                  </CheckboxPrimitive.Root>
                                  <span className="min-w-0 flex-1 text-[15px] text-base-content">
                                    {s.name}
                                    {s.twoPractitionersEligible && (
                                      <span
                                        title="Réalisable à 2 praticiennes"
                                        className="ml-2 inline-flex translate-y-[-1px] items-center gap-1 align-middle text-xs font-medium whitespace-nowrap text-base-content/50"
                                      >
                                        <Users aria-hidden className="size-3.5" />
                                        à 2
                                      </span>
                                    )}
                                  </span>
                                  <span className="shrink-0 text-sm tabular-nums text-base-content/60">{durationLabel(s.durationMinutes)}</span>
                                  <span className="w-28 shrink-0 text-right text-[15px] font-medium tabular-nums text-base-content">
                                    {formatFcfa(s.price)}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Questions de catégorie (celles de la prise de RDV b&co) */}
          {questionPeople.length > 0 && (
            <section aria-labelledby="rdv-questions">
              <h3 id="rdv-questions" className="text-[17px] font-semibold text-base-content">
                Questions
              </h3>
              <p className="mt-0.5 mb-3 text-sm text-base-content/60">
                {unanswered > 0
                  ? `Les questions de la prise de rendez-vous en ligne · ${unanswered} sans réponse`
                  : "Les questions de la prise de rendez-vous en ligne · toutes renseignées"}
              </p>
              <RdvQuestions people={questionPeople} answers={answers} onAnswer={answer} />
            </section>
          )}

          {/* Note libre de la réceptionniste */}
          <section aria-labelledby="rdv-note">
            <h3 id="rdv-note" className="mb-3 text-[17px] font-semibold text-base-content">
              Note de l&apos;accueil
            </h3>
            {reservation?.note && (
              <p className="mb-3 rounded-box bg-base-200 px-4 py-2.5 text-sm text-base-content">
                <span className="font-semibold">Note de la cliente · </span>
                {reservation.note}
              </p>
            )}
            <Textarea
              value={staffNote}
              onChange={(e) => setStaffNote(e.target.value)}
              rows={3}
              aria-labelledby="rdv-note"
              placeholder="Ex. arrive avec sa fille, préfère Fatou, allergie précisée au téléphone…"
            />
          </section>
        </div>

        <footer className="flex shrink-0 items-center gap-4 border-t border-base-300 px-8 py-5">
          <p className="min-w-0 flex-1 text-sm text-base-content/60">
            {error ? (
              <span className="font-medium text-error">{error}</span>
            ) : canConfirm && chosenTime ? (
              <>
                <span className="font-medium text-base-content">
                  {shortDay(day)} à {chosenTime} · {salonById(salon)?.name}
                </span>
                <span className="block">
                  {isCreate ? "La cliente recevra une confirmation par email." : "La cliente sera prévenue par email."}
                </span>
              </>
            ) : (
              blocker
            )}
          </p>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button disabled={!canConfirm} onClick={confirm}>
            {isCreate ? "Créer le rendez-vous" : "Confirmer la modification"}
          </Button>
        </footer>
      </Dialog>

      {isCreate && newClient !== null && (
        <NewClientDialog
          open
          initialValues={newClient}
          onClose={() => setNewClient(null)}
          onCreated={(id) => {
            setClientId(id);
            setNewClient(null);
          }}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Choix de la cliente (création)                                      */
/* ------------------------------------------------------------------ */

const PHONE_LIKE = /^[+\d\s().-]+$/;

function prefillFrom(query: string) {
  const q = query.trim();
  if (q && /\d/.test(q) && PHONE_LIKE.test(q)) return { phone: q };
  const [firstName, ...rest] = q.split(/\s+/);
  return { firstName: firstName ?? "", lastName: rest.join(" ") };
}

function ClientPicker({
  clients,
  value,
  onChange,
  onCreateNew,
}: {
  clients: Cliente[];
  value: Cliente | null;
  onChange: (id: string | null) => void;
  onCreateNew: (prefill: ReturnType<typeof prefillFrom>) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim();
  const results = q ? clients.filter((c) => clientMatchesQuery(c, q)).slice(0, 6) : [];

  return (
    <section aria-labelledby="rdv-client">
      <h3 id="rdv-client" className="mb-3 text-[17px] font-semibold text-base-content">
        Cliente
      </h3>
      {value ? (
        <div className="flex items-center gap-4 rounded-box border border-primary bg-accent px-4 py-3 ring-1 ring-primary">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-base-100 text-secondary">
            <UserRound aria-hidden className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-semibold text-base-content">{clientFullName(value)}</span>
            <span className="block truncate text-sm text-base-content/60">
              {clientNumberLabel(value)} · {value.phone}
            </span>
          </span>
          <Button variant="outline" size="sm" onClick={() => onChange(null)}>
            Changer
          </Button>
        </div>
      ) : (
        <>
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, téléphone ou n° client"
            aria-label="Rechercher une cliente"
            autoFocus
          />
          {q && (
            <ul className="mt-2 overflow-hidden rounded-field border border-base-300">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onChange(c.id)}
                    className="flex min-h-12 w-full items-center gap-3 border-b border-base-300 px-4 py-2 text-left hover:bg-base-200/60"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium text-base-content">{clientFullName(c)}</span>
                      <span className="block truncate text-sm text-base-content/60">
                        {clientNumberLabel(c)} · {c.phone}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => onCreateNew(prefillFrom(q))}
                  className="flex min-h-12 w-full items-center gap-2 px-4 py-2 text-left text-[15px] font-medium text-secondary hover:bg-base-200/60"
                >
                  <Plus aria-hidden className="size-4" />
                  {results.length === 0 ? `Aucune cliente trouvée — créer la fiche « ${q} »` : `Créer une fiche « ${q} »`}
                </button>
              </li>
            </ul>
          )}
        </>
      )}
    </section>
  );
}
