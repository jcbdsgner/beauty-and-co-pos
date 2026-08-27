"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const TIME_FMT = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

/** Slim strip on the cream ground — the day's date and a live clock. The counter runs on time
 *  (appointments to the minute, change to give back), so it stays visible. The sale entry is no
 *  longer here — it is the full-width Comptoir bar docked at the foot of the working area. */
export function Header() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 20_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex h-12 shrink-0 items-center justify-end gap-3 px-8 text-sm text-[var(--color-gray-500)]">
      {now && (
        <>
          <span className="capitalize">{DATE_FMT.format(now)}</span>
          <span className="flex items-center gap-1.5 font-semibold tabular-nums text-[var(--color-gray-600)]">
            <Clock aria-hidden className="size-4" />
            {TIME_FMT.format(now)}
          </span>
        </>
      )}
    </header>
  );
}
