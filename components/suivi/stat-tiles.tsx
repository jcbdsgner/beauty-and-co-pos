import { Calendar, Clock, Heart, TriangleAlert, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { HeroNumber } from "@/components/ui/hero-number";
import { suiviStats } from "@/lib/data/suivi";

const STAT_ICON: Record<(typeof suiviStats)[number]["key"], LucideIcon> = {
  late: TriangleAlert,
  today: Clock,
  week: Calendar,
  winback: Heart,
};

/** Rangée de 4 tuiles stats égales sous le bandeau "Tournée du matin". */
export function StatTiles() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {suiviStats.map((stat) => {
        const Icon = STAT_ICON[stat.key];
        return (
          <Card key={stat.key} className="p-5">
            <Icon aria-hidden className="mb-2 size-5 text-[var(--color-gray-400)]" />
            <HeroNumber label={stat.label} value={stat.value} size="lg" />
          </Card>
        );
      })}
    </div>
  );
}
