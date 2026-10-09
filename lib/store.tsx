"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ADMIN, createMockAccounts, createMockGrants, createMockProjects } from "./mock-data";
import { clearPages } from "./page-store";
import type { AccessGrant, Project, Session, ViewerAccount } from "./types";
import { daysFromNow, hashPassword, isGrantLive, nameFromEmail, uid } from "./utils";

// Bumped whenever the persisted shape changes, so old demo data is replaced rather than half-loaded.
const STORAGE_KEY = "orwo-family:v2";

interface PersistedState {
  projects: Project[];
  grants: AccessGrant[];
  accounts: ViewerAccount[];
  session: Session | null;
}

interface InviteInput {
  email: string;
  projectIds: string[];
  days: number;
  includeFilm: boolean;
  message?: string;
}

type SignInResult = { ok: true } | { ok: false; error: string };

interface StoreValue extends PersistedState {
  signIn: (session: Session) => void;
  signOut: () => void;
  ownerSignIn: (email: string, password: string) => SignInResult;
  viewerSignIn: (email: string, password: string) => SignInResult;
  /** Viewer accepts an invitation by choosing a name + password. */
  acceptInvite: (token: string, name: string, password: string) => SignInResult;
  hasAccount: (email: string) => boolean;
  saveProject: (project: Project) => void;
  invite: (input: InviteInput) => AccessGrant;
  extendGrant: (id: string, days: number) => void;
  revokeGrant: (id: string) => void;
  reinstateGrant: (id: string, days: number) => void;
  resetDemo: () => void;
  /** Number of viewers with live access to a project */
  viewerCount: (projectId: string) => number;
  grantsForProject: (projectId: string) => AccessGrant[];
}

const StoreContext = createContext<StoreValue | null>(null);

/** Cleans up demo data saved by earlier prototype versions. */
function migrate(state: PersistedState): PersistedState {
  const fallbackUrl: Record<string, string> = { "echo-line": "https://vimeo.com/private/echo-line-festival-cut" };
  return {
    ...state,
    projects: state.projects.map((p) => {
      const next = { ...p };
      // PDF pages were briefly used as card covers.
      if (next.cover?.startsWith("/demo-pages/")) delete next.cover;
      // Films used to allow file uploads; they're private links only now.
      if (next.film && !next.film.url) next.film = { ...next.film, url: fallbackUrl[p.id] ?? "https://vimeo.com/private/" + p.id };
      return next;
    }),
  };
}

function initialState(): PersistedState {
  return { projects: createMockProjects(), grants: createMockGrants(), accounts: createMockAccounts(), session: null };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted mock state once on the client.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(migrate(JSON.parse(raw) as PersistedState));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — state stays in memory */
    }
  }, [state, hydrated]);

  const updateGrant = useCallback((id: string, fn: (g: AccessGrant) => AccessGrant) => {
    setState((s) => ({ ...s, grants: s.grants.map((g) => (g.id === id ? fn(g) : g)) }));
  }, []);

  const value = useMemo<StoreValue>(() => {
    const hasAccount = (email: string) => state.accounts.some((a) => a.email === email.trim().toLowerCase());

    return {
      ...state,
      hasAccount,
      signIn: (session) => setState((s) => ({ ...s, session })),
      signOut: () => setState((s) => ({ ...s, session: null })),

      ownerSignIn: (email, password) => {
        // Mock owner auth: Jake's email + any password.
        if (email.trim().toLowerCase() !== ADMIN.email) return { ok: false, error: "Incorrect email or password." };
        if (!password) return { ok: false, error: "Enter your password." };
        setState((s) => ({ ...s, session: { role: "admin", email: ADMIN.email, name: ADMIN.name } }));
        return { ok: true };
      },

      viewerSignIn: (rawEmail, password) => {
        const email = rawEmail.trim().toLowerCase();
        const account = state.accounts.find((a) => a.email === email);
        // Same message for unknown email and wrong password — don't reveal who has been invited.
        if (!account || account.passwordHash !== hashPassword(email, password))
          return { ok: false, error: "Incorrect email or password." };
        setState((s) => ({ ...s, session: { role: "viewer", email, name: account.name } }));
        return { ok: true };
      },

      acceptInvite: (token, name, password) => {
        const grant = state.grants.find((g) => g.token === token);
        if (!grant || !isGrantLive(grant)) return { ok: false, error: "This invitation is no longer valid." };
        if (hasAccount(grant.email)) return { ok: false, error: "An account already exists for this email. Please sign in." };
        const account: ViewerAccount = {
          email: grant.email,
          name: name.trim() || grant.name,
          passwordHash: hashPassword(grant.email, password),
          createdAt: new Date().toISOString(),
        };
        setState((s) => ({
          ...s,
          accounts: [...s.accounts, account],
          grants: s.grants.map((g) => (g.email === account.email ? { ...g, name: account.name } : g)),
          session: { role: "viewer", email: account.email, name: account.name },
        }));
        return { ok: true };
      },

      saveProject: (project) =>
        setState((s) => {
          const exists = s.projects.some((p) => p.id === project.id);
          const next = { ...project, updatedAt: new Date().toISOString() };
          return {
            ...s,
            projects: exists ? s.projects.map((p) => (p.id === project.id ? next : p)) : [next, ...s.projects],
          };
        }),

      invite: ({ email, projectIds, days, includeFilm, message }) => {
        const addr = email.trim().toLowerCase();
        const existing = state.accounts.find((a) => a.email === addr);
        const grant: AccessGrant = {
          id: uid("g"),
          email: addr,
          name: existing?.name ?? nameFromEmail(addr),
          projectIds,
          includeFilm,
          startDate: new Date().toISOString(),
          expiryDate: daysFromNow(days),
          revoked: false,
          message: message?.trim() || undefined,
          token: Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10),
        };
        setState((s) => ({ ...s, grants: [grant, ...s.grants] }));
        return grant;
      },

      extendGrant: (id, days) =>
        updateGrant(id, (g) => {
          // Extending an expired grant restarts the clock from now.
          const base = Math.max(Date.now(), new Date(g.expiryDate).getTime());
          return { ...g, expiryDate: daysFromNow(days, base) };
        }),
      revokeGrant: (id) => updateGrant(id, (g) => ({ ...g, revoked: true })),
      reinstateGrant: (id, days) => updateGrant(id, (g) => ({ ...g, revoked: false, expiryDate: daysFromNow(days) })),
      resetDemo: () => {
        clearPages();
        setState((s) => ({ ...initialState(), session: s.session }));
      },
      viewerCount: (projectId) => state.grants.filter((g) => g.projectIds.includes(projectId) && isGrantLive(g)).length,
      grantsForProject: (projectId) => state.grants.filter((g) => g.projectIds.includes(projectId)),
    };
  }, [state, updateGrant]);

  return <StoreContext.Provider value={value}>{hydrated ? children : <BootScreen />}</StoreContext.Provider>;
}

function BootScreen() {
  return (
    <div className="fixed inset-0 grid place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
    </div>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
