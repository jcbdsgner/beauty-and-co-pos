"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import { InputOtp } from "@/components/ui/molecules/input-otp";
import { useSession } from "@/lib/session";
import { ROLE_LABEL, UTILISATEURS } from "@/lib/data/utilisateurs";

type SwitchUserDialogProps = {
  open: boolean;
  onClose: () => void;
};

/** Changer d'utilisateur — choisir la personne au poste puis saisir son code PIN (simulé). */
export function SwitchUserDialog({ open, onClose }: SwitchUserDialogProps) {
  return (
    <Dialog open={open} labelledBy="switch-user-title" className="relative w-full max-w-md rounded-3xl p-6">
      {open && <SwitchUserForm onClose={onClose} />}
    </Dialog>
  );
}

function SwitchUserForm({ onClose }: { onClose: () => void }) {
  const { currentUser, switchUser, verifyPin } = useSession();
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const picked = pickedId ? UTILISATEURS.find((u) => u.id === pickedId) ?? null : null;

  function confirm() {
    if (!picked) return;
    if (!verifyPin(picked.id, pin)) {
      setError("Code incorrect — réessayez.");
      setPin("");
      return;
    }
    switchUser(picked.id);
    onClose();
  }

  return (
    <>
      <CloseButton onClick={onClose} />
      <h2 id="switch-user-title" className="font-[family-name:var(--font-heading)] font-semibold text-xl text-base-content">
        {picked ? `Code de ${picked.name}` : "Changer d'utilisateur"}
      </h2>

      {!picked ? (
        <ul className="mt-5 flex flex-col gap-2">
          {UTILISATEURS.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => {
                  setPickedId(u.id);
                  setError(null);
                }}
                disabled={u.id === currentUser.id}
                className="flex w-full items-center gap-3 rounded-2xl border border-base-300 bg-white px-4 py-3 text-left transition active:scale-[0.98] hover:border-primary disabled:opacity-40"
              >
                <Avatar initial={u.initial} size={36} className="bg-accent font-semibold text-secondary" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-base-content">{u.name}</span>
                  <span className="block text-xs text-base-content/55">
                    {ROLE_LABEL[u.role]}
                    {u.id === currentUser.id && " · au poste"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          <InputOtp value={pin} onChange={(v) => { setPin(v); setError(null); }} onComplete={confirm} ariaLabel={`Code de ${picked.name}`} />
          {error && <p className="text-sm font-medium text-error">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => { setPickedId(null); setPin(""); setError(null); }} className="flex-1">
              Retour
            </Button>
            <Button type="button" variant="dark" onClick={confirm} disabled={pin.length < 4} className="flex-1">
              Prendre le poste
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
