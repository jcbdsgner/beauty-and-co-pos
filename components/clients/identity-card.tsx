import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { QrPlaceholder } from "@/components/clients/qr-placeholder";
import { PrintButton } from "@/components/clients/print-button";
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
          <PrintButton variant="outline" icon={<PrinterIcon className="size-4" />}>
            Imprimer carte
          </PrintButton>
          <Button
            variant="success"
            href={waNumber ? `https://wa.me/${waNumber}` : "#"}
            external
            hideExternalIcon
            icon={<WhatsAppIcon className="size-4" />}
          >
            Envoyer WhatsApp
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <QrPlaceholder size={112} />
        <p className="text-xs text-[var(--color-gray-400)]">Scanner au salon</p>
      </div>
    </Card>
  );
}
