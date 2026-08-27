import { Sidebar } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";
import { ComptoirBar } from "@/components/shell/comptoir-bar";
import { ComptoirPanel } from "@/components/comptoir/comptoir-panel";

/**
 * Sidebar + a content column that is: a slim header strip, the scrollable page, and — docked at
 * its foot on every section — the collapsed Comptoir bar (the counter's always-present entry to a
 * sale). The deployed Comptoir is mounted once above everything so collapsing it never resets its
 * tabs or step.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--brand-cream)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
        </div>
        <ComptoirBar />
      </div>
      <ComptoirPanel />
    </div>
  );
}
