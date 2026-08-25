"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type SuiviValidationContextValue = {
  /** true une fois que la tournée du matin a été validée et envoyée. */
  sent: boolean;
  markSent: () => void;
};

const SuiviValidationContext = createContext<SuiviValidationContextValue | null>(null);

/**
 * Relie le bandeau "Tournée du matin" (bouton "Valider & envoyer") aux cartes "en attente de
 * validation" listées plus bas sur la même page : cliquer sur le bouton global doit se
 * répercuter visuellement sur chaque carte concernée, pas seulement sur le bouton lui-même.
 */
export function SuiviValidationProvider({ children }: { children: ReactNode }) {
  const [sent, setSent] = useState(false);
  const value = useMemo(() => ({ sent, markSent: () => setSent(true) }), [sent]);

  return <SuiviValidationContext.Provider value={value}>{children}</SuiviValidationContext.Provider>;
}

export function useSuiviValidation() {
  const ctx = useContext(SuiviValidationContext);
  if (!ctx) {
    throw new Error("useSuiviValidation doit être utilisé à l'intérieur de <SuiviValidationProvider>.");
  }
  return ctx;
}
