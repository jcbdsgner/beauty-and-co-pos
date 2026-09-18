"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/atoms/card";
import { Button } from "@/components/ui/atoms/button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Toast } from "@/components/ui/molecules/toast";
import { useSession } from "@/lib/session";

const MIN_LENGTH = 6;

type FieldKey = "current" | "next" | "confirm";

/** Champ mot de passe avec bascule afficher/masquer — utile au comptoir pour vérifier la saisie avant de valider. */
function PasswordField({
  value,
  onChange,
  revealed,
  onToggleReveal,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  revealed: boolean;
  onToggleReveal: () => void;
  autoComplete: string;
}) {
  return (
    <div className="relative">
      <TextInput
        type={revealed ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-11"
      />
      <button
        type="button"
        onClick={onToggleReveal}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 transition hover:text-base-content/70"
        aria-label={revealed ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

/** Sécurité — changer mon mot de passe. Simulé : la nouvelle valeur vit en session (voir lib/session),
 *  aucune persistance réelle au-delà de l'onglet. */
export function PasswordSection() {
  const { verifyPassword, setPassword } = useSession();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<FieldKey, boolean>>({
    current: false,
    next: false,
    confirm: false,
  });

  function toggleReveal(field: FieldKey) {
    setRevealed((r) => ({ ...r, [field]: !r[field] }));
  }

  function reset() {
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  const hasInput = current !== "" || next !== "" || confirm !== "";

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
          <PasswordField
            autoComplete="current-password"
            value={current}
            onChange={(v) => { setCurrent(v); setError(null); }}
            revealed={revealed.current}
            onToggleReveal={() => toggleReveal("current")}
          />
        </div>

        <div>
          <FieldLabel variant="plain" className="mb-2">
            Nouveau mot de passe
          </FieldLabel>
          <PasswordField
            autoComplete="new-password"
            value={next}
            onChange={(v) => { setNext(v); setError(null); }}
            revealed={revealed.next}
            onToggleReveal={() => toggleReveal("next")}
          />
          <p className="mt-1.5 text-xs text-base-content/55">{MIN_LENGTH} caractères minimum.</p>
        </div>

        <div>
          <FieldLabel variant="plain" className="mb-2">
            Confirmer le nouveau mot de passe
          </FieldLabel>
          <PasswordField
            autoComplete="new-password"
            value={confirm}
            onChange={(v) => { setConfirm(v); setError(null); }}
            revealed={revealed.confirm}
            onToggleReveal={() => toggleReveal("confirm")}
          />
        </div>

        {error && <p className="text-sm font-medium text-error">{error}</p>}

        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="dark"
            onClick={submit}
            disabled={!current || !next || !confirm}
            className="w-auto"
          >
            Changer mon mot de passe
          </Button>
          {hasInput && (
            <button
              type="button"
              onClick={() => { reset(); setError(null); }}
              className="text-sm font-medium text-base-content/55 underline-offset-2 transition hover:text-base-content hover:underline"
            >
              Annuler
            </button>
          )}
        </div>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </Card>
  );
}
