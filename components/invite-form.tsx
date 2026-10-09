"use client";

import { Check, Mail, Send } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { AccessGrant } from "@/lib/types";
import { cn, daysFromNow, formatDate } from "@/lib/utils";
import { PosterArt } from "./poster-art";
import { useToast } from "./toast";
import { Button, Field, Input, Textarea } from "./ui";
import { DurationPicker } from "./duration-picker";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteForm({ defaultProjectIds = [], onSent }: { defaultProjectIds?: string[]; onSent?: (g: AccessGrant) => void }) {
  const { projects, invite } = useStore();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>(defaultProjectIds);
  const [days, setDays] = useState(3);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const shareable = projects.filter((p) => p.status !== "Archived" || selected.includes(p.id));

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address.");
    if (!selected.length) return setError("Select at least one project.");
    setError("");
    setSending(true);
    setTimeout(() => {
      const g = invite({ email, projectIds: selected, days, message });
      toast("Access sent", `${g.email} · ${days} day${days === 1 ? "" : "s"}`);
      setSending(false);
      setEmail("");
      setMessage("");
      setSelected(defaultProjectIds);
      onSent?.(g);
    }, 700);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Viewer email">
        <div className="relative">
          <Mail size={17} className="absolute top-1/2 left-4 -translate-y-1/2 text-ink-muted" />
          <Input type="email" className="pl-11" placeholder="name@studio.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </Field>

      <div>
        <div className="mb-2 flex items-baseline justify-between text-[13px] font-medium text-ink-soft">
          Projects
          <span className="text-xs font-normal text-ink-muted">{selected.length} selected</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {shareable.map((p) => {
            const on = selected.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl p-2 pr-3 text-left transition-all duration-300 ease-[var(--ease-glass)]",
                  on ? "bg-white shadow-[0_6px_20px_-8px_rgba(15,23,42,0.25)] ring-2 ring-ink" : "bg-white/60 ring-1 ring-black/[0.05] hover:bg-white",
                )}
              >
                <PosterArt title="" palette={p.palette} variant={p.posters[0]?.variant ?? 0} compact className="h-11 w-9 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.title}</div>
                  <div className="text-xs text-ink-muted">{p.status}</div>
                </div>
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full transition",
                    on ? "bg-ink text-white" : "ring-1 ring-black/15",
                  )}
                >
                  {on && <Check size={12} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between text-[13px] font-medium text-ink-soft">
          Access duration
          <span className="text-xs font-normal text-ink-muted">Expires {formatDate(daysFromNow(days))}</span>
        </div>
        <DurationPicker value={days} onChange={setDays} />
      </div>

      <Field label="Message" hint="Optional">
        <Textarea rows={3} placeholder="Add a personal note to the invitation…" value={message} onChange={(e) => setMessage(e.target.value)} />
      </Field>

      {error && <p className="animate-fade-in text-sm font-medium text-red-600">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={sending}>
        {sending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>
            <Send size={16} /> Send Access
          </>
        )}
      </Button>
      <p className="text-center text-xs text-ink-muted">The viewer gets a private link. Access ends automatically on expiry.</p>
    </form>
  );
}
