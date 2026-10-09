"use client";

import { ArrowLeft, Clapperboard, EyeOff, FileText, Film, Link2, Image as ImageIcon, KeyRound, Pencil, Presentation, UserPlus } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { PdfDoc, Project } from "@/lib/types";
import { formatRelative, formatRuntime, isGrantLive } from "@/lib/utils";
import { AccessList } from "./access-list";
import { NoDownloadsNote, ProjectStatusBadge, ProtectedBadge, ViewOnlyBadge } from "./badges";
import { FilmPlayer } from "./film-player";
import { InviteForm } from "./invite-form";
import { PdfViewer, usePageImages } from "./pdf-viewer";
import { ProjectCover } from "./project-cover";
import { PosterGallery } from "./poster-gallery";
import { TrailerPlayer } from "./trailer-player";
import { Avatar, Badge, Button, ButtonLink, EmptyState, GlassCard, Modal, Segmented, buttonClass } from "./ui";

type Tab = "film" | "presentations" | "posters" | "trailers" | "access";

export function ProjectView({
  project,
  mode,
  backHref,
  watermark,
  canWatchFilm = false,
}: {
  project: Project;
  mode: "admin" | "viewer";
  backHref: string;
  watermark?: string;
  /** Viewer only: whether one of their grants includes the full film. */
  canWatchFilm?: boolean;
}) {
  const { grantsForProject } = useStore();
  const [tab, setTab] = useState<Tab>("presentations");
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [inviting, setInviting] = useState(false);
  const admin = mode === "admin";
  const showFilm = Boolean(project.film) && (admin || canWatchFilm);

  const pdfs = admin ? project.pdfs : project.pdfs.filter((d) => d.visible);
  const grants = grantsForProject(project.id);

  const tabs = [
    ...(showFilm ? [{ value: "film" as Tab, label: "Film", icon: <Film size={15} /> }] : []),
    { value: "presentations" as Tab, label: "Presentations", icon: <Presentation size={15} />, count: pdfs.length },
    { value: "posters" as Tab, label: "Posters", icon: <ImageIcon size={15} />, count: project.posters.length },
    { value: "trailers" as Tab, label: "Trailers", icon: <Clapperboard size={15} />, count: project.trailers.length },
    ...(admin ? [{ value: "access" as Tab, label: "Access", icon: <KeyRound size={15} />, count: grants.length }] : []),
  ];

  return (
    <>
      <ButtonLink href={backHref} variant="ghost" size="sm" className="-ml-3 mb-4">
        <ArrowLeft size={15} /> {admin ? "Projects" : "All projects"}
      </ButtonLink>

      {/* Header */}
      <GlassCard className="relative mb-8 animate-fade-up overflow-hidden rounded-[32px] p-3 sm:p-4">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{ background: project.palette.glow }}
        />
        <div className="relative grid gap-6 md:grid-cols-[240px_1fr]">
          <div className="protected overflow-hidden rounded-[24px] shadow-[0_24px_48px_-20px_rgba(15,23,42,0.45)]" onContextMenu={(e) => e.preventDefault()}>
            <ProjectCover project={project} className={project.cover ? "aspect-[16/10] md:aspect-[2/3]" : "aspect-[2/3] max-md:aspect-[16/10]"} />
          </div>
          <div className="flex flex-col px-2 pb-3 md:py-4 md:pr-4">
            <div className="flex flex-wrap items-center gap-2">
              {admin && (
                <>
                  <ProjectStatusBadge status={project.status} />
                  <ProtectedBadge />
                </>
              )}
              <span className="text-xs text-ink-muted">
                {project.genre} · {project.year}
              </span>
            </div>
            <h1 className="mt-4 text-[34px] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-[46px]">{project.title}</h1>
            <p className="mt-2 text-[16px] text-ink-soft">{project.description}</p>
            <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-ink-muted">{project.summary}</p>

            {admin && (
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                <Button onClick={() => setInviting(true)}>
                  <UserPlus size={16} /> Invite Viewer
                </Button>
                <ButtonLink href={`/projects/${project.id}/edit`} variant="secondary">
                  <Pencil size={15} /> Edit Project
                </ButtonLink>
                <span className="text-xs text-ink-muted">Updated {formatRelative(project.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      <Segmented className="mb-6" value={tab} onChange={setTab} options={tabs} />

      <div key={tab} className="animate-fade-up">
        {tab === "film" && showFilm && (
          <div className="space-y-5">
            <FilmPlayer project={project} watermark={watermark} />
            {admin && <FilmAccess project={project} />}
          </div>
        )}

        {tab === "presentations" &&
          (pdfs.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {pdfs.map((d, i) => (
                <PdfCard key={d.id} doc={d} project={project} index={i} onOpen={() => setDoc(d)} admin={admin} />
              ))}
            </div>
          ) : (
            <GlassCard>
              <EmptyState icon={<FileText size={22} />} title="No presentations yet" body="Decks and documents will appear here." />
            </GlassCard>
          ))}

        {tab === "posters" && (
          <GlassCard className="p-5 sm:p-7">
            <PosterGallery project={project} watermark={watermark} discreet={!admin} />
          </GlassCard>
        )}

        {tab === "trailers" && (
          <GlassCard className="p-4 sm:p-6">
            <TrailerPlayer project={project} watermark={watermark} discreet={!admin} />
          </GlassCard>
        )}

        {tab === "access" && admin && (
          <GlassCard className="p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 px-1">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Viewers with access</h2>
                <p className="text-[13px] text-ink-muted">People who can view {project.title}. You control how long.</p>
              </div>
              <Button onClick={() => setInviting(true)} size="sm">
                <UserPlus size={14} /> Invite Viewer
              </Button>
            </div>
            <AccessList grants={grants} showPreview />
          </GlassCard>
        )}

        {admin && <NoDownloadsNote className="mt-8 justify-center" />}
      </div>

      <PdfViewer doc={doc} project={project} watermark={watermark} discreet={!admin} onClose={() => setDoc(null)} />

      {admin && (
        <Modal
          open={inviting}
          onClose={() => setInviting(false)}
          title="Grant access"
          subtitle="Share view-only access by email. You decide when it ends."
          className="max-w-xl"
        >
          <InviteForm
            defaultProjectIds={[project.id]}
            onSent={() => setTab("access")}
          />
        </Modal>
      )}
    </>
  );
}

function PdfCard({ doc, project, index, onOpen, admin }: { doc: PdfDoc; project: Project; index: number; onOpen: () => void; admin: boolean }) {
  const { from, via, to } = project.palette;
  const cover = usePageImages(doc)?.[0];
  return (
    <GlassCard
      className="group animate-fade-up overflow-hidden rounded-[26px] p-2.5 transition-all duration-500 ease-[var(--ease-glass)] hover:-translate-y-1 hover:shadow-[0_30px_60px_-24px_rgba(15,23,42,0.28)]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <button type="button" onClick={onOpen} className="sheen relative block w-full overflow-hidden rounded-[20px] bg-white/60 px-5 pt-7 pb-5 text-left">
        {/* Stacked page preview */}
        <div className="relative mx-auto aspect-[16/10] w-[86%]">
          <div className="absolute inset-0 translate-x-3 -translate-y-3 rotate-3 rounded-lg bg-white shadow-md ring-1 ring-black/5" />
          <div className="absolute inset-0 translate-x-1.5 -translate-y-1.5 rotate-[1.5deg] rounded-lg bg-white shadow-md ring-1 ring-black/5" />
          {cover ? (
            <div className="absolute inset-0 overflow-hidden rounded-lg bg-white shadow-lg transition-transform duration-500 group-hover:-translate-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt="" draggable={false} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div
              className="absolute inset-0 flex flex-col justify-end rounded-lg p-3 text-white shadow-lg transition-transform duration-500 group-hover:-translate-y-1"
              style={{ background: `linear-gradient(135deg, ${from}, ${via} 70%, ${to})` }}
            >
              <div className="text-[8px] tracking-[0.3em] text-white/70 uppercase">{doc.title}</div>
              <div className="text-sm font-light tracking-[0.15em] uppercase">{project.title}</div>
            </div>
          )}
        </div>
      </button>
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[16px] font-semibold tracking-tight">{doc.title}</h3>
          {admin &&
            (doc.visible ? (
              <ViewOnlyBadge />
            ) : (
              <Badge tone="neutral" icon={<EyeOff size={11} />}>
                Hidden
              </Badge>
            ))}
        </div>
        <div className="mt-1 text-[13px] text-ink-muted">
          {doc.pages} pages · Updated {formatRelative(doc.updatedAt)}
        </div>
        <button type="button" onClick={onOpen} className={buttonClass("secondary", "sm", "mt-4 w-full")}>
          Open Viewer
        </button>
      </div>
    </GlassCard>
  );
}

/** Owner-only panel under the film: where it's hosted and exactly who can watch it. */
function FilmAccess({ project }: { project: Project }) {
  const { grantsForProject } = useStore();
  const film = project.film!;
  const watchers = grantsForProject(project.id).filter((g) => g.includeFilm && isGrantLive(g));

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <GlassCard className="p-5 sm:p-6">
        <div className="text-[11px] font-semibold tracking-wider text-ink-muted uppercase">Source</div>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-white">
            <Link2 size={17} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{film.url}</div>
            <div className="text-xs text-ink-muted">
              Private streaming link · {formatRuntime(film.duration)}
            </div>
          </div>
        </div>
        <ul className="mt-5 space-y-2 text-[13px] text-ink-soft">
          <li>• Shared only with viewers you explicitly tick “Include the full film” for</li>
          <li>• Each viewer&apos;s email drifts across the picture while it plays</li>
          <li>• Streamed only — there&apos;s never a file to download</li>
        </ul>
      </GlassCard>
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold tracking-wider text-ink-muted uppercase">Who can watch</div>
          <Badge tone={watchers.length ? "amber" : "neutral"}>
            {watchers.length} viewer{watchers.length === 1 ? "" : "s"}
          </Badge>
        </div>
        {watchers.length ? (
          <div className="mt-4 space-y-3">
            {watchers.map((g) => (
              <div key={g.id} className="flex items-center gap-3">
                <Avatar name={g.name} size={32} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{g.name}</div>
                  <div className="truncate text-xs text-ink-muted">{g.email}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-muted">Nobody yet. Invite a viewer and switch on “Include the full film”.</p>
        )}
      </GlassCard>
    </div>
  );
}
