export type ProjectStatus = "Active" | "Draft" | "Archived";

export interface Palette {
  /** Poster gradient stops */
  from: string;
  via: string;
  to: string;
  /** Accent used for glows / highlights */
  glow: string;
}

export interface PdfDoc {
  id: string;
  title: string;
  pages: number;
  format: "deck" | "document";
  updatedAt: string; // ISO
  visible: boolean;
}

export interface Poster {
  id: string;
  title: string;
  variant: 0 | 1 | 2;
}

export interface Trailer {
  id: string;
  title: string;
  duration: number; // seconds
}

export interface Project {
  id: string;
  title: string;
  description: string;
  summary: string;
  genre: string;
  year: number;
  status: ProjectStatus;
  palette: Palette;
  pdfs: PdfDoc[];
  posters: Poster[];
  trailers: Trailer[];
  updatedAt: string;
}

export interface AccessGrant {
  id: string;
  email: string;
  name: string;
  projectIds: string[];
  startDate: string;
  expiryDate: string;
  revoked: boolean;
  message?: string;
  token: string;
}

export type GrantStatus = "Active" | "Expiring" | "Expired" | "Revoked";

export interface Session {
  role: "admin" | "viewer";
  email: string;
  name: string;
  /** Set when the owner is previewing the portal as a viewer. */
  preview?: boolean;
}
