"use client";

import { useState } from "react";
import { Card } from "@/components/ui/atoms/card";
import { Button } from "@/components/ui/atoms/button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Toast } from "@/components/ui/molecules/toast";
import { useSession } from "@/lib/session";

const MIN_LENGTH = 6;

/** Sécurité — changer mon mot de passe. Simulé : la nouvelle valeur vit en session (voir lib/session),
 *  aucune persistance réelle au-delà de l'onglet. */
export function PasswordSection() {
  const { verifyPassword, setPassword } = useSession();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function reset() {
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  function submit() {
    if (!verifyPassword(current)) {
      setError("Mot de passe actuel incorrect.");
      return;
    }
    if (next.length < MIN_LENGTH) {
      setError(`Le nouveau mot de passe doit faire au moins ${MIN_LENGTH} caractères.`);
      return;
    }
    if (next !== confirm) {
      setError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (next === current) {
      setError("Le nouveau mot de passe doit être différent de l'actuel.");
      return;
    }
    setPassword(next);
    setError(null);
    reset();
    setToast("Votre mot de passe a été changé.");
  }

  return (
    <Card className="flex max-w-lg flex-col gap-5 p-6">
      <FieldLabel>Mot de passe</FieldLabel>

      <div className="flex max-w-sm flex-col gap-4">
        <div>
          <FieldLabel variant="plain" className="mb-2">
            Mot de passe actuel
          </FieldLabel>
          <TextInput
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => { setCurrent(e.target.value); setError(null); }}
          />
        </div>

        <div>
          <FieldLabel variant="plain" className="mb-2">
            Nouveau mot de passe
          </FieldLabel>
          <TextInput
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => { setNext(e.target.value); setError(null); }}
          />
        </div>

        <div>
          <FieldLabel variant="plain" className="mb-2">
            Confirmer le nouveau mot de passe
          </FieldLabel>
          <TextInput
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(null); }}
          />
        </div>

        {error && <p className="text-sm font-medium text-error">{error}</p>}

        <div>
          <Button
            type="button"
            variant="dark"
            onClick={submit}
            disabled={!current || !next || !confirm}
            className="w-auto"
          >
            Changer mon mot de passe
          </Button>
        </div>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </Card>
  );
}
