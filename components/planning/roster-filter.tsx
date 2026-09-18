"use client";

import { Eye, MoreHorizontal, Undo2, UserX } from "lucide-react";
import { Avatar } from "@/components/ui/atoms/avatar";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { DropdownMenu } from "@/components/ui/molecules/dropdown-menu";
import { ROLE_LABEL } from "@/lib/data/utilisateurs";
import { formatHour } from "@/lib/data/planning";
import { praticienneAccent } from "@/lib/data/praticienne-colors";
import { scheduleFor } from "@/lib/data/praticiennes";
import { cn } from "@/lib/utils";
import type { Praticienne, Role } from "@/lib/data/types";

/**
 * La sidebar de filtre du Planning (ADR 0020) — inspirée de la référence utilisateur (liste de
 * collaborateurs, avatar + case à cocher pour afficher/masquer sa ligne), groupée par rôle plutôt
 * qu'un rail de colonnes. Remplace « Voir seule » du `DayGrid` retiré par une action « Isoler ».
 */
const GROUP_ORDER: Role[] = ["coiffeuse", "estheticienne", "menage"];

type Props = {
  staff: Praticienne[];
  date: Date;
  visibleIds: Set<string>;
  isolatedId: string | null;
  onToggle: (id: string) => void;
  onIsolate: (id: string) => void;
  onShowAll: () => void;
  onMarkAbsent: (id: string) => void;
  isToday: boolean;
};

export function RosterFilter({ staff, date, visibleIds, isolatedId, onToggle, onIsolate, onShowAll, onMarkAbsent, isToday }: Props) {
  return (
    <aside className="flex w-[248px] shrink-0 flex-col gap-4 rounded-box border border-base-300 bg-base-100 p-3">
      {isolatedId && (
        <button
          type="button"
          onClick={onShowAll}
          className="flex items-center gap-1.5 self-start rounded-full bg-base-200 px-3 py-1.5 text-xs font-semibold text-base-content/70 transition active:scale-[0.97] hover:bg-base-300"
        >
          <Undo2 aria-hidden className="size-3.5" />
          Tout afficher
        </button>
      )}
      {GROUP_ORDER.map((role) => {
        const group = staff.filter((p) => p.role === role);
        if (group.length === 0) return null;
        return (
          <div key={role} className="flex flex-col gap-0.5">
            <p className="px-1.5 pb-1 text-[0.66rem] font-bold uppercase tracking-[0.1em] text-base-content/40">
              {ROLE_LABEL[role]}
            </p>
            {group.map((p) => {
              const hours = scheduleFor(p, date);
              const absent = isToday && p.unavailableToday;
              const checked = visibleIds.has(p.id);
              const accent = praticienneAccent(p.id);
              return (
                <div
                  key={p.id}
                  className={cn("flex items-center gap-2 rounded-field px-1.5 py-1.5 transition", !checked && "opacity-40")}
                  style={checked && !absent ? { backgroundColor: accent.bg } : undefined}
                >
                  <input
                    type="checkbox"
                    aria-label={`Afficher ${p.name}`}
                    checked={checked}
                    onChange={() => onToggle(p.id)}
                    className="checkbox checkbox-primary size-4 shrink-0"
                  />
                  <Avatar
                    initial={p.initial}
                    size={28}
                    className={cn("shrink-0 text-[0.68rem] font-semibold", absent && "bg-base-200 text-base-content/40")}
                    style={absent ? undefined : { backgroundColor: accent.dot, color: "#fff" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-base-content">{p.name}</p>
                    <p className={cn("truncate text-[0.68rem] tabular-nums", absent ? "font-semibold text-warning" : "text-base-content/45")}>
                      {absent ? "Absente" : hours ? `${formatHour(hours.start)}–${formatHour(hours.end)}` : "Repos"}
                    </p>
                  </div>
                  <DropdownMenu
                    align="end"
                    trigger={
                      <IconButton
                        aria-label={`Actions pour ${p.name}`}
                        className="size-7 shrink-0 rounded-full text-base-content/40 hover:bg-base-200"
                      >
                        <MoreHorizontal className="size-4" />
                      </IconButton>
                    }
                    items={[
                      { label: "Isoler cette ligne", icon: <Eye className="size-4" />, onSelect: () => onIsolate(p.id) },
                      ...(isToday
                        ? [
                            {
                              label: "Marquer absente aujourd'hui",
                              icon: <UserX className="size-4" />,
                              tone: "danger" as const,
                              disabled: absent,
                              onSelect: () => onMarkAbsent(p.id),
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </aside>
  );
}
