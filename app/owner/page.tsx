"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthLayout, Spinner } from "@/components/auth-layout";
import { Button, Field, Input } from "@/components/ui";
import { ADMIN } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

/** Owner sign-in — a separate, unlinked address from the viewer sign-in. */
export default function OwnerSignInPage() {
  const router = useRouter();
  const { session, ownerSignIn } = useStore();
  const [email, setEmail] = useState(ADMIN.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.role === "admin") router.replace("/dashboard");
  }, [session, router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const res = ownerSignIn(email, password);
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
      }
    }, 500);
  }

  return (
    <AuthLayout title="Owner sign in" subtitle="Manage projects and who can see them." footer="Prototype: any password works for the owner.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email">
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <Input type="password" autoComplete="current-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
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
    </AuthLayout>
  );
}
