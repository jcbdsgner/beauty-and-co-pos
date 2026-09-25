"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  AttendeesDialog,
  type Attendees,
} from "@/components/prise-rdv/attendees-dialog";
import { BookingConfirmedDialog } from "@/components/prise-rdv/booking-confirmed-dialog";
import { BookingProgress } from "@/components/prise-rdv/booking-progress";
import { BookingSummarySidebar } from "@/components/prise-rdv/booking-summary-sidebar";
import { LeaveBookingDialog } from "@/components/prise-rdv/leave-booking-dialog";
import {
  AlreadyPaidDialog,
  redeemableItemKey,
  type RedeemableEntry,
} from "@/components/prise-rdv/already-paid-dialog";
import { PackUpsellDialog } from "@/components/prise-rdv/pack-upsell-dialog";
import {
  PaymentMethodDialog,
  type PaymentMethod,
} from "@/components/prise-rdv/payment-method-dialog";
import {
  ClientesStep,
  type PersonAssignment,
} from "@/components/prise-rdv/steps/clientes-step";
import { ServicesStep } from "@/components/prise-rdv/steps/services-step";
import {
  CreneauStep,
  type StaffRow,
} from "@/components/prise-rdv/steps/creneau-step";
import {
  ConfirmationStep,
  type ConfirmationExtras,
} from "@/components/prise-rdv/steps/confirmation-step";
import { bcoFontVariables } from "@/components/prise-rdv/fonts";
import { useAppData } from "@/components/providers/app-data-provider";
import {
  buildCartItems,
  requiresAlmadiesOnly,
  type PrestationCoverage,
  type Selections,
} from "@/lib/prise-rdv/cart";
import { buildPersonTabs } from "@/lib/prise-rdv/people";
import {
  addMinutes,
  DEPOSIT_AMOUNT,
  formatPrice,
} from "@/lib/prise-rdv/format";
import { answerKey, type QuestionAnswers } from "@/lib/prise-rdv/questions";
import { bookingLocations } from "@/lib/prise-rdv/data/booking-locations";
import { bookingServices } from "@/lib/prise-rdv/data/booking-services";
import { type Pack } from "@/lib/prise-rdv/data/packs";
import {
  emptyContactInfo,
  type BookingStepId,
  type ContactInfo,
  type PersonTab,
} from "@/lib/prise-rdv/types";
import {
  LOCATION_ID_BY_SALON,
  SALON_ID_BY_LOCATION,
  alternativesFor,
  availableTimes,
  planAt,
  type PlanContext,
  type PlanItem,
} from "@/lib/prise-rdv/planifier";
import { cn, toSentenceCase } from "@/lib/prise-rdv/utils";
import { clientFullName } from "@/lib/data/clientele";
import {
  abonnementAvailablePrestations,
  abonnementsForClient,
} from "@/lib/data/abonnements";
import { forfaitById } from "@/lib/data/forfaits";
import { packById } from "@/lib/data/packs";
import {
  packPurchasesForClient,
  packRemainingPrestations,
} from "@/lib/data/pack-purchases";
import { dateISO, reservationById, reservationDate } from "@/lib/data/planning";
import type {
  Cliente,
  DepositMode,
  Reservation,
  ReservationExtra,
} from "@/lib/data/types";
import "@/components/prise-rdv/prise-rdv.css";

/**
 * « Créer un rendez-vous » / « Modifier » (ADR 0032) : le parcours du site de rendez-vous b&co,
 * recopié à l'identique — mêmes étapes, mêmes écrans, même apparence — dans un grand dialogue.
 * Seules différences : l'étape « Clientes » (la réceptionniste cherche la payeuse au lieu de se
 * connecter) passe en premier, les horaires et praticiennes viennent de l'agenda réel, l'acompte
 * accepte les espèces, et « Encaisser maintenant » mène à la station Règlement.
 */

/** Largeur de référence du site : tout le contenu est rendu à cette largeur puis réduit proportionnellement pour tenir. */
const DESIGN_WIDTH = 1440;

const DEPOSIT_MODE: Record<PaymentMethod, DepositMode> = {
  cash: "especes",
  "mobile-money": "mobile_money",
  card: "carte",
};
const DEPOSIT_MODE_LABEL: Record<DepositMode, string> = {
  especes: "en espèces",
  mobile_money: "par mobile money",
  carte: "par carte",
};

