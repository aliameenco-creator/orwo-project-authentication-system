"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthLayout, Spinner } from "@/components/auth-layout";
import { Button, Field, Input, Modal } from "@/components/ui";
import { useStore } from "@/lib/store";

/** Viewer sign-in — the public front door. The owner signs in separately at /owner. */
export default function ViewerSignInPage() {
  const router = useRouter();
  const { session, viewerSignIn } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);

  useEffect(() => {
    if (session) router.replace(session.role === "admin" ? "/dashboard" : "/viewer");
  }, [session, router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setError("");
    setLoading(true);
    setTimeout(() => {
      const res = viewerSignIn(email, password);
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
      }
    }, 500);
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Welcome back."
      footer={<>New here? Use the invitation link that was emailed to you to set up your account.</>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email">
          <Input type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <div className="-mt-1 text-right">
          <button type="button" onClick={() => setForgot(true)} className="text-[13px] font-medium text-ink-muted hover:text-ink">
            Forgot password?
          </button>
        </div>
        {error && <p className="animate-fade-in text-sm font-medium text-red-600">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <Spinner />
          ) : (
            <>
              Sign In <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>

      <Modal open={forgot} onClose={() => setForgot(false)} title="Reset your password">
        <p className="text-sm leading-relaxed text-ink-soft">
          If an account exists for your email, we&apos;ll send you a link to choose a new password. In this prototype, ask Jake to re-send
          your invitation instead.
        </p>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setForgot(false)}>OK</Button>
        </div>
      </Modal>
    </AuthLayout>
  );
}
