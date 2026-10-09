# Orwo Family — Phase 1 Prototype

A private film-project portal where Jake manages decks, posters, trailers and full films and grants **time-limited, view-only** access to viewers by email. This is a clickable frontend prototype: mock data, mock authentication and no backend.

Built with Next.js (App Router), React, TypeScript, Tailwind CSS v4, lucide-react and pdf.js, in an Apple "Liquid Glass" inspired style.

## Run it

```bash
npm install        # also copies the pdf.js worker into /public
npm run dev
```

## Two separate sign-ins

| Who | Where | Demo login |
| --- | --- | --- |
| Viewers | `http://localhost:3000/` | `sarah.chen@northlightfilms.com` / `screening` |
| Owner (Jake) | `http://localhost:3000/owner` | `jake@orwo.family` / any password |

The viewer page never links to the owner sign-in.

## How a viewer gets in

1. On **Access**, Jake enters an email, picks the projects, decides whether to **include the full film**, and sets a duration (1 / 3 / 7 / custom days).
2. The app shows two links (the email is simulated):
   - **Invitation link** (`/invite/<token>`): a one-time link where the viewer chooses their own password. Jake never sees or sends passwords.
   - **Sign-in link** (`/`): where they sign in afterwards.
3. Once they've set up their account, the invitation link stops working. When their access expires or is revoked, the projects disappear from their portal.

Try it: invite any email, copy the invitation link, sign out, open the link, set a password, and you're in the viewer portal.

## PDFs become page images

Viewers never receive the PDF file, only an image of each page with their email over it. There are two ways to produce the images:

- **Server-style (production approach):** `python scripts/convert-pdf.py "<file>.pdf" <slug>` uses PyMuPDF to render each page into `public/demo-pages/<slug>/`. The demo project **Céline — Paris** uses this. A real backend would do it on upload, store the images privately and serve them through short-lived signed URLs.
  ```bash
  pip install pymupdf
  python scripts/convert-pdf.py "CÉLINE — PARIS.pdf" celine-paris
  ```
- **In-browser (prototype uploads):** uploading a PDF in New/Edit Project converts it with pdf.js and stores the pages in IndexedDB.

PDFs and generated page images are git-ignored, so confidential decks are never committed.

## Full film

Each project can have a full film, either an uploaded master or a private streaming link (Vimeo, Mux, Frame.io…). It's the most sensitive asset, so it's **opt-in per invitation**. Only viewers whose invitation includes the film see a Film tab, and their email drifts across the picture while it plays. Playback is simulated in this prototype. Production would use DRM streaming with signed, expiring tokens.

## Also included

Dashboard, project search and filters, project detail (Film / Presentations / Posters / Trailers / Access tabs), extend / revoke / reinstate access, viewer directory with Joined / Invite pending status, owner "preview as viewer", and settings with **Reset demo data**.

The viewer side is deliberately discreet: no "protected" badges and no expiry countdowns.

All prototype data lives in your browser (localStorage and IndexedDB).

## Project layout

```
app/page.tsx              viewer sign-in
app/owner/page.tsx        owner sign-in
app/invite/[token]/       invitation → create password
app/(admin)/...           owner pages
app/viewer/...            viewer portal
components/               UI kit + features (pdf-viewer, film-player, invite-form, …)
lib/                      types, mock data, store, pdf-convert, page-store
scripts/                  convert-pdf.py, copy-pdf-worker.mjs
plan.md                   spec + build status
```
