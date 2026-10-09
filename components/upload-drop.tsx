"use client";

import { Upload } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Drop zone for the prototype uploader. Files never leave the browser — callers only read names. */
export function UploadDrop({
  accept,
  multiple,
  onFiles,
  title,
  hint,
  icon,
  compact,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  title: string;
  hint: string;
  icon?: ReactNode;
  compact?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <button
      type="button"
      onClick={() => input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) onFiles(multiple ? files : files.slice(0, 1));
      }}
      className={cn(
        "group flex w-full flex-col items-center justify-center rounded-3xl border-[1.5px] border-dashed text-center transition-all duration-300",
        compact ? "gap-1.5 px-4 py-5" : "gap-2 px-6 py-9",
        over ? "border-accent bg-accent/5 scale-[1.01]" : "border-black/[0.1] bg-white/40 hover:border-black/20 hover:bg-white/70",
      )}
    >
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-ink-soft shadow-sm ring-1 ring-black/[0.04] transition-transform group-hover:-translate-y-0.5">
        {icon ?? <Upload size={18} />}
      </span>
      <span className="mt-1 text-sm font-medium">{title}</span>
      <span className="text-xs text-ink-muted">{hint}</span>
      <input
        ref={input}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </button>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-black/[0.06]">
      <div className="h-full rounded-full bg-gradient-to-r from-[#4c82ff] to-accent transition-[width] duration-200" style={{ width: `${value}%` }} />
    </div>
  );
}
