"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/atoms/card";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { useSession } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/data/utilisateurs";

const MAX_SIDE = 400;

/** Redimensionne côté client avant stockage — l'avatar n'est jamais affiché plus grand que 56px,
 *  inutile de garder une photo de plusieurs Mo en session. */
function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(objectUrl);
      if (!ctx) {
        reject(new Error("canvas indisponible"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("image illisible"));
    };
    img.src = objectUrl;
  });
}

/** Photo de profil — changer ou retirer l'avatar. Simulée, stockée en session (voir lib/session). */
export function PhotoSection() {
  const { currentUser, photoUrl, setPhotoUrl } = useSession();
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const dataUrl = await resizeToDataUrl(file);
      setPhotoUrl(dataUrl);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="flex max-w-lg flex-col gap-5 p-6">
      <FieldLabel>Photo de profil</FieldLabel>
      <div className="flex items-center gap-4">
        <Avatar
          photoUrl={photoUrl}
          initial={currentUser.initial}
          size={72}
          className="bg-accent text-xl font-semibold text-secondary"
        />
        <div className="min-w-0">
          <p className="text-lg font-semibold text-base-content">{currentUser.name}</p>
          <p className="text-sm text-base-content/55">{ROLE_LABEL[currentUser.role]}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy} className="w-auto">
          {busy ? "Chargement…" : "Changer la photo"}
        </Button>
        {photoUrl && (
          <button
            type="button"
            onClick={() => setPhotoUrl(null)}
            className="text-sm font-medium text-base-content/55 underline-offset-2 transition hover:text-error hover:underline"
          >
            Retirer la photo
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />
    </Card>
  );
}
