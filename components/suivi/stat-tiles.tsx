import { Card } from "@/components/ui/card";
import { HeroNumber } from "@/components/ui/hero-number";
import { suiviStats } from "@/lib/data/suivi";

const STAT_ICON: Record<(typeof suiviStats)[number]["key"], string> = {
  late: "⚠️",
  today: "🕐",
  week: "📅",
  winback: "♡",
};

/** Rangée de 4 tuiles stats égales sous le bandeau "Tournée du matin". */
export function StatTiles() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {suiviStats.map((stat) => (
        <Card key={stat.key} className="p-5">
          <p className="mb-2 text-lg leading-none">{STAT_ICON[stat.key]}</p>
          <HeroNumber label={stat.label} value={stat.value} size="lg" />
        </Card>
      ))}
    </div>
  );
}
