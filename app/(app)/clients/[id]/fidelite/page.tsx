import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { QrPlaceholder } from "@/components/clients/qr-placeholder";
import { LoyaltyCard } from "@/components/clients/loyalty-card";
import { PrintButton } from "@/components/clients/print-button";
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
        <Button
          variant="success"
          href={waNumber ? `https://wa.me/${waNumber}` : "#"}
          external
          hideExternalIcon
          icon={<WhatsAppIcon className="size-4" />}
        >
          Envoyer par WhatsApp
        </Button>
        <Button
          variant="info"
          href={client.email ? `mailto:${client.email}` : "#"}
          icon={<MailIcon className="size-4" />}
        >
          Envoyer par email
        </Button>
        <Button variant="dark" icon={<DownloadIcon className="size-4" />}>
          Télécharger
        </Button>
        <PrintButton variant="outline" icon={<PrinterIcon className="size-4" />}>
          Imprimer
        </PrintButton>
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
