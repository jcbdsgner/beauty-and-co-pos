"use client";

import { useState } from "react";
import { Card } from "@/components/ui/atoms/card";
import { Button } from "@/components/ui/atoms/button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { LogoutIcon } from "@/components/ui/atoms/icons";
import { useSession } from "@/lib/session";

/** Déconnexion — verrouille le poste derrière l'écran de verrouillage (voir ADR 0026). */
export function LogoutSection() {
  const { logout } = useSession();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Card className="flex max-w-lg flex-col gap-4 p-6">
      <FieldLabel>Déconnexion</FieldLabel>
      <div>
        <Button
          type="button"
          variant="danger-outline"
          icon={<LogoutIcon className="size-4" />}
          onClick={() => setConfirmOpen(true)}
          className="w-auto"
        >
          Se déconnecter
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Se déconnecter ?"
        description="Vous devrez ressaisir votre mot de passe pour accéder au poste."
        confirmLabel="Se déconnecter"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          logout();
        }}
      />
    </Card>
  );
}
