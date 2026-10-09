"use client";

import { Ban, CalendarPlus, Eye, Film, Link as LinkIcon, RotateCcw, UserRound } from "lucide-react";
import { useState } from "react";
import { usePreviewAs } from "./admin-shell";
import { useStore } from "@/lib/store";
import type { AccessGrant } from "@/lib/types";
import { cn, daysUntil, formatDate, grantStatus, inviteLink, viewerSignInLink } from "@/lib/utils";
import { GrantStatusBadge } from "./badges";
import { DurationPicker } from "./duration-picker";
import { useToast } from "./toast";
import { Avatar, Button, EmptyState, IconButton, Modal } from "./ui";

/** Viewer access rows with Extend / Revoke / Copy Link. Table on desktop, cards on mobile. */
export function AccessList({ grants, showPreview }: { grants: AccessGrant[]; showPreview?: boolean }) {
  const { projects, extendGrant, revokeGrant, reinstateGrant, hasAccount } = useStore();
  const toast = useToast();
  const previewAs = usePreviewAs();
  const [extending, setExtending] = useState<AccessGrant | null>(null);
  const [revoking, setRevoking] = useState<AccessGrant | null>(null);
  const [days, setDays] = useState(3);

  const projectName = (id: string) => projects.find((p) => p.id === id)?.title ?? "Removed project";

  if (!grants.length)
    return <EmptyState icon={<UserRound size={22} />} title="No viewers yet" body="Invite someone by email to give them time-limited, view-only access." />;

  // Not signed up yet → their one-time invitation link; otherwise the normal sign-in page.
  async function copy(g: AccessGrant) {
    const joined = hasAccount(g.email);
    const link = joined ? viewerSignInLink() : inviteLink(g.token);
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      /* clipboard unavailable — still show the link */
    }
    toast(joined ? "Sign-in link copied" : "Invitation link copied", link);
  }

  const accountState = (g: AccessGrant) =>
    hasAccount(g.email) ? (
      <span className="text-[11px] text-emerald-600">Joined</span>
    ) : (
      <span className="text-[11px] text-amber-600">Invite pending</span>
    );

  const actions = (g: AccessGrant) => {
    const s = grantStatus(g);
    const dead = s === "Revoked" || s === "Expired";
    return (
      <div className="flex items-center justify-end gap-1.5">
        {showPreview && !dead && (
          <IconButton label="Preview as this viewer" onClick={() => previewAs(g.email)}>
            <Eye size={15} />
          </IconButton>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setDays(dead ? 3 : 7);
            setExtending(g);
          }}
        >
          {dead ? <RotateCcw size={13} /> : <CalendarPlus size={13} />}
          {dead ? "Reinstate" : "Extend"}
        </Button>
        {s !== "Revoked" && (
          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setRevoking(g)}>
            <Ban size={13} /> Revoke
          </Button>
        )}
        <IconButton label={hasAccount(g.email) ? "Copy sign-in link" : "Copy invitation link"} onClick={() => copy(g)} disabled={dead} className="disabled:opacity-30">
          <LinkIcon size={15} />
        </IconButton>
      </div>
    );
  };

  const projectChips = (g: AccessGrant) => (
    <div className="flex flex-wrap gap-1">
      {g.projectIds.map((id) => (
        <span key={id} className="rounded-full bg-black/[0.045] px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap text-ink-soft">
          {projectName(id)}
        </span>
      ))}
      {g.includeFilm && (
        <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap text-white">
          <Film size={11} /> Full film
        </span>
      )}
    </div>
  );

  const expiryText = (g: AccessGrant) => {
    const d = daysUntil(g.expiryDate);
    return (
      <>
        <div className="text-[13px]">{formatDate(g.expiryDate)}</div>
        <div className={cn("text-xs", d <= 0 || g.revoked ? "text-ink-muted" : d <= 2 ? "text-amber-600" : "text-ink-muted")}>
          {g.revoked ? "—" : d <= 0 ? "Expired" : `in ${d} day${d === 1 ? "" : "s"}`}
        </div>
      </>
    );
  };

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] font-semibold tracking-wider whitespace-nowrap text-ink-muted uppercase">
              <th className="px-4 pb-3 font-semibold">Viewer</th>
              <th className="px-4 pb-3 font-semibold">Projects</th>
              <th className="px-4 pb-3 font-semibold">Access start</th>
              <th className="px-4 pb-3 font-semibold">Expiry</th>
              <th className="px-4 pb-3 font-semibold">Status</th>
              <th className="px-4 pb-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {grants.map((g) => (
              <tr key={g.id} className={cn("border-t border-black/[0.05] transition hover:bg-white/50", grantStatus(g) === "Revoked" && "opacity-60")}>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={g.name} size={34} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{g.name}</div>
                      <div className="truncate text-xs text-ink-muted">{g.email}</div>
                      {accountState(g)}
                    </div>
                  </div>
                </td>
                <td className="max-w-[260px] px-4 py-3.5">{projectChips(g)}</td>
                <td className="px-4 py-3.5 text-[13px] whitespace-nowrap text-ink-soft">{formatDate(g.startDate)}</td>
                <td className="px-4 py-3.5 whitespace-nowrap">{expiryText(g)}</td>
                <td className="px-4 py-3.5">
                  <GrantStatusBadge grant={g} />
                </td>
                <td className="px-4 py-3.5">{actions(g)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {grants.map((g) => (
          <div key={g.id} className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/[0.04]">
            <div className="flex items-start gap-3">
              <Avatar name={g.name} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-medium">{g.name}</div>
                  <GrantStatusBadge grant={g} />
                </div>
                <div className="truncate text-xs text-ink-muted">{g.email}</div>
                {accountState(g)}
              </div>
            </div>
            <div className="mt-3">{projectChips(g)}</div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="text-xs text-ink-muted">
                {formatDate(g.startDate)} → {formatDate(g.expiryDate)}
              </div>
            </div>
            <div className="mt-3 border-t border-black/[0.05] pt-3">{actions(g)}</div>
          </div>
        ))}
      </div>

      {/* Extend / reinstate */}
      <Modal
        open={!!extending}
        onClose={() => setExtending(null)}
        title={extending && grantStatus(extending) !== "Active" && grantStatus(extending) !== "Expiring" ? "Reinstate access" : "Extend access"}
        subtitle={extending ? `${extending.name} · ${extending.email}` : undefined}
      >
        {extending && (
          <>
            <DurationPicker value={days} onChange={setDays} />
            <p className="mt-4 text-sm text-ink-muted">
              {grantStatus(extending) === "Revoked" || grantStatus(extending) === "Expired"
                ? `Access will restart today and run for ${days} day${days === 1 ? "" : "s"}.`
                : `Adds ${days} day${days === 1 ? "" : "s"} to the current expiry of ${formatDate(extending.expiryDate)}.`}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setExtending(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const dead = grantStatus(extending) === "Revoked" || grantStatus(extending) === "Expired";
                  if (dead) reinstateGrant(extending.id, days);
                  else extendGrant(extending.id, days);
                  toast(dead ? "Access reinstated" : "Access extended", `${extending.name} · +${days} days`);
                  setExtending(null);
                }}
              >
                Confirm
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Revoke confirm */}
      <Modal open={!!revoking} onClose={() => setRevoking(null)} title="Revoke access?" subtitle={revoking?.email}>
        {revoking && (
          <>
            <p className="text-sm leading-relaxed text-ink-soft">
              {revoking.name} will immediately lose access to {revoking.projectIds.map(projectName).join(", ")}. Their link will stop working.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setRevoking(null)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  revokeGrant(revoking.id);
                  toast("Access revoked", revoking.email);
                  setRevoking(null);
                }}
              >
                <Ban size={15} /> Revoke access
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
