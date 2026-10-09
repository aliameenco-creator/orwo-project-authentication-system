import { cn } from "@/lib/utils";

/** Orwo wordmark (stacked "OR / WO"). Black on light surfaces, white on dark. */
export function Logo({ height = 44, tone = "dark", className }: { height?: number; tone?: "dark" | "light"; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={tone === "dark" ? "/orwo-logo-black.png" : "/orwo-logo-white.png"}
      alt="Orwo Family"
      height={height}
      width={Math.round(height * (516 / 400))}
      style={{ height, width: "auto" }}
      className={cn("shrink-0 select-none", className)}
      draggable={false}
    />
  );
}

/** Compact app-icon version: white wordmark on a dark rounded tile. */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[30%] bg-gradient-to-br from-[#1c1f27] to-[#050608] shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.25)]",
        className,
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent" />
      <Logo height={Math.round(size * 0.48)} tone="light" />
    </span>
  );
}

export function Brand({ tagline, height = 34, className }: { tagline?: string; height?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      <Logo height={height} />
      {tagline && <div className="max-w-[140px] text-[11.5px] leading-snug text-ink-muted">{tagline}</div>}
    </div>
  );
}
