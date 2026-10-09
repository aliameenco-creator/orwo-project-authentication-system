import type { Palette } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Generated key-art used in place of real poster uploads (Phase 1 has no file storage).
 * Three compositions so posters within a project feel distinct.
 */
export function PosterArt({
  title,
  palette,
  variant = 0,
  subtitle,
  className,
  compact,
}: {
  title: string;
  palette: Palette;
  variant?: 0 | 1 | 2;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}) {
  const { from, via, to, glow } = palette;

  return (
    <div
      className={cn("relative isolate overflow-hidden [container-type:inline-size]", className)}
      style={{ background: `linear-gradient(165deg, ${from} 0%, ${via} 62%, ${to} 120%)` }}
    >
      {variant === 0 && (
        <>
          {/* Low sun / moon */}
          <div
            className="absolute left-1/2 top-[52%] aspect-square w-[78%] -translate-x-1/2 rounded-full opacity-90"
            style={{ background: `radial-gradient(circle at 50% 40%, ${to}, ${glow} 45%, transparent 70%)` }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[38%]"
            style={{ background: `linear-gradient(to top, ${from} 20%, transparent)` }}
          />
        </>
      )}
      {variant === 1 && (
        <>
          {/* Silhouette figure */}
          <div
            className="absolute top-[18%] left-1/2 aspect-square w-[34%] -translate-x-1/2 rounded-full"
            style={{ background: from, boxShadow: `0 0 80px 10px ${glow}66` }}
          />
          <div
            className="absolute bottom-0 left-1/2 h-[46%] w-[70%] -translate-x-1/2 rounded-t-[50%]"
            style={{ background: from }}
          />
        </>
      )}
      {variant === 2 && (
        <>
          {/* Horizon bands */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute inset-x-0"
              style={{
                top: `${30 + i * 9}%`,
                height: `${2 + i * 0.6}%`,
                background: glow,
                opacity: 0.7 - i * 0.12,
                filter: "blur(0.5px)",
              }}
            />
          ))}
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 50% 35%, ${to}55, transparent 55%)` }}
          />
        </>
      )}

      {/* Film grain + glossy top highlight */}
      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent" />

      {/* Typography */}
      <div className={cn("absolute inset-x-0 text-center text-white", compact ? "bottom-[9%] px-3" : "bottom-[8%] px-5")}>
        <div
          className={cn(
            "font-light uppercase leading-[1.05] drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]",
            compact ? "text-[max(12px,7cqw)] tracking-[0.26em]" : "text-[max(16px,7.5cqw)] tracking-[0.3em]",
          )}
        >
          {title}
        </div>
        {!compact && (
          <div className="mt-3 text-[max(8px,2.4cqw)] tracking-[0.35em] text-white/60 uppercase">
            {subtitle ?? "An Orwo Family Production"}
          </div>
        )}
      </div>
    </div>
  );
}
