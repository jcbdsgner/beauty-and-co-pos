import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { PencilIcon, PeopleIcon, TrashIcon } from "@/components/ui/icons";
import type { Campaign } from "@/lib/data/suivi";

type CampaignCardProps = {
  campaign: Campaign;
  onEdit?: (campaign: Campaign) => void;
  onDelete?: (id: string) => void;
};

/** Carte campagne — titre + badge de statut, aperçu du message, audience ciblée, actions Modifier/Supprimer. */
export function CampaignCard({ campaign, onEdit, onDelete }: CampaignCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-[var(--color-gray-900)]">{campaign.title}</p>
        <Badge variant="warning" className="shrink-0">
          BROUILLON
        </Badge>
      </div>
      <p className="line-clamp-3 text-sm text-[var(--color-gray-500)]">{campaign.message}</p>
      <p className="flex items-center gap-1.5 text-sm text-[var(--color-gray-500)]">
        <PeopleIcon className="size-4" /> {campaign.audience}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <Button
          variant="outline"
          className="flex-1"
          icon={<PencilIcon />}
          onClick={() => onEdit?.(campaign)}
        >
          Modifier
        </Button>
        <IconButton
          aria-label={`Supprimer la campagne « ${campaign.title} »`}
          onClick={() => onDelete?.(campaign.id)}
          className="size-11 shrink-0 rounded-full border border-[var(--color-gray-200)] text-[var(--color-gray-500)] hover:bg-[var(--color-gray-50)]"
        >
          <TrashIcon />
        </IconButton>
      </div>
    </Card>
  );
}
