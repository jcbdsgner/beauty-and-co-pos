import { PageHeader } from "@/components/ui/page-header";
import { CompanyAccordion } from "@/components/parametres/company-accordion";

export default function EntreprisesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader backHref="/parametres" title="Entreprises & Salons" subtitle="Gerer les entreprises et leurs salons" />
      <CompanyAccordion />
    </div>
  );
}
