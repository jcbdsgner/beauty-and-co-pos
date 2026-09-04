"use client";

import { useRef, useState } from "react";
import { ImageIcon, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type UploadedFile = { name: string; sizeLabel: string; previewUrl?: string };

type FileUploadProps = {
  files: UploadedFile[];
  onAdd: (fileList: FileList) => void;
  onRemove: (name: string) => void;
  accept?: string;
  multiple?: boolean;
  hint?: string;
  className?: string;
};

/**
 * Rebuilt around what this component actually holds in this app: reference photos and product
 * shots, not arbitrary documents — a filename-and-size row told a caissière nothing about what
 * she'd just uploaded. Uploaded files now render as a grid of real image thumbnails (falling
 * back to a plain icon tile only when no preview exists yet), the way you'd lay out swatch cards
 * on a counter, not a file manager's list view.
 */
export function FileUpload({ files, onAdd, onRemove, accept = "image/*", multiple = true, hint = "PNG, JPG jusqu'à 10 Mo", className }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) onAdd(e.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition active:scale-[0.99]",
          dragOver ? "border-primary bg-accent" : "border-base-content/30 bg-base-200",
        )}
      >
        <UploadCloud aria-hidden className="size-8 text-primary" />
        <p className="text-sm font-semibold text-base-content/80">Touchez pour choisir une photo</p>
        <p className="text-xs text-base-content/45">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && onAdd(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {files.map((file) => (
            <li key={file.name} className="relative aspect-square overflow-hidden rounded-2xl border border-base-300 bg-white">
              {file.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob/object URL, not a Next Image asset
                <img src={file.previewUrl} alt={file.name} className="size-full object-cover" />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-1 bg-base-200 text-base-content/45">
                  <ImageIcon aria-hidden className="size-6" />
                  <span className="px-1 text-center text-[10px] leading-tight truncate">{file.name}</span>
                </div>
              )}
              {/* A 28px badge, not the app's usual 44px minimum: removing one photo from a small,
                  glanceable set is low-stakes and instantly reversible by re-adding it — the same
                  exception a photo app's own "remove from selection" badge makes. Generous gap-3
                  between tiles keeps a mis-tap from landing on the neighboring photo instead. */}
              <button
                type="button"
                onClick={() => onRemove(file.name)}
                aria-label={`Retirer ${file.name}`}
                className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition active:scale-90 active:bg-error"
              >
                <X aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
