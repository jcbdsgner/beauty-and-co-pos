import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { QrPlaceholder } from "@/components/clients/qr-placeholder";
import { PrinterIcon, WhatsAppIcon } from "@/components/clients/icons";
import { type Client, fullName, initials, tierMemberLabel } from "@/lib/data/clients";

export function IdentityCard({ client }: { client: Client }) {
  const waNumber = (client.whatsapp ?? client.phone ?? "").replace(/[^0-9]/g, "");

  return (
    <Card className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:items-start sm:text-left">
      <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
        <Avatar
          initial={initials(client)}
          size={88}
          className="border-4 border-[var(--core-brand-color)] bg-[var(--brand-rose-soft)] font-[var(--font-heading)] text-3xl text-[var(--brand-taupe-muted)]"
        />
        <div>
          <p className="font-[var(--font-heading)] text-2xl text-[var(--color-gray-900)]">{fullName(client)}</p>
          <p className="mt-1 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
            {tierMemberLabel(client.tier)}
          </p>
          <p className="mt-0.5 text-sm text-[var(--color-gray-400)]">{client.id}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gray-100)] px-4 py-2.5 text-sm font-medium text-[var(--color-gray-700)] transition hover:opacity-90"
          >
            <PrinterIcon className="size-4" />
            Imprimer carte
          </button>
          <Link
            href={waNumber ? `https://wa.me/${waNumber}` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-success-soft)] px-4 py-2.5 text-sm font-medium text-[var(--color-success)] transition hover:opacity-90"
          >
            <WhatsAppIcon className="size-4" />
            Envoyer WhatsApp
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <QrPlaceholder size={112} />
        <p className="text-xs text-[var(--color-gray-400)]">Scanner au salon</p>
      </div>
    </Card>
  );
}
