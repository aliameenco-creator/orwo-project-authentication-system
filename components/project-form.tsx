"use client";

import {
  ArrowLeft,
  Check,
  Clapperboard,
  Eye,
  EyeOff,
  FileText,
  Film as FilmIcon,
  Link2,
  GripVertical,
  ImagePlus,
  Plus,
  Trash,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PALETTE_PRESETS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { savePages } from "@/lib/page-store";
import { convertPdf } from "@/lib/pdf-convert";
import type { Palette, PdfDoc, Poster, Project, ProjectStatus, Trailer } from "@/lib/types";
import { cn, formatDuration, formatRuntime, uid } from "@/lib/utils";
import { PdfViewer } from "./pdf-viewer";
import { PosterArt } from "./poster-art";
import { useToast } from "./toast";
import { Badge, Button, ButtonLink, Field, GlassCard, IconButton, Input, Segmented, Textarea, Toggle } from "./ui";
import { ProgressBar, UploadDrop } from "./upload-drop";

const SAMPLE_PDFS = ["Pitch Deck", "Lookbook", "Treatment", "Director's Statement", "Budget Top Sheet", "Shooting Schedule"];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "project";
}

function titleFromFile(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function blankProject(): Project {
  return {
    id: "",
    title: "",
    description: "",
    summary: "",
    genre: "",
    year: new Date().getFullYear() + 1,
    status: "Draft",
    palette: PALETTE_PRESETS[2]!,
    pdfs: [],
    posters: [],
    trailers: [],
    updatedAt: new Date().toISOString(),
  };
}

export function ProjectForm({ initial }: { initial?: Project }) {
  const router = useRouter();
  const toast = useToast();
  const { saveProject, projects } = useStore();
  const isEdit = Boolean(initial);
  const [p, setP] = useState<Project>(() => initial ?? blankProject());
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [preview, setPreview] = useState<PdfDoc | null>(null);
  const [error, setError] = useState("");

  const set = <K extends keyof Project>(key: K, value: Project[K]) => setP((prev) => ({ ...prev, [key]: value }));

  // Drive the fake upload progress for any item still uploading.
  const uploading = Object.values(progress).some((v) => v < 100);
  useEffect(() => {
    if (!uploading) return;
    const t = setInterval(() => {
      setProgress((prev) =>
        Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, v >= 100 ? 100 : Math.min(100, v + 6 + Math.random() * 18)])),
      );
    }, 160);
    return () => clearInterval(t);
  }, [uploading]);

  const startUpload = (ids: string[]) => setProgress((prev) => ({ ...prev, ...Object.fromEntries(ids.map((id) => [id, 0])) }));
  // Real PDF → page-image conversion progress, per PDF.
  const [converting, setConverting] = useState<Record<string, { done: number; total: number }>>({});
  const isUploading = (id: string) => (progress[id] ?? 100) < 100 || id in converting;
  const busy = uploading || Object.keys(converting).length > 0;

  /* ---------- Materials ---------- */

  function addPdfs(titles: string[]) {
    const docs: PdfDoc[] = titles.map((title) => ({
      id: uid("pdf"),
      title,
      pages: 8 + Math.floor(Math.random() * 30),
      format: /script|treatment|statement|notes|bible|schedule|budget/i.test(title) ? "document" : "deck",
      updatedAt: new Date().toISOString(),
      visible: true,
    }));
    set("pdfs", [...p.pdfs, ...docs]);
    startUpload(docs.map((d) => d.id));
  }

  function updatePdf(id: string, patch: Partial<PdfDoc>) {
    setP((prev) => ({ ...prev, pdfs: prev.pdfs.map((d) => (d.id === id ? { ...d, ...patch } : d)) }));
  }

  /** Real uploads: render every page to an image with pdf.js, one file at a time. */
  async function addPdfFiles(files: File[]) {
    const docs: PdfDoc[] = files.map((f) => ({
      id: uid("pdf"),
      title: titleFromFile(f.name),
      pages: 0,
      format: "deck",
      updatedAt: new Date().toISOString(),
      visible: true,
      source: "upload",
    }));
    setP((prev) => ({ ...prev, pdfs: [...prev.pdfs, ...docs] }));
    setConverting((prev) => ({ ...prev, ...Object.fromEntries(docs.map((d) => [d.id, { done: 0, total: 0 }])) }));

    for (const [i, doc] of docs.entries()) {
      try {
        const out = await convertPdf(files[i]!, (done, total) => setConverting((prev) => ({ ...prev, [doc.id]: { done, total } })));
        await savePages(doc.id, out.pages);
        updatePdf(doc.id, { pages: out.pages.length, aspect: out.aspect, format: out.aspect >= 1 ? "deck" : "document" });
        toast("PDF converted", `${doc.title} · ${out.pages.length} pages`);
      } catch {
        setP((prev) => ({ ...prev, pdfs: prev.pdfs.filter((d) => d.id !== doc.id) }));
        toast("Couldn't read that PDF", files[i]!.name);
      } finally {
        setConverting(({ [doc.id]: _, ...rest }) => rest);
      }
    }
  }

  // Reorder by dragging the handle.
  const dragId = useRef<string | null>(null);
  const [draggableId, setDraggableId] = useState<string | null>(null);
  function onDragOver(overId: string) {
    const from = p.pdfs.findIndex((d) => d.id === dragId.current);
    const to = p.pdfs.findIndex((d) => d.id === overId);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...p.pdfs];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    set("pdfs", next);
  }

  /* ---------- Posters & trailers ---------- */

  function addPosters(files: File[]) {
    const posters: Poster[] = files.map((f, i) => ({
      id: uid("poster"),
      title: titleFromFile(f.name),
      variant: ((p.posters.length + i) % 3) as Poster["variant"],
    }));
    set("posters", [...p.posters, ...posters]);
    startUpload(posters.map((x) => x.id));
  }

  function addTrailer(files: File[]) {
    const trailers: Trailer[] = files.map((f) => ({ id: uid("trailer"), title: titleFromFile(f.name), duration: 60 + Math.floor(Math.random() * 120) }));
    set("trailers", [...p.trailers, ...trailers]);
    startUpload(trailers.map((t) => t.id));
  }

  /* ---------- Full film ---------- */

  const [filmLink, setFilmLink] = useState("");
  const filmTitle = () => `${p.title.trim() || "Untitled"} — Feature`;

  function addFilmFile(files: File[]) {
    const f = files[0]!;
    set("film", { title: filmTitle(), duration: 5400 + Math.floor(Math.random() * 2400), source: "upload", fileName: f.name });
    startUpload(["film"]);
  }

  function addFilmLink() {
    if (!/^https?:\/\/\S+$/.test(filmLink.trim())) return toast("Paste a full https:// link");
    set("film", { title: filmTitle(), duration: 6000, source: "link", url: filmLink.trim() });
    setFilmLink("");
  }

  /* ---------- Save ---------- */

  function save() {
    if (!p.title.trim()) {
      setError("Give the project a title.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    let id = p.id;
    if (!id) {
      id = slugify(p.title);
      if (projects.some((x) => x.id === id)) id = `${id}-${uid("").slice(1, 5)}`;
    }
    saveProject({
      ...p,
      id,
      title: p.title.trim(),
      summary: p.summary.trim() || p.description.trim(),
      genre: p.genre.trim() || "Feature Film",
    });
    toast(isEdit ? "Project saved" : "Project created", p.title);
    router.push(`/projects/${id}`);
  }

  const cancelHref = isEdit ? `/projects/${p.id}` : "/dashboard";

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <ButtonLink href={cancelHref} variant="ghost" size="sm" className="-ml-3 mb-3">
            <ArrowLeft size={15} /> {isEdit ? "Back to project" : "Dashboard"}
          </ButtonLink>
          <h1 className="text-[32px] font-semibold tracking-[-0.03em] sm:text-[40px]">{isEdit ? "Edit Project" : "New Project"}</h1>
          <p className="mt-1.5 text-[15px] text-ink-muted">
            {isEdit ? "Update details and manage protected materials." : "Set up a private space for a film and its materials."}
          </p>
        </div>
        <div className="flex gap-3">
          <ButtonLink href={cancelHref} variant="secondary">
            Cancel
          </ButtonLink>
          <Button onClick={save} disabled={busy}>
            <Check size={16} /> {isEdit ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          {/* Details */}
          <Section title="Project details">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Project title" className="sm:col-span-2">
                <Input
                  value={p.title}
                  onChange={(e) => {
                    set("title", e.target.value);
                    setError("");
                  }}
                  placeholder="e.g. Glass River"
                  autoFocus={!isEdit}
                />
                {error && <span className="mt-2 block text-sm font-medium text-red-600">{error}</span>}
              </Field>
              <Field label="Short description" hint={`${p.description.length}/140`} className="sm:col-span-2">
                <Textarea
                  value={p.description}
                  maxLength={140}
                  rows={2}
                  className="min-h-20"
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="One or two lines that appear on the project card."
                />
              </Field>
              <Field label="Genre">
                <Input value={p.genre} onChange={(e) => set("genre", e.target.value)} placeholder="Drama" />
              </Field>
              <Field label="Year">
                <Input type="number" value={p.year} onChange={(e) => set("year", Number(e.target.value))} />
              </Field>
              <Field label="Project status" className="sm:col-span-2">
                <Segmented<ProjectStatus>
                  value={p.status}
                  onChange={(v) => set("status", v)}
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Draft", label: "Draft" },
                    { value: "Archived", label: "Archived" },
                  ]}
                />
              </Field>
            </div>
          </Section>

          {/* Poster + trailer */}
          <Section title="Poster & trailer" subtitle="Shown in a protected viewer — never offered as a download.">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="mb-3 text-[13px] font-medium text-ink-soft">Posters</div>
                <div className="mb-3 grid grid-cols-3 gap-2.5">
                  {p.posters.map((poster) => (
                    <div key={poster.id} className="group relative overflow-hidden rounded-2xl">
                      <PosterArt title={p.title || "Untitled"} palette={p.palette} variant={poster.variant} compact className="aspect-[2/3]" />
                      {isUploading(poster.id) ? (
                        <div className="absolute inset-x-2 bottom-2">
                          <ProgressBar value={progress[poster.id]!} />
                        </div>
                      ) : (
                        <button
                          type="button"
                          aria-label="Remove poster"
                          onClick={() => set("posters", p.posters.filter((x) => x.id !== poster.id))}
                          className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <UploadDrop
                  accept="image/*"
                  multiple
                  onFiles={addPosters}
                  icon={<ImagePlus size={18} />}
                  title="Upload poster"
                  hint="JPG or PNG · drag & drop"
                  compact={p.posters.length > 0}
                />
                {!isEdit && (
                  <div className="mt-4">
                    <div className="mb-2 text-xs text-ink-muted">Key-art colour grade</div>
                    <div className="flex gap-2">
                      {PALETTE_PRESETS.map((pal: Palette) => (
                        <button
                          key={pal.via}
                          type="button"
                          aria-label="Choose colour grade"
                          onClick={() => set("palette", pal)}
                          className={cn(
                            "h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-white/60 transition",
                            p.palette.via === pal.via ? "ring-ink" : "ring-transparent hover:scale-110",
                          )}
                          style={{ background: `linear-gradient(135deg, ${pal.from}, ${pal.via}, ${pal.to})` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-3 text-[13px] font-medium text-ink-soft">Trailers</div>
                <div className="mb-3 space-y-2">
                  {p.trailers.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-2.5 ring-1 ring-black/[0.04]">
                      <div
                        className="grid h-11 w-16 shrink-0 place-items-center rounded-xl text-white"
                        style={{ background: `linear-gradient(135deg, ${p.palette.from}, ${p.palette.via})` }}
                      >
                        <Clapperboard size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{t.title}</div>
                        {isUploading(t.id) ? (
                          <div className="mt-1.5">
                            <ProgressBar value={progress[t.id]!} />
                          </div>
                        ) : (
                          <div className="text-xs text-ink-muted">{formatDuration(t.duration)} · Stream only</div>
                        )}
                      </div>
                      <IconButton label="Remove trailer" onClick={() => set("trailers", p.trailers.filter((x) => x.id !== t.id))}>
                        <Trash size={15} />
                      </IconButton>
                    </div>
                  ))}
                </div>
                <UploadDrop
                  accept="video/*"
                  onFiles={addTrailer}
                  icon={<Clapperboard size={18} />}
                  title="Upload trailer"
                  hint="MP4 or MOV · streamed, not downloadable"
                  compact={p.trailers.length > 0}
                />
              </div>
            </div>
          </Section>

          {/* Full film */}
          <Section title="Full film" subtitle="The complete cut. Only viewers you explicitly include can watch it.">
            {p.film ? (
              <div className="flex items-center gap-3 rounded-2xl bg-white/75 p-3 ring-1 ring-black/[0.04]">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink text-white">
                  {p.film.source === "link" ? <Link2 size={18} /> : <FilmIcon size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <input
                    value={p.film.title}
                    onChange={(e) => set("film", { ...p.film!, title: e.target.value })}
                    className="w-full rounded-lg bg-transparent px-1 py-0.5 text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-accent/15"
                    aria-label="Film title"
                  />
                  {isUploading("film") ? (
                    <div className="mt-1.5 px-1">
                      <ProgressBar value={progress.film!} />
                    </div>
                  ) : (
                    <div className="truncate px-1 text-xs text-ink-muted">
                      {p.film.source === "link" ? p.film.url : p.film.fileName} · {formatRuntime(p.film.duration)} · Stream only
                    </div>
                  )}
                </div>
                <IconButton label="Remove film" onClick={() => set("film", undefined)} className="hover:text-red-600">
                  <Trash size={15} />
                </IconButton>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <UploadDrop accept="video/*" onFiles={addFilmFile} icon={<FilmIcon size={18} />} title="Upload the film" hint="MP4 / MOV master · streamed, never downloadable" />
                <div className="flex flex-col justify-center rounded-3xl bg-white/40 p-5 ring-1 ring-black/[0.05]">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Link2 size={16} /> Or use a private link
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">Vimeo, Mux, Frame.io… The link stays hidden from viewers.</p>
                  <div className="mt-3 flex gap-2">
                    <Input
                      value={filmLink}
                      onChange={(e) => setFilmLink(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFilmLink())}
                      placeholder="https://vimeo.com/…"
                      className="h-10 text-sm"
                    />
                    <Button size="sm" className="h-10" onClick={addFilmLink}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* Materials */}
          <Section
            title="Project materials"
            subtitle="Decks, scripts and documents. Drag to reorder — viewers see them in this order."
            aside={<Badge tone="neutral">{p.pdfs.length} PDFs</Badge>}
          >
            <div className="space-y-2">
              {p.pdfs.map((d) => (
                <div
                  key={d.id}
                  draggable={draggableId === d.id}
                  onDragStart={() => (dragId.current = d.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    onDragOver(d.id);
                  }}
                  onDragEnd={() => {
                    dragId.current = null;
                    setDraggableId(null);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl bg-white/75 p-2 pr-2.5 ring-1 ring-black/[0.04] transition-all duration-300 sm:gap-3",
                    !d.visible && "opacity-60",
                    dragId.current === d.id && "scale-[0.99] shadow-lg ring-accent/30",
                  )}
                >
                  <span
                    className="grid h-9 w-6 shrink-0 cursor-grab place-items-center text-ink-muted/60 hover:text-ink active:cursor-grabbing"
                    onPointerDown={() => setDraggableId(d.id)}
                    onPointerUp={() => setDraggableId(null)}
                    aria-label="Drag to reorder"
                    title="Drag to reorder"
                  >
                    <GripVertical size={16} />
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500">
                    <FileText size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <input
                      value={d.title}
                      onChange={(e) => updatePdf(d.id, { title: e.target.value })}
                      className="w-full truncate rounded-lg bg-transparent px-1 py-0.5 text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-accent/15"
                      aria-label="PDF title"
                    />
                    {converting[d.id] ? (
                      <div className="mt-1.5 space-y-1 px-1">
                        <ProgressBar value={converting[d.id]!.total ? (converting[d.id]!.done / converting[d.id]!.total) * 100 : 3} />
                        <div className="text-[11px] text-ink-muted">
                          {converting[d.id]!.total ? `Converting page ${converting[d.id]!.done} of ${converting[d.id]!.total}…` : "Reading PDF…"}
                        </div>
                      </div>
                    ) : isUploading(d.id) ? (
                      <div className="mt-1.5 px-1">
                        <ProgressBar value={progress[d.id]!} />
                      </div>
                    ) : (
                      <div className="px-1 text-xs text-ink-muted">
                        {d.pages} pages · {d.format === "deck" ? "Presentation" : "Document"}
                        {d.source === "upload" || d.source === "static" ? " · Real pages" : " · Sample"}
                        {!d.visible && " · Hidden from viewers"}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <span className="hidden items-center gap-1.5 text-xs text-ink-muted sm:flex">
                      {d.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </span>
                    <Toggle checked={d.visible} onChange={(v) => updatePdf(d.id, { visible: v })} label="Visible to viewers" />
                    <Button variant="ghost" size="sm" onClick={() => setPreview(d)} disabled={isUploading(d.id)} className="hidden sm:inline-flex">
                      Preview
                    </Button>
                    <IconButton label="Preview" onClick={() => setPreview(d)} className="sm:hidden">
                      <Eye size={15} />
                    </IconButton>
                    <IconButton label="Remove PDF" onClick={() => set("pdfs", p.pdfs.filter((x) => x.id !== d.id))} className="hover:text-red-600">
                      <Trash size={15} />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>

            <div className={cn(p.pdfs.length > 0 && "mt-4")}>
              <UploadDrop
                accept="application/pdf"
                multiple
                onFiles={addPdfFiles}
                icon={<FileText size={18} />}
                title="Upload PDFs"
                hint="Select multiple files · each page is converted to an image"
                compact={p.pdfs.length > 0}
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-ink-muted">No files handy? Add a sample:</span>
                {SAMPLE_PDFS.filter((t) => !p.pdfs.some((d) => d.title === t))
                  .slice(0, 3)
                  .map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => addPdfs([t])}
                      className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-ink-soft ring-1 ring-black/[0.05] transition hover:bg-white hover:text-ink"
                    >
                      <Plus size={12} /> {t}
                    </button>
                  ))}
              </div>
            </div>
          </Section>
        </div>

        {/* Live preview */}
        <aside className="hidden xl:block">
          <div className="sticky top-28 space-y-4">
            <div className="text-xs font-semibold tracking-wide text-ink-muted uppercase">Card preview</div>
            <GlassCard className="overflow-hidden rounded-[28px] p-2.5">
              <PosterArt
                title={p.title || "Untitled"}
                palette={p.palette}
                variant={p.posters[0]?.variant ?? 0}
                compact
                className="aspect-[4/3] rounded-[22px]"
              />
              <div className="px-3 pt-4 pb-3">
                <div className="text-lg font-semibold tracking-tight">{p.title || "Untitled project"}</div>
                <p className="mt-1 line-clamp-2 text-[13px] text-ink-muted">{p.description || "Short description appears here."}</p>
                <div className="mt-3 text-xs text-ink-soft">
                  {p.pdfs.filter((d) => d.visible).length} PDFs · {p.trailers.length ? "Trailer" : "No trailer"} · {p.status}
                </div>
              </div>
            </GlassCard>
            <p className="px-1 text-xs leading-relaxed text-ink-muted">
              PDFs are converted to real page images in your browser. Posters, trailers and the film are represented with generated previews in this prototype.
            </p>
          </div>
        </aside>
      </div>

      <PdfViewer doc={preview} project={p} onClose={() => setPreview(null)} />
    </>
  );
}

function Section({
  title,
  subtitle,
  aside,
  children,
}: {
  title: string;
  subtitle?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <GlassCard className="animate-fade-up p-6 sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.01em]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[13px] text-ink-muted">{subtitle}</p>}
        </div>
        {aside}
      </div>
      {children}
    </GlassCard>
  );
}
