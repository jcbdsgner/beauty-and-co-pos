"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, LogIn, LogOut, ScanLine } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { Button } from "@/components/ui/atoms/button";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Dialog } from "@/components/ui/molecules/dialog";
import { Toast } from "@/components/ui/molecules/toast";
import { ScanCamera } from "@/components/shared/scan-camera";
import { useAppData } from "@/components/providers/app-data-provider";
import { shiftsAt, shiftsFor } from "@/lib/data/praticiennes";
import { salonById } from "@/lib/data/entreprises";
import { ROLE_LABEL } from "@/lib/data/utilisateurs";
import { POSTE_SALON_ID } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { Pointage, PointageKind, Praticienne } from "@/lib/data/types";

/** Côté du bloc Scanner — les alertes à côté prennent exactement cette hauteur. */
export const POINTAGE_BLOCK = "size-48";

/** Prototype : aucun badge ne porte encore de QR lisible. Sans détection réelle au bout de ce
 *  délai, la caméra « reconnaît » la première personne de l'équipe du jour pas encore arrivée —
 *  c'est le parcours qui compte pour la démo (même parti que le scan de carte cadeau). */
const DEMO_DETECT_MS = 2200;

const KIND_LABEL: Record<PointageKind, string> = { arrivee: "Arrivée", depart: "Départ" };

function clock(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

/** Le dernier pointage du jour de chaque membre de l'équipe. */
function lastTodayByStaff(pointages: Pointage[]): Map<string, Pointage> {
  const map = new Map<string, Pointage>();
  for (const p of pointages) if (isToday(p.at)) map.set(p.staffId, p);
  return map;
}

/** L'équipe attendue à ce poste aujourd'hui ; à défaut (salon fermé, poste sans planning) toute
 *  l'équipe qui travaille ce jour-là, puis toute l'équipe — on peut toujours pointer. */
function todayCrew(praticiennes: Praticienne[]): Praticienne[] {
  const today = new Date();
  const here = praticiennes.filter((p) => shiftsAt(p, today, POSTE_SALON_ID).length > 0);
  if (here.length > 0) return here;
  const working = praticiennes.filter((p) => shiftsFor(p, today).length > 0);
  return working.length > 0 ? working : praticiennes;
}

/**
 * Le bloc « Scanner » de l'Accueil (ADR 0040) — le pointage de l'équipe. Un grand carré en tête
 * de page : l'employée présente son badge, l'écran dit son nom, elle touche « Arrivée » ou
 * « Départ ». Sous le titre, le dernier pointage du jour, pour que la réceptionniste voie d'un coup
 * d'œil que le geste a bien été pris.
 */
export function AccueilPointage() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn(
          POINTAGE_BLOCK,
          "highlight-rose group flex shrink-0 flex-col items-center justify-center gap-4 rounded-box border bg-base-100 p-5 transition",
          "hover:bg-accent active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
        )}
      >
        <span className="flex size-20 items-center justify-center rounded-field bg-accent text-primary transition group-hover:bg-base-100">
          <ScanLine aria-hidden className="size-11" strokeWidth={1.5} />
        </span>
        <span className="font-[family-name:var(--font-heading)] text-xl leading-none font-semibold text-base-content">
          Scanner
        </span>
      </button>

      <PointageDialog
        open={open}
        onClose={() => setOpen(false)}
        onRecorded={(staff, pointage) => {
          setOpen(false);
          setToast(`${staff.name} — ${KIND_LABEL[pointage.kind].toLowerCase()} pointée à ${clock(pointage.at)}`);
        }}
      />
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}

