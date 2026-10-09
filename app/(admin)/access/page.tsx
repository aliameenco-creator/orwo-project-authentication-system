"use client";

import { Ban, Clock, KeyRound, Link as LinkIcon, Mail, ShieldCheck } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { AccessList } from "@/components/access-list";
import { InviteForm } from "@/components/invite-form";
import { GlassCard, PageHeader, Segmented } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { GrantStatus } from "@/lib/types";
import { grantStatus } from "@/lib/utils";

type Filter = "All" | GrantStatus;

export default function AccessPage() {
  const { grants } = useStore();
  const [filter, setFilter] = useState<Filter>("All");

  const visible = useMemo(() => (filter === "All" ? grants : grants.filter((g) => grantStatus(g) === filter)), [grants, filter]);
  const count = (f: Filter) => (f === "All" ? grants.length : grants.filter((g) => grantStatus(g) === f).length);

  return (
    <>
      <PageHeader title="Access" subtitle="Grant time-limited, view-only access by email. You decide when it ends." />

      <div className="mb-10 grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <GlassCard className="animate-fade-up p-6 sm:p-8">
          <h2 className="mb-1 text-xl font-semibold tracking-[-0.02em]">Invite a viewer</h2>
          <p className="mb-6 text-[13px] text-ink-muted">They&apos;ll receive a private link to the projects you choose.</p>
          <InviteForm />
        </GlassCard>

        <GlassCard className="relative animate-fade-up overflow-hidden p-6 [animation-delay:80ms] sm:p-8">
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl" />
          <h2 className="mb-6 text-xl font-semibold tracking-[-0.02em]">How access works</h2>
          <ol className="relative space-y-6">
            <Step icon={<Mail size={16} />} title="Invite by email">
              Choose the projects, whether to include the full film, and how long — 1, 3, 7 days or custom.
            </Step>
            <Step icon={<LinkIcon size={16} />} title="They set their own password">
              The email contains a one-time invitation link. They choose a password there — you never see or send it.
            </Step>
            <Step icon={<KeyRound size={16} />} title="Separate sign-in">
              From then on they sign in on the viewer page. Your owner sign-in is a different address they never see.
            </Step>
            <Step icon={<ShieldCheck size={16} />} title="View only">
              Decks show as page images with their email on them. Posters, trailers and the film stream — nothing to download.
            </Step>
            <Step icon={<Clock size={16} />} title="Automatic expiry">
              When time runs out, access ends. Extend it any time, or revoke instantly.
            </Step>
            <Step icon={<Ban size={16} />} title="Revoke anytime" last>
              Revoking cuts access immediately and disables their link.
            </Step>
          </ol>
        </GlassCard>
      </div>

      <GlassCard className="animate-fade-up p-4 [animation-delay:120ms] sm:p-6">
        <div className="mb-5 flex flex-col gap-3 px-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.02em]">Invited viewers</h2>
            <p className="text-[13px] text-ink-muted">Everyone you&apos;ve shared with, and when their access ends.</p>
          </div>
          <Segmented
            value={filter}
            onChange={setFilter}
            options={(["All", "Active", "Expiring", "Expired", "Revoked"] as Filter[]).map((f) => ({ value: f, label: f, count: count(f) }))}
          />
        </div>
        <AccessList grants={visible} showPreview />
      </GlassCard>
    </>
  );
}

function Step({ icon, title, children, last }: { icon: ReactNode; title: string; children: ReactNode; last?: boolean }) {
  return (
    <li className="relative flex gap-4">
      {!last && <span className="absolute top-10 bottom-[-20px] left-[17px] w-px bg-gradient-to-b from-black/10 to-transparent" />}
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-ink-soft shadow-sm ring-1 ring-black/[0.04]">{icon}</span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{children}</p>
      </div>
    </li>
  );
}
