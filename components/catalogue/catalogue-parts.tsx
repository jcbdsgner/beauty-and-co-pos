"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { PhotoPlaceholder } from "@/components/ui/atoms/photo-placeholder";
import { formatFcfa } from "@/lib/utils";

/**
 * Grammaire visuelle propre au Catalogue (ADR 0021) — une vitrine (cartes flottantes, ombre
 * portée) plutôt que le tableau à rainures de « Le Tableau » (`components/ui/board.tsx`) utilisé
 * ailleurs. Volontairement distincte : ce module n'encaisse rien, il se feuillette.
 */

/* ── Switch de volet (pilule à 2 options, dans l'en-tête) ──────────────── */

export function CatalogueSwitch<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex shrink-0 gap-1 rounded-full border border-base-300 bg-white p-1 shadow-sm">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition",
              active ? "bg-primary text-primary-content shadow-sm" : "text-base-content/55 hover:text-base-content",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Rail de catégories (nav verticale, sticky) ─────────────────────────── */

export function CategoryRail({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; count: number }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <nav className="flex shrink-0 gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] sm:sticky sm:top-0 sm:w-[212px] sm:flex-col sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              "flex shrink-0 items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition",
              active ? "bg-primary text-primary-content shadow-sm" : "text-base-content/65 hover:bg-white hover:shadow-sm",
            )}
          >
            <span className="truncate">{o.label}</span>
            <span className={cn("shrink-0 text-xs tabular-nums", active ? "text-primary-content/70" : "text-base-content/35")}>
              {o.count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ── Pilules secondaires (gammes) ───────────────────────────────────────── */

export function SubFilter({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5 [mask-image:linear-gradient(to_right,black_88%,transparent_100%)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[0.8rem] font-semibold transition",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-base-300 bg-white text-base-content/55 hover:border-base-content/20",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Carte produit / boisson (vitrine — maquette Figma 260-1260) ────────── */

export function CatalogueCard({
  name,
  price,
  image,
  imageBg = "bg-base-200",
  description,
  footer,
  onOpen,
}: {
  name: string;
  price: number;
  image?: string;
  imageBg?: string;
  description?: string;
  footer?: React.ReactNode;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col overflow-clip rounded-lg bg-white text-left shadow-[0px_30px_30px_0px_rgba(0,0,0,0.04),0px_7px_16px_0px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0px_30px_30px_0px_rgba(0,0,0,0.06),0px_7px_16px_0px_rgba(0,0,0,0.08)]"
    >
      <div className={cn("relative aspect-square shrink-0", imageBg)}>
        {image ? (
          <Image src={image} alt={name} fill sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw" className="object-cover" />
        ) : (
          <PhotoPlaceholder className="size-full rounded-none border-0" label="Photo à venir" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-base-content">{name}</p>
        <p className="text-sm font-semibold tabular-nums text-primary">{formatFcfa(price)}</p>
        {description && <p className="line-clamp-2 text-xs leading-snug text-base-content/55">{description}</p>}
        {footer}
      </div>
    </button>
  );
}

/* ── Statut de stock (point + libellé) ──────────────────────────────────── */

export function StockLine({ stock }: { stock: number }) {
  const out = stock <= 0;
  const low = !out && stock <= 5;
  return (
    <span className="mt-auto flex items-center gap-1.5 pt-1.5 text-xs font-semibold tabular-nums">
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          out ? "bg-error" : low ? "bg-warning" : "bg-success",
        )}
      />
      <span className={cn(out ? "text-error" : low ? "text-warning" : "text-base-content/45")}>
        {out ? "Rupture de stock" : `${stock} en stock`}
      </span>
    </span>
  );
}

/* ── Petites pastilles de synthèse (rupture / à réapprovisionner) ───────── */

export function StatPill({
  tone,
  active,
  onClick,
  children,
}: {
  tone: "error" | "warning";
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tabular-nums transition",
        tone === "error"
          ? active
            ? "bg-error text-error-content"
            : "bg-error/10 text-error hover:bg-error/20"
          : active
            ? "bg-warning text-warning-content"
            : "bg-warning/10 text-warning hover:bg-warning/20",
      )}
    >
      {children}
    </button>
  );
}

/* ── Vide ────────────────────────────────────────────────────────────────── */

export function CatalogueEmpty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-3xl border border-dashed border-base-300 px-6 py-16 text-center">
      <p className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-[0.1em] text-base-content/45">
        {title}
      </p>
      {hint && <p className="max-w-sm text-sm text-base-content/50">{hint}</p>}
    </div>
  );
}
