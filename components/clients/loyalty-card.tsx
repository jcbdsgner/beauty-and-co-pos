import { QrPlaceholder } from "@/components/clients/qr-placeholder";
import { type Client, fullName, tierCardLabel } from "@/lib/data/clients";

export function LoyaltyCard({ client }: { client: Client }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-gray-200)] bg-white shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)]">
      <div className="h-2 bg-[var(--core-brand-color)]" />
      <div className="flex items-start justify-between gap-6 p-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-[var(--font-heading)] text-lg tracking-wide text-[var(--pos-accent-dark)]">
              Beauty and Co
            </p>
            <p className="text-xs font-semibold tracking-widest text-[var(--color-gray-500)] uppercase">
              Carte de fidélité
            </p>
          </div>
          <div>
            <p className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">{fullName(client)}</p>
            <span className="mt-1 inline-flex items-center rounded-full bg-[var(--brand-rose-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-taupe-muted)]">
              {tierCardLabel(client.tier)}
            </span>
          </div>
          <p className="text-sm text-[var(--color-gray-400)]">{client.id}</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <QrPlaceholder size={88} />
          <p className="text-[11px] text-[var(--color-gray-400)]">Scanner au salon</p>
        </div>
      </div>
    </div>
  );
}
