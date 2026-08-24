import { PageHeader } from "@/components/ui/page-header";
import { NewClientForm } from "@/components/clients/new-client-form";

export default function NewClientPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <PageHeader backHref="/clients" title="Nouveau Client" />
      <NewClientForm />
    </div>
  );
}
