"use client";

import { useState } from "react";
import { Pencil, Trash2, Copy, Search, Sparkles, Store } from "lucide-react";

import { PageHeader } from "@/components/ui/organisms/page-header";
import { Toolbar } from "@/components/ui/organisms/toolbar";
import { DataTable, type DataTableColumn } from "@/components/ui/organisms/data-table";
import { DockedPanel } from "@/components/ui/organisms/docked-panel";

import { Card } from "@/components/ui/atoms/card";
import { Button } from "@/components/ui/atoms/button";
import { Badge } from "@/components/ui/atoms/badge";
import { Avatar } from "@/components/ui/atoms/avatar";
import { IconButton, CloseButton } from "@/components/ui/atoms/icon-button";
import { Logo } from "@/components/ui/atoms/logo";
import { PhotoPlaceholder } from "@/components/ui/atoms/photo-placeholder";
import { SearchInput } from "@/components/ui/atoms/search-input";
import { Switch } from "@/components/ui/atoms/switch";
import { Checkbox } from "@/components/ui/atoms/checkbox";
import { TextInput } from "@/components/ui/atoms/text-input";
import { Textarea } from "@/components/ui/atoms/textarea";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { RoundStepButton } from "@/components/ui/atoms/round-step-button";
import { Select } from "@/components/ui/atoms/select";
import { Separator } from "@/components/ui/atoms/separator";
import { Spinner } from "@/components/ui/atoms/spinner";
import { Skeleton } from "@/components/ui/atoms/skeleton";
import { ProgressBar } from "@/components/ui/atoms/progress-bar";
import { Tooltip } from "@/components/ui/atoms/tooltip";
import { BellIcon, CalendarIcon, PeopleIcon, HeartPulseIcon, TagHeartIcon, BagIcon, GearIcon, HomeIcon } from "@/components/ui/atoms/icons";

import { Dialog } from "@/components/ui/molecules/dialog";
import { ConfirmDialog } from "@/components/ui/molecules/confirm-dialog";
import { EmptyState } from "@/components/ui/molecules/empty-state";
import { Field } from "@/components/ui/molecules/field";
import { Pills } from "@/components/ui/molecules/pills";
import { SegmentedToggle } from "@/components/ui/molecules/segmented-toggle";
import { PersonCard } from "@/components/ui/molecules/person-card";
import { Stepper } from "@/components/ui/molecules/stepper";
import { StatTile, StatTileRow } from "@/components/ui/molecules/stat-tile";
import { Toast } from "@/components/ui/molecules/toast";
import { Tabs } from "@/components/ui/molecules/tabs";
import { Accordion } from "@/components/ui/molecules/accordion";
import { Popover } from "@/components/ui/molecules/popover";
import { DropdownMenu } from "@/components/ui/molecules/dropdown-menu";
import { RadioGroup } from "@/components/ui/molecules/radio-group";
import { Alert } from "@/components/ui/molecules/alert";
import { Breadcrumb } from "@/components/ui/molecules/breadcrumb";
import { SaleTrayTrigger } from "@/components/ui/molecules/sale-tray-trigger";
import { RelanceCard } from "@/components/ui/molecules/relance-card";
import { AppointmentTimelineRow } from "@/components/ui/molecules/appointment-timeline-row";
import { DatePicker } from "@/components/ui/molecules/date-picker";
import { FileUpload, type UploadedFile } from "@/components/ui/molecules/file-upload";
import { MessageCircle, Mail } from "lucide-react";

type Section = { id: string; label: string };
const SECTIONS: Section[] = [
  { id: "fondations", label: "Fondations" },
  { id: "atoms", label: "Atomes" },
  { id: "molecules", label: "Molécules" },
  { id: "comptoir", label: "Comptoir & Planning" },
  { id: "organisms", label: "Organismes" },
];

const COMPONENT_COUNT = 48;

function Swatch({ name, varName, fg = "#171717" }: { name: string; varName: string; fg?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-16 items-end rounded-2xl border border-[var(--color-gray-200)] p-2" style={{ background: `var(${varName})` }}>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium" style={{ color: fg }}>
          {varName}
        </span>
      </div>
      <p className="text-xs font-medium text-[var(--color-gray-600)]">{name}</p>
    </div>
  );
}

