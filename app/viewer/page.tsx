"use client";

import { FolderOpen } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { EmptyState, GlassCard } from "@/components/ui";
import { useStore } from "@/lib/store";
import { isGrantLive, viewerAccess } from "@/lib/utils";

export default function ViewerHome() {
  const { session, grants, projects } = useStore();
  if (!session) return null;

  // Only projects with live access are listed; expired or revoked ones simply disappear.
  const access = viewerAccess(grants, session.email);
  const live = projects.filter((p) => access.has(p.id) && isGrantLive(access.get(p.id)!));
  const message = [...access.values()].find((g) => g.message && isGrantLive(g))?.message;

  return (
    <>
      <div className="mb-10 animate-fade-up">
        <h1 className="text-[34px] leading-tight font-semibold tracking-[-0.035em] sm:text-[44px]">
          Hi {session.name.split(" ")[0]}<span className="text-ink-muted">,</span>
        </h1>
        <p className="mt-1.5 text-[15px] text-ink-muted">
          {live.length ? "Here's what Jake has shared with you." : "There's nothing shared with you right now."}
        </p>
        {message && (
          <blockquote className="glass mt-6 max-w-2xl rounded-3xl px-5 py-4 text-[14px] leading-relaxed text-ink-soft">
            “{message}” <span className="text-ink-muted">— Jake</span>
          </blockquote>
        )}
      </div>

      {live.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {live.map((p, i) => (
            <ProjectCard key={p.id} project={p} href={`/viewer/${p.id}`} index={i} showStatus={false} />
          ))}
        </div>
      ) : (
        <GlassCard>
          <EmptyState icon={<FolderOpen size={22} />} title="Nothing to view yet" body="When Jake shares a project with you, it will appear here." />
        </GlassCard>
      )}
    </>
  );
}
