"use client";

import { ChevronLeft, Lock, Minus, Plus, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { PdfDoc, Project } from "@/lib/types";
import { loadPages } from "@/lib/page-store";
import { cn } from "@/lib/utils";
import { ProtectedBadge, ViewOnlyBadge } from "./badges";
import { useToast } from "./toast";
import { IconButton } from "./ui";

const ZOOMS = [640, 820, 1020];

/** Image URL per page for converted PDFs; null for generated mock pages. */
export function usePageImages(doc: PdfDoc | null) {
  const [uploaded, setUploaded] = useState<{ id: string; pages: string[] } | null>(null);
  const id = doc?.id;
  const source = doc?.source;

  useEffect(() => {
    if (!id || source !== "upload") return;
    let alive = true;
    loadPages(id)
      .then((pages) => alive && setUploaded({ id, pages: pages ?? [] }))
      .catch(() => alive && setUploaded({ id, pages: [] }));
    return () => {
      alive = false;
    };
  }, [id, source]);

  if (!doc) return null;
  if (doc.source === "static" && doc.pagesPath)
    return Array.from({ length: doc.pages }, (_, i) => `${doc.pagesPath}/page-${String(i + 1).padStart(2, "0")}.jpg`);
  if (doc.source === "upload") return uploaded?.id === doc.id ? uploaded.pages : [];
  return null;
}

/**
 * In-page document viewer. Pages are rendered as styled blocks (no real file is ever sent to the browser),
 * stacked vertically like a web reader, with an optional per-viewer watermark.
 */
export function PdfViewer({
  doc,
  project,
  watermark,
  discreet,
  onClose,
}: {
  doc: PdfDoc | null;
  project: Project;
  watermark?: string;
  /** Viewer mode: no protection badges or "view-only" messaging; blocking stays silent. */
  discreet?: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const scroller = useRef<HTMLDivElement>(null);
  const images = usePageImages(doc);

  // Block the usual "save a copy" shortcuts while the viewer is open.
  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        if (!discreet) toast("Saving and printing are disabled", "This content is view-only");
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [doc, onClose, toast, discreet]);

  // Track the page currently in view.
  useEffect(() => {
    if (!doc || !scroller.current) return;
    setPage(1);
    const root = scroller.current;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (top) setPage(Number((top.target as HTMLElement).dataset.page));
      },
      { root, threshold: [0.35, 0.6] },
    );
    root.querySelectorAll("[data-page]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [doc, zoom, images?.length]);

  const jump = useCallback((n: number) => {
    scroller.current?.querySelector(`[data-page="${n}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (!doc) return null;
  const pages = Array.from({ length: doc.pages }, (_, i) => i + 1);
  const isDeck = doc.format === "deck";
  const real = images !== null;
  // Real pages use their own proportions; mock pages use deck / A4 shapes.
  const ratio = real ? (doc.aspect ?? 16 / 9) : isDeck ? 16 / 9 : 1 / 1.414;
  const width = ratio >= 1 ? ZOOMS[zoom]! : ZOOMS[zoom]! * 0.78;

  return createPortal(
    <div
      className="protected fixed inset-0 z-[60] flex animate-fade-in flex-col bg-[#eef0f4]/80 backdrop-blur-2xl print:hidden"
      onContextMenu={(e) => {
        e.preventDefault();
        if (!discreet) toast("Right-click is disabled", "This content is view-only");
      }}
    >
      {/* Toolbar */}
      <div className="px-3 pt-3 sm:px-5">
        <div className="glass-strong flex h-14 items-center gap-2 rounded-full pr-2 pl-2 sm:gap-3">
          <IconButton label="Close viewer" onClick={onClose}>
            <ChevronLeft size={20} />
          </IconButton>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[14px] font-semibold">{doc.title}</div>
            <div className="truncate text-[11.5px] text-ink-muted">{project.title}</div>
          </div>
          {!discreet && (
            <div className="hidden items-center gap-1.5 md:flex">
              <ViewOnlyBadge />
              <ProtectedBadge />
            </div>
          )}
          <div className="hidden items-center rounded-full bg-black/[0.04] p-0.5 sm:flex">
            <IconButton label="Zoom out" className="h-8 w-8" onClick={() => setZoom((z) => Math.max(0, z - 1))} disabled={zoom === 0}>
              <Minus size={15} />
            </IconButton>
            <span className="w-11 text-center text-xs font-medium tabular-nums">{[80, 100, 125][zoom]}%</span>
            <IconButton label="Zoom in" className="h-8 w-8" onClick={() => setZoom((z) => Math.min(2, z + 1))} disabled={zoom === 2}>
              <Plus size={15} />
            </IconButton>
          </div>
          <span className="rounded-full bg-black/[0.04] px-3 py-1.5 text-xs font-medium tabular-nums">
            {page} / {doc.pages}
          </span>
          <IconButton label="Close" onClick={onClose} className="hidden sm:grid">
            <X size={18} />
          </IconButton>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Thumbnails */}
        <div className="no-scrollbar hidden w-[132px] shrink-0 overflow-y-auto px-4 py-5 lg:block">
          {pages.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => jump(n)}
              className={cn(
                "mb-3 block w-full overflow-hidden rounded-lg bg-white text-left ring-2 transition",
                n === page ? "ring-accent shadow-md" : "ring-transparent opacity-70 hover:opacity-100",
              )}
            >
              <div className="relative" style={{ aspectRatio: ratio }}>
                {real ? <PageImage src={images[n - 1]} /> : <Thumb n={n} project={project} isDeck={isDeck} />}
              </div>
              <div className="py-1 text-center text-[10px] text-ink-muted">{n}</div>
            </button>
          ))}
        </div>

        {/* Pages */}
        <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto space-y-6" style={{ maxWidth: width }}>
            {pages.map((n) => (
              <div
                key={n}
                data-page={n}
                className="relative scroll-mt-4 overflow-hidden rounded-xl bg-white [container-type:inline-size] shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)] ring-1 ring-black/[0.04]"
                style={{ aspectRatio: ratio }}
              >
                {real ? (
                  <PageImage src={images[n - 1]} eager={n <= 2} />
                ) : isDeck ? (
                  <DeckPage n={n} doc={doc} project={project} />
                ) : (
                  <DocPage n={n} doc={doc} project={project} />
                )}
                {watermark && <Watermark text={watermark} />}
                <span className="absolute right-4 bottom-3 text-[10px] text-black/30 mix-blend-difference">{n}</span>
              </div>
            ))}
            <p className="flex items-center justify-center gap-2 pt-2 pb-10 text-xs text-ink-muted">
              {discreet ? (
                "End of document"
              ) : (
                <>
                  <Lock size={12} /> End of document · This content is view-only · Access controlled by Orwo Family
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ---------- Real page image ---------- */

function PageImage({ src, eager }: { src?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!src) return <div className="absolute inset-0 animate-pulse bg-black/[0.04]" />;
  if (failed)
    return <div className="absolute inset-0 grid place-items-center bg-black/[0.03] text-[11px] text-ink-muted">Page unavailable</div>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading={eager ? "eager" : "lazy"}
      draggable={false}
      className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none"
      onError={() => setFailed(true)}
    />
  );
}

/* ---------- Watermark ---------- */

function Watermark({ text }: { text: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -inset-1/2 flex rotate-[-24deg] flex-col justify-around">
        {Array.from({ length: 9 }).map((_, row) => (
          <div key={row} className="flex justify-around gap-16 whitespace-nowrap" style={{ marginLeft: row % 2 ? 80 : 0 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-[13px] font-semibold tracking-wide text-black/[0.07]">
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Mock page content ---------- */

const DECK_SECTIONS = [
  "Logline",
  "Synopsis",
  "The World",
  "Characters",
  "Tone & Visual Language",
  "Comparable Titles",
  "Why Now",
  "Audience",
  "Production Plan",
  "Budget Overview",
  "Schedule",
  "The Team",
];

function sentences(project: Project) {
  return project.summary.split(/(?<=\.)\s+/);
}

function Cover({ project, doc }: { project: Project; doc: PdfDoc }) {
  const { from, via, to } = project.palette;
  return (
    <div className="absolute inset-0 flex flex-col justify-end p-[6%] text-white" style={{ background: `linear-gradient(135deg, ${from}, ${via} 70%, ${to})` }}>
      <div className="text-[1.56cqw] tracking-[0.4em] text-white/70 uppercase">{doc.title}</div>
      <div className="mt-2 text-[6.0cqw] leading-none font-light tracking-[0.12em] uppercase">{project.title}</div>
      <div className="mt-4 text-[1.32cqw] tracking-[0.3em] text-white/60 uppercase">
        Confidential · Orwo Family · {project.year}
      </div>
    </div>
  );
}

function DeckPage({ n, doc, project }: { n: number; doc: PdfDoc; project: Project }) {
  if (n === 1) return <Cover project={project} doc={doc} />;
  const section = DECK_SECTIONS[(n - 2) % DECK_SECTIONS.length]!;
  const s = sentences(project);
  const layout = n % 4;
  const { via, glow, from } = project.palette;

  const Heading = ({ children }: { children: ReactNode }) => (
    <>
      <div className="text-[1.2cqw] font-semibold tracking-[0.3em] uppercase" style={{ color: via }}>
        {project.title} — {String(n).padStart(2, "0")}
      </div>
      <h3 className="mt-2 text-[3.6cqw] leading-tight font-semibold tracking-[-0.02em] text-ink">{children}</h3>
    </>
  );

  if (layout === 0)
    return (
      <div className="absolute inset-0 grid grid-cols-2">
        <div className="flex flex-col justify-center p-[7%]">
          <Heading>{section}</Heading>
          <p className="mt-4 text-[1.56cqw] leading-relaxed text-ink-soft">{s[n % s.length]}</p>
        </div>
        <div style={{ background: `linear-gradient(160deg, ${from}, ${via} 60%, ${glow})` }} />
      </div>
    );

  if (layout === 1)
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-[10%] text-center" style={{ background: `${glow}14` }}>
        <div className="text-[1.2cqw] font-semibold tracking-[0.3em] uppercase" style={{ color: via }}>
          {section}
        </div>
        <p className="mt-4 text-[3.12cqw] leading-snug font-light tracking-[-0.01em] text-ink">“{s[(n + 1) % s.length]}”</p>
      </div>
    );

  if (layout === 2)
    return (
      <div className="absolute inset-0 p-[6%]">
        <Heading>{section}</Heading>
        <div className="mt-[4%] grid grid-cols-3 gap-[3%]">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div className="aspect-[4/3] rounded-lg" style={{ background: `linear-gradient(${140 + i * 30}deg, ${from}, ${via}, ${glow})`, opacity: 1 - i * 0.15 }} />
              <div className="mt-2 h-[6px] w-3/4 rounded bg-black/10" />
              <div className="mt-1.5 h-[6px] w-1/2 rounded bg-black/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="absolute inset-0 flex flex-col justify-center p-[7%]">
      <Heading>{section}</Heading>
      <div className="mt-[5%] grid grid-cols-3 gap-[4%]">
        {[
          ["$4.2M", "Target budget"],
          ["32", "Shoot days"],
          [String(project.year), "Release window"],
        ].map(([v, l]) => (
          <div key={l} className="border-t-2 pt-3" style={{ borderColor: via }}>
            <div className="text-[3.84cqw] font-semibold tracking-[-0.03em] text-ink">{v}</div>
            <div className="text-[1.2cqw] text-ink-muted">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SCENES = ["INT. RESTORATION LAB — NIGHT", "EXT. COASTAL ROAD — DAWN", "INT. CONTROL ROOM — CONTINUOUS", "EXT. RIVERBANK — DAY", "INT. ARCHIVE VAULT — LATER"];

function DocPage({ n, doc, project }: { n: number; doc: PdfDoc; project: Project }) {
  if (n === 1) return <Cover project={project} doc={doc} />;
  const s = sentences(project);
  const script = /screenplay|script/i.test(doc.title);

  if (script)
    return (
      <div className="absolute inset-0 px-[12%] py-[10%] font-mono text-[1.63cqw] leading-[1.7] text-ink">
        <div className="font-bold">{SCENES[n % SCENES.length]}</div>
        <p className="mt-3">{s[n % s.length]}</p>
        <div className="mx-auto mt-4 w-[60%]">
          <div className="text-center">MARA</div>
          <p>You're telling me this tape was never played. Then why does it know where I'm standing?</p>
        </div>
        <p className="mt-4">{s[(n + 2) % s.length]}</p>
        {[80, 95, 70, 88, 60, 92, 75].map((w, i) => (
          <div key={i} className="mt-2.5 h-[0.55em] rounded-sm bg-black/[0.07]" style={{ width: `${w}%` }} />
        ))}
      </div>
    );

  return (
    <div className="absolute inset-0 px-[11%] py-[10%] text-ink">
      <div className="text-[1.4cqw] tracking-[0.3em] text-ink-muted uppercase">
        {doc.title} · Section {n - 1}
      </div>
      <h3 className="mt-2 text-[3.1cqw] font-semibold tracking-[-0.02em]">{DECK_SECTIONS[(n - 2) % DECK_SECTIONS.length]}</h3>
      <p className="mt-3 text-[1.71cqw] leading-relaxed text-ink-soft">{s.slice(0, 2).join(" ")}</p>
      {[96, 90, 98, 72, 94, 88, 97, 64, 91, 85, 95, 58].map((w, i) => (
        <div key={i} className="mt-[2.2%] h-[0.6em] rounded-sm bg-black/[0.06]" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

function Thumb({ n, project, isDeck }: { n: number; project: Project; isDeck: boolean }) {
  const { from, via, to } = project.palette;
  if (n === 1) return <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${from}, ${via} 70%, ${to})` }} />;
  return (
    <div className="absolute inset-0 p-2">
      <div className="h-1 w-1/3 rounded" style={{ background: via }} />
      <div className="mt-1 h-1.5 w-2/3 rounded bg-black/20" />
      {isDeck && n % 4 === 0 ? (
        <div className="absolute top-0 right-0 bottom-0 w-1/2" style={{ background: `linear-gradient(160deg, ${from}, ${via})` }} />
      ) : (
        [1, 2, 3, 4].map((i) => <div key={i} className="mt-1 h-[3px] rounded bg-black/10" style={{ width: `${90 - i * 12}%` }} />)
      )}
    </div>
  );
}
