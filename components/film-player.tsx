"use client";

import { Maximize, Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/types";
import { cn, formatRuntime } from "@/lib/utils";
import { ProjectCover } from "./project-cover";

// Spots the watermark drifts between (percent of the frame).
const SPOTS = [
  [12, 14],
  [62, 22],
  [30, 70],
  [70, 64],
  [44, 40],
  [16, 52],
];

/**
 * Simulated screener player for the full film. Production would stream HLS through a DRM provider
 * (Mux / Cloudflare Stream / Vimeo OTT) with signed, expiring playback tokens; the drifting email
 * here stands in for a per-viewer forensic watermark.
 */
export function FilmPlayer({ project, watermark }: { project: Project; watermark?: string }) {
  const film = project.film!;
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [spot, setSpot] = useState(0);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setTime((s) => Math.min(film.duration, s + 1)), 1000);
    const w = setInterval(() => setSpot((i) => (i + 1) % SPOTS.length), 7000);
    return () => {
      clearInterval(t);
      clearInterval(w);
    };
  }, [playing, film.duration]);

  useEffect(() => {
    if (time >= film.duration) setPlaying(false);
  }, [time, film.duration]);

  const pct = (time / film.duration) * 100;
  const seek = (d: number) => setTime((s) => Math.max(0, Math.min(film.duration, s + d)));
  const [x, y] = SPOTS[spot]!;

  return (
    <div
      ref={frame}
      className="protected group relative aspect-video overflow-hidden rounded-[24px] bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className={cn("absolute inset-0 transition-all duration-[1200ms]", playing ? "scale-105 opacity-90" : "opacity-45 blur-[2px]")}>
        <ProjectCover project={project} className="h-full w-full" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />

      {/* Per-viewer watermark, drifting while the film plays */}
      {watermark && playing && (
        <div
          className="pointer-events-none absolute text-[12px] font-medium tracking-wide whitespace-nowrap text-white/25 transition-all duration-[2500ms] ease-in-out"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          {watermark}
        </div>
      )}

      {!playing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <div className="text-[11px] font-semibold tracking-[0.35em] text-white/60 uppercase">{time > 0 ? "Paused" : "Feature"}</div>
          <div className="mt-3 text-[clamp(22px,4vw,40px)] font-light tracking-[0.04em]">{film.title}</div>
          <div className="mt-2 text-sm text-white/60">{formatRuntime(film.duration)}</div>
          <button
            type="button"
            onClick={() => {
              if (time >= film.duration) setTime(0);
              setPlaying(true);
            }}
            className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3 text-[15px] font-semibold text-black shadow-2xl transition hover:scale-[1.03]"
          >
            <Play size={18} fill="currentColor" /> {time > 0 ? "Resume" : "Play film"}
          </button>
        </div>
      )}

      {/* Controls */}
      <div className={cn("absolute inset-x-3 bottom-3 transition-opacity duration-300", playing && "opacity-0 group-hover:opacity-100")}>
        <div className="glass-dark flex items-center gap-2 rounded-full px-3 py-2 text-white sm:gap-3">
          <button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause" : "Play"} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10">
            {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>
          <button type="button" onClick={() => seek(-10)} aria-label="Back 10 seconds" className="hidden h-8 w-8 place-items-center rounded-full hover:bg-white/10 sm:grid">
            <RotateCcw size={15} />
          </button>
          <button type="button" onClick={() => seek(10)} aria-label="Forward 10 seconds" className="hidden h-8 w-8 place-items-center rounded-full hover:bg-white/10 sm:grid">
            <RotateCw size={15} />
          </button>
          <span className="w-14 text-xs tabular-nums">{formatRuntime(time)}</span>
          <input
            type="range"
            min={0}
            max={film.duration}
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            aria-label="Seek"
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full accent-white"
            style={{ background: `linear-gradient(to right, white ${pct}%, rgba(255,255,255,0.25) ${pct}%)` }}
          />
          <span className="w-14 text-right text-xs text-white/70 tabular-nums">{formatRuntime(film.duration)}</span>
          <button
            type="button"
            aria-label="Fullscreen"
            onClick={() => (document.fullscreenElement ? document.exitFullscreen() : frame.current?.requestFullscreen())}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"
          >
            <Maximize size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
