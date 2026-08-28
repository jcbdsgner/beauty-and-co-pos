"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const TIME_FMT = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

/**
 * Slim strip on the cream ground — just a live clock. The counter runs to the minute
 * (rendez-vous, change to give back), so the time stays visible; the date now lives on each
 * section's board header, no longer doubled here.
 */
export function Header() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Clock: the value must come from the client (SSR has no "now"), so the first read
    // necessarily lands in this effect. Subsequent ticks come from the interval.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 20_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex h-11 shrink-0 items-center justify-end gap-1.5 px-8 text-sm text-[var(--color-gray-500)]">
      <Clock aria-hidden className="size-4" />
      <span className="font-semibold tabular-nums text-[var(--color-gray-600)]">{now ? TIME_FMT.format(now) : "—"}</span>
    </header>
  );
}
