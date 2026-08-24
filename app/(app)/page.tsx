import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { HeroNumber } from "@/components/ui/hero-number";

function CreditCardIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10.5h18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <rect x="3.5" y="3.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14.5 14.5h2.5v2.5M20.5 14.5v2.5h-2.5M14.5 20.5h2.5M20.5 20.5v-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TrendUpIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-5 text-[var(--color-success)]">
      <path d="M3 16l6-6 4 4 8-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarCheckIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-5 text-[var(--brand-taupe-muted)]">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 10.5l2.5 2.5L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const QUICK_ACTIONS = [
  {
    href: "/suivi",
    label: "Recap ventes",
    bg: "bg-[var(--brand-rose-soft)]",
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6 text-[var(--brand-taupe-muted)]">
        <path d="M5 19V10M12 19V5M19 19v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/planning?vue=equipe",
    label: "Equipe",
    bg: "bg-[var(--brand-lilac)]/40",
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6 text-[var(--brand-taupe-muted)]">
        <path d="M6 4l1 16M18 4l-1 16M6 4h12M7 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/planning",
    label: "Planning",
    bg: "bg-[var(--color-gray-100)]",
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6 text-[var(--brand-taupe-muted)]">
        <rect x="3.5" y="5.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function AccueilPage() {
  return (
    <div className="flex flex-col gap-8">
      <Topbar />

      <h1 className="font-[var(--font-heading)] text-3xl text-[var(--color-gray-900)]">Bonjour, Proprietaire</h1>

      <div className="flex flex-col gap-4">
        <Link
          href="/vente"
          className="flex items-center gap-4 rounded-2xl bg-[var(--pos-accent-dark)] p-5 text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] transition hover:opacity-95"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15">
            <CreditCardIcon />
          </span>
          <span>
            <span className="block text-lg font-semibold">Nouvelle Vente</span>
            <span className="block text-sm text-white/80">Demarrer une nouvelle transaction</span>
          </span>
        </Link>

        <Link
          href="/vente?scan=1"
          className="flex items-center gap-4 rounded-2xl bg-[var(--brand-rose-soft)] p-5 text-[var(--color-gray-900)] transition hover:opacity-90"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[var(--brand-taupe-muted)]">
            <QrIcon />
          </span>
          <span>
            <span className="block text-lg font-semibold">Scanner un client</span>
            <span className="block text-sm text-[var(--color-gray-500)]">QR code carte de fidelite</span>
          </span>
        </Link>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">Performance du jour</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
              <TrendUpIcon />
              Revenus
            </div>
            <HeroNumber label="" value="0" />
          </Card>
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
              <CalendarCheckIcon />
              RDV
            </div>
            <HeroNumber label="" value="0" hint="0 ventes" />
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">Actions rapides</h2>
        <div className="grid grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(({ href, label, bg, icon }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-gray-200)] bg-white p-6 text-center transition hover:border-[var(--brand-taupe-muted)]"
            >
              <span className={`flex size-12 items-center justify-center rounded-full ${bg}`}>{icon}</span>
              <span className="text-sm font-medium text-[var(--color-gray-800)]">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
