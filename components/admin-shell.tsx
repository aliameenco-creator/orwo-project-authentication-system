"use client";

import {
  Bell,
  Clapperboard,
  Eye,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Brand, LogoMark } from "@/components/brand";
import { Avatar, IconButton } from "@/components/ui";
import { DEMO_VIEWER_EMAIL } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: Clapperboard },
  { href: "/access", label: "Access", icon: KeyRound },
  { href: "/viewers", label: "Viewers", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

const NOTIFICATIONS = [
  { who: "Sarah Chen", what: "viewed Echo Line — Pitch Deck", when: "2h ago" },
  { who: "Marcus Reid", what: "watched The Last Horizon trailer", when: "5h ago" },
  { who: "Elena Voss", what: "access expired", when: "3 days ago" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { session } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!session) router.replace("/owner");
    else if (session.role !== "admin") router.replace("/viewer");
  }, [session, router]);

  if (session?.role !== "admin") return null;

  return (
    <div className="min-h-screen lg:pl-[264px]">
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-5 pt-6 pb-28 sm:px-8 lg:pb-16">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}

/** Switch the session into a read-only viewer preview for the given email. */
export function usePreviewAs() {
  const { grants, signIn } = useStore();
  const router = useRouter();
  return (email: string) => {
    const grant = grants.find((g) => g.email === email);
    signIn({ role: "viewer", email, name: grant?.name ?? email, preview: true });
    router.push("/viewer");
  };
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function Sidebar() {
  const pathname = usePathname();
  const previewAs = usePreviewAs();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] p-4 lg:block">
      <div className="glass flex h-full flex-col rounded-[28px] p-4">
        <Link href="/dashboard" className="px-2 pt-2 pb-6">
          <Brand tagline="Create and manage our projects privately" />
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[14px] font-medium transition-all duration-300 ease-[var(--ease-glass)]",
                  active
                    ? "bg-white text-ink shadow-[0_4px_16px_-6px_rgba(15,23,42,0.18),inset_0_1px_0_white]"
                    : "text-ink-muted hover:bg-white/50 hover:text-ink",
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} className={cn(active && "text-accent")} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <button
            type="button"
            onClick={() => previewAs(DEMO_VIEWER_EMAIL)}
            className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13px] font-medium text-ink-muted transition hover:bg-white/50 hover:text-ink"
          >
            <Eye size={16} />
            Preview viewer portal
          </button>
          <div className="rounded-2xl bg-gradient-to-br from-white/80 to-white/40 p-4 ring-1 ring-black/[0.04]">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <ShieldCheck size={16} className="text-emerald-600" />
              Protected portal
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              Materials are view-only. Nothing is shared as a downloadable file.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  const router = useRouter();
  const { session, signOut } = useStore();
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState<"none" | "notifications" | "profile">("none");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenu("none");
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header className="sticky top-0 z-20 px-4 pt-4 sm:px-8">
      <div className="glass mx-auto flex h-16 max-w-[1280px] items-center gap-3 rounded-full pr-2.5 pl-3 sm:pl-5">
        <Link href="/dashboard" className="lg:hidden">
          <LogoMark size={34} />
        </Link>
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/projects${query ? `?q=${encodeURIComponent(query)}` : ""}`);
          }}
        >
          <Search size={17} className="absolute top-1/2 left-0 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, materials, viewers…"
            className="h-10 w-full bg-transparent pl-7 text-[14px] outline-none placeholder:text-ink-muted/80"
          />
        </form>

        <div ref={ref} className="relative flex items-center gap-1">
          <IconButton label="Notifications" onClick={() => setMenu(menu === "notifications" ? "none" : "notifications")} className="relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-accent ring-2 ring-white" />
          </IconButton>

          <button
            type="button"
            onClick={() => setMenu(menu === "profile" ? "none" : "profile")}
            className="flex items-center gap-2.5 rounded-full py-1 pr-3 pl-1 transition hover:bg-black/[0.04]"
          >
            <Avatar name={session?.name ?? "Jake"} size={34} />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[13px] font-semibold">{session?.name}</span>
              <span className="block text-[11px] text-ink-muted">Owner</span>
            </span>
          </button>

          {menu === "notifications" && (
            <div className="glass-strong absolute top-14 right-0 w-[320px] animate-scale-in rounded-3xl p-2">
              <div className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-ink-muted uppercase">Activity</div>
              {NOTIFICATIONS.map((n) => (
                <div key={n.who + n.when} className="flex gap-3 rounded-2xl p-3 hover:bg-black/[0.03]">
                  <Avatar name={n.who} size={32} />
                  <div className="text-[13px] leading-snug">
                    <span className="font-semibold">{n.who}</span> {n.what}
                    <div className="mt-0.5 text-xs text-ink-muted">{n.when}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {menu === "profile" && (
            <div className="glass-strong absolute top-14 right-0 w-[240px] animate-scale-in rounded-3xl p-2">
              <div className="px-3 py-2">
                <div className="text-sm font-semibold">{session?.name}</div>
                <div className="text-xs text-ink-muted">{session?.email}</div>
              </div>
              <div className="my-1 h-px bg-black/[0.06]" />
              <Link href="/settings" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-black/[0.04]">
                <Settings size={16} /> Settings
              </Link>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.replace("/owner");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="glass fixed inset-x-4 bottom-4 z-30 flex justify-around rounded-full p-1.5 lg:hidden">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[10px] font-medium transition",
              active ? "bg-white text-accent shadow-sm" : "text-ink-muted",
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