function PointageDialog({
  open,
  onClose,
  onRecorded,
}: {
  open: boolean;
  onClose: () => void;
  onRecorded: (staff: Praticienne, pointage: Pointage) => void;
}) {
  const { praticiennes, pointages, recordPointage } = useAppData();
  const [staffId, setStaffId] = useState<string | null>(null);

  const crew = useMemo(() => todayCrew(praticiennes), [praticiennes]);
  const lastToday = useMemo(() => lastTodayByStaff(pointages), [pointages]);
  const staff = staffId ? praticiennes.find((p) => p.id === staffId) : undefined;
  const scanning = open && !staff;

  function close() {
    setStaffId(null);
    onClose();
  }

  function resolve(raw: string) {
    const value = raw.trim();
    const match = praticiennes.find((p) => p.id === value);
    const fallback = crew.find((p) => !lastToday.has(p.id)) ?? crew[0];
    const found = match ?? fallback;
    if (found) setStaffId(found.id);
  }

  // Démo : voir DEMO_DETECT_MS.
  useEffect(() => {
    if (!scanning) return;
    const timer = window.setTimeout(() => resolve(""), DEMO_DETECT_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  return (
    <Dialog open={open} labelledBy="pointage-title" className="relative max-w-md rounded-box p-6">
      <CloseButton onClick={close} />
      {staff ? (
        <Identified
          staff={staff}
          last={lastToday.get(staff.id)}
          onBack={() => setStaffId(null)}
          onChoose={(kind) => {
            const pointage = recordPointage(staff.id, kind);
            setStaffId(null);
            onRecorded(staff, pointage);
          }}
        />
      ) : (
        <>
          <h2 id="pointage-title" className="font-[family-name:var(--font-heading)] text-xl font-semibold text-base-content">
            Pointer une arrivée ou un départ
          </h2>
          <ScanCamera active={scanning} onDetect={resolve} hint="Présentez votre badge devant la caméra." />
        </>
      )}
    </Dialog>
  );
}

/** Le nom est dit, la personne choisit. Le geste attendu (arrivée si rien de pointé aujourd'hui,
 *  départ si elle est arrivée) est mis en avant, mais les deux restent disponibles — c'est elle qui
 *  sait (un départ en pause, un oubli le matin…). */
function Identified({
  staff,
  last,
  onBack,
  onChoose,
}: {
  staff: Praticienne;
  last: Pointage | undefined;
  onBack: () => void;
  onChoose: (kind: PointageKind) => void;
}) {
  const today = new Date();
  const shifts = shiftsFor(staff, today);
  const expected: PointageKind = last?.kind === "arrivee" ? "depart" : "arrivee";
  const schedule =
    shifts.length === 0
      ? "Repos prévu aujourd'hui"
      : shifts.map((s) => `${s.start} – ${s.end} · ${salonById(s.salonId)?.name ?? ""}`).join("  ·  ");

  return (
    <div className="flex flex-col items-center pt-2 text-center">
      <Avatar
        photoUrl={staff.photoUrl}
        initial={staff.initial}
        size={88}
        className="bg-accent text-2xl font-semibold text-secondary ring-4 ring-accent"
      />
      <h2
        id="pointage-title"
        className="mt-4 font-[family-name:var(--font-heading)] text-[26px] leading-tight font-bold text-base-content"
      >
        {staff.name}
      </h2>
      <p className="mt-1 text-sm text-base-content/60">{ROLE_LABEL[staff.role]}</p>
      <p className="mt-3 text-sm text-base-content/70 tabular-nums">{schedule}</p>
      <p className="mt-1 text-sm text-base-content/50 tabular-nums">
        {last ? `${KIND_LABEL[last.kind]} pointée à ${clock(last.at)}` : "Pas encore pointée aujourd'hui"}
      </p>

      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        {(["arrivee", "depart"] as const).map((kind) => (
          <Button
            key={kind}
            size="xl"
            variant={kind === expected ? "brand" : "outline"}
            icon={kind === "arrivee" ? <LogIn aria-hidden className="size-5" /> : <LogOut aria-hidden className="size-5" />}
            onClick={() => onChoose(kind)}
            autoFocus={kind === expected}
          >
            {KIND_LABEL[kind]}
          </Button>
        ))}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-3 inline-flex min-h-12 items-center gap-1 rounded-field px-3 text-sm font-semibold text-primary transition hover:bg-base-200"
      >
        <ChevronLeft aria-hidden className="size-4" />
        Ce n&apos;est pas moi
      </button>
    </div>
  );
}