function Specimen({ label, sample, className }: { label: string; sample: string; className: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold tracking-wide text-[var(--color-gray-400)] uppercase">{label}</p>
      <p className={className}>{sample}</p>
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-[var(--font-heading)] text-lg text-[var(--color-gray-900)]">{children}</h3>;
}

type Row = { id: string; name: string; category: string; stock: number; price: string };
const TABLE_ROWS: Row[] = [
  { id: "1", name: "Shampoing Kérastase 300ml", category: "Capillaire", stock: 52, price: "20 000 F" },
  { id: "2", name: "Vernis Rouge Classique", category: "Ongles", stock: 8, price: "6 000 F" },
  { id: "3", name: "Crème Hydratante Visage", category: "Soins", stock: 0, price: "15 500 F" },
];
const TABLE_COLUMNS: DataTableColumn<Row>[] = [
  { key: "name", header: "Produit", render: (r) => <span className="font-medium text-[var(--color-gray-900)]">{r.name}</span> },
  { key: "category", header: "Catégorie", render: (r) => r.category },
  { key: "stock", header: "Stock", align: "right", render: (r) => (r.stock === 0 ? <Badge variant="error">Rupture</Badge> : r.stock) },
  { key: "price", header: "Prix", align: "right", render: (r) => <span className="font-semibold">{r.price}</span> },
];

/**
 * Système de design Beauty and Co — bibliothèque de composants atomiques (atomes / molécules /
 * organismes) tenue à part de tout écran métier. Sert à la fois de vitrine et de point de départ
 * pour reconstruire les futurs écrans du point de vente sur cette base.
 */
export default function DesignSystemPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("tous");
  const [segment, setSegment] = useState("services");
  const [switchOn, setSwitchOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [stepValue, setStepValue] = useState(2);
  const [selectValue, setSelectValue] = useState("coiffure");
  const [radioValue, setRadioValue] = useState("wave");
  const [tabValue, setTabValue] = useState("apercu");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastAction, setToastAction] = useState<{ label: string; onClick: () => void } | undefined>(undefined);
  const [comptoirOpen, setComptoirOpen] = useState(true);
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([{ name: "reference-ongles.jpg", sizeLabel: "1.2 Mo" }]);

  return (
    <>
      <div className="flex flex-col gap-12 pb-24">
          <PageHeader
            title="Composants"
            subtitle="Système de design Beauty and Co — atomes, molécules, organismes."
            action={<Badge variant="dark">v1 · {COMPONENT_COUNT} composants</Badge>}
          />

          <nav className="sticky top-0 z-10 -mx-8 flex gap-2 border-b border-[var(--color-gray-200)] bg-[var(--brand-cream)]/95 px-8 py-3 backdrop-blur-sm">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--color-gray-600)] transition hover:bg-[var(--color-gray-100)]"
              >
                {s.label}
              </a>
            ))}
          </nav>

          {/* ───────────────────────── Fondations ───────────────────────── */}
          <section id="fondations" className="flex flex-col gap-6 scroll-mt-20">
            <SubHeading>Fondations</SubHeading>

            <Card className="p-6">
              <FieldLabel className="mb-3">Couleurs — primaire &amp; secondaire</FieldLabel>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                <Swatch name="Rose primaire" varName="--core-brand-color" />
                <Swatch name="Taupe emphase" varName="--brand-taupe-muted" fg="#fff" />
                <Swatch name="Lilas (VIP only)" varName="--brand-lilac" />
                <Swatch name="Crème (fond)" varName="--brand-cream" />
                <Swatch name="Rose doux" varName="--brand-rose-soft" />
                <Swatch name="Bordure" varName="--color-gray-200" />
              </div>
              <FieldLabel className="mt-6 mb-3">Sémantique</FieldLabel>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Swatch name="Succès" varName="--color-success" fg="#fff" />
                <Swatch name="Attention" varName="--color-warning" fg="#fff" />
                <Swatch name="Erreur" varName="--color-error" fg="#fff" />
                <Swatch name="Info" varName="--color-info" fg="#fff" />
              </div>
            </Card>

            <Card className="p-6">
              <FieldLabel className="mb-4">Typographie</FieldLabel>
              <div className="flex flex-col gap-4">
                <Specimen label="Display · Prata" sample="Bonjour, Propriétaire" className="font-[var(--font-heading)] text-3xl text-[var(--color-gray-900)]" />
                <Specimen label="Accent · Benedict" sample="privé" className="font-[var(--font-display)] text-2xl text-[var(--brand-taupe-muted)]" />
                <Specimen label="Titre · Cabinet Grotesk 600" sample="Gestion Produits" className="text-xl font-semibold text-[var(--color-gray-900)]" />
                <Specimen label="Corps · Cabinet Grotesk 450" sample="Trouvez un client existant ou ajoutez un nouveau profil." className="text-[15px] text-[var(--color-gray-700)]" />
                <Specimen label="Label · uppercase tracked" sample="REVENUS DU JOUR" className="text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase" />
              </div>
            </Card>
          </section>

          {/* ───────────────────────── Atoms ───────────────────────── */}
          <section id="atoms" className="flex flex-col gap-6 scroll-mt-20">
            <SubHeading>Atomes</SubHeading>

            <Card className="flex flex-wrap items-center gap-6 p-6">
              <div className="flex flex-col items-center gap-2">
                <Logo className="relative h-16 w-16 shrink-0" />
                <FieldLabel>Logo</FieldLabel>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar initial="P" size={56} className="bg-[var(--brand-rose-soft)] text-lg font-semibold text-[var(--brand-taupe-muted)]" />
                <FieldLabel>Avatar</FieldLabel>
              </div>
              <div className="flex flex-col items-center gap-2">
                <PhotoPlaceholder className="size-14 rounded-2xl" />
                <FieldLabel>PhotoPlaceholder</FieldLabel>
              </div>
            </Card>

            <Card className="flex flex-col gap-4 p-6">
              <FieldLabel>Button — variantes</FieldLabel>
              <div className="flex flex-wrap gap-3">
                <Button variant="brand">Brand</Button>
                <Button variant="dark">Dark</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="lilac">Lilac</Button>
                <Button variant="success">Success</Button>
                <Button variant="info">Info</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="danger-outline">Danger outline</Button>
                <Button variant="brand" disabled>
                  Désactivé
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <IconButton aria-label="Notifications" className="size-10 rounded-full text-[var(--color-gray-500)] hover:bg-[var(--color-gray-100)]">
                  <BellIcon />
                </IconButton>
                <RoundStepButton direction="decrement" onClick={() => {}} ariaLabel="Diminuer" />
                <RoundStepButton direction="increment" onClick={() => {}} ariaLabel="Augmenter" />
                <div className="relative h-10 w-40 rounded-2xl border border-[var(--color-gray-200)]">
                  <CloseButton className="static translate-0" />
                </div>
                <Tooltip content="Action rapide">
                  <Button variant="outline">Survoler (Tooltip)</Button>
                </Tooltip>
              </div>
            </Card>

            <Card className="flex flex-col gap-4 p-6">
              <FieldLabel>Badge — variantes</FieldLabel>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">Succès</Badge>
                <Badge variant="warning">Attention</Badge>
                <Badge variant="error">Erreur</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="vip">VIP</Badge>
                <Badge variant="gold">Gold</Badge>
                <Badge variant="silver">Silver</Badge>
                <Badge variant="brand">Brand</Badge>
                <Badge variant="dark">Dark</Badge>
                <Badge variant="neutral">Neutral</Badge>
              </div>
            </Card>

            <Card className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
              <Field label="Nom complet" required>
                <TextInput tone="cream" placeholder="Prénom Nom" />
              </Field>
              <Field label="Champ compact (white)">
                <TextInput tone="white" size="compact" placeholder="Code promo" />
              </Field>
              <Field label="Sélection (Select)">
                <Select
                  value={selectValue}
                  onChange={setSelectValue}
                  options={[
                    { value: "coiffure", label: "Coiffure" },
                    { value: "ongles", label: "Onglerie" },
                    { value: "spa", label: "Spa & Massages" },
                  ]}
                />
              </Field>
              <Field label="Notes">
                <Textarea tone="white" placeholder="Allergies, préférences…" />
              </Field>
              <SearchInput placeholder="Rechercher un produit…" className="sm:col-span-2" />
            </Card>

            <Card className="flex flex-wrap items-center gap-8 p-6">
              <Switch checked={switchOn} onChange={setSwitchOn} label="Notifications" />
              <Checkbox checked={checked} onChange={setChecked} label="Produits inactifs" />
              <div className="flex items-center gap-3">
                <Spinner size="md" />
                <FieldLabel variant="plain">Spinner</FieldLabel>
              </div>
            </Card>

            <Card className="flex flex-col gap-5 p-6">
              <div>
                <FieldLabel className="mb-2">ProgressBar</FieldLabel>
                <div className="flex flex-col gap-2">
                  <ProgressBar value={72} tone="success" />
                  <ProgressBar value={38} tone="warning" />
                  <ProgressBar value={12} tone="error" />
                </div>
              </div>
              <Separator />
              <div>
                <FieldLabel className="mb-2">Skeleton</FieldLabel>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-3 w-1/3 rounded-full" />
                    <Skeleton className="h-3 w-2/3 rounded-full" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="flex flex-wrap gap-4 p-6 text-[var(--brand-taupe-muted)]">
              <HomeIcon />
              <CalendarIcon />
              <PeopleIcon />
              <HeartPulseIcon />
              <TagHeartIcon />
              <BagIcon />
              <GearIcon />
            </Card>
          </section>

          {/* ───────────────────────── Molecules ───────────────────────── */}
          <section id="molecules" className="flex flex-col gap-6 scroll-mt-20">
            <SubHeading>Molécules</SubHeading>

            <Card className="flex flex-col gap-4 p-6">
              <FieldLabel>Pills &amp; SegmentedToggle</FieldLabel>
              <Pills
                options={[
                  { value: "tous", label: "Tous" },
                  { value: "revente", label: "Revente", count: 42 },
                  { value: "interne", label: "Interne", count: 8 },
                ]}
                value={filter}
                onChange={setFilter}
              />
              <SegmentedToggle
                options={[
                  { value: "services", label: "Services" },
                  { value: "produits", label: "Produits" },
                ]}
                value={segment}
                onChange={setSegment}
              />
            </Card>

            <Card className="p-6">
              <FieldLabel className="mb-3">Tabs</FieldLabel>
              <Tabs
                value={tabValue}
                onChange={setTabValue}
                items={[
                  { value: "apercu", label: "Aperçu", content: <p className="text-sm text-[var(--color-gray-600)]">Contenu de l&apos;onglet Aperçu.</p> },
                  { value: "historique", label: "Historique", content: <p className="text-sm text-[var(--color-gray-600)]">Contenu de l&apos;onglet Historique.</p> },
                  { value: "notes", label: "Notes", content: <p className="text-sm text-[var(--color-gray-600)]">Contenu de l&apos;onglet Notes.</p> },
                ]}
              />
            </Card>

            <Card className="p-6">
              <FieldLabel className="mb-3">Accordion</FieldLabel>
              <Accordion
                items={[
                  { value: "a", title: "Beauty and Co", content: "Almadies · Sea Plaza" },
                  { value: "b", title: "Michele Ka", content: "Sea Plaza" },
                ]}
              />
            </Card>

            <Card className="flex flex-col gap-4 p-6">
              <FieldLabel>Stepper &amp; StatTile</FieldLabel>
              <Stepper label="Adultes" hint="À partir de 12 ans" value={stepValue} min={0} max={10} onChange={setStepValue} />
              <StatTileRow>
                <StatTile value={225} label="Produits" />
                <StatTile value={93} label="Sous le seuil" tone="warning" />
                <StatTile value={49} label="En rupture" tone="error" />
              </StatTileRow>
            </Card>

            <Card className="flex flex-col gap-4 p-6">
              <FieldLabel>RadioGroup</FieldLabel>
              <RadioGroup
                value={radioValue}
                onChange={setRadioValue}
                options={[
                  { value: "wave", label: "Wave", hint: "Paiement mobile" },
                  { value: "om", label: "Orange Money", hint: "Paiement mobile" },
                  { value: "carte", label: "Carte bancaire" },
                ]}
              />
            </Card>

            <Card className="flex flex-col gap-3 p-6">
              <FieldLabel>Alert</FieldLabel>
              <Alert tone="warning" title="49 en rupture · 93 sous le seuil" description="À réapprovisionner rapidement." />
              <Alert tone="success" title="Rendez-vous confirmé" />
              <Alert tone="info" title="Nouvelle version disponible" />
            </Card>

            <Card className="flex flex-col gap-4 p-6">
              <FieldLabel>PersonCard &amp; Breadcrumb</FieldLabel>
              <PersonCard initial="AS" name="Awa Sarr" meta="+221 78 445 56 61" badge={{ label: "VIP", variant: "vip" }} trailing="Il y a 6j" />
              <Breadcrumb items={[{ label: "Suivi", href: "#" }, { label: "Campagnes" }]} />
            </Card>

            <Card className="p-6">
              <FieldLabel className="mb-3">EmptyState</FieldLabel>
              <EmptyState icon={<Search className="size-12" />} title="Aucun résultat" subtitle="Essayez un autre terme de recherche." />
            </Card>

            <Card className="flex flex-wrap items-center gap-4 p-6">
              <FieldLabel>Popover, DropdownMenu, Dialog, ConfirmDialog, Toast</FieldLabel>
              <Popover trigger={<Button variant="outline">Ouvrir Popover</Button>}>
                <p className="w-48 text-sm text-[var(--color-gray-700)]">Contenu flottant ancré au déclencheur.</p>
              </Popover>
              <DropdownMenu
                trigger={
                  <IconButton aria-label="Actions" className="size-10 rounded-full border border-[var(--color-gray-200)] text-[var(--color-gray-600)] hover:bg-[var(--color-gray-50)]">
                    <Copy className="size-4" />
                  </IconButton>
                }
                items={[
                  { label: "Modifier", icon: <Pencil className="size-4" />, onSelect: () => {} },
                  { label: "Dupliquer", icon: <Copy className="size-4" />, onSelect: () => {} },
                  { type: "separator" },
                  { label: "Supprimer", icon: <Trash2 className="size-4" />, tone: "danger", onSelect: () => {} },
                ]}
              />
              <Button variant="brand" onClick={() => setDialogOpen(true)}>
                Ouvrir Dialog
              </Button>
              <Button variant="danger-outline" onClick={() => setConfirmOpen(true)}>
                Ouvrir ConfirmDialog
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setToastAction(undefined);
                  setToastMessage("Action enregistrée ✓");
                }}
              >
                Déclencher Toast
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setToastAction({ label: "Annuler", onClick: () => setToastMessage("Annulé ✓") });
                  setToastMessage("Produit supprimé");
                }}
              >
                Toast avec « Annuler »
              </Button>
            </Card>
          </section>

          {/* ─────────────────── Comptoir & Planning ─────────────────── */}
          <section id="comptoir" className="flex flex-col gap-6 scroll-mt-20">
            <SubHeading>Comptoir &amp; Planning</SubHeading>

            <Card className="flex flex-col gap-4 p-6">
              <FieldLabel>SaleTrayTrigger</FieldLabel>
              <div className="flex gap-3">
                <SaleTrayTrigger itemCount={0} total="0 F" onClick={() => {}} />
                <SaleTrayTrigger itemCount={3} total="45 000 F" onClick={() => setComptoirOpen((v) => !v)} />
              </div>
            </Card>

            <Card className="flex flex-col gap-4 p-6">
              <FieldLabel>AppointmentTimelineRow</FieldLabel>
              <div className="flex flex-col gap-2">
                <AppointmentTimelineRow
                  start="10:00"
                  end="11:00"
                  clientName="Sokhna Mbaye"
                  clientInitial="SM"
                  service="Coloration"
                  staffName="Bineta"
                  status="confirme"
                  onClick={() => {}}
                />
                <AppointmentTimelineRow
                  start="11:30"
                  end="12:15"
                  clientName="Awa Niang"
                  clientInitial="AN"
                  service="Manucure russe"
                  staffName="Fatou"
                  status="en_attente"
                  onClick={() => {}}
                />
                <AppointmentTimelineRow
                  start="14:00"
                  end="14:45"
                  clientName="Ndèye Diop"
                  clientInitial="ND"
                  service="Soin visage"
                  staffName="Gnagna"
                  status="annule"
                />
              </div>
            </Card>

            <Card className="flex flex-col gap-4 p-6">
              <FieldLabel>RelanceCard</FieldLabel>
              <RelanceCard
                initial="YW"
                name="Yacine Wade"
                context="Anniversaire — Yacine"
                message="Joyeux anniversaire Yacine 🎂 Toute l'équipe Beauty and Co vous souhaite une journée aussi rayonnante que vous."
                statusLabel="En retard de 48 j"
                tierBadge={{ label: "VIP", variant: "vip" }}
                actions={[
                  { label: "WhatsApp", variant: "success", icon: <MessageCircle className="size-4" />, onClick: () => {} },
                  { label: "Email", variant: "dark", icon: <Mail className="size-4" />, onClick: () => {} },
                  { label: "RDV pris", variant: "outline", onClick: () => {} },
                ]}
              />
            </Card>

            <Card className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
              <Field label="DatePicker">
                <DatePicker value={dateValue} onChange={setDateValue} />
              </Field>
              <div>
                <FieldLabel className="mb-1.5" variant="plain">
                  FileUpload
                </FieldLabel>
                <FileUpload
                  files={uploadedFiles}
                  onAdd={(fileList) => setUploadedFiles((prev) => [...prev, ...Array.from(fileList).map((f) => ({ name: f.name, sizeLabel: `${Math.round(f.size / 1024)} Ko` }))])}
                  onRemove={(name) => setUploadedFiles((prev) => prev.filter((f) => f.name !== name))}
                />
              </div>
            </Card>

            {comptoirOpen && (
              <div className="max-w-sm">
                <FieldLabel className="mb-2">DockedPanel</FieldLabel>
                <DockedPanel
                  title="Panier (3)"
                  footer={
                    <>
                      <div className="mb-3 flex items-end justify-between">
                        <span className="text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">Total</span>
                        <span className="font-[var(--font-heading)] text-2xl text-[var(--color-gray-900)]">45 000 F</span>
                      </div>
                      <Button variant="brand" className="w-full">
                        Encaisser
                      </Button>
                    </>
                  }
                >
                  <div className="flex flex-col gap-3 text-sm text-[var(--color-gray-700)]">
                    <p>Coloration — 25 000 F</p>
                    <Separator />
                    <p>Manucure russe — 20 000 F</p>
                  </div>
                </DockedPanel>
              </div>
            )}
          </section>

          {/* ───────────────────────── Organisms ───────────────────────── */}
          <section id="organisms" className="flex flex-col gap-6 scroll-mt-20">
            <SubHeading>Organismes</SubHeading>

            <Card className="p-6">
              <FieldLabel className="mb-3">Toolbar</FieldLabel>
              <Toolbar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Rechercher un produit, un SKU…"
                filters={[
                  { value: "tous", label: "Tous" },
                  { value: "capillaire", label: "Capillaire" },
                  { value: "ongles", label: "Ongles" },
                ]}
                filterValue={filter}
                onFilterChange={setFilter}
                action={
                  <Button variant="brand" icon={<Sparkles className="size-4" />}>
                    Ajouter
                  </Button>
                }
              />
            </Card>

            <Card className="p-6">
              <FieldLabel className="mb-3">DataTable</FieldLabel>
              <DataTable columns={TABLE_COLUMNS} rows={TABLE_ROWS} rowKey={(r) => r.id} />
            </Card>

            <Card className="p-6">
              <FieldLabel className="mb-3">PageHeader (avec retour + action)</FieldLabel>
              <div className="rounded-2xl border border-dashed border-[var(--color-gray-200)] p-4">
                <PageHeader
                  title="Gestion Produits"
                  subtitle="Stock, prix, fournisseurs"
                  backHref="#"
                  action={
                    <Button variant="brand" icon={<Store className="size-4" />}>
                      Ajouter
                    </Button>
                  }
                />
              </div>
            </Card>
          </section>
      </div>

      <Dialog open={dialogOpen} labelledBy="showcase-dialog-title" className="max-w-md rounded-3xl p-6">
        <h2 id="showcase-dialog-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
          Dialog
        </h2>
        <p className="mt-2 text-sm text-[var(--color-gray-600)]">
          Coquille structurelle partagée par toutes les modales de l&apos;app — recentrée, avec overlay et aria wiring.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
            Fermer
          </Button>
          <Button variant="brand" className="flex-1" onClick={() => setDialogOpen(false)}>
            OK
          </Button>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Supprimer ce produit ?"
        description="Cette action est irréversible."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
      />

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} action={toastAction} />
    </>
  );
}
