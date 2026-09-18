"use client";

import { Sidebar } from "@/components/shell/sidebar";
import { ComptoirBar } from "@/components/shell/comptoir-bar";
import { ComptoirPanel } from "@/components/comptoir/comptoir-panel";
import { LockScreen } from "@/components/shell/lock-screen";
import { useSession } from "@/lib/session";

/**
 * Sidebar + a content column that is: the scrollable page and — docked at its foot on every
 * section — the collapsed Comptoir bar (the counter's always-present entry to a sale). The
 * deployed Comptoir is mounted once above everything so collapsing it never resets its tabs or
 * step. Swapped entirely for the LockScreen while signed out (ADR 0026) — a fresh tab always
 * starts signed in, this only triggers after an explicit "Se déconnecter".
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { authenticated } = useSession();

  if (!authenticated) return <LockScreen />;

  return (
    <div className="flex h-screen bg-base-200">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto scroll-pt-24">
          <div className="mx-auto max-w-[1440px] px-8 py-8">{children}</div>
        </div>
        <ComptoirBar />
      </div>
      <ComptoirPanel />
    </div>
  );
}
