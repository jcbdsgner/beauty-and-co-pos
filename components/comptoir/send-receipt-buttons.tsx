"use client";

import { useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/atoms/button";
import { Toast } from "@/components/ui/molecules/toast";
import { clientFullName } from "@/lib/data/clientele";
import { cn } from "@/lib/utils";
import type { Cliente } from "@/lib/data/types";

/**
 * Envoi du reçu — simulé (aucun backend). Les deux mêmes boutons servent l'écran reçu du Comptoir
 * (juste après l'encaissement) et le reçu historique du Récap des ventes. Rien ne s'affiche quand
 * la vente n'a pas de cliente rattachée ; chaque bouton est désactivé si son canal manque.
 */
export function SendReceiptButtons({ client, className }: { client?: Cliente; className?: string }) {
  const [toast, setToast] = useState<string | null>(null);

  if (!client) return null;
  const who = clientFullName(client);
  const noChannel = !client.email && !client.whatsapp;

  return (
    <>
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="default"
            className="flex-1"
            icon={<Mail className="size-4" />}
            disabled={!client.email}
            onClick={() => setToast(`Reçu envoyé par e-mail à ${client.email}.`)}
          >
            Par e-mail
          </Button>
          <Button
            variant="outline"
            size="default"
            className="flex-1"
            icon={<MessageCircle className="size-4" />}
            disabled={!client.whatsapp}
            onClick={() => setToast(`Reçu envoyé par WhatsApp à ${who}.`)}
          >
            Par WhatsApp
          </Button>
        </div>
        {noChannel && (
          <p className="text-center text-xs text-[var(--color-gray-400)]">
            Aucune coordonnée enregistrée pour {who} — ajoutez un e-mail ou un WhatsApp sur sa fiche.
          </p>
        )}
      </div>
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
