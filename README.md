# Orwo Family — Phase 1 Prototype

A private film-project portal where Jake manages decks, posters and trailers and grants **time-limited, view-only** access to viewers by email. This is a clickable frontend prototype: mock data only, with no real auth, storage or backend.

Built with Next.js (App Router), React, TypeScript, Tailwind CSS v4 and lucide-react, in an Apple "Liquid Glass" inspired style.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Demo sign-in

| Role | Email | Password |
| --- | --- | --- |
| Owner (Jake) | `jake@orwo.family` (prefilled) | anything |
| Invited viewer | `sarah.chen@northlightfilms.com` (prefilled on the "Invited viewer" tab) | anything |

Viewer sign-in only accepts emails that have been invited. Anyone you invite from **Access** can sign in as a viewer straight away. As the owner you can also use **Preview viewer portal** (sidebar) or **Preview as** (Viewers page) to see exactly what a viewer sees.

All changes (new projects, invites, extensions, revocations) are saved in your browser's localStorage. **Settings → Reset demo data** restores the examples.

## What's included

- **Login**: Owner and Invited viewer modes, both with mock authentication.
- **Dashboard and Projects**: stats, search, status filter, and project cards (poster, PDFs, trailer, viewers, status).
- **New / Edit Project**: details, status, poster and trailer upload, and multi-PDF materials with drag reorder, visibility toggle, preview and remove. The upload progress is simulated.
- **Project detail**: Presentations, Posters, Trailers and Access tabs.
- **In-page PDF viewer**: stacked pages, thumbnails, zoom, and a watermark with the viewer's email. Right-click, Ctrl/⌘+S and Ctrl/⌘+P are blocked.
- **Access management**: invite by email with 1, 3, 7 or custom days of access, plus Extend, Revoke, Reinstate and Copy Link. Access expires automatically when the time runs out.
- **Viewer portal**: a clean, discreet view of only the shared projects, with no admin controls, protection badges, expiry countdowns or download actions. Expired or unshared projects quietly disappear.
- **Viewers directory and Settings**.

## Project layout

```
app/page.tsx            login
app/(admin)/...         owner pages (dashboard, projects, access, viewers, settings)
app/viewer/...          viewer portal
components/             UI kit + feature components (pdf-viewer, project-view, access-list, ...)
lib/                    types, mock data, client store, helpers
plan.md                 spec + build status
```

> Protection here is a UI simulation. A production build would need server-side auth, signed short-lived URLs, server-rendered page images, and DRM or streaming for video.
