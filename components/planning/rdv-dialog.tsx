"use client";

import { useMemo, useState } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CalendarDays, Check, ChevronDown, CupSoda, MapPin, Plus, Scissors, UserRound, Users, X } from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { DatePicker } from "@/components/ui/molecules/date-picker";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Button } from "@/components/ui/atoms/button";
import { SearchInput } from "@/components/ui/atoms/search-input";
import { Switch } from "@/components/ui/atoms/switch";
import { RoundStepButton } from "@/components/ui/atoms/round-step-button";
import { Textarea } from "@/components/ui/atoms/textarea";
import { RdvQuestions, missingAnswers, rdvAnswerKey, type RdvAnswers } from "@/components/planning/rdv-questions";
import { BOOKING_QUESTIONS } from "@/lib/data/booking-questions";
import { NewClientDialog } from "@/components/clientele/new-client-dialog";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn, formatFcfa } from "@/lib/utils";
import { clientFullName, clientMatchesQuery, clientNumberLabel } from "@/lib/data/clientele";
import { SALONS, salonById } from "@/lib/data/entreprises";
import { PRODUITS, SERVICES, SERVICE_CATEGORIES, produitById, serviceOfferedAt } from "@/lib/data/menu";
import { BOISSONS, boissonById } from "@/lib/data/boissons";
import { isSalonClosed } from "@/lib/data/praticiennes";
import { SALON_CLOSING, SALON_OPENING, dateISO, reservationById, reservationDate, todayISO } from "@/lib/data/planning";
import type { Cliente, RendezVous, ReservationExtra, Service } from "@/lib/data/types";
import { availableTimes, planAt, type PlanContext, type PlanItem } from "@/lib/prise-rdv/planifier";
import { POSTE_SALON_ID } from "@/lib/session";

// Le bloc unique de rendez-vous (ADR 0041) : « Nouveau rendez-vous » (sans
// `reservationId`) et « Modifier le rendez-vous » (avec) sont la même fenêtre,
// large, en deux colonnes vues d'un coup — à gauche le rendez-vous (cliente en
// création, prestations par personne, salon, date, horaire), à droite ce qui
// l'accompagne (2 praticiennes, questions, extensions, boissons, notes). Les
// praticiennes suivent (affectation automatique) : à la modification, l'actuelle
// est gardée si elle reste libre. « 2 praticiennes » est un seul interrupteur,
// appliqué là où c'est faisable : prestations réalisables à 2, quand deux
// praticiennes sont libres ensemble — il ne retire jamais un horaire.
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
// pour une personne.
type Line = { key: string; personKey: string; serviceId: string; existing?: RendezVous };

