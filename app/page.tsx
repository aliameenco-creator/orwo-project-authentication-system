"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { PosterArt } from "@/components/poster-art";
import { Button, Field, Input, Segmented } from "@/components/ui";
import { ADMIN, DEMO_VIEWER_EMAIL } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

type Mode = "admin" | "viewer";

export default function LoginPage() {
  const router = useRouter();
  const { session, signIn, grants, projects } = useStore();
  const [mode, setMode] = useState<Mode>("admin");
  const [email, setEmail] = useState(ADMIN.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already signed in — skip straight to the right home.
  useEffect(() => {
    if (session) router.replace(session.role === "admin" ? "/dashboard" : "/viewer");
  }, [session, router]);

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
    setEmail(m === "admin" ? ADMIN.email : DEMO_VIEWER_EMAIL);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const addr = email.trim().toLowerCase();
    if (!addr || !password) {
      setError("Enter your email and password.");
      return;
    }

    if (mode === "viewer") {
      const grant = grants.find((g) => g.email === addr);
      if (!grant) {
        setError("No invitation found for this email.");
        return;
      }
      setLoading(true);
      setTimeout(() => signIn({ role: "viewer", email: addr, name: grant.name }), 600);
      return;
    }

    // Mock auth: any password works for Jake.
    setLoading(true);
    setTimeout(() => signIn({ role: "admin", email: addr, name: ADMIN.name }), 600);
  }

  const showcase = projects.slice(0, 3);

  return (
    <main className="relative grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Showcase */}
      <section className="relative hidden items-center justify-center overflow-hidden lg:flex">
        <div className="relative h-[520px] w-[520px]">
          {showcase.map((p, i) => (
            <div
              key={p.id}
              className="absolute top-1/2 left-1/2 w-[230px]"
              style={{
                transform: `translate(${-50 + (i - 1) * 62}%, -50%) rotate(${(i - 1) * 7}deg) scale(${i === 1 ? 1.06 : 0.94})`,
                zIndex: i === 1 ? 2 : 1,
              }}
            >
              <div
                className="animate-fade-up overflow-hidden rounded-[28px] shadow-[0_40px_80px_-30px_rgba(15,23,42,0.55)] ring-1 ring-white/60"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <PosterArt title={p.title} palette={p.palette} variant={p.posters[0]?.variant ?? 0} className="aspect-[2/3]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sign-in */}
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-[420px] animate-fade-up">
          <Brand height={64} className="mb-8" />
          <h1 className="text-[40px] leading-[1.05] font-semibold tracking-[-0.035em]">
            Welcome back<span className="text-ink-muted">.</span>
          </h1>
          <p className="mt-3 text-[15px] text-ink-muted">Private access for film projects, decks, posters, and trailers.</p>

          <div className="glass-strong mt-8 rounded-[32px] p-7">
            <Segmented
              className="mb-6 w-full [&>button]:flex-1 [&>button]:justify-center"
              value={mode}
              onChange={switchMode}
              options={[
                { value: "admin", label: "Owner" },
                { value: "viewer", label: "Invited viewer" },
              ]}
            />

            <form onSubmit={submit} className="space-y-4">
              <Field label="Email">
                <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label="Password" hint={mode === "admin" ? "Any password works in this prototype" : "Any password works"}>
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>

              {error && <p className="animate-fade-in text-sm font-medium text-red-600">{error}</p>}

              <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>
          </div>

        </div>
      </section>
    </main>
  );
}
