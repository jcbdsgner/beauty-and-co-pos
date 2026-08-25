import { Sidebar } from "@/components/layout/sidebar";

/** Sidebar + scrollable content area — wraps every authenticated route (see app/(app)/layout.tsx). */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--brand-cream)]">
      <Sidebar />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </div>
    </div>
  );
}
