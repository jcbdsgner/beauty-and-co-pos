"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { UTILISATEURS, utilisateurById, type Utilisateur } from "@/lib/data/utilisateurs";

/**
 * Session du poste — qui tient le comptoir + son code PIN. Entièrement simulée : la valeur vit
 * dans `sessionStorage` (par onglet, effacée à la fermeture), aucune authentification réelle,
 * aucun backend. Un seul persona, aucun rôle de permission (voir ADR 0001).
 */

const USER_KEY = "pdv.session.userId";
const PIN_KEY = "pdv.session.pins";
const DEFAULT_ID = UTILISATEURS[0].id;

type Snapshot = { userId: string; pins: Record<string, string> };

let cache: Snapshot | null = null;
const listeners = new Set<() => void>();
const SERVER_SNAPSHOT: Snapshot = { userId: DEFAULT_ID, pins: {} };

function compute(): Snapshot {
  let userId = DEFAULT_ID;
  let pins: Record<string, string> = {};
  try {
    const stored = sessionStorage.getItem(USER_KEY);
    if (stored && utilisateurById(stored)) userId = stored;
    pins = JSON.parse(sessionStorage.getItem(PIN_KEY) ?? "{}");
  } catch {
    /* sessionStorage indisponible — valeurs par défaut */
  }
  return { userId, pins };
}

function getSnapshot(): Snapshot {
  if (!cache) cache = compute();
  return cache;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function emit() {
  cache = compute();
  for (const l of listeners) l();
}

function writeUserId(id: string) {
  if (!utilisateurById(id)) return;
  try {
    sessionStorage.setItem(USER_KEY, id);
  } catch {
    /* ignore */
  }
  emit();
}

function writePin(id: string, pin: string) {
  const next = { ...getSnapshot().pins, [id]: pin };
  try {
    sessionStorage.setItem(PIN_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  emit();
}

export type Session = {
  currentUser: Utilisateur;
  /** Bascule le poste sur un autre utilisateur (le PIN est vérifié par l'appelant). */
  switchUser: (id: string) => void;
  /** Vrai si `pin` correspond au code de `userId` (valeur de session si changée, sinon défaut). */
  verifyPin: (userId: string, pin: string) => boolean;
  /** Enregistre un nouveau PIN pour un utilisateur (simulé, en session). */
  setPin: (userId: string, pin: string) => void;
};

export function useSession(): Session {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const currentUser = utilisateurById(snap.userId) ?? UTILISATEURS[0];

  const switchUser = useCallback((id: string) => writeUserId(id), []);
  const setPin = useCallback((id: string, pin: string) => writePin(id, pin), []);
  const verifyPin = useCallback(
    (id: string, pin: string) => {
      const user = utilisateurById(id);
      return !!user && (snap.pins[id] ?? user.pin) === pin;
    },
    [snap.pins],
  );

  return useMemo(
    () => ({ currentUser, switchUser, verifyPin, setPin }),
    [currentUser, switchUser, verifyPin, setPin],
  );
}
