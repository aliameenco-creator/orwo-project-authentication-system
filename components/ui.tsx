"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, type ComponentProps, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn, initials } from "@/lib/utils";

/* ---------- Button ---------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-full transition-all duration-300 ease-[var(--ease-glass)] active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white shadow-[0_8px_24px_-8px_rgba(11,13,18,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-black hover:shadow-[0_12px_32px_-8px_rgba(11,13,18,0.55)]",
  accent:
    "bg-gradient-to-b from-[#4c82ff] to-accent text-white shadow-[0_8px_24px_-8px_rgba(47,107,255,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] hover:brightness-110",
  secondary: "glass text-ink hover:bg-white/90",
  ghost: "text-ink-soft hover:bg-black/[0.04] hover:text-ink",
  danger: "text-red-600 bg-red-50/80 border border-red-100 hover:bg-red-100/80",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-[13px]",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function IconButton({ className, label, ...props }: ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-all duration-200 hover:bg-black/[0.05] hover:text-ink active:scale-95",
        className,
      )}
      {...props}
    />
  );
}

/* ---------- Badge ---------- */

export type BadgeTone = "neutral" | "green" | "amber" | "red" | "blue" | "violet" | "dark";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-black/[0.05] text-ink-soft",
  green: "bg-emerald-500/10 text-emerald-700",
  amber: "bg-amber-500/12 text-amber-700",
  red: "bg-red-500/10 text-red-600",
  blue: "bg-accent/10 text-accent",
  violet: "bg-violet-500/10 text-violet-700",
  dark: "bg-black/55 text-white backdrop-blur-md border border-white/15",
};

export function Badge({
  tone = "neutral",
  dot,
  icon,
  className,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap",
        badgeTones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {icon}
      {children}
    </span>
  );
}

/* ---------- Glass card ---------- */

export function GlassCard({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("glass rounded-3xl", className)} {...props} />;
}

/* ---------- Form fields ---------- */

export const inputClass =
  "w-full h-11 rounded-2xl bg-white/70 border border-black/[0.06] px-4 text-[15px] text-ink placeholder:text-ink-muted/70 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-all focus:bg-white focus:border-accent/40 focus:ring-4 focus:ring-accent/10";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 flex items-baseline justify-between text-[13px] font-medium text-ink-soft">
        {label}
        {hint && <span className="text-xs font-normal text-ink-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputClass, "h-auto min-h-24 py-3 resize-none", className)} {...props} />;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-300",
        checked ? "bg-emerald-500" : "bg-black/[0.12]",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] left-[3px] h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-[var(--ease-glass)]",
          checked && "translate-x-[18px]",
        )}
      />
    </button>
  );
}

/* ---------- Segmented control ---------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string; icon?: ReactNode; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-full bg-black/[0.045] p-1 no-scrollbar overflow-x-auto max-w-full", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-all duration-300 ease-[var(--ease-glass)]",
              active
                ? "bg-white text-ink shadow-[0_2px_10px_-2px_rgba(15,23,42,0.15),inset_0_1px_0_white]"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {o.icon}
            {o.label}
            {o.count !== undefined && (
              <span className={cn("rounded-full px-1.5 text-[11px]", active ? "bg-black/[0.06]" : "bg-black/[0.04]")}>
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Avatar ---------- */

const avatarGradients = [
  "from-sky-400 to-indigo-500",
  "from-rose-400 to-orange-400",
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-fuchsia-500",
  "from-amber-400 to-pink-500",
];

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const idx = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % avatarGradients.length;
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_8px_-2px_rgba(0,0,0,0.2)]",
        avatarGradients[idx],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

/* ---------- Page header ---------- */

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-ink sm:text-[40px]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

/* ---------- Empty state ---------- */

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="glass mb-5 grid h-14 w-14 place-items-center rounded-2xl text-ink-soft">{icon}</div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ---------- Modal ---------- */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "glass-strong relative max-h-[92vh] w-full max-w-lg animate-scale-in overflow-y-auto rounded-t-[32px] p-6 sm:rounded-[32px] sm:p-8",
          className,
        )}
      >
        <IconButton label="Close" onClick={onClose} className="absolute top-4 right-4">
          <X size={18} />
        </IconButton>
        {title && (
          <div className="mb-6 pr-8">
            <h2 className="text-2xl font-semibold tracking-[-0.02em]">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
