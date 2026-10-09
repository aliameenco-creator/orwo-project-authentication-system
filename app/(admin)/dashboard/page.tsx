"use client";

import { Clapperboard, FileText, Hourglass, Plus, Users } from "lucide-react";
import type { ReactNode } from "react";
import { ProjectsBrowser } from "@/components/projects-browser";
import { ButtonLink, GlassCard, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";
import { grantStatus, isGrantLive } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function DashboardPage() {
  const { projects, grants, session } = useStore();
  const live = grants.filter(isGrantLive);
  const expiring = grants.filter((g) => grantStatus(g) === "Expiring");
  const materials = projects.reduce((n, p) => n + p.pdfs.length + p.posters.length + p.trailers.length, 0);

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle={`${greeting()}, ${session?.name.split(" ")[0]}. Here's what's being viewed.`}
        actions={
          <ButtonLink href="/projects/new">
            <Plus size={16} /> New Project
          </ButtonLink>
        }
      />

      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={<Clapperboard size={18} />} label="Active projects" value={projects.filter((p) => p.status === "Active").length} tint="from-sky-400/20" />
        <StatTile icon={<Users size={18} />} label="Viewers with access" value={live.length} tint="from-emerald-400/20" />
        <StatTile icon={<Hourglass size={18} />} label="Expiring in 48h" value={expiring.length} tint="from-amber-400/25" />
        <StatTile icon={<FileText size={18} />} label="Protected materials" value={materials} tint="from-violet-400/20" />
      </div>

      <ProjectsBrowser />
    </>
  );
}

function StatTile({ icon, label, value, tint }: { icon: ReactNode; label: string; value: number; tint: string }) {
  return (
    <GlassCard className="relative animate-fade-up overflow-hidden p-5">
      <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${tint} to-transparent blur-2xl`} />
      <div className="relative">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/80 text-ink-soft shadow-sm">{icon}</div>
        <div className="mt-4 text-[30px] leading-none font-semibold tracking-[-0.03em]">{value}</div>
        <div className="mt-1.5 text-[13px] text-ink-muted">{label}</div>
      </div>
    </GlassCard>
  );
}
