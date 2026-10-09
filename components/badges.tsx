import { Eye, Lock, ShieldCheck } from "lucide-react";
import type { AccessGrant, ProjectStatus } from "@/lib/types";
import { daysUntil, grantStatus } from "@/lib/utils";
import { Badge, type BadgeTone } from "./ui";

const statusTone: Record<ProjectStatus, BadgeTone> = {
  Active: "green",
  Draft: "amber",
  Archived: "neutral",
};

export function ProjectStatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <Badge tone={statusTone[status]} dot className={className}>
      {status}
    </Badge>
  );
}

export function GrantStatusBadge({ grant }: { grant: AccessGrant }) {
  const s = grantStatus(grant);
  if (s === "Revoked") return <Badge tone="red" dot>Revoked</Badge>;
  if (s === "Expired") return <Badge tone="neutral" dot>Expired</Badge>;
  if (s === "Expiring") {
    const d = daysUntil(grant.expiryDate);
    return (
      <Badge tone="amber" dot>
        {d === 1 ? "1 day left" : `${d} days left`}
      </Badge>
    );
  }
  return <Badge tone="green" dot>Active</Badge>;
}

export function ViewOnlyBadge({ dark }: { dark?: boolean }) {
  return (
    <Badge tone={dark ? "dark" : "blue"} icon={<Eye size={12} />}>
      View Only
    </Badge>
  );
}

export function ProtectedBadge({ dark }: { dark?: boolean }) {
  return (
    <Badge tone={dark ? "dark" : "green"} icon={<ShieldCheck size={12} />}>
      Protected Access
    </Badge>
  );
}

export function NoDownloadsNote({ className }: { className?: string }) {
  return (
    <p className={`flex items-center gap-1.5 text-xs text-ink-muted ${className ?? ""}`}>
      <Lock size={12} /> This content is view-only · Access controlled by Orwo Family
    </p>
  );
}
