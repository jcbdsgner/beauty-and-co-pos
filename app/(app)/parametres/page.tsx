import { PageHeader } from "@/components/ui/page-header";
import { SettingsProfileCard, SettingsHubGrid } from "@/components/parametres/settings-hub-grid";

export default function ParametresPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Paramètres" />
      <SettingsProfileCard />
      <SettingsHubGrid />
    </div>
  );
}
