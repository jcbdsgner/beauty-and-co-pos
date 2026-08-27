"use client";

import { useMemo, useState } from "react";
import { Pills } from "@/components/ui/molecules/pills";
import { Card } from "@/components/ui/atoms/card";
import { Button } from "@/components/ui/atoms/button";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { BeautyTipFormDialog } from "@/components/reglages/beauty-tip-form-dialog";
import { PencilIcon, TrashIcon, PlusIcon } from "@/components/ui/atoms/icons";
import { BEAUTY_TIPS } from "@/lib/data/conseils";
import type { BeautyTip } from "@/lib/data/types";

let uid = 0;
function nextId(prefix: string) {
  uid += 1;
  return `${prefix}-${Date.now()}-${uid}`;
}

/**
 * Conseils & cycles de relance — already the most complete module on validation/édition
 * (kept as-is conceptually), except deletion now goes through ConfirmDialog: today it deletes
 * immediately, and that's the one real bug this module carries into the rebuild.
 */
export function ConseilsCyclesTab() {
  const [tips, setTips] = useState<BeautyTip[]>(BEAUTY_TIPS);
  const [family, setFamily] = useState("toutes");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<BeautyTip | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BeautyTip | null>(null);

  const families = useMemo(() => Array.from(new Set(tips.map((t) => t.family))), [tips]);
  const familyOptions = [{ value: "toutes", label: "Toutes" }, ...families.map((f) => ({ value: f, label: f }))];
  const filtered = family === "toutes" ? tips : tips.filter((t) => t.family === family);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Pills options={familyOptions} value={family} onChange={setFamily} />
        <Button
          type="button"
          variant="dark"
          icon={<PlusIcon />}
          onClick={() => {
            setFormMode("add");
            setEditing(null);
            setFormOpen(true);
          }}
          className="w-auto shrink-0"
        >
          Ajouter un conseil
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--color-gray-200)] py-10 text-center text-sm text-[var(--color-gray-400)]">
          Aucun conseil dans cette famille.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((tip) => (
            <Card key={tip.id} className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-xs font-semibold tracking-wide text-[var(--brand-taupe-muted)] uppercase">{tip.family}</p>
                <p className="mt-1 text-[15px] font-semibold text-[var(--color-gray-900)]">{tip.title}</p>
                <p className="mt-1 text-sm text-[var(--color-gray-600)]">{tip.body}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <IconButton
                  aria-label={`Modifier ${tip.title}`}
                  onClick={() => {
                    setFormMode("edit");
                    setEditing(tip);
                    setFormOpen(true);
                  }}
                  className="size-11 rounded-full text-[var(--color-gray-400)] transition active:scale-90 active:bg-[var(--brand-rose-soft)] active:text-[var(--brand-taupe-muted)] hover:bg-[var(--brand-rose-soft)] hover:text-[var(--brand-taupe-muted)]"
                >
                  <PencilIcon />
                </IconButton>
                <IconButton
                  aria-label={`Supprimer ${tip.title}`}
                  onClick={() => setPendingDelete(tip)}
                  className="size-11 rounded-full text-[var(--color-gray-400)] transition active:scale-90 active:bg-[var(--color-error-soft)] active:text-[var(--color-error)] hover:bg-[var(--color-error-soft)] hover:text-[var(--color-error)]"
                >
                  <TrashIcon />
                </IconButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      <BeautyTipFormDialog
        open={formOpen}
        mode={formMode}
        tip={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={(values) => {
          if (formMode === "add") {
            setTips((prev) => [...prev, { ...values, id: nextId("tip") }]);
          } else if (editing) {
            setTips((prev) => prev.map((t) => (t.id === editing.id ? { ...values, id: editing.id } : t)));
          }
          setFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Supprimer ce conseil ?"
        description={pendingDelete ? `« ${pendingDelete.title} » sera retiré définitivement.` : undefined}
        confirmLabel="Supprimer"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) setTips((prev) => prev.filter((t) => t.id !== pendingDelete.id));
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
