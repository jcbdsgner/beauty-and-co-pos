"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { Button } from "@/components/ui/atoms/button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { Badge } from "@/components/ui/atoms/badge";
import { EmptyState } from "@/components/ui/molecules/empty-state";
import { StatTile, StatTileRow } from "@/components/ui/molecules/stat-tile";
import { AppointmentTimelineRow } from "@/components/ui/molecules/appointment-timeline-row";
import { MorningRoundCard } from "@/components/journee/morning-round-card";
import { AppointmentDetailDialog } from "@/components/journee/appointment-detail-dialog";
import { AppointmentFormDialog } from "@/components/journee/appointment-form-dialog";
import { useAccueil } from "@/components/journee/use-accueil";
import { computeTotals, useAppData } from "@/components/providers/app-data-provider";
import { clientFullName, clientInitial } from "@/lib/data/clientele";
import { serviceById } from "@/lib/data/catalogue";
import { appointmentEndTime } from "@/lib/data/planning";
import { formatFcfa } from "@/lib/utils";
import type { RendezVous } from "@/lib/data/types";

export default function JourneePage() {
  const { appointments, praticiennes, clients, sales } = useAppData();
  const { requestAccueil, accueilDialog } = useAccueil();

  const [detailAppointment, setDetailAppointment] = useState<RendezVous | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formAppointment, setFormAppointment] = useState<RendezVous | null>(null);

  const groups = praticiennes
    .map((staff) => ({
      staff,
      items: appointments.filter((a) => a.staffId === staff.id).sort((a, b) => a.start.localeCompare(b.start)),
    }))
    .filter((g) => g.items.length > 0);

  const encaisseAujourdhui = sales.filter((s) => s.status === "encaissee").reduce((sum, s) => sum + computeTotals(s).total, 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Journée" subtitle="Chronologie, tournée du matin et résumé du jour en un coup d'œil." />

      <section className="flex flex-col gap-4">
        <FieldLabel>Chronologie du jour</FieldLabel>
        {appointments.length === 0 ? (
          <EmptyState
            icon={<CalendarClock />}
            title="Aucun rendez-vous aujourd'hui"
            subtitle="La journée est libre pour l'instant."
            action={
              <Button
                variant="dark"
                onClick={() => {
                  setFormAppointment(null);
                  setFormOpen(true);
                }}
              >
                Nouveau rendez-vous
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map(({ staff, items }) => (
              <div key={staff.id} className="flex flex-col gap-2">
                <FieldLabel className="px-1">
                  {staff.name}
                  {staff.unavailableToday && (
                    <Badge variant="warning" className="ml-2 normal-case">
                      Absente aujourd&apos;hui
                    </Badge>
                  )}
                </FieldLabel>
                <div className="flex flex-col gap-2">
                  {items.map((appt) => {
                    const client = clients.find((c) => c.id === appt.clientId);
                    const service = serviceById(appt.serviceId);
                    return (
                      <AppointmentTimelineRow
                        key={appt.id}
                        start={appt.start}
                        end={appointmentEndTime(appt)}
                        clientName={client ? clientFullName(client) : "Cliente"}
                        clientInitial={client ? clientInitial(client) : "?"}
                        service={service?.name ?? "Prestation"}
                        staffName={staff.name}
                        status={appt.status}
                        onClick={() => setDetailAppointment(appt)}
                        trailing={
                          appt.status === "annule" ? undefined : appt.saleId ? (
                            <button
                              type="button"
                              onClick={() => requestAccueil(appt.id)}
                              className="shrink-0 rounded-full transition active:scale-95"
                            >
                              <Badge variant="dark">En cours</Badge>
                            </button>
                          ) : (
                            <Button variant="dark" onClick={() => requestAccueil(appt.id)} className="shrink-0 px-4 py-2.5 text-sm">
                              Accueillir
                            </Button>
                          )
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <MorningRoundCard />

      <section className="flex flex-col gap-3">
        <FieldLabel>Résumé du jour</FieldLabel>
        <StatTileRow>
          <StatTile value={formatFcfa(encaisseAujourdhui)} label="Encaissé aujourd'hui" tone="success" />
          <StatTile value={appointments.length} label="Rendez-vous du jour" />
        </StatTileRow>
        <Button variant="outline" href="/recap-ventes" className="self-start px-4 py-2 text-sm">
          Voir le récap complet
        </Button>
      </section>

      <div className="flex justify-center border-t border-[var(--color-gray-200)] pt-6">
        <Button variant="outline" href="/planning">
          Planning complet
        </Button>
      </div>

      <AppointmentDetailDialog
        open={detailAppointment !== null}
        appointment={detailAppointment}
        onClose={() => setDetailAppointment(null)}
        onEdit={(appt) => {
          setDetailAppointment(null);
          setFormAppointment(appt);
          setFormOpen(true);
        }}
        onAccueil={(id) => {
          setDetailAppointment(null);
          requestAccueil(id);
        }}
      />

      <AppointmentFormDialog
        open={formOpen}
        appointment={formAppointment}
        onClose={() => {
          setFormOpen(false);
          setFormAppointment(null);
        }}
      />

      {accueilDialog}
    </div>
  );
}
