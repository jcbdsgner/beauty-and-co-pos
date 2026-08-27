import { Sidebar } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";
import { ComptoirPanel } from "@/components/comptoir/comptoir-panel";

/** Sidebar + header + scrollable content column, with the Comptoir overlay mounted once above everything so collapsing it never resets its state. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--brand-cream)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
        </div>
      </div>
      <ComptoirPanel />
    </div>
  );
}
