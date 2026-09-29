"use client";

import { useParams } from "next/navigation";
import { ReservationDetailView } from "@/components/planning/reservation-detail-view";

/** Page détaillée d'une réservation — ouverte par « Voir les détails » de la fiche réservation. */
export default function ReservationDetailPage() {
  const params = useParams<{ id: string }>();
  return <ReservationDetailView reservationId={decodeURIComponent(params.id)} />;
}
