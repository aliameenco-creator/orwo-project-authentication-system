"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createMockGrants, createMockProjects } from "./mock-data";
import type { AccessGrant, Project, Session } from "./types";
import { daysFromNow, isGrantLive, nameFromEmail, uid } from "./utils";

const STORAGE_KEY = "orwo-family:v1";

interface PersistedState {
  projects: Project[];
  grants: AccessGrant[];
  session: Session | null;
}

interface InviteInput {
  email: string;
  projectIds: string[];
  days: number;
  message?: string;
}

interface StoreValue extends PersistedState {
  signIn: (session: Session) => void;
  signOut: () => void;
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

function initialState(): PersistedState {
  return { projects: createMockProjects(), grants: createMockGrants(), session: null };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted mock state once on the client.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as PersistedState);
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

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      signIn: (session) => setState((s) => ({ ...s, session })),
      signOut: () => setState((s) => ({ ...s, session: null })),
      saveProject: (project) =>
        setState((s) => {
          const exists = s.projects.some((p) => p.id === project.id);
          const next = { ...project, updatedAt: new Date().toISOString() };
          return {
            ...s,
            projects: exists ? s.projects.map((p) => (p.id === project.id ? next : p)) : [next, ...s.projects],
          };
        }),
      invite: ({ email, projectIds, days, message }) => {
        const grant: AccessGrant = {
          id: uid("g"),
          email: email.trim().toLowerCase(),
          name: nameFromEmail(email.trim()),
          projectIds,
          startDate: new Date().toISOString(),
          expiryDate: daysFromNow(days),
          revoked: false,
          message: message?.trim() || undefined,
          token: Math.random().toString(36).slice(2, 8),
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
      reinstateGrant: (id, days) =>
        updateGrant(id, (g) => ({ ...g, revoked: false, expiryDate: daysFromNow(days) })),
      resetDemo: () => setState((s) => ({ ...initialState(), session: s.session })),
      viewerCount: (projectId) =>
        state.grants.filter((g) => g.projectIds.includes(projectId) && isGrantLive(g)).length,
      grantsForProject: (projectId) => state.grants.filter((g) => g.projectIds.includes(projectId)),
    }),
    [state, updateGrant],
  );

  return (
    <StoreContext.Provider value={value}>
      {hydrated ? children : <BootScreen />}
    </StoreContext.Provider>
  );
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
