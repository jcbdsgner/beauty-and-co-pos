"use client";

import { useState } from "react";
import { Button } from "@/components/ui/atoms/button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { InputOtp } from "@/components/ui/molecules/input-otp";
import { Toast } from "@/components/ui/molecules/toast";
import { useSession } from "@/lib/session";

/** Sécurité — changer mon code PIN. Simulé : la nouvelle valeur vit en session (voir lib/session),
 *  aucune persistance réelle au-delà de l'onglet. */
export function SecuriteView() {
  const { currentUser, verifyPin, setPin } = useSession();
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
    if (!verifyPin(currentUser.id, current)) {
      setError("Code actuel incorrect.");
      return;
    }
    if (next.length < 4) {
      setError("Le nouveau code doit faire 4 chiffres.");
      return;
    }
    if (next !== confirm) {
      setError("Les deux nouveaux codes ne correspondent pas.");
      return;
    }
    if (next === current) {
      setError("Le nouveau code doit être différent de l'actuel.");
      return;
    }
    setPin(currentUser.id, next);
    setError(null);
    reset();
    setToast("Votre code a été changé.");
  }

  return (
    <div className="flex max-w-sm flex-col gap-6">
      <div>
        <FieldLabel variant="plain" className="mb-2">
          Code actuel
        </FieldLabel>
        <InputOtp value={current} onChange={(v) => { setCurrent(v); setError(null); }} ariaLabel="Code actuel" />
      </div>

      <div>
        <FieldLabel variant="plain" className="mb-2">
          Nouveau code
        </FieldLabel>
        <InputOtp value={next} onChange={(v) => { setNext(v); setError(null); }} ariaLabel="Nouveau code" />
      </div>

      <div>
        <FieldLabel variant="plain" className="mb-2">
          Confirmer le nouveau code
        </FieldLabel>
        <InputOtp value={confirm} onChange={(v) => { setConfirm(v); setError(null); }} ariaLabel="Confirmer le nouveau code" />
      </div>

      {error && <p className="text-sm font-medium text-[var(--color-error)]">{error}</p>}

      <div>
        <Button
          type="button"
          variant="dark"
          onClick={submit}
          disabled={current.length < 4 || next.length < 4 || confirm.length < 4}
          className="w-auto"
        >
          Changer mon code
        </Button>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
