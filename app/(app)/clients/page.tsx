import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PeopleIcon } from "@/components/ui/icons";
import { ClientDirectory } from "@/components/clients/client-directory";

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Recherche Client"
        subtitle="Trouver un client existant ou ajouter un nouveau profil."
        action={
          <Button href="/clients/nouveau" icon={<PeopleIcon className="size-4" />}>
            Ajouter
          </Button>
        }
      />

      <ClientDirectory />
    </div>
  );
}
