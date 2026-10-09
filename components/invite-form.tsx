"use client";

import { Check, CircleCheck, Copy, Film, Mail, Send } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { AccessGrant } from "@/lib/types";
import { cn, daysFromNow, formatDate, inviteLink, viewerSignInLink } from "@/lib/utils";
import { DurationPicker } from "./duration-picker";
import { ProjectCover } from "./project-cover";
import { useToast } from "./toast";
import { Button, Field, Input, Textarea, Toggle } from "./ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteForm({ defaultProjectIds = [], onSent }: { defaultProjectIds?: string[]; onSent?: (g: AccessGrant) => void }) {
  const { projects, invite, hasAccount } = useStore();
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>(defaultProjectIds);
  const [days, setDays] = useState(3);
  const [includeFilm, setIncludeFilm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ grant: AccessGrant; existing: boolean } | null>(null);

  const shareable = projects.filter((p) => p.status !== "Archived" || selected.includes(p.id));
  const filmProjects = projects.filter((p) => selected.includes(p.id) && p.film);

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
      const existing = hasAccount(email);
      const grant = invite({ email, projectIds: selected, days, includeFilm: includeFilm && filmProjects.length > 0, message });
      setSending(false);
      setSent({ grant, existing });
      onSent?.(grant);
    }, 700);
  }

  if (sent) return <InviteSent {...sent} onDone={() => {
    setSent(null);
    setEmail("");
    setMessage("");
    setIncludeFilm(false);
    setSelected(defaultProjectIds);
  }} />;

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Viewer email">
        <div className="relative">
          <Mail size={17} className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-ink-muted" />
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
                <ProjectCover project={p} compact hideTitle className="h-11 w-9 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.title}</div>
                  <div className="flex items-center gap-1 text-xs text-ink-muted">
                    {p.status}
                    {p.film && (
                      <>
                        {" · "}
                        <Film size={11} /> Film
                      </>
                    )}
                  </div>
                </div>
                <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full transition", on ? "bg-ink text-white" : "ring-1 ring-black/15")}>
                  {on && <Check size={12} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full film is opt-in per invite — the most sensitive asset. */}
      <div
        className={cn(
          "flex items-start gap-4 rounded-2xl p-4 ring-1 transition",
          includeFilm && filmProjects.length ? "bg-amber-50/80 ring-amber-200" : "bg-white/60 ring-black/[0.05]",
          !filmProjects.length && "opacity-50",
        )}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink text-white">
          <Film size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Include the full film</div>
          <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">
            {filmProjects.length
              ? `Lets them watch ${filmProjects.map((p) => p.film!.title).join(" and ")}. Only share with people who need the full cut.`
              : "None of the selected projects has a full film."}
          </p>
        </div>
        <Toggle checked={includeFilm && filmProjects.length > 0} onChange={(v) => filmProjects.length && setIncludeFilm(v)} label="Include the full film" />
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
      <p className="text-center text-xs text-ink-muted">They&apos;ll get an email with a private link to set their own password. You never see it.</p>
    </form>
  );
}

function InviteSent({ grant, existing, onDone }: { grant: AccessGrant; existing: boolean; onDone: () => void }) {
  const toast = useToast();
  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable */
    }
    toast(`${label} copied`);
  };

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-500/12 text-emerald-600">
          <CircleCheck size={22} />
        </span>
        <div>
          <div className="text-lg font-semibold tracking-tight">Access sent</div>
          <div className="text-[13px] text-ink-muted">
            Email sent to {grant.email} <span className="text-ink-muted/70">(simulated)</span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {existing ? (
          <LinkRow
            label="They already have an account"
            hint="The new access appears next time they sign in."
            url={viewerSignInLink()}
            onCopy={() => copy(viewerSignInLink(), "Sign-in link")}
          />
        ) : (
          <>
            <LinkRow
              label="1 · Invitation link"
              hint="One-time link. They choose their own password here."
              url={inviteLink(grant.token)}
              onCopy={() => copy(inviteLink(grant.token), "Invitation link")}
            />
            <LinkRow
              label="2 · Sign-in link"
              hint="Where they sign in afterwards with email + password."
              url={viewerSignInLink()}
              onCopy={() => copy(viewerSignInLink(), "Sign-in link")}
            />
          </>
        )}
      </div>

      <Button variant="secondary" className="mt-6 w-full" onClick={onDone}>
        Invite someone else
      </Button>
    </div>
  );
}

function LinkRow({ label, hint, url, onCopy }: { label: string; hint: string; url: string; onCopy: () => void }) {
  return (
    <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-black/[0.05]">
      <div className="text-[13px] font-semibold">{label}</div>
      <div className="mt-0.5 text-xs text-ink-muted">{hint}</div>
      <div className="mt-3 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-xl bg-black/[0.04] px-3 py-2 font-mono text-xs text-ink-soft">{url}</code>
        <Button variant="secondary" size="sm" onClick={onCopy}>
          <Copy size={13} /> Copy
        </Button>
      </div>
    </div>
  );
}
