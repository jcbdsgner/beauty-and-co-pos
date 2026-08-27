"use client";

import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type UploadedFile = { name: string; sizeLabel: string };

type FileUploadProps = {
  files: UploadedFile[];
  onAdd: (fileList: FileList) => void;
  onRemove: (name: string) => void;
  accept?: string;
  multiple?: boolean;
  hint?: string;
  className?: string;
};

/** Dashed dropzone for reference photos, product images, documents — drag-and-drop or click-to-browse, with a removable file chip list underneath. */
export function FileUpload({ files, onAdd, onRemove, accept = "image/*", multiple = true, hint = "PNG, JPG jusqu'à 10 Mo", className }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
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
          "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition",
          dragOver ? "border-[var(--brand-taupe-muted)] bg-[var(--brand-rose-soft)]" : "border-[var(--color-gray-300)] bg-[var(--color-gray-50)]",
        )}
      >
        <UploadCloud aria-hidden className="size-8 text-[var(--brand-taupe-muted)]" />
        <p className="text-sm font-semibold text-[var(--color-gray-700)]">Glissez un fichier ou cliquez pour parcourir</p>
        <p className="text-xs text-[var(--color-gray-400)]">{hint}</p>
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
        <ul className="flex flex-col gap-2">
          {files.map((file) => (
            <li
              key={file.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-gray-200)] bg-white px-3 py-2 text-sm"
            >
              <span className="truncate text-[var(--color-gray-800)]">{file.name}</span>
              <span className="flex shrink-0 items-center gap-2 text-xs text-[var(--color-gray-400)]">
                {file.sizeLabel}
                {/* Visible glyph stays small (a 44px icon would tower over the compact chip row),
                    but the actual tap target doesn't shrink with it — same invisible-hit-area
                    trick as Checkbox, via negative margin rather than a bigger row. */}
                <button
                  type="button"
                  onClick={() => onRemove(file.name)}
                  aria-label={`Retirer ${file.name}`}
                  className="-m-2.5 flex size-11 items-center justify-center rounded-full text-[var(--color-gray-400)] transition active:scale-90 active:bg-[var(--color-error-soft)] active:text-[var(--color-error)] hover:bg-[var(--color-error-soft)] hover:text-[var(--color-error)]"
                >
                  <X aria-hidden className="size-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
