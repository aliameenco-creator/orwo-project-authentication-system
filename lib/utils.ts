import type { AccessGrant, GrantStatus } from "./types";

const DAY = 86_400_000;

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function daysFromNow(days: number, base = Date.now()) {
  return new Date(base + days * DAY).toISOString();
}

export function daysUntil(iso: string, now = Date.now()) {
  return Math.ceil((new Date(iso).getTime() - now) / DAY);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatRelative(iso: string) {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / DAY);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.round(diff / 7)} wk ago`;
  return formatDate(iso);
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function grantStatus(grant: AccessGrant): GrantStatus {
  if (grant.revoked) return "Revoked";
  const d = daysUntil(grant.expiryDate);
  if (d <= 0) return "Expired";
  if (d <= 2) return "Expiring";
  return "Active";
}

export function isGrantLive(grant: AccessGrant) {
  const s = grantStatus(grant);
  return s === "Active" || s === "Expiring";
}

export function expiryLabel(grant: AccessGrant) {
  if (grant.revoked) return "Access revoked";
  const d = daysUntil(grant.expiryDate);
  if (d <= 0) {
    const ago = Math.abs(d);
    return ago === 0 ? "Expired today" : `Expired ${ago} day${ago === 1 ? "" : "s"} ago`;
  }
  if (d === 1) return "Access expires in 1 day";
  return `Access expires in ${d} days`;
}

export function initials(name: string) {
  return name
    .split(/[\s.@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase() + p.slice(1))
    .join(" ");
}

function origin() {
  return typeof window !== "undefined" ? window.location.origin : "https://orwo.family";
}

/** One-time link where an invited viewer creates their own password. */
export function inviteLink(token: string) {
  return `${origin()}/invite/${token}`;
}

/** Where viewers sign in after they've set up their account. */
export function viewerSignInLink() {
  return `${origin()}/`;
}

/**
 * Prototype-only password hash (FNV-1a, salted with the email) so plain passwords never sit in storage.
 * A real backend would use bcrypt/argon2 server-side.
 */
export function hashPassword(email: string, password: string) {
  let h = 0x811c9dc5;
  for (const c of `${email.toLowerCase()}::${password}`) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export function formatRuntime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : formatDuration(seconds);
}

/** Best grant per project for a viewer — live grants win, then the latest expiry. */
export function viewerAccess(grants: AccessGrant[], email: string) {
  const map = new Map<string, AccessGrant>();
  for (const g of grants) {
    if (g.email !== email) continue;
    for (const pid of g.projectIds) {
      const cur = map.get(pid);
      const better =
        !cur ||
        (isGrantLive(g) && !isGrantLive(cur)) ||
        (isGrantLive(g) === isGrantLive(cur) && new Date(g.expiryDate) > new Date(cur.expiryDate));
      if (better) map.set(pid, g);
    }
  }
  return map;
}
