"use client";

import { ArrowRight, Clapperboard, FileText, Users, VideoOff } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Project } from "@/lib/types";
import { cn, formatRelative } from "@/lib/utils";
import { ProjectStatusBadge } from "./badges";
import { PosterArt } from "./poster-art";
import { buttonClass } from "./ui";

export function ProjectCard({
  project,
  href,
  viewerCount,
  footer,
  topRight,
  index = 0,
  showStatus = true,
}: {
  project: Project;
  href: string;
  viewerCount?: number;
  footer?: ReactNode;
  topRight?: ReactNode;
  index?: number;
  showStatus?: boolean;
}) {
  const pdfCount = project.pdfs.filter((p) => p.visible).length;
  const hasTrailer = project.trailers.length > 0;

  return (
    <article
      className="group glass flex animate-fade-up flex-col overflow-hidden rounded-[28px] p-2.5 transition-all duration-500 ease-[var(--ease-glass)] hover:-translate-y-1 hover:shadow-[0_30px_60px_-24px_rgba(15,23,42,0.28)]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <Link href={href} className="sheen relative block overflow-hidden rounded-[22px]">
        <PosterArt
          title={project.title}
          palette={project.palette}
          variant={project.posters[0]?.variant ?? 0}
          compact
          className="aspect-[4/3] transition-transform duration-700 ease-[var(--ease-glass)] group-hover:scale-[1.04]"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {showStatus && <ProjectStatusBadge status={project.status} className="bg-white/85 backdrop-blur-md" />}
        </div>
        {topRight && <div className="absolute top-3 right-3">{topRight}</div>}
      </Link>

      <div className="flex flex-1 flex-col px-3 pt-4 pb-2">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[19px] font-semibold tracking-[-0.02em]">{project.title}</h3>
          <span className="shrink-0 text-xs text-ink-muted">{project.genre}</span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-muted">{project.description}</p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[12.5px] text-ink-soft">
          <Stat icon={<FileText size={14} />}>
            {pdfCount} PDF{pdfCount === 1 ? "" : "s"}
          </Stat>
          <Stat icon={hasTrailer ? <Clapperboard size={14} /> : <VideoOff size={14} />} muted={!hasTrailer}>
            {hasTrailer ? "Trailer" : "No trailer"}
          </Stat>
          {viewerCount !== undefined && (
            <Stat icon={<Users size={14} />}>
              {viewerCount} viewer{viewerCount === 1 ? "" : "s"}
            </Stat>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          {footer ?? <span className="text-xs text-ink-muted">Updated {formatRelative(project.updatedAt)}</span>}
          <Link href={href} className={buttonClass("secondary", "sm", "group/btn shrink-0")}>
            Open Project
            <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function Stat({ icon, children, muted }: { icon: ReactNode; children: ReactNode; muted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", muted && "text-ink-muted/70")}>
      {icon}
      {children}
    </span>
  );
}
