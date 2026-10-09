"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AuthLayout, Spinner } from "@/components/auth-layout";
import { Button, ButtonLink, Field, Input } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cn, isGrantLive } from "@/lib/utils";

/** Invitation landing: the viewer creates their own password. Jake never sees or sends passwords. */
export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { grants, projects, hasAccount, acceptInvite, session, signOut } = useStore();
  const grant = grants.find((g) => g.token === token);
  const [name, setName] = useState(grant?.name ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!grant || !isGrantLive(grant))
    return (
      <AuthLayout title="This link has expired" subtitle="Invitation links only work for a limited time. Please ask the person who invited you to send a new one.">
        <ButtonLink href="/" variant="secondary" className="w-full">
          Go to sign in
        </ButtonLink>
      </AuthLayout>
    );

  if (hasAccount(grant.email))
    return (
      <AuthLayout title="You're already set up" subtitle={<>Sign in with {grant.email} to see what&apos;s been shared with you.</>}>
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            if (session) signOut();
            router.push("/");
          }}
        >
          Sign In <ArrowRight size={16} />
        </Button>
      </AuthLayout>
    );

  const titles = grant.projectIds.map((id) => projects.find((p) => p.id === id)?.title).filter(Boolean) as string[];
  const rules = [
    { ok: password.length >= 8, label: "At least 8 characters" },
    { ok: /\d/.test(password) || /[^a-zA-Z0-9]/.test(password), label: "A number or symbol" },
  ];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Enter your name.");
    if (!rules.every((r) => r.ok)) return setError("Choose a stronger password.");
    if (password !== confirm) return setError("Passwords don't match.");
    setError("");
    setLoading(true);
    setTimeout(() => {
      const res = acceptInvite(token, name, password);
      if (res.ok) router.replace("/viewer");
      else {
        setError(res.error);
        setLoading(false);
      }
    }, 600);
  }

  return (
    <AuthLayout
      title="Set up your account"
      subtitle={
        <>
          Jake has shared <strong className="font-semibold text-ink">{titles.join(", ")}</strong> with you. Choose a password to continue.
        </>
      }
      footer={
        <>
          Already set up?{" "}
          <Link href="/" className="font-medium text-ink hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email">
          <Input value={grant.email} disabled className="opacity-70" />
        </Field>
        <Field label="Your name">
          <Input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Create password">
          <Input type="password" autoComplete="new-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {rules.map((r) => (
            <span key={r.label} className={cn("inline-flex items-center gap-1.5 text-xs transition-colors", r.ok ? "text-emerald-600" : "text-ink-muted")}>
              <Check size={12} strokeWidth={3} /> {r.label}
            </span>
          ))}
        </div>
        <Field label="Confirm password">
          <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        {error && <p className="animate-fade-in text-sm font-medium text-red-600">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <Spinner />
          ) : (
            <>
              Create Account <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
