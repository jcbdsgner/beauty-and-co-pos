"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { UTILISATEUR, type Utilisateur } from "@/lib/data/utilisateurs";

/**
 * Session du poste — le compte unique (mot de passe + photo) et l'état connecté/verrouillé.
 * Entièrement simulée : la valeur vit dans `sessionStorage` (par onglet, effacée à la fermeture),
 * aucune authentification réelle, aucun backend. Un seul compte, aucune bascule (voir ADR 0026).
 */

const AUTH_KEY = "pdv.session.authenticated";
const PASSWORD_KEY = "pdv.session.password";
const PHOTO_KEY = "pdv.session.photoUrl";

type Snapshot = { authenticated: boolean; password: string; photoUrl: string | null };

let cache: Snapshot | null = null;
const listeners = new Set<() => void>();
const SERVER_SNAPSHOT: Snapshot = { authenticated: true, password: UTILISATEUR.password, photoUrl: null };

function compute(): Snapshot {
  let authenticated = true;
  let password = UTILISATEUR.password;
  let photoUrl: string | null = null;
  try {
    const storedAuth = sessionStorage.getItem(AUTH_KEY);
    if (storedAuth !== null) authenticated = storedAuth === "1";
    password = sessionStorage.getItem(PASSWORD_KEY) ?? UTILISATEUR.password;
    photoUrl = sessionStorage.getItem(PHOTO_KEY);
  } catch {
    /* sessionStorage indisponible — valeurs par défaut */
  }
  return { authenticated, password, photoUrl };
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

function writeAuthenticated(value: boolean) {
  try {
    sessionStorage.setItem(AUTH_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
  emit();
}

function writePassword(password: string) {
  try {
    sessionStorage.setItem(PASSWORD_KEY, password);
  } catch {
    /* ignore */
  }
  emit();
}

function writePhotoUrl(photoUrl: string | null) {
  try {
    if (photoUrl) sessionStorage.setItem(PHOTO_KEY, photoUrl);
    else sessionStorage.removeItem(PHOTO_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

export type Session = {
  currentUser: Utilisateur;
  photoUrl: string | null;
  authenticated: boolean;
  /** Vrai si `password` correspond au mot de passe courant (valeur de session si changé, sinon défaut). */
  verifyPassword: (password: string) => boolean;
  /** Enregistre un nouveau mot de passe (simulé, en session). */
  setPassword: (password: string) => void;
  setPhotoUrl: (photoUrl: string | null) => void;
  /** Verrouille le poste — affiche l'écran de verrouillage jusqu'à réauthentification. */
  logout: () => void;
  /** Vérifie le mot de passe et déverrouille le poste si correct. */
  login: (password: string) => boolean;
};

export function useSession(): Session {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const verifyPassword = useCallback((password: string) => snap.password === password, [snap.password]);
  const setPassword = useCallback((password: string) => writePassword(password), []);
  const setPhotoUrl = useCallback((photoUrl: string | null) => writePhotoUrl(photoUrl), []);
  const logout = useCallback(() => writeAuthenticated(false), []);
  const login = useCallback(
    (password: string) => {
      if (snap.password !== password) return false;
      writeAuthenticated(true);
      return true;
    },
    [snap.password],
  );

  return useMemo(
    () => ({
      currentUser: UTILISATEUR,
      photoUrl: snap.photoUrl,
      authenticated: snap.authenticated,
      verifyPassword,
      setPassword,
      setPhotoUrl,
      logout,
      login,
    }),
    [snap.photoUrl, snap.authenticated, verifyPassword, setPassword, setPhotoUrl, logout, login],
  );
}
