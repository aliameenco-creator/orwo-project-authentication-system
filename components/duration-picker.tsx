"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const PRESETS = [1, 3, 7];

export function DurationPicker({ value, onChange }: { value: number; onChange: (days: number) => void }) {
  const [custom, setCustom] = useState(!PRESETS.includes(value));

  const chip = (active: boolean) =>
    cn(
      "flex-1 rounded-2xl px-3 py-3 text-center text-sm font-medium transition-all duration-300 ease-[var(--ease-glass)]",
      active
        ? "bg-ink text-white shadow-[0_8px_20px_-8px_rgba(11,13,18,0.5)]"
        : "bg-white/70 text-ink-soft ring-1 ring-black/[0.05] hover:bg-white hover:text-ink",
    );

  return (
    <div>
      <div className="flex gap-2">
        {PRESETS.map((d) => (
          <button
            key={d}
            type="button"
            className={chip(!custom && value === d)}
            onClick={() => {
              setCustom(false);
              onChange(d);
            }}
          >
            {d} day{d === 1 ? "" : "s"}
          </button>
        ))}
        <button type="button" className={chip(custom)} onClick={() => setCustom(true)}>
          Custom
        </button>
      </div>
      {custom && (
        <div className="mt-3 flex animate-fade-in items-center gap-3">
          <input
            type="number"
            min={1}
            max={365}
            value={value}
            onChange={(e) => onChange(Math.max(1, Math.min(365, Number(e.target.value) || 1)))}
            className="h-11 w-24 rounded-2xl border border-black/[0.06] bg-white/80 px-4 text-[15px] outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/10"
            aria-label="Number of days"
          />
          <span className="text-sm text-ink-muted">days of access</span>
        </div>
      )}
    </div>
  );
}
