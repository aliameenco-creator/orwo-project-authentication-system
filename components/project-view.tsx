"use client";

import { ArrowLeft, Clapperboard, EyeOff, FileText, Hourglass, Image as ImageIcon, KeyRound, Pencil, Presentation, UserPlus } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { AccessGrant, PdfDoc, Project } from "@/lib/types";
import { cn, daysUntil, expiryLabel, formatRelative } from "@/lib/utils";
import { AccessList } from "./access-list";
import { NoDownloadsNote, ProjectStatusBadge, ProtectedBadge, ViewOnlyBadge } from "./badges";
import { InviteForm } from "./invite-form";
import { PdfViewer } from "./pdf-viewer";
import { PosterArt } from "./poster-art";
import { PosterGallery } from "./poster-gallery";
import { TrailerPlayer } from "./trailer-player";
import { Badge, Button, ButtonLink, EmptyState, GlassCard, Modal, Segmented, buttonClass } from "./ui";

type Tab = "presentations" | "posters" | "trailers" | "access";

export function ProjectView({
  project,
  mode,
  backHref,
  grant,
  watermark,
}: {
  project: Project;
  mode: "admin" | "viewer";
  backHref: string;
  /** Viewer's grant — drives the expiry banner. */
  grant?: AccessGrant;
  watermark?: string;
}) {
  const { grantsForProject } = useStore();
  const [tab, setTab] = useState<Tab>("presentations");
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [inviting, setInviting] = useState(false);
  const admin = mode === "admin";

  const pdfs = admin ? project.pdfs : project.pdfs.filter((d) => d.visible);
  const grants = grantsForProject(project.id);

  const tabs = [
    { value: "presentations" as Tab, label: "Presentations", icon: <Presentation size={15} />, count: pdfs.length },
    { value: "posters" as Tab, label: "Posters", icon: <ImageIcon size={15} />, count: project.posters.length },
    { value: "trailers" as Tab, label: "Trailers", icon: <Clapperboard size={15} />, count: project.trailers.length },
    ...(admin ? [{ value: "access" as Tab, label: "Access", icon: <KeyRound size={15} />, count: grants.length }] : []),
  ];

  return (
    <>
      <ButtonLink href={backHref} variant="ghost" size="sm" className="-ml-3 mb-4">
        <ArrowLeft size={15} /> {admin ? "Projects" : "Shared with you"}
      </ButtonLink>

      {/* Header */}
      <GlassCard className="relative mb-8 animate-fade-up overflow-hidden rounded-[32px] p-3 sm:p-4">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{ background: project.palette.glow }}
        />
        <div className="relative grid gap-6 md:grid-cols-[240px_1fr]">
          <div className="protected overflow-hidden rounded-[24px] shadow-[0_24px_48px_-20px_rgba(15,23,42,0.45)]" onContextMenu={(e) => e.preventDefault()}>
            <PosterArt title={project.title} palette={project.palette} variant={project.posters[0]?.variant ?? 0} className="aspect-[2/3] max-md:aspect-[16/10]" />
          </div>
          <div className="flex flex-col px-2 pb-3 md:py-4 md:pr-4">
            <div className="flex flex-wrap items-center gap-2">
              {admin ? <ProjectStatusBadge status={project.status} /> : <ViewOnlyBadge />}
              <ProtectedBadge />
              <span className="text-xs text-ink-muted">
                {project.genre} · {project.year}
              </span>
            </div>
            <h1 className="mt-4 text-[34px] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-[46px]">{project.title}</h1>
            <p className="mt-2 text-[16px] text-ink-soft">{project.description}</p>
            <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-ink-muted">{project.summary}</p>

            <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
              {admin ? (
                <>
                  <Button onClick={() => setInviting(true)}>
                    <UserPlus size={16} /> Invite Viewer
                  </Button>
                  <ButtonLink href={`/projects/${project.id}/edit`} variant="secondary">
                    <Pencil size={15} /> Edit Project
                  </ButtonLink>
                  <span className="text-xs text-ink-muted">Updated {formatRelative(project.updatedAt)}</span>
                </>
              ) : (
                grant && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                      daysUntil(grant.expiryDate) <= 2 ? "bg-amber-500/12 text-amber-700" : "bg-black/[0.04] text-ink-soft",
                    )}
                  >
                    <Hourglass size={15} /> {expiryLabel(grant)}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      <Segmented className="mb-6" value={tab} onChange={setTab} options={tabs} />

      <div key={tab} className="animate-fade-up">
        {tab === "presentations" &&
          (pdfs.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {pdfs.map((d, i) => (
                <PdfCard key={d.id} doc={d} project={project} index={i} onOpen={() => setDoc(d)} showHidden={admin} />
              ))}
            </div>
          ) : (
            <GlassCard>
              <EmptyState icon={<FileText size={22} />} title="No presentations yet" body="Decks and documents will appear here." />
            </GlassCard>
          ))}

        {tab === "posters" && (
          <GlassCard className="p-5 sm:p-7">
            <PosterGallery project={project} watermark={watermark} />
          </GlassCard>
        )}

        {tab === "trailers" && (
          <GlassCard className="p-4 sm:p-6">
            <TrailerPlayer project={project} watermark={watermark} />
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

        <NoDownloadsNote className="mt-8 justify-center" />
      </div>

      <PdfViewer doc={doc} project={project} watermark={watermark} onClose={() => setDoc(null)} />

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
            onSent={() => {
              setInviting(false);
              setTab("access");
            }}
          />
        </Modal>
      )}
    </>
  );
}

function PdfCard({ doc, project, index, onOpen, showHidden }: { doc: PdfDoc; project: Project; index: number; onOpen: () => void; showHidden: boolean }) {
  const { from, via, to } = project.palette;
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
          <div
            className="absolute inset-0 flex flex-col justify-end rounded-lg p-3 text-white shadow-lg transition-transform duration-500 group-hover:-translate-y-1"
            style={{ background: `linear-gradient(135deg, ${from}, ${via} 70%, ${to})` }}
          >
            <div className="text-[8px] tracking-[0.3em] text-white/70 uppercase">{doc.title}</div>
            <div className="text-sm font-light tracking-[0.15em] uppercase">{project.title}</div>
          </div>
        </div>
      </button>
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[16px] font-semibold tracking-tight">{doc.title}</h3>
          {showHidden && !doc.visible ? (
            <Badge tone="neutral" icon={<EyeOff size={11} />}>
              Hidden
            </Badge>
          ) : (
            <ViewOnlyBadge />
          )}
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
