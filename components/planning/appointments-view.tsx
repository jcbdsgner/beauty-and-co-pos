import { CalendarIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/empty-state";

type AppointmentsViewProps = {
  dateLabel: string;
};

/** Vue "Rendez-vous" du Planning — état vide (aucune donnée mock de RDV pour l'instant). */
export function AppointmentsView({ dateLabel }: AppointmentsViewProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">Rendez-vous</h2>
        <span className="text-sm text-[var(--color-gray-500)]">0 RDV</span>
      </div>

      <EmptyState
        icon={<CalendarIcon className="size-12" />}
        title="Aucun rendez-vous pour ce jour"
        subtitle={dateLabel}
      />
    </div>
  );
}
