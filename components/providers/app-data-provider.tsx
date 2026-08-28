"use client";

/**
 * Compatibility facade. The session state moved to a Zustand store (`lib/store/app-store.ts`);
 * this file keeps the old surface so the ~30 components that do `const { … } = useAppData()`
 * and `import { computeTotals } from "@/components/providers/app-data-provider"` never had to
 * change. New code can import from `@/lib/store/app-store` directly.
 */

import { useAppStore, type AppState } from "@/lib/store/app-store";

export { computeTotals } from "@/lib/store/app-store";

/** No longer a real provider — the store is a module singleton. Kept so `app/layout.tsx`
 *  (and any test harness) can keep wrapping the tree without a change. */
export function AppDataProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/** Returns the whole store, re-rendering the caller on any change — same semantics as the old
 *  context value. Selector-based reads are available via `useAppStore(selector)`. */
export function useAppData(): AppState {
  return useAppStore();
}
