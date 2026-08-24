import { Button } from "@/components/ui/button";
import { HeartPulseIcon } from "@/components/ui/icons";
import { StatTiles } from "@/components/suivi/stat-tiles";
import { SuiviTabs } from "@/components/suivi/suivi-tabs";
import { TourneeBanner } from "@/components/suivi/tournee-banner";
import { tourneeDuMatin } from "@/lib/data/suivi";

export default function SuiviPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]">
            <HeartPulseIcon />
          </span>
          <div>
            <h1 className="font-[var(--font-heading)] text-2xl text-[var(--color-gray-900)]">Suivi</h1>
            <p className="mt-1 text-sm text-[var(--color-gray-500)]">
              La tournée du matin — chaque cliente, au bon moment
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Button variant="dark" href="/lookbook">
            ✨ Lookbook
          </Button>
          <Button variant="outline" href="/suivi/campagnes">
            📣 Campagnes
          </Button>
        </div>
      </div>

      <TourneeBanner
        messagesReady={tourneeDuMatin.messagesReady}
        toValidate={tourneeDuMatin.toValidate}
        discounts15={tourneeDuMatin.discounts15}
      />

      <StatTiles />

      <SuiviTabs />
    </div>
  );
}
