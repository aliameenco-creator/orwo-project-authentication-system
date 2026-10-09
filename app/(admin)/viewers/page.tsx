"use client";

import { Eye, Hourglass, KeyRound, Search, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { usePreviewAs } from "@/components/admin-shell";
import { GrantStatusBadge } from "@/components/badges";
import { Avatar, Button, ButtonLink, EmptyState, GlassCard, PageHeader, inputClass } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { AccessGrant } from "@/lib/types";
import { cn, expiryLabel, isGrantLive } from "@/lib/utils";

export default function ViewersPage() {
  const { grants, projects, hasAccount } = useStore();
  const previewAs = usePreviewAs();
  const [query, setQuery] = useState("");

  // One entry per email, represented by their most relevant grant.
  const viewers = useMemo(() => {
    const byEmail = new Map<string, AccessGrant[]>();
    grants.forEach((g) => byEmail.set(g.email, [...(byEmail.get(g.email) ?? []), g]));
    return [...byEmail.entries()]
      .map(([email, list]) => {
        const primary =
          [...list].sort((a, b) => Number(isGrantLive(b)) - Number(isGrantLive(a)) || +new Date(b.expiryDate) - +new Date(a.expiryDate))[0]!;
        const projectIds = [...new Set(list.filter(isGrantLive).flatMap((g) => g.projectIds))];
        return { email, name: primary.name, primary, projectIds, live: isGrantLive(primary) };
      })
      .filter((v) => !query || `${v.name} ${v.email}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => Number(b.live) - Number(a.live));
  }, [grants, query]);

  const title = (id: string) => projects.find((p) => p.id === id)?.title ?? "—";

  return (
    <>
      <PageHeader
        title="Viewers"
        subtitle="Everyone who has been invited to view your work."
        actions={
          <ButtonLink href="/access">
            <UserPlus size={16} /> Invite Viewer
          </ButtonLink>
        }
      />

      <div className="relative mb-6 md:max-w-sm">
        <Search size={17} className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-ink-muted" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search viewers" className={cn(inputClass, "glass rounded-full pl-11")} />
      </div>

      {viewers.length === 0 ? (
        <GlassCard>
          <EmptyState icon={<Users size={22} />} title="No viewers found" />
        </GlassCard>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {viewers.map((v, i) => (
            <GlassCard
              key={v.email}
              className={cn("flex animate-fade-up flex-col p-5 transition-all duration-500 hover:-translate-y-0.5", !v.live && "opacity-70")}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-3.5">
                <Avatar name={v.name} size={46} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold tracking-tight">{v.name}</div>
                  <div className="truncate text-xs text-ink-muted">{v.email}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <GrantStatusBadge grant={v.primary} />
                    <span className={cn("text-[11px]", hasAccount(v.email) ? "text-emerald-600" : "text-amber-600")}>
                      {hasAccount(v.email) ? "Joined" : "Invite pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex-1">
                <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-muted uppercase">Can view</div>
                {v.projectIds.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {v.projectIds.map((id) => (
                      <span key={id} className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium ring-1 ring-black/[0.05]">
                        {title(id)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-ink-muted">No active projects</span>
                )}
              </div>

              <div className="mt-5 flex items-center gap-1.5 text-xs text-ink-muted">
                <Hourglass size={13} /> {expiryLabel(v.primary)}
              </div>

              <div className="mt-4 flex gap-2 border-t border-black/[0.05] pt-4">
                <Button variant="secondary" size="sm" className="flex-1" disabled={!v.live} onClick={() => previewAs(v.email)}>
                  <Eye size={14} /> Preview as
                </Button>
                <ButtonLink href="/access" variant="ghost" size="sm" className="flex-1">
                  <KeyRound size={14} /> Manage
                </ButtonLink>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </>
  );
}
