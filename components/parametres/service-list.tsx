"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Pills, type PillOption } from "@/components/ui/pills";
import { SearchInput } from "@/components/ui/search-input";
import { Switch } from "@/components/ui/switch";
import { PencilIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import {
  COMPANY_OPTIONS,
  formatFCFA,
  SERVICE_CATEGORY_OPTIONS,
  SERVICES,
  type Service,
  type ServiceCategoryValue,
} from "@/lib/data/parametres-catalogue";

const CATEGORY_PILLS: PillOption[] = [
  { value: "tous", label: "Tous" },
  ...SERVICE_CATEGORY_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
];

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-full border border-[var(--color-gray-200)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-gray-700)] focus:border-[var(--brand-taupe-muted)] focus:outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-rose-soft)] text-lg">
        ✨
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-[15px] font-semibold text-[var(--color-gray-900)]", !service.active && "text-[var(--color-gray-400)]")}>
          {service.name}
        </p>
        <div className="mt-1 flex items-center gap-3 text-sm">
          <span className="font-bold text-[var(--brand-taupe-muted)]">{formatFCFA(service.price)}</span>
          <span className="inline-flex items-center gap-1 text-[var(--color-gray-500)]">
            <ClockIcon /> {service.durationMin} min
          </span>
        </div>
      </div>
      <button
        type="button"
        aria-label={`Modifier ${service.name}`}
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--color-gray-400)] hover:bg-[var(--color-gray-100)] hover:text-[var(--brand-taupe-muted)]"
      >
        <PencilIcon />
      </button>
    </Card>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-3.5">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ServiceCategoriesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const counts = useMemo(() => {
    const map = new Map<ServiceCategoryValue, number>();
    for (const service of SERVICES) map.set(service.category, (map.get(service.category) ?? 0) + 1);
    return map;
  }, []);

  return (
    <Dialog
      open={open}
      labelledBy="service-categories-title"
      className="max-h-[85vh] max-w-md overflow-y-auto rounded-3xl"
    >
      <div className="flex justify-center pt-3">
        <div className="h-1 w-10 rounded-full bg-[var(--color-gray-200)]" />
      </div>
      <div className="flex items-start justify-between px-6 pt-4">
        <div>
          <h2 id="service-categories-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
            Categories de services
          </h2>
          <p className="mt-1 text-sm text-[var(--color-gray-500)]">Liste des catégories disponibles</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--color-gray-400)] hover:bg-[var(--color-gray-100)]"
        >
          ✕
        </button>
      </div>
      <ul className="space-y-2 px-6 py-5">
        {SERVICE_CATEGORY_OPTIONS.map((category) => (
          <li key={category.value}>
            <Card className="flex items-center justify-between px-4 py-3">
              <span className="text-[15px] font-medium text-[var(--color-gray-800)]">{category.label}</span>
              <span className="text-sm text-[var(--color-gray-400)]">{counts.get(category.value) ?? 0}</span>
            </Card>
          </li>
        ))}
      </ul>
      <div className="px-6 pb-6">
        <Button variant="outline" onClick={onClose} className="w-full">
          Fermer
        </Button>
      </div>
    </Dialog>
  );
}

/** Orchestrateur client de "Gestion Services" : entreprise, recherche, filtre catégorie, switch
 * inactifs, liste groupée par sous-catégorie. */
export function ServiceList() {
  const [company, setCompany] = useState(COMPANY_OPTIONS[0].value);
  const [category, setCategory] = useState("tous");
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SERVICES.filter((service) => {
      if (!showInactive && !service.active) return false;
      if (category !== "tous" && service.category !== category) return false;
      if (q && !service.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [category, query, showInactive]);

  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, Service[]>();
    for (const service of filtered) {
      if (!map.has(service.groupLabel)) {
        map.set(service.groupLabel, []);
        order.push(service.groupLabel);
      }
      map.get(service.groupLabel)!.push(service);
    }
    return order.map((label) => ({ label, services: map.get(label)! }));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/parametres"
        title="Gestion Services"
        subtitle="Categories, prix, durees"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCategoriesOpen(true)}>
              ⇄ Categories
            </Button>
            <Button variant="brand" icon={<span aria-hidden>+</span>}>
              Ajouter
            </Button>
          </div>
        }
      />

      <SelectField value={company} onChange={setCompany} options={COMPANY_OPTIONS} />

      <SearchInput
        placeholder="Rechercher un service..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <Pills options={CATEGORY_PILLS} value={category} onChange={setCategory} />

      <div className="flex items-center gap-3">
        <Switch checked={showInactive} onChange={setShowInactive} label="Afficher les services inactifs" />
        <span className="text-sm text-[var(--color-gray-600)]">Afficher les services inactifs</span>
      </div>

      <div className="space-y-6">
        {groups.length === 0 && (
          <p className="py-10 text-center text-sm text-[var(--color-gray-400)]">Aucun service trouvé.</p>
        )}
        {groups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
              {group.label} <span className="text-[var(--color-gray-400)]">({group.services.length})</span>
            </p>
            <div className="space-y-2">
              {group.services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <ServiceCategoriesDialog open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
    </div>
  );
}
