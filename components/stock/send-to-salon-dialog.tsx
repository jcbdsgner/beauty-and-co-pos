"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { PaperPlaneIcon } from "@/components/stock/icons";
import { TRANSFER_CATALOG, type Salon } from "@/lib/data/stock";
import { cn } from "@/lib/utils";

type TransferItem = { id: string; name: string; qty: number };

type SendToSalonDialogProps = {
  open: boolean;
  salons: Salon[];
  defaultSalonId?: string;
  onClose: () => void;
  onSend: (payload: { salonId: string; items: TransferItem[]; note: string }) => void;
};

/** Modale "Envoi vers salon" — selection du salon destinataire, liste locale de produits a transferer, note, CTA desactive tant que la liste est vide. */
export function SendToSalonDialog({ open, salons, defaultSalonId, onClose, onSend }: SendToSalonDialogProps) {
  const [salonId, setSalonId] = useState(defaultSalonId ?? salons[0]?.id ?? "");
  const [items, setItems] = useState<TransferItem[]>([]);
  const [note, setNote] = useState("");

  const availableToAdd = useMemo(
    () => TRANSFER_CATALOG.filter((p) => !items.some((item) => item.id === p.id)),
    [items],
  );

  const [productToAdd, setProductToAdd] = useState(availableToAdd[0]?.id ?? "");
  // Derived, not stored: falls back to the first still-available product whenever the
  // previous selection gets added to the transfer list (avoids a setState-in-effect sync).
  const selectedProductToAdd = availableToAdd.some((p) => p.id === productToAdd)
    ? productToAdd
    : (availableToAdd[0]?.id ?? "");

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  function reset() {
    setItems([]);
    setNote("");
  }

  function handleAdd() {
    const next = availableToAdd.find((p) => p.id === selectedProductToAdd) ?? availableToAdd[0];
    if (!next) return;
    setItems((prev) => [...prev, { id: next.id, name: next.name, qty: 1 }]);
  }

  function handleRemove(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleQtyChange(id: string, delta: number) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item)),
    );
  }

  function handleSend() {
    if (items.length === 0) return;
    onSend({ salonId, items, note });
    reset();
    onClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Dialog
      open={open}
      labelledBy="send-to-salon-title"
      className="max-h-[85vh] max-w-md overflow-y-auto rounded-3xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between">
        <h2 id="send-to-salon-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
          Envoi vers salon
        </h2>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fermer"
          className="flex size-8 items-center justify-center rounded-full border border-[var(--color-gray-200)] text-[var(--color-gray-500)] hover:bg-[var(--color-gray-50)]"
        >
          ×
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
            Salon destinataire
          </label>
          <select
            value={salonId}
            onChange={(e) => setSalonId(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-gray-200)] bg-white px-4 py-3 text-[15px] text-[var(--color-gray-900)] focus:border-[var(--brand-taupe-muted)] focus:outline-none"
          >
            {salons.map((salon) => (
              <option key={salon.id} value={salon.id}>
                {salon.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-[var(--color-gray-900)]">
            Produits a envoyer ({items.length})
          </p>

          {availableToAdd.length > 0 && (
            <div className="mb-3 flex items-center gap-2">
              <select
                value={selectedProductToAdd}
                onChange={(e) => setProductToAdd(e.target.value)}
                aria-label="Choisir un produit a ajouter"
                className="w-full rounded-xl border border-[var(--color-gray-200)] bg-white px-3 py-2.5 text-sm text-[var(--color-gray-900)] focus:border-[var(--brand-taupe-muted)] focus:outline-none"
              >
                {availableToAdd.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-gray-200)] px-3 py-2.5 text-xs font-semibold text-[var(--pos-accent-dark)] hover:bg-[var(--brand-rose-soft)]"
              >
                <PlusIcon /> Ajouter
              </button>
            </div>
          )}

          {items.length === 0 ? (
            <EmptyState
              icon={<PlusIcon className="size-12" />}
              title="Ajoutez des produits a transférer"
              className="rounded-2xl bg-[var(--color-gray-50)] py-10"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-[var(--color-gray-200)] px-3 py-2"
                >
                  <span className="text-sm text-[var(--color-gray-900)]">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full border border-[var(--color-gray-200)]">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, -1)}
                        disabled={item.qty <= 1}
                        aria-label={`Diminuer la quantite de ${item.name}`}
                        className="flex size-6 items-center justify-center rounded-full text-[var(--color-gray-600)] hover:bg-[var(--color-gray-100)] disabled:pointer-events-none disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-xs font-medium text-[var(--color-gray-900)]">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, 1)}
                        aria-label={`Augmenter la quantite de ${item.name}`}
                        className="flex size-6 items-center justify-center rounded-full text-[var(--color-gray-600)] hover:bg-[var(--color-gray-100)]"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      aria-label={`Retirer ${item.name}`}
                      className="flex size-6 items-center justify-center rounded-full text-[var(--color-error)] hover:bg-[#fdece9]"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
            Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Raison de l'approvisionnement..."
            rows={3}
            className="w-full resize-none rounded-xl border border-[var(--color-gray-200)] bg-white px-4 py-3 text-[15px] text-[var(--color-gray-900)] placeholder:text-[var(--color-gray-400)] focus:border-[var(--brand-taupe-muted)] focus:outline-none"
          />
        </div>

        <Button
          variant="brand"
          icon={<PaperPlaneIcon />}
          className={cn("w-full", items.length === 0 && "pointer-events-none opacity-40")}
          disabled={items.length === 0}
          onClick={handleSend}
        >
          Envoyer au salon
        </Button>
      </div>
    </Dialog>
  );
}
