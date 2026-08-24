import { PageHeader } from "@/components/ui/page-header";
import { PhotoReferenceGrid } from "@/components/parametres/photo-reference-grid";

export default function PhotosReferencePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader backHref="/parametres" title="Photos de référence" align="center" />
      <PhotoReferenceGrid />
    </div>
  );
}
