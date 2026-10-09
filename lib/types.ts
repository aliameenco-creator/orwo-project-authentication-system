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
  /**
   * Where the page images come from:
   * - "static": converted server-side (scripts/convert-pdf.py) → `${pagesPath}/page-01.jpg`…
   * - "upload": converted in the browser with pdf.js, stored in IndexedDB
   * - "mock" (default): generated placeholder pages
   */
  source?: "mock" | "upload" | "static";
  pagesPath?: string;
  /** Page width / height for uploaded PDFs. */
  aspect?: number;
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

/** The full feature — shared separately from the rest of the materials. */
export interface Film {
  title: string;
  duration: number; // seconds
  /** Uploaded master, or a private link from a streaming host (Vimeo, Mux, Frame.io…). */
  source: "upload" | "link";
  url?: string;
  fileName?: string;
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
  film?: Film;
  /** Real cover image (e.g. page 1 of the deck). Falls back to generated key art. */
  cover?: string;
  updatedAt: string;
}

export interface AccessGrant {
  id: string;
  email: string;
  name: string;
  projectIds: string[];
  /** Whether the full film is included for these projects (off by default). */
  includeFilm: boolean;
  startDate: string;
  expiryDate: string;
  revoked: boolean;
  message?: string;
  /** Single invitation token — used in the /invite/{token} link. */
  token: string;
}

/** A viewer who has accepted an invitation and set their own password. */
export interface ViewerAccount {
  email: string;
  name: string;
  /** Prototype only: a non-reversible hash so the plain password is never stored. */
  passwordHash: string;
  createdAt: string;
}

export type GrantStatus = "Active" | "Expiring" | "Expired" | "Revoked";

export interface Session {
  role: "admin" | "viewer";
  email: string;
  name: string;
  /** Set when the owner is previewing the portal as a viewer. */
  preview?: boolean;
}
