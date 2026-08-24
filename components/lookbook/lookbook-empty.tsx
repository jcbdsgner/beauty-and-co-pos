import { TagHeartIcon } from "@/components/ui/icons";

/** État vide affiché quand une catégorie ne contient encore aucun style/soin. */
export function LookbookEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--color-gray-300)] bg-white px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-[var(--color-gray-100)] text-[var(--color-gray-400)]">
        <TagHeartIcon className="size-5" />
      </span>
      <p className="text-sm font-medium text-[var(--color-gray-600)]">Aucun style dans cette catégorie pour le moment</p>
    </div>
  );
}
