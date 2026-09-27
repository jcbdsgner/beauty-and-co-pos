"use client";

import { Mail, MapPin, Phone, Store, Truck } from "lucide-react";
import { Badge } from "@/components/ui/atoms/badge";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Dialog } from "@/components/ui/molecules/dialog";
import { ContactRow } from "@/components/shared/contact-row";
import type { GiftCardContent, GiftCardRecipient } from "@/lib/data/cartes-cadeaux";
import { formatFcfa, formatPhone } from "@/lib/utils";
import type { Cliente, GiftCardOrder } from "@/lib/data/types";

/**
 * « Détails » d'une commande de carte cadeau, ouvert depuis sa tuile : ce que la carte offre, puis
 * l'acheteur et le destinataire avec leurs coordonnées (téléphone, e-mail, et l'adresse de
 * livraison quand la carte est livrée). Achetée pour elle-même → une seule personne, appelée
 * « Acheteur ». Lecture seule — les gestes (imprimer, remettre, expédier) restent sur la tuile.
 */
export function GiftCardDetailsDialog({
  open,
  onClose,
  order,
  content,
  buyer,
  buyerName,
  recipient,
}: {
  open: boolean;
  onClose: () => void;
  order: GiftCardOrder;
  content: GiftCardContent;
  buyer: Cliente | undefined;
  buyerName: string;
  recipient: GiftCardRecipient;
}) {
  const isLivraison = order.fulfillment === "livraison";
  const titleId = `gift-card-details-${order.id}`;
  const address = isLivraison ? (
    <ContactRow icon={<MapPin className="size-5" />} label="Adresse de livraison" value={order.deliveryAddress} wrap />
  ) : null;

  return (
    <Dialog open={open} labelledBy={titleId} className="relative flex max-h-[calc(100vh-2rem)] max-w-[560px] flex-col overflow-hidden p-0">
      <CloseButton onClick={onClose} className="top-4 right-4" />

      <div className="min-h-0 flex-1 overflow-y-auto px-8 pt-7 pb-8">
        <div className="flex items-center gap-3 pr-12">
          <Badge
            variant="neutral"
            icon={isLivraison ? <Truck aria-hidden className="size-3.5" /> : <Store aria-hidden className="size-3.5" />}
          >
            {isLivraison ? "Livraison" : "Retrait"}
          </Badge>
          <span className="truncate font-mono text-xs tracking-wide text-base-content/55">{order.code}</span>
        </div>
        <h2
          id={titleId}
          className="mt-3 font-[family-name:var(--font-heading)] text-[26px] font-bold leading-tight text-base-content"
        >
          Carte cadeau
        </h2>
        {content.kind === "montant" ? (
          <p className="mt-1 text-[17px] font-semibold tabular-nums text-primary">{formatFcfa(content.amount)}</p>
        ) : (
          <p className="mt-1 text-[17px] font-semibold leading-snug text-primary">{content.services.join(" · ")}</p>
        )}

        <PersonSection
          label="Acheteur"
          name={buyerName}
          phone={buyer?.phone}
          email={buyer?.email}
          extra={recipient.self ? address : null}
        />
        {!recipient.self && (
          <PersonSection
            label="Destinataire"
            name={recipient.name}
            phone={recipient.phone}
            email={recipient.email}
            extra={address}
          />
        )}
      </div>
    </Dialog>
  );
}

function PersonSection({
  label,
  name,
  phone,
  email,
  extra,
}: {
  label: string;
  name: string;
  phone?: string;
  email?: string;
  extra?: React.ReactNode;
}) {
  return (
    <section className="mt-7 border-t border-base-300 pt-6">
      <p className="text-xs font-medium text-base-content/55">{label}</p>
      <p className="mt-0.5 font-[family-name:var(--font-heading)] text-lg font-semibold text-base-content">{name}</p>
      <div className="mt-4 flex flex-col gap-4">
        <ContactRow icon={<Phone className="size-5" />} label="Téléphone" value={phone ? formatPhone(phone) : undefined} />
        <ContactRow icon={<Mail className="size-5" />} label="E-mail" value={email} />
        {extra}
      </div>
    </section>
  );
}
