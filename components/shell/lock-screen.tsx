"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/atoms/logo";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Card } from "@/components/ui/atoms/card";
import { Button } from "@/components/ui/atoms/button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { TextInput } from "@/components/ui/atoms/text-input";
import { useSession } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/data/utilisateurs";

/** Écran de verrouillage — plein écran, bloque l'app jusqu'à réauthentification (ADR 0026). */
export function LockScreen() {
  const { currentUser, photoUrl, login } = useSession();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!login(password)) {
      setError("Mot de passe incorrect.");
      setPassword("");
      return;
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-base-200 px-4">
      <Card className="flex w-full max-w-sm flex-col items-center gap-6 p-8">
        <Logo className="h-14 w-14 shrink-0" />

        <div className="flex flex-col items-center gap-3">
          <Avatar
            photoUrl={photoUrl}
            initial={currentUser.initial}
            size={72}
            className="bg-accent text-xl font-semibold text-secondary"
          />
          <div className="text-center">
            <p className="text-lg font-semibold text-base-content">{currentUser.name}</p>
            <p className="text-sm text-base-content/55">{ROLE_LABEL[currentUser.role]}</p>
          </div>
        </div>

        <form
          className="flex w-full flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <FieldLabel variant="plain" className="mb-2">
              Mot de passe
            </FieldLabel>
            <TextInput
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
            />
          </div>

          {error && <p className="text-sm font-medium text-error">{error}</p>}

          <Button type="submit" variant="dark" disabled={!password}>
            Se reconnecter
          </Button>
        </form>
      </Card>
    </div>
  );
}
