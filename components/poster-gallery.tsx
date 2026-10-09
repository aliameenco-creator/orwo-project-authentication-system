"use client";

import { ChevronLeft, ChevronRight, ImageOff, Maximize, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/lib/types";
import { ProtectedBadge, ViewOnlyBadge } from "./badges";
import { PosterArt } from "./poster-art";
import { useToast } from "./toast";
import { EmptyState, IconButton } from "./ui";

export function PosterGallery({ project, watermark, discreet }: { project: Project; watermark?: string; discreet?: boolean }) {
  const toast = useToast();
  const [open, setOpen] = useState<number | null>(null);
  const posters = project.posters;

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % posters.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + posters.length) % posters.length));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, posters.length]);

  if (!posters.length) return <EmptyState icon={<ImageOff size={22} />} title="No posters yet" body="Key art will appear here once uploaded." />;

  const blockMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!discreet) toast("Saving images is disabled", "This content is view-only");
  };

  const current = open !== null ? posters[open] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3" onContextMenu={blockMenu}>
        {posters.map((poster, i) => (
          <button
            key={poster.id}
            type="button"
            onClick={() => setOpen(i)}
            className="group protected animate-fade-up text-left"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="sheen relative overflow-hidden rounded-[22px] shadow-[0_24px_48px_-24px_rgba(15,23,42,0.45)] ring-1 ring-black/[0.04] transition-transform duration-500 ease-[var(--ease-glass)] group-hover:-translate-y-1">
              <PosterArt title={project.title} palette={project.palette} variant={poster.variant} className="aspect-[2/3]" />
              {!discreet && (
                <div className="absolute top-3 left-3">
                  <ViewOnlyBadge dark />
                </div>
              )}
              <span className="absolute right-3 bottom-3 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
                <Maximize size={14} />
              </span>
            </div>
            <div className="mt-3 px-1 text-sm font-medium">{poster.title}</div>
          </button>
        ))}
      </div>

      {current &&
        createPortal(
          <div className="protected fixed inset-0 z-[60] flex animate-fade-in flex-col bg-[#eef0f4]/85 backdrop-blur-2xl print:hidden" onContextMenu={blockMenu}>
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-2">
                {!discreet && (
                  <>
                    <ViewOnlyBadge />
                    <span className="hidden sm:inline-flex">
                      <ProtectedBadge />
                    </span>
                  </>
                )}
              </div>
              <div className="truncate text-sm font-medium">
                {current.title} <span className="text-ink-muted">· {open! + 1} of {posters.length}</span>
              </div>
              <IconButton label="Close" onClick={() => setOpen(null)} className="glass">
                <X size={18} />
              </IconButton>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 pb-10">
              <div className="relative h-full max-h-[78vh] animate-scale-in overflow-hidden rounded-2xl shadow-[0_40px_100px_-30px_rgba(15,23,42,0.5)]" style={{ aspectRatio: "2/3" }}>
                <PosterArt title={project.title} palette={project.palette} variant={current.variant} className="h-full w-full" />
                {watermark && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <span className="rotate-[-30deg] text-sm font-semibold tracking-wider whitespace-nowrap text-white/15">
                      {watermark}
                    </span>
                  </div>
                )}
              </div>
              {posters.length > 1 && (
                <>
                  <IconButton label="Previous" className="glass absolute left-4" onClick={() => setOpen((open! - 1 + posters.length) % posters.length)}>
                    <ChevronLeft size={18} />
                  </IconButton>
                  <IconButton label="Next" className="glass absolute right-4" onClick={() => setOpen((open! + 1) % posters.length)}>
                    <ChevronRight size={18} />
                  </IconButton>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
