import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/suivi/campaign-card";
import { MegaphoneIcon } from "@/components/suivi/icons";
import { campaigns } from "@/lib/data/suivi";

export default function CampagnesPage() {
  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/suivi"
        className="inline-flex w-fit items-center gap-1 text-xs font-semibold tracking-[0.1em] text-[var(--color-gray-500)] uppercase hover:text-[var(--color-gray-700)]"
      >
        ‹ Suivi
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]">
            <MegaphoneIcon className="size-5" />
          </span>
          <div>
            <h1 className="font-[var(--font-heading)] text-2xl text-[var(--color-gray-900)]">Campagnes</h1>
            <p className="mt-1 text-sm text-[var(--color-gray-500)]">
              Temps forts et jours creux — rédigées et validées par vous
            </p>
          </div>
        </div>
        <Button variant="brand" className="shrink-0">
          + Créer
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}
