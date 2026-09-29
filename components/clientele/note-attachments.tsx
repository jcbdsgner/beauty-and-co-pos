"use client";

import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, FileText, Paperclip, X } from "lucide-react";
import { CloseButton, IconButton } from "@/components/ui/atoms/icon-button";
import { cn } from "@/lib/utils";
import type { NoteAttachment } from "@/lib/data/types";

/** Photos et PDF : ce qu'on joint en salon (avant/après, réaction, ordonnance, test d'allergie). */
export const NOTE_ATTACHMENT_ACCEPT = "image/*,application/pdf";
const MAX_BYTES = 10 * 1024 * 1024;

let seq = 0;

/** « 245 Ko », « 1,2 Mo ». */
export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
}

/** Fichiers choisis → pièces jointes de session (object URL) ; ce qui n'est ni photo ni PDF, ou
 *  dépasse 10 Mo, est refusé et nommé. */
export function filesToAttachments(files: FileList | File[]): { accepted: NoteAttachment[]; refused: string[] } {
  const accepted: NoteAttachment[] = [];
  const refused: string[] = [];
  for (const file of Array.from(files)) {
    const image = file.type.startsWith("image/");
    if (!image && file.type !== "application/pdf") {
      refused.push(`${file.name} : seules les photos et les PDF se joignent.`);
      continue;
    }
    if (file.size > MAX_BYTES) {
      refused.push(`${file.name} : plus de 10 Mo.`);
      continue;
    }
    accepted.push({
      id: `att-${Date.now()}-${seq++}`,
      name: file.name,
      kind: image ? "image" : "document",
      size: file.size,
      url: URL.createObjectURL(file),
    });
  }
  return { accepted, refused };
}

/** « Joindre » — un trombone discret à côté de l'auteur ; ouvre le sélecteur (plusieurs fichiers). */
export function AttachButton({ onFiles }: { onFiles: (files: FileList) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        multiple
        accept={NOTE_ATTACHMENT_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-field px-3 text-sm font-semibold text-secondary transition hover:bg-base-200 active:scale-[0.97] outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
      >
        <Paperclip aria-hidden className="size-4" />
        Joindre
      </button>
    </>
  );
}

/** Les fichiers en attente dans la saisie — même rendu que dans la note, plus un × pour retirer. */
export function PendingAttachments({ items, onRemove }: { items: NoteAttachment[]; onRemove: (id: string) => void }) {
  if (items.length === 0) return null;
  return <AttachmentStrip attachments={items} onRemove={onRemove} />;
}

/** Les fichiers d'une note : photos en vignettes (agrandies au toucher), documents en pastilles. */
export function NoteAttachments({ attachments }: { attachments?: NoteAttachment[] }) {
  if (!attachments?.length) return null;
  return <AttachmentStrip attachments={attachments} />;
}

function AttachmentStrip({ attachments, onRemove }: { attachments: NoteAttachment[]; onRemove?: (id: string) => void }) {
  const images = attachments.filter((a) => a.kind === "image");
  const documents = attachments.filter((a) => a.kind === "document");
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-2">
      {images.map((a, i) => (
        <div key={a.id} className="group relative">
          <button
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Agrandir ${a.name}`}
            className="block size-16 overflow-hidden rounded-field border border-base-300 bg-base-200 transition active:scale-[0.97] outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- object URLs de session, pas optimisables */}
            <img src={a.url} alt="" className="size-full object-cover" />
          </button>
          {onRemove && <RemoveDot name={a.name} onClick={() => onRemove(a.id)} />}
        </div>
      ))}
      {documents.map((a) => (
        <div key={a.id} className="relative">
          <a
            href={a.url}
            target="_blank"
            rel="noreferrer"
            title={a.name}
            className="flex h-16 max-w-[15rem] items-center gap-2.5 rounded-field border border-base-300 bg-base-100 pr-4 pl-3 transition hover:bg-base-200 active:scale-[0.99] outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-secondary">
              <FileText aria-hidden className="size-4.5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-base-content">{a.name}</span>
              <span className="block text-xs text-base-content/55 tabular-nums">PDF · {formatFileSize(a.size)}</span>
            </span>
          </a>
          {onRemove && <RemoveDot name={a.name} onClick={() => onRemove(a.id)} />}
        </div>
      ))}
      <ImageViewer images={images} index={open} onIndex={setOpen} />
    </div>
  );
}

function RemoveDot({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    // Pastille visible de 24px, zone de toucher de 40px.
    <button
      type="button"
      onClick={onClick}
      aria-label={`Retirer ${name}`}
      className="absolute -top-3 -right-3 flex size-10 items-center justify-center outline-none"
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-base-content text-base-100 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.35)]">
        <X aria-hidden className="size-3.5" strokeWidth={2.5} />
      </span>
    </button>
  );
}

/** Lecture seule : Échap et un clic sur le fond ferment (rien à perdre), comme la visionneuse du
 *  Catalogue. ← → passent d'une photo à l'autre de la même note. */
function ImageViewer({ images, index, onIndex }: { images: NoteAttachment[]; index: number | null; onIndex: (i: number | null) => void }) {
  const count = images.length;
  const image = index !== null ? images[index] : undefined;

  useEffect(() => {
    if (index === null || count <= 1) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") onIndex((index! - 1 + count) % count);
      if (e.key === "ArrowRight") onIndex((index! + 1) % count);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, count, onIndex]);

  return (
    <DialogPrimitive.Root open={Boolean(image)} onOpenChange={(o) => !o && onIndex(null)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/85 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onClick={(e) => e.target === e.currentTarget && onIndex(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-10 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Title className="sr-only">{image?.name ?? "Photo"}</DialogPrimitive.Title>
          {image && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- object URLs de session */}
              <img src={image.url} alt={image.name} className="max-h-[78vh] max-w-[80vw] rounded-box object-contain shadow-[0_24px_64px_-12px_rgba(0,0,0,0.6)]" />
              <p className="text-sm text-white/75 tabular-nums">
                {image.name}
                {count > 1 && <span className="text-white/50"> · {index! + 1} / {count}</span>}
              </p>
            </>
          )}
          <CloseButton onClick={() => onIndex(null)} className="top-5 right-5 bg-white/10 text-white hover:bg-white/20" aria-label="Fermer la photo" />
          {count > 1 && index !== null && (
            <>
              <ViewerArrow side="left" onClick={() => onIndex((index - 1 + count) % count)} />
              <ViewerArrow side="right" onClick={() => onIndex((index + 1) % count)} />
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ViewerArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <IconButton
      onClick={onClick}
      aria-label={side === "left" ? "Photo précédente" : "Photo suivante"}
      className={cn(
        "absolute top-1/2 size-14 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90",
        side === "left" ? "left-6" : "right-6",
      )}
    >
      <Icon className="size-6" />
    </IconButton>
  );
}
