"use client";

import { useMemo, useState } from "react";
import { Board, Lane, BoardEmpty, ChipFilter, Legend } from "@/components/ui/board";
import { Button } from "@/components/ui/atoms/button";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { BeautyTipFormDialog } from "@/components/relances/beauty-tip-form-dialog";
import { PencilIcon, TrashIcon, PlusIcon } from "@/components/ui/atoms/icons";
import { BEAUTY_TIPS } from "@/lib/data/conseils";
import type { BeautyTip } from "@/lib/data/types";

let uid = 0;
const nextId = () => `tip-${Date.now()}-${(uid += 1)}`;

/**
 * Contenu conseillère — le savoir injecté dans les messages de la conseillère virtuelle : conseils
 * par famille de soin. Volet rare-édition. Les délais et textes de relance par prestation (J+N)
 * sont annoncés « bientôt » plutôt qu'un faux écran tant que le modèle n'existe pas.
 */
export function ContenuConseillereTab() {
  const [tips, setTips] = useState<BeautyTip[]>(BEAUTY_TIPS);
  const [family, setFamily] = useState("toutes");
  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<BeautyTip | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BeautyTip | null>(null);

  const families = useMemo(() => Array.from(new Set(tips.map((t) => t.family))), [tips]);
  const options = [{ value: "toutes", label: "Toutes" }, ...families.map((f) => ({ value: f, label: f }))];
  const filtered = family === "toutes" ? tips : tips.filter((t) => t.family === family);

  return (
    <div className="flex flex-col gap-6">
      <Board
        legend={`${tips.length} conseil${tips.length > 1 ? "s" : ""}`}
        legendRight={
          <div className="flex items-center gap-2">
            <ChipFilter options={options} value={family} onChange={setFamily} />
            <Button
              size="sm"
              variant="dark"
              icon={<PlusIcon />}
              onClick={() => { setMode("add"); setEditing(null); setFormOpen(true); }}
            >
              Ajouter
            </Button>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <BoardEmpty title="Aucun conseil dans cette famille" />
        ) : (
          filtered.map((tip) => (
            <Lane
              key={tip.id}
              title={tip.title}
              meta={
                <span className="flex flex-col gap-0.5">
                  <span className="text-[var(--brand-taupe-muted)]">{tip.family}</span>
                  <span className="line-clamp-2">{tip.body}</span>
                </span>
              }
              className="items-start py-3"
              actions={
                <>
                  <IconButton
                    aria-label={`Modifier ${tip.title}`}
                    onClick={() => { setMode("edit"); setEditing(tip); setFormOpen(true); }}
                    className="size-11 rounded-full text-[var(--color-gray-400)] transition active:scale-90 hover:bg-[var(--brand-rose-soft)] hover:text-[var(--brand-taupe-muted)]"
                  >
                    <PencilIcon />
                  </IconButton>
                  <IconButton
                    aria-label={`Supprimer ${tip.title}`}
                    onClick={() => setPendingDelete(tip)}
                    className="size-11 rounded-full text-[var(--color-gray-400)] transition active:scale-90 hover:bg-[var(--color-error-soft)] hover:text-[var(--color-error)]"
                  >
                    <TrashIcon />
                  </IconButton>
                </>
              }
            />
          ))
        )}
      </Board>

      <Board legend="Cycles de relance par prestation" tone="now">
        <div className="flex flex-col gap-1 px-5 py-6">
          <Legend>Bientôt</Legend>
          <p className="max-w-lg text-sm text-[var(--color-gray-600)]">
            {"Les délais et textes de relance par prestation (rappel J+N après un soin) arriveront avec un vrai modèle de cycle — rien n'est simulé ici en attendant."}
          </p>
        </div>
      </Board>

      <BeautyTipFormDialog
        open={formOpen}
        mode={mode}
        tip={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={(values) => {
          if (mode === "add") setTips((prev) => [...prev, { ...values, id: nextId() }]);
          else if (editing) setTips((prev) => prev.map((t) => (t.id === editing.id ? { ...values, id: editing.id } : t)));
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