// Les extensions proposées quand une cliente coiffure n'apporte pas les siennes (règle du site
// b&co, `needsSalonExtensions`) : les cheveux vendus en boutique.
const EXTENSION_CATEGORIES = new Set(["beccy-wave", "nefertiti"]);

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
  const [openCat, setOpenCat] = useState<string | null>(null);
  const searching = query.trim() !== "";
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
  const initialDuo = initial.rvs.some((rv) => rv.secondStaffId);
  const [duo, setDuo] = useState(initialDuo);
  const initialExtras = reservation?.extras ?? [];
  const [extras, setExtras] = useState<ReservationExtra[]>(initialExtras);
  const extraQty = (kind: ReservationExtra["kind"], refId: string) =>
    extras.find((x) => x.kind === kind && x.refId === refId)?.qty ?? 0;
  const setExtraQty = (kind: ReservationExtra["kind"], refId: string, qty: number) =>
    setExtras((list) => {
      const rest = list.filter((x) => !(x.kind === kind && x.refId === refId));
      return qty > 0 ? [...rest, { kind, refId, qty }] : rest;
    });
  const extraPrice = (x: ReservationExtra) =>
    (x.kind === "boisson" ? boissonById(x.refId)?.price : produitById(x.refId)?.price) ?? 0;
  const extrasTotal = extras.reduce((sum, x) => sum + extraPrice(x) * x.qty, 0);
  const drinkCount = extras.filter((x) => x.kind === "boisson").reduce((n, x) => n + x.qty, 0);
  const [barOpen, setBarOpen] = useState(false);
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
  // du Menu si elle était à deux, sa durée y étant déjà divisée), celle du Menu
  // pour une ligne ajoutée.
  const soloDuration = (l: Line) => {
    const menu = byId.get(l.serviceId)?.durationMinutes;
    if (l.existing && !l.existing.secondStaffId) return l.existing.durationMin;
    return menu ?? (l.existing ? l.existing.durationMin * 2 : 0);
  };
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
    twoPractitionersEligible: canDuo(l),
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
    () => (opening && notOffered.length === 0 ? availableTimes(ctx, items, duo) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctx, opening, notOffered.length, itemsKey, duo],
  );
  const chosenTime = time && times.includes(time) ? time : null;
  // Le plan à l'horaire choisi : dit où « 2 praticiennes » s'applique vraiment.
  const plan = useMemo(
    () => (chosenTime ? planAt(ctx, items, chosenTime, duo, overrides, pickedSlot?.staffId) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctx, chosenTime, itemsKey, duo],
  );
  const planned = (l: Line) => plan?.find((pl) => pl.key === l.key);
  // Durée réelle d'une ligne : celle du plan ; sans horaire, à deux dès que l'interrupteur et la prestation le permettent.
  const lineDuration = (l: Line) =>
    planned(l)?.durationMin ?? (duo && canDuo(l) ? Math.round(soloDuration(l) / 2) : soloDuration(l));
  const duoEligible = lines.filter(canDuo);

  const totalMin = (() => {
    // Amplitude de la visite : chaque personne enchaîne ses prestations, en parallèle des autres.
    const perPerson = new Map<string, number>();
    for (const l of lines) perPerson.set(l.personKey, (perPerson.get(l.personKey) ?? 0) + lineDuration(l));
    return Math.max(0, ...perPerson.values());
  })();
  const soloTotalMin = (() => {
    const perPerson = new Map<string, number>();
    for (const l of lines) perPerson.set(l.personKey, (perPerson.get(l.personKey) ?? 0) + soloDuration(l));
    return Math.max(0, ...perPerson.values());
  })();
  const totalPrice = lines.reduce((s, l) => s + linePrice(l), 0) + extrasTotal;

  const sameLines = lines.length === initialLines.length && lines.every((l, i) => l.key === initialLines[i].key);
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
    duo !== initialDuo ||
    JSON.stringify(extras) !== JSON.stringify(initialExtras) ||
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
    setLines((list) => [...list, original ?? { key: newLineId(), personKey: person, serviceId: s.id }]);
  };

  // Extensions : dès qu'une personne en coiffure n'apporte pas les siennes — ou déjà réservées.
  const showExtensions =
    people.some(
      (p) =>
        lines.some((l) => l.personKey === p.key && byId.get(l.serviceId)?.categoryId === "coiffure") &&
        answers[rdvAnswerKey(p.key, "coiffure")]?.["propres-extensions"] === "Non",
    ) || extras.some((x) => x.kind === "produit" && EXTENSION_CATEGORIES.has(produitById(x.refId)?.categoryId ?? ""));
  const extensionProducts = PRODUITS.filter((p) => p.active && EXTENSION_CATEGORIES.has(p.categoryId));

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
    if (!chosenTime || !client || !plan) return;
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
      extras,
    });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onClose();
  };


  return (
    <>
      <Dialog
        open
        onClose={onClose}
        labelledBy="resched-title"
        className="relative flex h-[90vh] max-w-[1200px] flex-col overflow-hidden"
      >
        <CloseButton onClick={onClose} className="top-4 right-4" />

        <header className="shrink-0 border-b border-base-300 px-8 pt-7 pb-5">
          <h2 id="resched-title" className="text-[24px] font-semibold tracking-[-0.01em] text-base-content">
            {isCreate ? "Nouveau rendez-vous" : "Modifier le rendez-vous"}
          </h2>
          {!isCreate && (
            <p className="mt-1 text-[15px] text-base-content/60">
              {`${payerName} · actuellement ${frFullDate(currentDay!)} à ${currentTime}, ${salonById(initial.salon ?? "")?.name ?? ""}`}
            </p>
          )}
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_440px]">
          {/* ---- Le rendez-vous ---- */}
          <div className="min-h-0 space-y-8 overflow-y-auto px-8 pt-6 pb-8">
            {isCreate && (
              <ClientPicker clients={clients} value={client} onChange={setClientId} onCreateNew={(prefill) => setNewClient(prefill)} />
            )}

            {/* Prestations (repliées à la modification : on y vient surtout pour l'horaire) */}
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
                      : `${lines.length} prestation${lines.length > 1 ? "s" : ""} · ${durationLabel(totalMin)} · ${formatFcfa(totalPrice - extrasTotal)}`}
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
                    <ul className="mb-4 flex flex-wrap gap-2" aria-label="Prestations choisies">
                      {personLines.map((l) => (
                        <li
                          key={l.key}
                          className="inline-flex items-center gap-2 rounded-full bg-accent py-1.5 pr-1.5 pl-3.5 text-sm font-medium text-secondary"
                        >
                          {lineName(l)}
                          {(planned(l)?.staffIds.length ?? 0) > 1 && <Users aria-label="à 2 praticiennes" className="size-3.5" />}
                          <button
                            type="button"
                            aria-label={`Retirer ${lineName(l)}`}
                            onClick={() => setLines((list) => list.filter((x) => x.key !== l.key))}
                            className="flex size-6 items-center justify-center rounded-full text-secondary/70 hover:bg-base-100 hover:text-secondary"
                          >
                            <X aria-hidden className="size-3.5" strokeWidth={2.5} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <SearchInput
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher une prestation"
                    aria-label="Rechercher une prestation"
                  />

                  <div className="mt-3 divide-y divide-base-300 rounded-field border border-base-300">
                    {groups.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-base-content/60">
                        Aucune prestation ne correspond à « {query.trim()} ».
                      </p>
                    ) : (
                      groups.map((g) => {
                        // Une seule catégorie ouverte à la fois ; une recherche ouvre toutes celles qui ont un résultat.
                        const isOpen = searching || openCat === g.id;
                        const chosen = personLines.filter((l) => byId.get(l.serviceId)?.categoryId === g.id).length;
                        return (
                          <div key={g.id}>
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              disabled={searching}
                              onClick={() => setOpenCat(isOpen ? null : g.id)}
                              className={cn(
                                "flex h-14 w-full items-center gap-3 px-4 text-left transition enabled:hover:bg-base-200/60",
                                isOpen && "sticky top-0 z-10 border-b border-base-300 bg-base-200",
                              )}
                            >
                              <span className="text-[16px] font-semibold text-base-content">{g.name}</span>
                              {chosen > 0 && (
                                <span className="rounded-full bg-accent px-2.5 py-0.5 text-sm font-semibold tabular-nums text-secondary">
                                  {chosen}
                                </span>
                              )}
                              {!searching && (
                                <ChevronDown aria-hidden className={cn("ml-auto size-5 text-secondary transition", isOpen && "rotate-180")} />
                              )}
                            </button>
                            {isOpen &&
                              subGroups(g.items).map((sg) => (
                                <div key={sg.name ?? "_"}>
                                  {sg.name && (
                                    <p className="px-4 pt-3 pb-1 text-xs font-semibold tracking-wide text-base-content/50 uppercase">
                                      {sg.name}
                                    </p>
                                  )}
                                  <ul>
                                    {sg.items.map((s) => {
                                      const checked = selectedIds.has(s.id);
                                      return (
                                        <li key={s.id}>
                                          <label className="flex min-h-12 cursor-pointer items-center gap-3 px-4 py-2 hover:bg-base-200/60">
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
                                                  <Users aria-hidden className="size-3.5" />à 2
                                                </span>
                                              )}
                                            </span>
                                            <span className="shrink-0 text-sm tabular-nums text-base-content/60">
                                              {durationLabel(s.durationMinutes)}
                                            </span>
                                            <span className="w-28 shrink-0 text-right text-[15px] font-medium tabular-nums text-base-content">
                                              {formatFcfa(s.price)}
                                            </span>
                                          </label>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              ))}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Date et salon, sur une rangée */}
            <div className="grid grid-cols-2 gap-6">
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
                      <span className="truncate first-letter:uppercase">{frFullDate(day)}</span>
                    </button>
                  }
                />
              </section>

              <section aria-labelledby="resched-salon">
                <h3 id="resched-salon" className="mb-3 text-[17px] font-semibold text-base-content">
                  Salon
                </h3>
                <div role="radiogroup" aria-labelledby="resched-salon" className="grid grid-cols-2 gap-2">
                  {activeSalons.map((s) => {
                    const selected = s.id === salon;
                    const closed = !openingLabel(s.id, day);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setSalon(s.id)}
                        title={s.address}
                        className={cn(
                          "flex h-14 items-center gap-2.5 rounded-field border px-3 text-left transition",
                          selected ? "border-primary bg-accent ring-1 ring-primary" : "border-base-300 bg-base-100 hover:border-base-content/25",
                          closed && !selected && "bg-base-200 opacity-70",
                        )}
                      >
                        <MapPin aria-hidden className={cn("size-5 shrink-0", selected ? "text-primary" : "text-base-content/45")} />
                        <span className="min-w-0">
                          <span className="block truncate text-[16px] font-semibold text-base-content">{s.name}</span>
                          {closed && <span className="block text-xs font-medium whitespace-nowrap text-error">Fermé</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Horaire */}
            <section aria-labelledby="resched-time">
              <h3 id="resched-time" className="mb-3 text-[17px] font-semibold text-base-content">
                Horaire
              </h3>
              {!opening ? (
                <p className="rounded-box bg-base-200 px-4 py-4 text-[15px] text-base-content/70">
                  {salonById(salon)?.name} est fermé {frFullDate(day)}. Choisissez un autre jour ou l&apos;autre salon.
                </p>
              ) : notOffered.length > 0 ? (
                <p className="rounded-box bg-warning/10 px-4 py-4 text-[15px] text-warning">
                  {notOffered.map(lineName).join(", ")} {notOffered.length > 1 ? "ne sont pas proposées" : "n'est pas proposée"} à{" "}
                  {salonById(salon)?.name}. Retirez-{notOffered.length > 1 ? "les" : "la"} dans « Prestations » ou gardez
                  l&apos;autre salon.
                </p>
              ) : lines.length === 0 ? (
                <p className="rounded-box bg-base-200 px-4 py-4 text-[15px] text-base-content/70">
                  Ajoutez au moins une prestation pour voir les horaires.
                </p>
              ) : times.length === 0 ? (
                <p className="rounded-box bg-base-200 px-4 py-4 text-[15px] text-base-content/70">
                  Aucun horaire libre ce jour-là pour {lines.length > 1 ? "ces prestations" : "cette prestation"} : les praticiennes
                  compétentes sont absentes ou déjà prises. Essayez un autre jour ou l&apos;autre salon.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {times.map((t) => {
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
              )}
            </section>
          </div>

          {/* ---- Ce qui l'accompagne ---- */}
          <aside aria-label="Options du rendez-vous" className="min-h-0 space-y-8 overflow-y-auto border-l border-base-300 bg-base-200/40 px-7 pt-6 pb-8">
            {/* 2 praticiennes : un seul interrupteur, appliqué là où c'est faisable */}
            <section aria-labelledby="rdv-duo">
              <div className="flex items-center gap-3">
                <span id="rdv-duo" className="flex min-w-0 flex-1 items-center gap-2 text-[17px] font-semibold text-base-content">
                  <Users aria-hidden className="size-5 text-secondary" />2 praticiennes
                </span>
                <Switch checked={duo} onChange={setDuo} disabled={duoEligible.length === 0 && !duo} label="2 praticiennes" />
              </div>
              {duo && duoEligible.length > 0 && (
                <div className="mt-3 rounded-box bg-base-100 px-4 py-3 ring-1 ring-base-300">
                  {!plan ? (
                    <p className="text-sm text-base-content/70">
                      Visite jusqu&apos;à{" "}
                      <span className="font-semibold text-base-content tabular-nums">
                        {durationLabel(soloTotalMin)} → {durationLabel(totalMin)}
                      </span>
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-base-content/70">
                        Visite{" "}
                        <span className="font-semibold text-base-content tabular-nums">
                          {soloTotalMin === totalMin ? durationLabel(totalMin) : `${durationLabel(soloTotalMin)} → ${durationLabel(totalMin)}`}
                        </span>
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {duoEligible.map((l) => {
                          const two = (planned(l)?.staffIds.length ?? 0) > 1;
                          return (
                            <li key={l.key} className="flex items-start gap-2 text-sm">
                              {two ? (
                                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={2.5} />
                              ) : (
                                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-base-content/35" />
                              )}
                              <span className="min-w-0 flex-1">
                                <span className="text-base-content">{lineName(l)}</span>
                                <span className="block text-base-content/60">
                                  {two
                                    ? `À 2 · ${durationLabel(lineDuration(l))} au lieu de ${durationLabel(soloDuration(l))}`
                                    : `Reste à 1 : une seule praticienne libre à ${chosenTime}`}
                                </span>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </section>

            {/* Questions de catégorie (celles de la prise de RDV b&co) */}
            {questionPeople.length > 0 && (
              <section aria-labelledby="rdv-questions">
                <h3 id="rdv-questions" className="mb-3 text-[17px] font-semibold text-base-content">
                  Questions
                  {unanswered > 0 && <span className="ml-2 text-sm font-normal text-base-content/50">{unanswered} sans réponse</span>}
                </h3>
                <RdvQuestions people={questionPeople} answers={answers} onAnswer={answer} />
              </section>
            )}

            {/* Extensions : quand une cliente coiffure n'apporte pas les siennes */}
            {showExtensions && (
              <section aria-labelledby="rdv-extensions">
                <h3 id="rdv-extensions" className="mb-3 flex items-center gap-2 text-[17px] font-semibold text-base-content">
                  <Scissors aria-hidden className="size-5 text-secondary" />
                  Extensions
                </h3>
                <ExtraList
                  rows={extensionProducts.map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.image }))}
                  qty={(id) => extraQty("produit", id)}
                  onQty={(id, q) => setExtraQty("produit", id, q)}
                />
              </section>
            )}

            {/* Bar Beauty : replié par défaut */}
            <section aria-labelledby="rdv-boissons">
              <button
                type="button"
                aria-expanded={barOpen}
                onClick={() => setBarOpen((v) => !v)}
                className="flex min-h-12 w-full items-center gap-2 text-left"
              >
                <CupSoda aria-hidden className="size-5 text-secondary" />
                <span id="rdv-boissons" className="text-[17px] font-semibold text-base-content">
                  Bar Beauty
                </span>
                {drinkCount > 0 && (
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-sm font-semibold tabular-nums text-secondary">{drinkCount}</span>
                )}
                <ChevronDown aria-hidden className={cn("ml-auto size-5 text-secondary transition", barOpen && "rotate-180")} />
              </button>
              {barOpen && (
                <ExtraList
                  className="mt-2"
                  rows={BOISSONS.filter((b) => b.active || extraQty("boisson", b.id) > 0).map((b) => ({
                    id: b.id,
                    name: b.name,
                    price: b.price,
                    image: b.image,
                    detail: b.description,
                  }))}
                  qty={(id) => extraQty("boisson", id)}
                  onQty={(id, q) => setExtraQty("boisson", id, q)}
                />
              )}
            </section>

            {/* Notes libres de la réceptionniste */}
            <section aria-labelledby="rdv-note">
              <h3 id="rdv-note" className="mb-3 text-[17px] font-semibold text-base-content">
                Notes
              </h3>
              {reservation?.note && (
                <p className="mb-3 rounded-box bg-base-100 px-4 py-2.5 text-sm text-base-content ring-1 ring-base-300">
                  <span className="font-semibold">Note de la cliente · </span>
                  {reservation.note}
                </p>
              )}
              <Textarea
                value={staffNote}
                onChange={(e) => setStaffNote(e.target.value)}
                rows={3}
                aria-labelledby="rdv-note"
                placeholder="Ajouter une note sur ce rendez-vous"
              />
            </section>
          </aside>
        </div>

        <footer className="flex shrink-0 items-center gap-4 border-t border-base-300 px-8 py-5">
          <div className="min-w-0 flex-1">
            {error ? (
              <p className="text-sm font-medium text-error">{error}</p>
            ) : canConfirm && chosenTime ? (
              <p>
                <span className="block text-[17px] font-semibold text-base-content first-letter:uppercase">
                  {shortDay(day)} · {chosenTime}
                </span>
                <span className="block text-sm text-base-content/60">
                  {salonById(salon)?.name} · {durationLabel(totalMin)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-base-content/60">{blocker}</p>
            )}
          </div>
          {lines.length > 0 && (
            <span className="mr-2 text-[20px] font-semibold tabular-nums text-base-content">{formatFcfa(totalPrice)}</span>
          )}
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

/** Les prestations d'une catégorie rangées par sous-catégorie (Tissage, Brushing…), dans l'ordre
 *  où le Menu les présente ; `name: null` pour celles qui n'en ont pas. */
function subGroups(items: Service[]) {
  const out: { name: string | null; items: Service[] }[] = [];
  for (const s of items) {
    const name = s.subcategory ?? null;
    const group = out.find((g) => g.name === name);
    if (group) group.items.push(s);
    else out.push({ name, items: [s] });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Extensions et boissons : une liste à quantités                      */
/* ------------------------------------------------------------------ */

type ExtraRow = { id: string; name: string; price: number; image?: string; detail?: string };

function ExtraList({
  rows,
  qty,
  onQty,
  className,
}: {
  rows: ExtraRow[];
  qty: (id: string) => number;
  onQty: (id: string, q: number) => void;
  className?: string;
}) {
  return (
    <ul className={cn("divide-y divide-base-300 overflow-hidden rounded-box bg-base-100 ring-1 ring-base-300", className)}>
      {rows.map((r) => {
        const n = qty(r.id);
        return (
          <li key={r.id} className={cn("flex items-center gap-3 px-3 py-2.5", n > 0 && "bg-accent/60")}>
            {r.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.image} alt="" className="size-11 shrink-0 rounded-field object-cover" />
            ) : (
              <span aria-hidden className="size-11 shrink-0 rounded-field bg-base-200" />
            )}
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 text-[15px] leading-snug font-medium text-base-content">{r.name}</span>
              <span className="block truncate text-sm text-base-content/60">
                <span className="tabular-nums">{formatFcfa(r.price)}</span>
                {r.detail && ` · ${r.detail}`}
              </span>
            </span>
            {n === 0 ? (
              <RoundStepButton direction="increment" size="sm" ariaLabel={`Ajouter ${r.name}`} onClick={() => onQty(r.id, 1)} />
            ) : (
              <span className="flex shrink-0 items-center gap-2">
                <RoundStepButton direction="decrement" size="sm" ariaLabel={`Retirer un ${r.name}`} onClick={() => onQty(r.id, n - 1)} />
                <span className="w-5 text-center text-[15px] font-semibold tabular-nums text-base-content">{n}</span>
                <RoundStepButton direction="increment" size="sm" ariaLabel={`Ajouter un ${r.name}`} onClick={() => onQty(r.id, n + 1)} />
              </span>
            )}
          </li>
        );
      })}
    </ul>
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
