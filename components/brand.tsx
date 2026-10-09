import { cn } from "@/lib/utils";

export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[30%] bg-gradient-to-br from-[#1c1f27] to-[#050608] shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.25)]",
        className,
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
      <svg viewBox="0 0 24 24" width={size * 0.56} height={size * 0.56} fill="none">
        <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2.2" />
        <circle cx="12" cy="12" r="3" fill="url(#lg)" />
        <defs>
          <linearGradient id="lg" x1="9" y1="9" x2="15" y2="15">
            <stop stopColor="#8fb4ff" />
            <stop offset="1" stopColor="#f0abfc" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

export function Brand({ tagline = true, className }: { tagline?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark />
      <div className="leading-tight">
        <div className="text-[17px] font-semibold tracking-[-0.02em]">Orwo Family</div>
        {tagline && <div className="text-[11.5px] text-ink-muted">Create and manage our projects privately</div>}
      </div>
    </div>
  );
}
