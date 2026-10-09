import type { ReactNode } from "react";
import { Logo } from "./brand";

/** Minimal centered layout for sign-in / invitation screens. Reveals nothing about the projects inside. */
export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-[400px] animate-fade-up">
        <div className="mb-10 flex justify-center">
          <Logo height={56} />
        </div>
        <div className="glass-strong rounded-[32px] p-7 sm:p-8">
          <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.03em]">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-[13px] text-ink-muted">{footer}</div>}
      </div>
    </main>
  );
}

export function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />;
}
