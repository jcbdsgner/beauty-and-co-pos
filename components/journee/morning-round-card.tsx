"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Card } from "@/components/ui/atoms/card";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { HeroNumber } from "@/components/ui/atoms/hero-number";
import { Button } from "@/components/ui/atoms/button";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { RELANCES } from "@/lib/data/relances";

/**
 * Widget "Tournée du matin" — the structural answer to burying the daily send under Clientèle:
 * the high-frequency gesture (valider & envoyer en bloc) stays 1 tap from the landing screen,
 * per USERFLOW.md § Journée. Card-by-card handling (authorize a discount, ignore a case) moves
 * one tap further to Relances — an acceptable cost since those are exceptions, not the daily habit.
 *
 * Known limit: relance send-state isn't exposed via useAppData() (Clientèle/Relances owns that
 * mutation), so "Valider & envoyer" here confirms visually but doesn't persist a sent state across
 * screens in this pass — see final report.
 */
export function MorningRoundCard() {
  const [confirmSend, setConfirmSend] = useState(false);
  const [sent, setSent] = useState(false);
  const ready = RELANCES.filter((r) => r.status === "en_attente");

  return (
    <>
      <Card className="flex items-center justify-between gap-6 p-6">
        <div className="flex items-center gap-6">
          <div>
            <FieldLabel>Tournée du matin</FieldLabel>
            <HeroNumber label="" value={String(ready.length)} hint="messages prêts à envoyer" />
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Button
            variant="dark"
            icon={<Send className="size-4" />}
            onClick={() => setConfirmSend(true)}
            disabled={ready.length === 0 || sent}
          >
            {sent ? "Envoyé" : "Valider & envoyer"}
          </Button>
          {(ready.length === 0 || sent) && (
            <p className="text-right text-xs text-[var(--color-gray-400)]">
              {sent ? "Tous les messages du jour sont partis." : "Aucun message prêt pour le moment."}
            </p>
          )}
          <Button variant="outline" href="/clientele" className="px-4 py-2 text-sm">
            Voir le détail
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmSend}
        title={`Envoyer ${ready.length} message${ready.length > 1 ? "s" : ""} ?`}
        description="Chaque cliente reçoit son message de relance personnalisé maintenant."
        confirmLabel="Envoyer"
        confirmVariant="dark"
        onCancel={() => setConfirmSend(false)}
        onConfirm={() => {
          setSent(true);
          setConfirmSend(false);
        }}
      />
    </>
  );
}
