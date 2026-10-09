"use client";

import { Maximize, Pause, Play, Volume2, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";
import { ProtectedBadge } from "./badges";
import { PosterArt } from "./poster-art";
import { EmptyState } from "./ui";

/** Simulated streaming player — playback is a timer over generated key art; there is no media file to save. */
export function TrailerPlayer({ project, watermark, discreet }: { project: Project; watermark?: string; discreet?: boolean }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const trailer = project.trailers[index];

  useEffect(() => {
    if (!playing || !trailer) return;
    const t = setInterval(() => {
      setTime((s) => {
        if (s + 0.25 >= trailer.duration) {
          setPlaying(false);
          return trailer.duration;
        }
        return s + 0.25;
      });
    }, 250);
    return () => clearInterval(t);
  }, [playing, trailer]);

  if (!trailer) return <EmptyState icon={<VideoOff size={22} />} title="No trailer yet" body="A trailer will stream here once uploaded." />;

  const pct = (time / trailer.duration) * 100;

  function select(i: number) {
    setIndex(i);
    setTime(0);
    setPlaying(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div
        ref={frame}
        className="protected group relative aspect-video overflow-hidden rounded-[24px] bg-black shadow-[0_30px_70px_-30px_rgba(15,23,42,0.6)]"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="absolute inset-0">
          <PosterArt
            title={project.title}
            palette={project.palette}
            variant={(index % 3) as 0 | 1 | 2}
            subtitle={trailer.title}
            className={cn("h-full w-full transition-transform duration-[8000ms] ease-linear", playing && "scale-110")}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {!discreet && (
          <div className="absolute top-4 left-4 flex gap-2">
            <ProtectedBadge dark />
            <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              Streaming · No download
            </span>
          </div>
        )}
        {watermark && <div className="absolute top-4 right-4 text-[11px] font-medium text-white/40">{watermark}</div>}

        {!playing && (
          <button
            type="button"
            onClick={() => {
              if (time >= trailer.duration) setTime(0);
              setPlaying(true);
            }}
            className="absolute top-1/2 left-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/20 text-white shadow-2xl backdrop-blur-xl transition hover:scale-105 hover:bg-white/30"
            aria-label="Play trailer"
          >
            <Play size={30} fill="currentColor" className="ml-1" />
          </button>
        )}

        {/* Controls */}
        <div className={cn("absolute inset-x-3 bottom-3 transition-opacity duration-300", playing && "opacity-0 group-hover:opacity-100")}>
          <div className="glass-dark flex items-center gap-3 rounded-full px-3 py-2 text-white">
            <button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause" : "Play"} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10">
              {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            </button>
            <span className="w-10 text-xs tabular-nums">{formatDuration(time)}</span>
            <input
              type="range"
              min={0}
              max={trailer.duration}
              step={0.25}
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
              aria-label="Seek"
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full accent-white"
              style={{ background: `linear-gradient(to right, white ${pct}%, rgba(255,255,255,0.25) ${pct}%)` }}
            />
            <span className="w-10 text-right text-xs text-white/70 tabular-nums">{formatDuration(trailer.duration)}</span>
            <Volume2 size={16} className="hidden text-white/80 sm:block" />
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

      <div className="space-y-2">
        <div className="px-1 text-xs font-semibold tracking-wide text-ink-muted uppercase">Up next</div>
        {project.trailers.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => select(i)}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl p-2 text-left transition",
              i === index ? "bg-white shadow-[0_6px_20px_-8px_rgba(15,23,42,0.2)]" : "hover:bg-white/60",
            )}
          >
            <div className="relative w-24 shrink-0 overflow-hidden rounded-xl">
              <PosterArt title="" palette={project.palette} variant={(i % 3) as 0 | 1 | 2} compact className="aspect-video" />
              <Play size={14} fill="white" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{t.title}</div>
              <div className="text-xs text-ink-muted">{formatDuration(t.duration)}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
