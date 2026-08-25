import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { HeroNumber } from "@/components/ui/hero-number";
import { EmptyState } from "@/components/ui/empty-state";
import { PencilIcon, PlusIcon } from "@/components/ui/icons";
import { ClockIcon, NoteIcon, ScissorsIcon } from "@/components/clients/icons";
import { IdentityCard } from "@/components/clients/identity-card";
import { ContactCard } from "@/components/clients/contact-card";
import { SubscriptionCard } from "@/components/clients/subscription-card";
import { FollowUpCard } from "@/components/clients/follow-up-card";
import { getClientById } from "@/lib/data/clients";

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader backHref="/clients" title="Profil Client" align="center" />

      <IdentityCard client={client} />
      <ContactCard client={client} />

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5">
          <HeroNumber label="Visites" value={String(client.visits)} align="center" />
        </Card>
        <Card className="p-5">
          <HeroNumber label="Dépenses" value={client.spend.toLocaleString("fr-FR")} hint="FCFA" align="center" />
        </Card>
        <Card className="p-5">
          <HeroNumber label="Points" value={String(client.points)} align="center" />
        </Card>
      </div>

      <Card className="flex items-center gap-4 p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-gray-100)] text-[var(--color-gray-600)]">
          <ClockIcon className="size-5" />
        </span>
        <div>
          <p className="text-xs text-[var(--color-gray-500)]">Dernière visite</p>
          <p
            className={
              client.lastVisit
                ? "font-semibold text-[var(--color-gray-900)]"
                : "text-sm text-[var(--color-gray-400)]"
            }
          >
            {client.lastVisit?.label ?? "—"}
          </p>
        </div>
      </Card>

      <SubscriptionCard client={client} />
      <FollowUpCard client={client} />

      <Card className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
            <NoteIcon className="size-5 text-[var(--brand-taupe-muted)]" />
            Notes internes
          </h2>
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-semibold tracking-wide text-[var(--brand-taupe-muted)] uppercase"
          >
            <PlusIcon className="size-3" />
            Ajouter
          </button>
        </div>
        <EmptyState
          icon={<NoteIcon />}
          title="Aucune note pour ce client"
          action={
            <button type="button" className="text-sm font-medium text-[var(--brand-taupe-muted)]">
              + Ajouter une note
            </button>
          }
        />
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-[var(--font-heading)] text-lg text-[var(--color-gray-900)]">Préférences beauté</h2>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-semibold tracking-wide text-[var(--brand-taupe-muted)] uppercase"
            >
              <PencilIcon className="size-3" />
              Modifier
            </button>
          </div>
          <Card className="p-5">
            {client.hairType ? (
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-warning-soft)] text-[var(--color-warning)]">
                  <ScissorsIcon className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
                    Coiffure
                  </p>
                  <p className="text-sm text-[var(--color-gray-600)]">
                    Type de cheveux → <span className="font-medium text-[var(--color-gray-900)]">{client.hairType}</span>
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState icon={<ScissorsIcon />} title="Aucune préférence enregistrée" />
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-[var(--font-heading)] text-lg text-[var(--color-gray-900)]">Dernières visites</h2>
          <Card className="p-5">
            <EmptyState icon={<ClockIcon />} title="Aucune visite enregistrée" />
          </Card>
        </div>
      </div>

      <div className="text-center">
        <Link
          href={`/clients/${client.id}/fidelite`}
          className="text-sm font-semibold text-[var(--brand-taupe-muted)] underline underline-offset-4"
        >
          Voir la carte de fidélité
        </Link>
      </div>
    </div>
  );
}
