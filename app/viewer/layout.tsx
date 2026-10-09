"use client";

import { Eye, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Brand, LogoMark } from "@/components/brand";
import { Avatar, Button } from "@/components/ui";
import { ADMIN } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

export default function ViewerLayout({ children }: { children: React.ReactNode }) {
  const { session, signIn, signOut } = useStore();
  const router = useRouter();
  // Set while exiting a preview so the guard doesn't override the chosen destination.
  const leaving = useRef(false);

  useEffect(() => {
    if (leaving.current) return;
    if (!session) router.replace("/");
    else if (session.role !== "viewer") router.replace("/dashboard");
  }, [session, router]);

  if (session?.role !== "viewer") return null;

  function exit() {
    if (session?.preview) {
      leaving.current = true;
      signIn({ role: "admin", email: ADMIN.email, name: ADMIN.name });
      router.push("/viewers");
    } else {
      signOut();
      router.replace("/");
    }
  }

  return (
    <div className="min-h-screen">
      {session.preview && (
        <div className="sticky top-0 z-40 flex items-center justify-center gap-3 bg-ink px-4 py-2 text-[13px] text-white">
          <Eye size={15} className="shrink-0 text-white/70" />
          <span className="truncate">
            Previewing as <strong className="font-semibold">{session.name}</strong> — this is exactly what they see.
          </span>
          <button type="button" onClick={exit} className="shrink-0 rounded-full bg-white/15 px-3 py-1 font-medium transition hover:bg-white/25">
            Return to owner view
          </button>
        </div>
      )}

      <header className="sticky top-0 z-30 px-4 pt-4 sm:px-8" style={session.preview ? { top: 36 } : undefined}>
        <div className="glass mx-auto flex h-16 max-w-[1180px] items-center gap-3 rounded-full pr-2.5 pl-3 sm:pl-4">
          <Link href="/viewer" className="flex items-center">
            <Brand height={40} className="hidden sm:flex" />
            <LogoMark size={34} className="sm:hidden" />
          </Link>
          <div className="ml-auto flex items-center gap-2.5 rounded-full py-1 pr-1 pl-1 sm:pl-3">
            <span className="hidden text-right leading-tight sm:block">
              <span className="block text-[13px] font-semibold">{session.name}</span>
              <span className="block text-[11px] text-ink-muted">{session.email}</span>
            </span>
            <Avatar name={session.name} size={34} />
          </div>
          <Button variant="ghost" size="sm" onClick={exit}>
            <LogOut size={14} />
            <span className="hidden sm:inline">{session.preview ? "Exit" : "Sign out"}</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-5 pt-8 pb-16 sm:px-8">{children}</main>
    </div>
  );
}
