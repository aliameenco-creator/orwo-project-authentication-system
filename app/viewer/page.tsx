"use client";

import { Hourglass, Lock, ShieldCheck } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { PosterArt } from "@/components/poster-art";
import { EmptyState, GlassCard } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cn, daysUntil, expiryLabel, isGrantLive, viewerAccess } from "@/lib/utils";

export default function ViewerHome() {
  const { session, grants, projects } = useStore();
  if (!session) return null;

  const access = viewerAccess(grants, session.email);
  const shared = projects.filter((p) => access.has(p.id));
  const live = shared.filter((p) => isGrantLive(access.get(p.id)!));
  const ended = shared.filter((p) => !isGrantLive(access.get(p.id)!));
  const message = [...access.values()].find((g) => g.message && isGrantLive(g))?.message;

  return (
    <>
      <div className="mb-8 animate-fade-up">
        <h1 className="text-[34px] leading-tight font-semibold tracking-[-0.035em] sm:text-[44px]">
          Hi {session.name.split(" ")[0]}<span className="text-ink-muted">,</span>
        </h1>
        <p className="mt-1.5 text-[15px] text-ink-muted">
          {live.length
            ? `${live.length} project${live.length === 1 ? " has" : "s have"} been shared with you privately.`
            : "There are no active projects shared with you right now."}
        </p>
      </div>

      <GlassCard className="mb-10 flex animate-fade-up flex-col gap-4 p-5 [animation-delay:60ms] sm:flex-row sm:items-center">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <ShieldCheck size={20} />
        </span>
        <div className="flex-1">
          <div className="text-sm font-semibold">Access controlled by Orwo Family</div>
          <p className="text-[13px] text-ink-muted">
            This content is view-only. Presentations are watermarked with your email and nothing can be downloaded.
          </p>
        </div>
        {message && (
          <blockquote className="rounded-2xl bg-white/70 px-4 py-3 text-[13px] text-ink-soft italic ring-1 ring-black/[0.04] sm:max-w-sm">
            “{message}” <span className="not-italic text-ink-muted">— Jake</span>
          </blockquote>
        )}
      </GlassCard>

      {live.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {live.map((p, i) => {
            const g = access.get(p.id)!;
            const soon = daysUntil(g.expiryDate) <= 2;
            return (
              <ProjectCard
                key={p.id}
                project={p}
                href={`/viewer/${p.id}`}
                index={i}
                showStatus={false}
                topRight={
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                    <Lock size={11} /> View Only
                  </span>
                }
                footer={
                  <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", soon ? "text-amber-600" : "text-ink-muted")}>
                    <Hourglass size={13} /> {expiryLabel(g)}
                  </span>
                }
              />
            );
          })}
        </div>
      ) : (
        <GlassCard>
          <EmptyState icon={<Lock size={22} />} title="Nothing to view yet" body="When Jake shares a project with you, it will appear here." />
        </GlassCard>
      )}

      {ended.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-ink-muted uppercase">Access ended</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ended.map((p) => (
              <GlassCard key={p.id} className="flex items-center gap-4 p-3 opacity-80">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl grayscale">
                  <PosterArt title="" palette={p.palette} compact className="h-full w-full" />
                  <Lock size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{p.title}</div>
                  <div className="text-xs text-ink-muted">{expiryLabel(access.get(p.id)!)}</div>
                  <div className="mt-1 text-xs text-ink-muted">Ask Jake to extend your access.</div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
