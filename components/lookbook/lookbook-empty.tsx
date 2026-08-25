import { TagHeartIcon } from "@/components/ui/icons";

type LookbookEmptyProps = {
  /** Libellé de la catégorie active (ex. "Pédicure") — affiné dans le message quand un filtre précis est sélectionné. */
  categoryLabel?: string;
};

/** État vide affiché quand une catégorie ne contient encore aucun style/soin. */
export function LookbookEmpty({ categoryLabel }: LookbookEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--color-gray-300)] bg-white px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-[var(--color-gray-100)] text-[var(--color-gray-400)]">
        <TagHeartIcon className="size-5" />
      </span>
      <p className="text-sm font-medium text-[var(--color-gray-600)]">
        {categoryLabel
          ? `Aucun style "${categoryLabel}" pour le moment`
          : "Aucun style dans cette catégorie pour le moment"}
      </p>
      <p className="text-xs text-[var(--color-gray-400)]">Les prochains styles ajoutés apparaîtront ici.</p>
    </div>
  );
}
