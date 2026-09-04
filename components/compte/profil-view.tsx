"use client";

import { useState } from "react";
import { Card } from "@/components/ui/atoms/card";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { SwitchUserDialog } from "@/components/compte/switch-user-dialog";
import { useSession } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/data/utilisateurs";

/** Profil — qui tient le poste en ce moment. Lecture seule (les fiches viennent de l'équipe) +
 *  le geste « changer d'utilisateur ». Simulé, aucun compte réel. */
export function ProfilView() {
  const { currentUser } = useSession();
  const [switchOpen, setSwitchOpen] = useState(false);

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <Card className="flex items-center gap-4 p-6">
        <Avatar initial={currentUser.initial} size={56} className="bg-accent text-lg font-semibold text-secondary" />
        <div className="min-w-0">
          <p className="text-lg font-semibold text-base-content">{currentUser.name}</p>
          <p className="text-sm text-base-content/55">{ROLE_LABEL[currentUser.role]}</p>
        </div>
      </Card>

      <div>
        <FieldLabel variant="plain" className="mb-1.5">
          Mon code
        </FieldLabel>
        <p className="font-[family-name:var(--font-heading)] text-xl font-semibold tracking-[0.2em] text-base-content">
          {currentUser.code}
        </p>
        <p className="mt-1 text-sm text-base-content/55">
          Identifie qui a accordé une remise sur un ticket. Il est attribué par la direction et ne se modifie pas ici.
        </p>
      </div>

      <div className="border-t border-base-300 pt-6">
        <Button type="button" variant="outline" onClick={() => setSwitchOpen(true)} className="w-auto">
          Changer d&apos;utilisateur
        </Button>
      </div>

      <SwitchUserDialog open={switchOpen} onClose={() => setSwitchOpen(false)} />
    </div>
  );
}
