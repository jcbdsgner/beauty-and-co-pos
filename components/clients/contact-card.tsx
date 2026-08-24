import { Card } from "@/components/ui/card";
import { type Client } from "@/lib/data/clients";
import {
  BriefcaseIcon,
  CakeIcon,
  CupIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  StarListIcon,
  WhatsAppIcon,
} from "@/components/clients/icons";

function ContactRow({
  icon,
  iconClassName,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-[var(--color-gray-500)]">{label}</p>
        <p className="truncate text-[15px] font-medium text-[var(--color-gray-900)]">{value || "—"}</p>
      </div>
    </div>
  );
}

export function ContactCard({ client }: { client: Client }) {
  return (
    <Card className="p-6">
      <p className="mb-5 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">Coordonnées</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <ContactRow
          icon={<PhoneIcon className="size-4" />}
          iconClassName="bg-[var(--color-success-soft)] text-[var(--color-success)]"
          label="Téléphone"
          value={client.phone}
        />
        <ContactRow
          icon={<WhatsAppIcon className="size-4" />}
          iconClassName="bg-[var(--color-success-soft)] text-[var(--color-success)]"
          label="WhatsApp"
          value={client.whatsapp}
        />
        <ContactRow
          icon={<MailIcon className="size-4" />}
          iconClassName="bg-[var(--color-info-soft)] text-[var(--color-info)]"
          label="Email"
          value={client.email}
        />
        <ContactRow
          icon={<PinIcon className="size-4" />}
          iconClassName="bg-[var(--color-warning-soft)] text-[var(--color-warning)]"
          label="Adresse"
          value={client.address}
        />
        <ContactRow
          icon={<BriefcaseIcon className="size-4" />}
          iconClassName="bg-[var(--color-gray-100)] text-[var(--color-gray-600)]"
          label="Profession"
          value={client.profession}
        />
        <ContactRow
          icon={<CakeIcon className="size-4" />}
          iconClassName="bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]"
          label="Anniversaire"
          value={client.birthday}
        />
        <ContactRow
          icon={<CupIcon className="size-4" />}
          iconClassName="bg-[var(--color-gray-100)] text-[var(--color-gray-600)]"
          label="Boisson"
          value={client.drink}
        />
        <ContactRow
          icon={<StarListIcon className="size-4" />}
          iconClassName="bg-[var(--brand-lilac)]/40 text-[var(--brand-taupe-muted)]"
          label="Services préférés"
          value={client.preferredServices}
        />
      </div>
    </Card>
  );
}
