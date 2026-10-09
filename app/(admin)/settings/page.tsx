"use client";

import { RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { DurationPicker } from "@/components/duration-picker";
import { useToast } from "@/components/toast";
import { Avatar, Button, Field, GlassCard, Input, Modal, PageHeader, Toggle } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const { session, resetDemo } = useStore();
  const toast = useToast();
  const [name, setName] = useState(session?.name ?? "");
  const [prefs, setPrefs] = useState({ watermark: true, blockShortcuts: true, notifyOnView: true, notifyOnExpiry: true });
  const [defaultDays, setDefaultDays] = useState(3);
  const [confirmReset, setConfirmReset] = useState(false);

  const flip = (k: keyof typeof prefs) => (v: boolean) => setPrefs((p) => ({ ...p, [k]: v }));

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Your profile and default protection for shared materials."
        actions={<Button onClick={() => toast("Settings saved")}>Save Changes</Button>}
      />

      <div className="grid max-w-3xl gap-6">
        <Section title="Profile">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar name={name || "Jake"} size={72} />
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <Field label="Name">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Email">
                <Input value={session?.email ?? ""} disabled className="opacity-70" />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Protection" subtitle="Applied to every project you share.">
          <Row title="Watermark presentations" body="Overlay each viewer's email across every page they open.">
            <Toggle checked={prefs.watermark} onChange={flip("watermark")} label="Watermark presentations" />
          </Row>
          <Row title="Block saving shortcuts" body="Disable right-click, Ctrl/⌘+S and Ctrl/⌘+P inside viewers.">
            <Toggle checked={prefs.blockShortcuts} onChange={flip("blockShortcuts")} label="Block saving shortcuts" />
          </Row>
          <Row title="Downloads" body="Files are never offered for download in Orwo Family." last>
            <span className="rounded-full bg-black/[0.05] px-3 py-1 text-xs font-medium text-ink-muted">Always off</span>
          </Row>
        </Section>

        <Section title="Default access duration" subtitle="Pre-selected when you invite someone new.">
          <DurationPicker value={defaultDays} onChange={setDefaultDays} />
        </Section>

        <Section title="Notifications">
          <Row title="When a viewer opens material" body="Get notified when a presentation or trailer is viewed.">
            <Toggle checked={prefs.notifyOnView} onChange={flip("notifyOnView")} label="Notify on view" />
          </Row>
          <Row title="Before access expires" body="A reminder 24 hours before someone's access ends." last>
            <Toggle checked={prefs.notifyOnExpiry} onChange={flip("notifyOnExpiry")} label="Notify before expiry" />
          </Row>
        </Section>

        <Section title="Prototype" subtitle="This demo stores everything in your browser.">
          <Row title="Reset demo data" body="Restore the four example projects and invited viewers." last>
            <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={14} /> Reset
            </Button>
          </Row>
        </Section>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset demo data?">
        <p className="text-sm text-ink-soft">Any projects or invites you created in this prototype will be replaced with the original examples.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmReset(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              resetDemo();
              setConfirmReset(false);
              toast("Demo data restored");
            }}
          >
            Reset
          </Button>
        </div>
      </Modal>
    </>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <GlassCard className="animate-fade-up p-6 sm:p-7">
      <h2 className="text-lg font-semibold tracking-[-0.01em]">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[13px] text-ink-muted">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </GlassCard>
  );
}

function Row({ title, body, children, last }: { title: string; body: string; children: ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-6 py-4 first:pt-0 ${last ? "pb-0" : "border-b border-black/[0.05]"}`}>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-0.5 text-[13px] text-ink-muted">{body}</div>
      </div>
      {children}
    </div>
  );
}
