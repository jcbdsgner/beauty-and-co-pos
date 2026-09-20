"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/ui/atoms/logo";
import { Button } from "@/components/ui/atoms/button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Toast } from "@/components/ui/molecules/toast";
import { useSession } from "@/lib/session";

/**
 * Écran de verrouillage — plein écran, bloque l'app jusqu'à réauthentification (ADR 0026).
 * Démo : n'importe quelle adresse e-mail et mot de passe suffisent, aucune vérification réelle.
 */
export function LockScreen() {
  const { login } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function submit() {
    login();
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-end overflow-hidden bg-base-200">
      <Image
        src="/images/brand/lock-screen-spa.jpg"
        alt=""
        fill
        sizes="100vw"
        priority
        className="object-cover"
      />

      <Logo className="absolute left-10 top-10 h-16 w-16 shrink-0 overflow-hidden rounded-2xl shadow-lg" />

      <div className="relative z-10 mr-[clamp(2.5rem,17%,20rem)] flex w-full max-w-[540px] flex-col gap-8 rounded-[2.5rem] bg-base-100 px-10 py-11 shadow-2xl">
        <div>
          <p className="text-base text-base-content/70">
            Bienvenue chez <span className="font-semibold text-primary">Beauty and Co</span>
          </p>
          <h1 className="mt-1 font-heading text-4xl font-semibold text-base-content">Reconnexion</h1>
        </div>

        <form
          className="flex flex-col gap-5 pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <FieldLabel variant="plain" htmlFor="lock-email" className="mb-2">
              Adresse e-mail
            </FieldLabel>
            <TextInput
              id="lock-email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="vous@beautyandco.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel variant="plain" htmlFor="lock-password" className="mb-2">
              Mot de passe
            </FieldLabel>
            <div className="relative">
              <TextInput
                id="lock-password"
                type={revealed ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setRevealed((r) => !r)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 transition hover:text-base-content/70"
                aria-label={revealed ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <div className="mt-2 flex justify-end">
              {/* Démo : aucun flux de récupération réel, cf. commentaire ci-dessus. */}
              <button
                type="button"
                onClick={() => setToast("Fonctionnalité non disponible dans cette démo.")}
                className="text-sm font-medium text-primary hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </div>

          <div className="mt-2 flex justify-end">
            <Button
              type="submit"
              variant="brand"
              size="xl"
              className="shadow-[0px_4px_19px_rgba(136,102,102,0.35)]"
              disabled={!email || !password}
            >
              Se reconnecter
            </Button>
          </div>
        </form>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
