import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { QrPlaceholder } from "@/components/clients/qr-placeholder";
import { LoyaltyCard } from "@/components/clients/loyalty-card";
import { DownloadIcon, MailIcon, PrinterIcon, WhatsAppIcon } from "@/components/clients/icons";
import { fullName, getClientById, tierCardLabel } from "@/lib/data/clients";

export default async function ClientLoyaltyCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);
  const waNumber = (client.whatsapp ?? client.phone ?? "").replace(/[^0-9]/g, "");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <PageHeader backHref={`/clients/${client.id}`} title="Carte de fidélité" align="center" />

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={waNumber ? `https://wa.me/${waNumber}` : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-success)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <WhatsAppIcon className="size-4" />
          Envoyer par WhatsApp
        </Link>
        <Link
          href={client.email ? `mailto:${client.email}` : "#"}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-info)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <MailIcon className="size-4" />
          Envoyer par email
        </Link>
        <Button variant="dark" icon={<DownloadIcon className="size-4" />}>
          Télécharger
        </Button>
        <Button variant="outline" icon={<PrinterIcon className="size-4" />}>
          Imprimer
        </Button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <LoyaltyCard client={client} />
        <p className="text-xs text-[var(--color-gray-400)]">▲ Recto de la carte</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--color-gray-300)] bg-white p-6">
          <p className="text-xs font-semibold tracking-widest text-[var(--color-gray-500)] uppercase">
            QR code sticker
          </p>
          <QrPlaceholder size={140} />
          <p className="text-sm text-[var(--color-gray-400)]">{client.id}</p>
          <p className="text-sm text-[var(--color-gray-600)]">
            {fullName(client)} · {tierCardLabel(client.tier)}
          </p>
        </div>
        <p className="text-xs text-[var(--color-gray-400)]">▲ Sticker QR à découper</p>
      </div>
    </div>
  );
}