/** Boutique du site ↔ Produits du point de vente (seul Becky Wave existe des deux côtés). */
const PRODUIT_ID_BY_BOUTIQUE: Record<string, string> = {
  "becky-wave": "becky-wave-raw-hair",
};
const BOUTIQUE_ID_BY_PRODUIT = Object.fromEntries(
  Object.entries(PRODUIT_ID_BY_BOUTIQUE).map(([a, b]) => [b, a]),
);

const subServiceById = new Map(
  bookingServices.flatMap((category) =>
    category.subServices.map((sub) => [sub.id, { sub, category }] as const),
  ),
);

type PriseRdvModalProps = {
  open: boolean;
  /** Absent ⇒ création ; présent ⇒ modification de cette réservation, parcours pré-rempli. */
  reservationId?: string | null;
  /** Salon pré-choisi à l'étape Créneau (le salon filtré à l'Accueil), modifiable. */
  defaultSalonId?: string | null;
  onClose: () => void;
};

export function PriseRdvModal({
  open,
  reservationId,
  defaultSalonId,
  onClose,
}: PriseRdvModalProps) {
  if (!open) return null;
  return (
    <ScaledFrame>
      {(scroller) => (
        <PriseRdvFlow
          key={reservationId ?? "new"}
          reservationId={reservationId ?? null}
          defaultSalonId={defaultSalonId ?? null}
          scroller={scroller}
          onClose={onClose}
        />
      )}
    </ScaledFrame>
  );
}

/**
 * Très grand, pas plein écran. Le contenu est rendu à la largeur du site puis mis à l'échelle ; le
 * `transform` fait aussi de ce cadre le bloc conteneur des fenêtres `fixed` du site (nombre de
 * personnes, acompte…), qui s'ouvrent donc par-dessus le parcours et non par-dessus toute l'app.
 */
