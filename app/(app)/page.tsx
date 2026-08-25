import Link from "next/link";
import { BarChart3, Calendar, CalendarCheck, CreditCard, QrCode, TrendingUp, Users } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { HeroNumber } from "@/components/ui/hero-number";
import { formatFCFA } from "@/lib/data/clients";
import { APPOINTMENTS_BY_DAY, TODAY_INDEX } from "@/lib/data/planning";

const QUICK_ACTIONS = [
  {
    href: "/suivi",
    label: "Relances clients",
    bg: "bg-[var(--brand-rose-soft)]",
    icon: <BarChart3 className="size-6 text-[var(--brand-taupe-muted)]" />,
  },
  {
    href: "/planning?vue=equipe",
    label: "Équipe",
    bg: "bg-[var(--brand-lilac)]/40",
    icon: <Users className="size-6 text-[var(--brand-taupe-muted)]" />,
  },
  {
    href: "/planning",
    label: "Planning",
    bg: "bg-[var(--color-gray-100)]",
    icon: <Calendar className="size-6 text-[var(--brand-taupe-muted)]" />,
  },
];

export default function AccueilPage() {
  const todaysAppointments = [...(APPOINTMENTS_BY_DAY[TODAY_INDEX] ?? [])].sort((a, b) =>
    a.start.localeCompare(b.start),
  );
  const nextAppointment = todaysAppointments[0];

  return (
    <div className="flex flex-col gap-8">
      <Topbar />

      <h1 className="font-[var(--font-heading)] text-3xl text-[var(--color-gray-900)]">Bonjour, Propriétaire</h1>

      <div className="grid grid-cols-3 items-stretch gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Link
            href="/vente"
            className="group relative flex min-h-[220px] flex-1 flex-col justify-between overflow-hidden rounded-3xl bg-[var(--pos-accent-dark)] p-8 text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] transition hover:opacity-95"
          >
            <span className="relative flex size-14 items-center justify-center rounded-full bg-white/15">
              <CreditCard className="size-6" />
            </span>
            <span className="relative">
              <span className="block text-2xl font-semibold">Nouvelle Vente</span>
              <span className="mt-1 block text-white/80">Un service ou un produit</span>
            </span>
          </Link>

          <Link
            href="/vente?scan=1"
            className="flex items-center gap-4 rounded-2xl bg-[var(--brand-rose-soft)] p-5 text-[var(--color-gray-900)] transition hover:opacity-90"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[var(--brand-taupe-muted)]">
              <QrCode className="size-6" />
            </span>
            <span>
              <span className="block text-lg font-semibold">Scanner un client</span>
              <span className="block text-sm text-[var(--color-gray-500)]">Identifier un client via sa carte de fidélité</span>
            </span>
          </Link>
        </div>

        <Card className="col-span-1 flex flex-col justify-between p-6">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
              <TrendingUp className="size-5 text-[var(--color-success)]" />
              Revenus
            </div>
            <HeroNumber label="" value={formatFCFA(0)} hint="Aucune vente pour l'instant" size="lg" />
          </div>

          <div className="border-t border-[var(--color-gray-200)] pt-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
              <CalendarCheck className="size-5 text-[var(--brand-taupe-muted)]" />
              Rendez-vous
            </div>
            {nextAppointment ? (
              <HeroNumber
                label=""
                value={String(todaysAppointments.length)}
                hint={`Prochain : ${nextAppointment.start} — ${nextAppointment.clientName} · ${nextAppointment.service}`}
                size="lg"
              />
            ) : (
              <HeroNumber label="" value="0" hint="Aucun rendez-vous pour l'instant" size="lg" />
            )}
          </div>
        </Card>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">Actions rapides</h2>
        <div className="grid grid-cols-3 gap-6">
          {QUICK_ACTIONS.map(({ href, label, bg, icon }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-gray-200)] bg-white p-8 text-center transition hover:border-[var(--brand-taupe-muted)]"
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