function ScaledFrame({
  children,
}: {
  children: (
    scroller: React.RefObject<HTMLDivElement | null>,
  ) => React.ReactNode;
}) {
  // Callback ref : le Portal Radix ne monte le panneau qu'après le premier rendu.
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!panel) return;
    const measure = () =>
      setSize({ width: panel.clientWidth, height: panel.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [panel]);

  const scale = size ? Math.min(1, size.width / DESIGN_WIDTH) : 1;

  // Radix, comme les autres dialogues de l'app : il s'empile proprement par-dessus la fiche
  // réservation (elle-même un Dialog Radix), qui sinon rendrait ce parcours inerte. Ni Échap ni un
  // clic à côté ne ferment le parcours — seule la croix, confirmée, le quitte (comme sur le site).
  return (
    <DialogPrimitive.Root open>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/60" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          className="fixed inset-0 z-[70] flex items-center justify-center p-6 outline-none"
        >
          <VisuallyHidden>
            <DialogPrimitive.Title>Prendre rendez-vous</DialogPrimitive.Title>
          </VisuallyHidden>
          <div
            ref={setPanel}
            className={cn(
              "bco relative h-[92vh] w-[min(94vw,1600px)] overflow-hidden rounded-3xl bg-[#EBDDDA] shadow-2xl",
              bcoFontVariables,
            )}
          >
            <div
              style={{
                width: size ? size.width / scale : "100%",
                height: size ? size.height / scale : "100%",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                visibility: size ? "visible" : "hidden",
              }}
            >
              <div
                ref={scrollerRef}
                className="h-full overflow-y-auto p-[31px]"
              >
                {children(scrollerRef)}
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

type Prefill = {
  attendees: Attendees;
  assignments: Record<string, PersonAssignment>;
  selections: Selections;
  date: Date;
  locationId: string | null;
  time: string | null;
  twoPractitioners: boolean;
  staffOverrides: Record<string, string[]>;
  note: string;
  drinkIds: string[];
  productQuantities: Record<string, number>;
};

/** Relit une réservation existante dans les termes du parcours : personnes, sélections, créneau. */
function prefillFrom(
  reservation: Reservation,
  praticienneSalon: (id: string) => string | undefined,
): Prefill {
  const active = reservation.rendezVous.filter((rv) => rv.status !== "annule");
  const payerRvs = active.filter(
    (rv) => !rv.beneficiaryClientId && !rv.beneficiaryName,
  );
  const others = new Map<
    string,
    { assignment: PersonAssignment; child: boolean; serviceIds: string[] }
  >();
  for (const rv of active) {
    if (!rv.beneficiaryClientId && !rv.beneficiaryName) continue;
    const key = rv.beneficiaryClientId ?? `nom:${rv.beneficiaryName}`;
    const category = subServiceById.get(rv.serviceId)?.category;
    const entry = others.get(key) ?? {
      assignment: rv.beneficiaryClientId
        ? { clientId: rv.beneficiaryClientId }
        : { name: rv.beneficiaryName },
      child: rv.beneficiaryKind === "enfant" || Boolean(category?.forChildren),
      serviceIds: [],
    };
    entry.serviceIds.push(rv.serviceId);
    others.set(key, entry);
  }
  const adultOthers = [...others.values()].filter((o) => !o.child);
  const childOthers = [...others.values()].filter((o) => o.child);
  const payerIsAdultSlot = payerRvs.length > 0 || adultOthers.length > 0;
  const attendees: Attendees = {
    adults: (payerIsAdultSlot ? 1 : 0) + adultOthers.length,
    children: childOthers.length,
  };
  const people = buildPersonTabs(attendees);
  const adults = people.filter((p) => p.type === "adult");
  const children = people.filter((p) => p.type === "child");

  const assignments: Record<string, PersonAssignment> = {};
  const selections: Selections = {};
  const staffOverrides: Record<string, string[]> = {};
  const payerSlot = adults[0]?.id ?? "payeuse";
  assignments[payerSlot] = { clientId: reservation.payerClientId };
  selections[payerSlot] = new Set(payerRvs.map((rv) => rv.serviceId));
  adultOthers.forEach((o, i) => {
    const slot = adults[i + 1];
    assignments[slot.id] = o.assignment;
    selections[slot.id] = new Set(o.serviceIds);
  });
  childOthers.forEach((o, i) => {
    assignments[children[i].id] = o.assignment;
    selections[children[i].id] = new Set(o.serviceIds);
  });
  for (const rv of active) {
    const slot = Object.entries(assignments).find(([, a]) =>
      rv.beneficiaryClientId
        ? a.clientId === rv.beneficiaryClientId
        : rv.beneficiaryName
          ? a.name === rv.beneficiaryName
          : a.clientId === reservation.payerClientId,
    )?.[0];
    if (slot)
      staffOverrides[`${slot}:${rv.serviceId}`] = [
        rv.staffId,
        rv.secondStaffId,
      ].filter(Boolean) as string[];
  }

  const firstStaff = active[0]?.staffId;
  const salonId = firstStaff ? praticienneSalon(firstStaff) : undefined;
  const earliest = active.map((rv) => rv.start).sort()[0] ?? null;
  const productQuantities: Record<string, number> = {};
  for (const extra of reservation.extras ?? []) {
    const boutiqueId =
      extra.kind === "produit"
        ? BOUTIQUE_ID_BY_PRODUIT[extra.refId]
        : undefined;
    if (boutiqueId) productQuantities[boutiqueId] = extra.qty;
  }
  return {
    attendees,
    assignments,
    selections,
    date: new Date(`${reservationDate(reservation)}T00:00:00`),
    locationId: salonId ? (LOCATION_ID_BY_SALON[salonId] ?? null) : null,
    time: earliest,
    twoPractitioners: active.some((rv) => rv.secondStaffId),
    staffOverrides,
    note: reservation.note ?? "",
    drinkIds: (reservation.extras ?? [])
      .filter((e) => e.kind === "boisson")
      .map((e) => e.refId.replace(/^boisson-/, "")),
    productQuantities,
  };
}

function PriseRdvFlow({
  reservationId,
  defaultSalonId,
  scroller,
  onClose,
}: {
  reservationId: string | null;
  defaultSalonId: string | null;
  scroller: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const {
    clients,
    reservations,
    praticiennes,
    addClient,
    saveParcoursReservation,
    openNewTab,
  } = useAppData();
  const editing = reservationId
    ? reservationById(reservations, reservationId)
    : undefined;
  const [prefill] = useState<Prefill | null>(() =>
    editing
      ? prefillFrom(
          editing,
          (id) => praticiennes.find((p) => p.id === id)?.salonId,
        )
      : null,
  );
  const excludeRvIds = useMemo(
    () => new Set(editing?.rendezVous.map((rv) => rv.id) ?? []),
    [editing],
  );

  const [attendees, setAttendees] = useState<Attendees | null>(null);
  const [step, setStep] = useState<BookingStepId>("clientes");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [assignments, setAssignments] = useState<
    Record<string, PersonAssignment>
  >(prefill?.assignments ?? {});
  const [selections, setSelections] = useState<Selections>(
    prefill?.selections ?? {},
  );
  const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswers>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    prefill?.date ?? null,
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    prefill
      ? prefill.locationId
      : defaultSalonId
        ? (LOCATION_ID_BY_SALON[defaultSalonId] ?? null)
        : null,
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(
    prefill?.time ?? null,
  );
  const [twoPractitioners, setTwoPractitioners] = useState(
    prefill?.twoPractitioners ?? false,
  );
  const [staffOverrides, setStaffOverrides] = useState<
    Record<string, string[]>
  >(prefill?.staffOverrides ?? {});
  const [note, setNote] = useState(prefill?.note ?? "");
  const [pendingExtras, setPendingExtras] = useState<ConfirmationExtras | null>(
    null,
  );
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Déjà payé / suggestion de pack — ouvert en sortant de l'étape Clientes, une fois la payeuse
  // connue (sur le site, c'est la connexion qui la fait connaître). Pas en modification.
  const [gateOpen, setGateOpen] = useState(false);
  const [redeemableGateResolved, setRedeemableGateResolved] = useState(
    Boolean(prefill),
  );
  const [redeemablesApplied, setRedeemablesApplied] = useState(false);
  const [redeemableItemSelections, setRedeemableItemSelections] = useState<
    Record<string, boolean>
  >({});
  const [redeemableItemAssignments, setRedeemableItemAssignments] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    scroller.current?.scrollTo(0, 0);
  }, [step, scroller]);

  const basePeople = buildPersonTabs(attendees);
  const baseAdults = basePeople.filter((person) => person.type === "adult");
  // Une réservation d'enfant(s) seul(s) : la payeuse ne reçoit rien, mais il faut quand même la trouver.
  const payerSlot: PersonTab = baseAdults[0] ?? {
    id: "payeuse",
    label: "Payeuse",
    type: "adult",
  };
  const slots = baseAdults.length > 0 ? basePeople : [payerSlot, ...basePeople];
  const clientById = (id?: string) =>
    id ? clients.find((c) => c.id === id) : undefined;
  const labelFor = (person: PersonTab) => {
    const assignment = assignments[person.id];
    const client = clientById(assignment?.clientId);
    return client
      ? clientFullName(client)
      : assignment?.name?.trim() || person.label;
  };
  // Les onglets du site portent les noms retrouvés à l'étape Clientes plutôt que « Adulte 2 ».
  const people = basePeople.map((person) => ({
    ...person,
    label: labelFor(person),
  }));
  const adults = people.filter((person) => person.type === "adult");
  const payer = clientById(assignments[payerSlot.id]?.clientId);

  const redeemableEntries: RedeemableEntry[] = useMemo(() => {
    if (!payer) return [];
    const toPrestation = (id: string) => {
      const found = subServiceById.get(id);
      return found
        ? {
            id,
            label: toSentenceCase(found.sub.label),
            categoryId: found.category.id,
            duration: found.sub.duration,
          }
        : null;
    };
    const abonnementEntries = abonnementsForClient(payer.id)
      .filter((ab) => abonnementAvailablePrestations(ab).length > 0)
      .sort((a, b) => b.subscribedAt.localeCompare(a.subscribedAt))
      .slice(0, 1)
      .map((ab): RedeemableEntry => ({
        entryId: ab.id,
        source: "abonnement",
        sourceLabel: forfaitById(ab.forfaitId)?.label ?? "Abonnement",
        remainingPrestations: abonnementAvailablePrestations(ab)
          .map(toPrestation)
          .filter((p) => p !== null),
      }));
    const packEntries = packPurchasesForClient(payer.id)
      .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt))
      .slice(0, 2)
      .map((pp): RedeemableEntry => ({
        entryId: pp.id,
        source: "pack",
        sourceLabel: packById(pp.packId)?.label ?? "Pack",
        remainingPrestations: packRemainingPrestations(pp)
          .map(toPrestation)
          .filter((p) => p !== null),
      }))
      .filter((entry) => entry.remainingPrestations.length > 0);
    return [...abonnementEntries, ...packEntries];
  }, [payer]);
  const hasRedeemableEntries = redeemableEntries.length > 0;

  const isRedeemableItemSelected = (entryId: string, prestationId: string) =>
    redeemableItemSelections[redeemableItemKey(entryId, prestationId)] ?? false;
  const getRedeemableItemPersonId = (
    entryId: string,
    prestationId: string,
  ): string | null =>
    redeemableItemAssignments[redeemableItemKey(entryId, prestationId)] ??
    adults[0]?.id ??
    null;
  const coverage: PrestationCoverage = new Map();
  if (redeemablesApplied) {
    for (const entry of redeemableEntries) {
      for (const prestation of entry.remainingPrestations) {
        if (!isRedeemableItemSelected(entry.entryId, prestation.id)) continue;
        const personId = getRedeemableItemPersonId(
          entry.entryId,
          prestation.id,
        );
        if (!personId) continue;
        const bySub =
          coverage.get(personId) ?? new Map<string, "pack" | "abonnement">();
        bySub.set(prestation.id, entry.source);
        coverage.set(personId, bySub);
      }
    }
  }
  const cartItems = buildCartItems(people, selections, coverage);
  const almadiesOnly = requiresAlmadiesOnly(cartItems);
  const availableLocations = almadiesOnly
    ? bookingLocations.filter((location) => location.id === "almadies")
    : bookingLocations;

  // Une prestation réservée aux Almadies invalide un Sea Plaza déjà choisi : il faut rechoisir.
  const locationId =
    almadiesOnly && selectedLocationId !== "almadies" ? null : selectedLocationId;

  const totalMinutes = people.reduce((max, person) => {
    const personMinutes = cartItems
      .filter((item) => item.personId === person.id)
      .reduce((sum, item) => sum + item.durationMinutes, 0);
    return Math.max(max, personMinutes);
  }, 0);
  const twoPractitionersMinutes = people.reduce((max, person) => {
    const personItems = cartItems.filter((item) => item.personId === person.id);
    const eligibleMinutes = personItems
      .filter((item) => item.twoPractitionersEligible)
      .reduce((sum, item) => sum + item.durationMinutes, 0);
    const soloOnlyMinutes = personItems
      .filter((item) => !item.twoPractitionersEligible)
      .reduce((sum, item) => sum + item.durationMinutes, 0);
    return Math.max(max, Math.round(eligibleMinutes / 2) + soloOnlyMinutes);
  }, 0);
  const effectiveTotalMinutes = twoPractitioners
    ? twoPractitionersMinutes
    : totalMinutes;
  const locationLabel =
    bookingLocations.find((location) => location.id === locationId)
      ?.label ?? null;

  // L'agenda réel : quels horaires tiennent, et qui pose chaque prestation.
  const planItems: PlanItem[] = cartItems.map((item) => ({
    key: item.id,
    personId: item.personId,
    serviceId: item.subServiceId,
    categoryId: item.categoryId,
    durationMinutes: item.durationMinutes,
    twoPractitionersEligible: item.twoPractitionersEligible,
  }));
  const planContext: PlanContext | null =
    selectedDate && locationId
      ? {
          date: dateISO(selectedDate),
          salonId: SALON_ID_BY_LOCATION[locationId],
          praticiennes,
          reservations,
          excludeRvIds,
        }
      : null;
  const timeSlots = planContext
    ? availableTimes(planContext, planItems, twoPractitioners)
    : [];
  // En modification, l'horaire d'origine peut ne pas tomber sur une demi-heure : on le garde proposé.
  if (
    planContext &&
    selectedTime &&
    !timeSlots.includes(selectedTime) &&
    planAt(planContext, planItems, selectedTime, twoPractitioners)
  ) {
    timeSlots.push(selectedTime);
    timeSlots.sort();
  }
  const effectiveTime =
    selectedTime && timeSlots.includes(selectedTime) ? selectedTime : null;
  const plan =
    planContext && effectiveTime
      ? planAt(
          planContext,
          planItems,
          effectiveTime,
          twoPractitioners,
          staffOverrides,
        )
      : null;
  const staffRows: StaffRow[] =
    plan && planContext
      ? plan.map((line) => {
          const item = cartItems.find((c) => c.id === line.key)!;
          return {
            key: line.key,
            label: item.label,
            personLabel: people.length > 1 ? item.personLabel : undefined,
            start: line.start,
            end: addMinutes(line.start, line.durationMin),
            staffIds: line.staffIds,
            options: alternativesFor(
              planContext,
              plan,
              line,
              item.categoryId,
            ).map((p) => ({ id: p.id, name: p.name })),
          };
        })
      : [];

  const toggleSubService = (personId: string, subServiceId: string) => {
    setSelections((prev) => {
      const next = { ...prev };
      const current = new Set(next[personId] ?? []);
      if (current.has(subServiceId)) current.delete(subServiceId);
      else current.add(subServiceId);
      next[personId] = current;
      return next;
    });
  };

  const choosePackToBuy = (pack: Pack) => {
    const personId = adults[0]?.id;
    if (personId) {
      setSelections((prev) => {
        const next = { ...prev };
        const current = new Set(next[personId] ?? []);
        for (const prestationId of pack.prestationIds)
          current.add(prestationId);
        next[personId] = current;
        return next;
      });
    }
    resolveGate();
  };

  const resolveGate = () => {
    setRedeemableGateResolved(true);
    setGateOpen(false);
  };

  const applyRedeemableEntriesToBooking = () => {
    setSelections((prev) => {
      const next = { ...prev };
      for (const entry of redeemableEntries) {
        for (const prestation of entry.remainingPrestations) {
          if (!isRedeemableItemSelected(entry.entryId, prestation.id)) continue;
          const personId = getRedeemableItemPersonId(
            entry.entryId,
            prestation.id,
          );
          if (!personId) continue;
          const current = new Set(next[personId] ?? []);
          current.add(prestation.id);
          next[personId] = current;
        }
      }
      return next;
    });
    setRedeemablesApplied(true);
    resolveGate();
  };

  const toggleRedeemableItem = (entryId: string, prestationId: string) => {
    const key = redeemableItemKey(entryId, prestationId);
    setRedeemableItemSelections((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? false),
    }));
  };

  const assignRedeemableItemPerson = (
    entryId: string,
    prestationId: string,
    personId: string,
  ) => {
    const key = redeemableItemKey(entryId, prestationId);
    setRedeemableItemAssignments((prev) => ({ ...prev, [key]: personId }));
    setRedeemableItemSelections((prev) => ({ ...prev, [key]: true }));
  };

  const answerQuestion = (
    personId: string,
    categoryId: string,
    questionId: string,
    value: string,
  ) => {
    setQuestionAnswers((prev) => {
      const key = answerKey(personId, categoryId);
      return { ...prev, [key]: { ...(prev[key] ?? {}), [questionId]: value } };
    });
  };

  const createClient = (data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }): Cliente =>
    addClient({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      ...(data.email ? { email: data.email } : {}),
      residenceCountry: "Sénégal",
    });

  const leaveClientes = () => {
    setStep("services");
    if (!redeemableGateResolved) setGateOpen(true);
  };

  // La confirmation montre « Prénom et nom / Email » de chaque adulte : on les lit sur leurs fiches.
  const contacts = slots.filter((slot) => slot.type === "adult");
  const contactInfoByPerson: Record<string, ContactInfo> = Object.fromEntries(
    slots.map((slot) => {
      const assignment = assignments[slot.id];
      const client = clientById(assignment?.clientId);
      return [
        slot.id,
        client
          ? {
              ...emptyContactInfo,
              firstName: client.firstName,
              lastName: client.lastName,
              email: client.email ?? "",
              phone: client.phone,
            }
          : { ...emptyContactInfo, firstName: assignment?.name ?? "" },
      ];
    }),
  );

  const toExtras = (extras: ConfirmationExtras): ReservationExtra[] => [
    ...extras.drinkIds.map((id): ReservationExtra => ({
      kind: "boisson",
      refId: `boisson-${id}`,
      qty: 1,
    })),
    ...extras.products
      .filter((p) => PRODUIT_ID_BY_BOUTIQUE[p.id])
      .map((p): ReservationExtra => ({
        kind: "produit",
        refId: PRODUIT_ID_BY_BOUTIQUE[p.id],
        qty: p.qty,
      })),
  ];

  const save = (
    extras: ConfirmationExtras,
    deposit?: { amount: number; mode: DepositMode },
  ) => {
    if (!plan || !selectedDate || !payer) {
      setSaveError("Choisissez un créneau disponible avant de confirmer.");
      return null;
    }
    const result = saveParcoursReservation({
      reservationId: editing?.id,
      payerClientId: payer.id,
      date: dateISO(selectedDate),
      lines: plan.map((line) => {
        const person = slots.find((slot) => slot.id === line.personId);
        const assignment = assignments[line.personId];
        const isPayer = line.personId === payerSlot.id;
        return {
          serviceId: line.serviceId,
          staffId: line.staffIds[0],
          ...(line.staffIds[1] ? { secondStaffId: line.staffIds[1] } : {}),
          start: line.start,
          durationMin: line.durationMin,
          ...(isPayer
            ? {}
            : assignment?.clientId
              ? { beneficiaryClientId: assignment.clientId }
              : {
                  beneficiaryName:
                    assignment?.name?.trim() || person?.label || "Invitée",
                  ...(person?.type === "child"
                    ? { beneficiaryKind: "enfant" as const }
                    : {}),
                }),
        };
      }),
      extras: toExtras(extras),
      note,
      deposit,
    });
    if (!result.ok) {
      setSaveError(result.message);
      return null;
    }
    setSaveError(null);
    return result.reservationId ?? null;
  };

  const payerName = payer ? clientFullName(payer) : "la cliente";
  const depositAlreadyPaid = (editing?.depositPaid ?? 0) > 0;

  const handleConfirm = (grandTotal: number, extras: ConfirmationExtras) => {
    if (depositAlreadyPaid || grandTotal <= 0) {
      if (save(extras)) {
        setConfirmation({
          title: editing ? "Rendez-vous modifié !" : "Rendez-vous confirmé !",
          message: `La réservation de ${payerName} est enregistrée.`,
        });
      }
      return;
    }
    setPendingExtras(extras);
    setShowPaymentDialog(true);
  };

  const handleDeposit = (method: PaymentMethod) => {
    setShowPaymentDialog(false);
    const mode = DEPOSIT_MODE[method];
    if (
      save(pendingExtras ?? { drinkIds: [], products: [] }, {
        amount: DEPOSIT_AMOUNT,
        mode,
      })
    ) {
      setConfirmation({
        title: editing ? "Rendez-vous modifié !" : "Rendez-vous confirmé !",
        message: `La réservation de ${payerName} est enregistrée. Acompte de ${formatPrice(DEPOSIT_AMOUNT)} réglé ${DEPOSIT_MODE_LABEL[mode]}.`,
      });
    }
  };

  const handleCheckoutNow = (extras: ConfirmationExtras) => {
    const id = save(extras);
    if (!id) return;
    onClose();
    openNewTab({ reservationId: id });
  };

  const stepNumber = {
    clientes: 1,
    services: 2,
    creneau: 3,
    confirmation: 4,
  } as const;

  return (
    <div className="rounded-none border border-[rgba(234,236,240,0.6)] bg-[var(--color-bg-subtle)] p-6 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05)] sm:rounded-3xl sm:p-10">
      <div className="relative">
        <h1 className="px-12 text-center text-[19px] font-bold text-[var(--color-gray-800)] sm:px-14 sm:text-[27px]">
          {editing ? "Modifier le rendez-vous" : "Prendre rendez-vous"}
        </h1>
        <button
          type="button"
          onClick={() => setShowLeaveConfirm(true)}
          aria-label="Quitter la prise de rendez-vous"
          className="absolute top-1/2 right-0 flex size-11 -translate-y-1/2 items-center justify-center rounded-lg bg-[var(--color-gray-50)] text-[var(--color-gray-500)] transition hover:bg-[var(--color-gray-100)] hover:text-[var(--text-secondary)]"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M18 6 6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="mt-8">
        <BookingProgress currentStep={step} />
      </div>

      {saveError && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-[#fef3f2] px-4 py-3 text-[17px] text-[var(--color-error)]"
        >
          {saveError}
        </p>
      )}

      <div
        className={cn(
          "mt-10 grid gap-10",
          step !== "confirmation" && "lg:grid-cols-[1fr_320px]",
        )}
      >
        <div className="min-w-0">
          {step === "clientes" && (
            <ClientesStep
              slots={slots}
              payerSlotId={payerSlot.id}
              assignments={assignments}
              clients={clients}
              onAssign={(slotId, assignment) =>
                setAssignments((prev) => ({ ...prev, [slotId]: assignment }))
              }
              onCreateClient={createClient}
              canContinue={Boolean(payer)}
              onContinue={leaveClientes}
              onBack={() => setAttendees(null)}
            />
          )}

          {step === "services" && (
            <ServicesStep
              people={people}
              selections={selections}
              onToggleSubService={toggleSubService}
              questionAnswers={questionAnswers}
              onAnswerQuestion={answerQuestion}
              onContinue={() => setStep("creneau")}
              onCancel={() => setStep("clientes")}
              coverage={coverage}
            />
          )}

          {step === "creneau" && (
            <CreneauStep
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setSelectedTime(null);
              }}
              locations={availableLocations}
              selectedLocationId={locationId}
              onSelectLocation={(id) => {
                setSelectedLocationId(id);
                setSelectedTime(null);
              }}
              selectedTime={effectiveTime}
              onSelectTime={setSelectedTime}
              timeSlots={timeSlots}
              staffRows={staffRows}
              onChangeStaff={(key, index, staffId) => {
                const current =
                  staffRows.find((row) => row.key === key)?.staffIds ?? [];
                const next = [...current];
                next[index] = staffId;
                setStaffOverrides((prev) => ({ ...prev, [key]: next }));
              }}
              totalMinutes={totalMinutes}
              twoPractitionersMinutes={twoPractitionersMinutes}
              twoPractitioners={twoPractitioners}
              onToggleTwoPractitioners={setTwoPractitioners}
              canContinue={Boolean(selectedDate && locationId && plan)}
              onContinue={() => setStep("confirmation")}
              onBack={() => setStep("services")}
            />
          )}

          {step === "confirmation" && (
            <ConfirmationStep
              cartItems={cartItems}
              note={note}
              onNoteChange={setNote}
              locationLabel={locationLabel}
              date={selectedDate}
              time={effectiveTime}
              totalMinutes={effectiveTotalMinutes}
              adults={contacts.filter(
                (c) => assignments[c.id]?.clientId || assignments[c.id]?.name,
              )}
              contactInfoByPerson={contactInfoByPerson}
              onBack={() => setStep("creneau")}
              onConfirm={handleConfirm}
              onCheckoutNow={handleCheckoutNow}
              initialDrinkIds={prefill?.drinkIds}
              initialProductQuantities={prefill?.productQuantities}
            />
          )}
        </div>

        {step !== "confirmation" && (
          <BookingSummarySidebar
            step={stepNumber[step]}
            cartItems={cartItems}
            showPersonLabels={people.length > 1}
            date={step === "creneau" ? selectedDate : null}
            time={step === "creneau" ? effectiveTime : null}
            locationLabel={step === "creneau" ? locationLabel : null}
            totalMinutesOverride={
              step === "creneau" ? effectiveTotalMinutes : undefined
            }
          />
        )}
      </div>

      <AttendeesDialog
        open={attendees === null}
        initial={attendees ?? prefill?.attendees}
        onConfirm={setAttendees}
        onCancel={onClose}
      />
      {hasRedeemableEntries ? (
        <AlreadyPaidDialog
          open={gateOpen && adults.length > 0}
          entries={redeemableEntries}
          adults={adults}
          selectedItems={redeemableItemSelections}
          itemAssignments={redeemableItemAssignments}
          onToggleItem={toggleRedeemableItem}
          onAssignItem={assignRedeemableItemPerson}
          onViewOtherServices={applyRedeemableEntriesToBooking}
          onSkipToCreneau={() => {
            applyRedeemableEntriesToBooking();
            setStep("creneau");
          }}
        />
      ) : (
        <PackUpsellDialog
          open={gateOpen}
          onChoosePack={choosePackToBuy}
          onSkip={resolveGate}
        />
      )}
      <LeaveBookingDialog
        open={showLeaveConfirm}
        onCancel={() => setShowLeaveConfirm(false)}
        onConfirm={onClose}
      />
      <PaymentMethodDialog
        open={showPaymentDialog}
        amountLabel={formatPrice(DEPOSIT_AMOUNT)}
        description={`Réglez l'acompte (${formatPrice(DEPOSIT_AMOUNT)}) pour confirmer le rendez-vous.`}
        onClose={() => setShowPaymentDialog(false)}
        onSelect={handleDeposit}
      />
      <BookingConfirmedDialog
        open={confirmation !== null}
        title={confirmation?.title ?? ""}
        message={confirmation?.message ?? ""}
        onClose={onClose}
      />
    </div>
  );
}
