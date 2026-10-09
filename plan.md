# Orwo Family — Phase 1 Prototype

## BUILD STATUS (keep this section updated — resume from "NEXT UP")

**Stack:** Next.js (App Router) + React + TypeScript + Tailwind CSS v4 + lucide-react. Mock data only, client-side store (React context + localStorage).
**Run:** `npm install` then `npm run dev`. Viewer sign-in at http://localhost:3000/ (sarah.chen@northlightfilms.com / screening); owner at http://localhost:3000/owner (jake@orwo.family / any password).

### Progress
- [x] 0. Project scaffold (package.json, tsconfig, Tailwind, layout, glass design tokens)
- [x] 1. Login screen (Admin / Viewer mock sign-in)
- [x] 2. Admin shell (sidebar + top bar) + Dashboard (Projects grid, search, New Project)
- [x] 3. New / Edit Project form (poster, trailer, multi-PDF materials list)
- [x] 4. Project Detail page (Presentations / Posters / Trailers / Access tabs)
- [x] 5. Access management (invite form + invited viewers list, Extend / Revoke / Copy Link)
- [x] 6. Viewer portal (shared projects, expiry countdown, restricted project view)
- [x] 7. Protected viewing touches (View Only badges, watermark, no downloads)
- [x] 8. Viewers + Settings pages
- [x] 9. Build check (`npm run build`) + polish

### NEXT UP
**Phase 1 prototype is complete** (build passes; every flow clicked through in Edge via a Playwright script, 0 console errors). Pushed to https://github.com/aliameenco-creator/orwo-project-authentication-system

**Round 2 feedback (done):**
- Viewer side is now *discreet*: no "View Only" / "Protected Access" badges, no "Access controlled by Orwo Family" banner or footnote, no expiry countdown, and no "Access ended" section (expired projects just disappear). Blocked links show a neutral "This project isn't available". Right-click/Ctrl+S/Ctrl+P are still blocked, silently. The watermark shows only the viewer's email. Owner pages keep all protection badges.
- Real Orwo Family logo: `public/orwo-logo-black.png` (light UI) and `public/orwo-logo-white.png` (dark surfaces), generated from the supplied white-on-transparent webp. `app/icon.png` is the favicon. `components/brand.tsx` exports `Logo`, `LogoMark`, `Brand`.
- The tagline "Create and manage our projects privately" only appears in Jake's sidebar, never to viewers.

**Round 3 (done):**
- **Separate sign-ins.** `/` = viewer sign-in (email + password, generic "Incorrect email or password" so it never reveals who's invited). `/owner` = owner sign-in (any password in the prototype). `AdminShell` redirects to `/owner`.
- **Invitation flow.** `/invite/[token]`: the viewer sets name + password and an account is created (`ViewerAccount` with a prototype FNV hash, never the plain password). After that the link shows "You're already set up"; once access expires or is revoked it shows "This link has expired". After sending, `InviteForm` shows the invitation link and the sign-in link with Copy buttons. The access list shows Joined / Invite pending, and Copy Link copies the invite link or the sign-in link to match.
- **Full film (screener).** `Project.film` (upload, or a private link such as Vimeo/Mux/Frame.io). `AccessGrant.includeFilm` is opt-in per invite. Viewers see the Film tab only with a live grant that has `includeFilm`. `components/film-player.tsx` is a simulated player with the viewer's email drifting across the frame. The owner Film tab also shows the source and "Who can watch".
- **Real PDF → pages, two routes:** (1) server-style `scripts/convert-pdf.py` (PyMuPDF) → `public/demo-pages/<slug>/page-NN.jpg` + manifest (the demo project "Céline — Paris" uses `source: "static"`); (2) in-browser `lib/pdf-convert.ts` (pdf.js, worker copied to `/public` by postinstall) → IndexedDB (`lib/page-store.ts`), `source: "upload"`, with live "Converting page X of Y". `PdfViewer` renders real images when present (`usePageImages`).
- The supplied deck `CÉLINE — PARIS.pdf` (35 MB → 14 JPEGs, 2.1 MB) stays local: `*.pdf` and `public/demo-pages/` are git-ignored. On a fresh clone, run the convert script or the Céline project falls back to generated art and "Page unavailable".
- Store key bumped to `orwo-family:v2` (shape changed).

**Round 4 (done):**
- Project cards never use a PDF page as the thumbnail. Céline — Paris uses generated key art like the others (`store.migrate()` strips old `/demo-pages/` covers from saved data). Real covers should come from poster uploads.
- Full film is **private link only** (no upload). `Film` = `{ title, duration, url }`. Older saved films without a url are migrated.
- Logo is the "OR / WO" mark only. "FAMILY" was cropped off the supplied artwork (`public/orwo-logo-*.png` are 516×400, plus `app/icon.png`).

Possible next steps (not started; pick up here if continuing):
- Phase 2 backend: real auth (email invite tokens with expiry, hashed passwords, password reset), private storage, server-side page rendering with burned-in watermark, signed URLs, DRM video (Mux / Cloudflare Stream).
- Real poster/trailer images (currently generated art).
- **Real PDF → pages.** Recommended production approach: on upload, the server rasterises each page to an image (pdftoppm/Poppler, MuPDF or Ghostscript, typically in a background job). The images are stored privately, the original PDF is never sent to the browser, and pages are served through short-lived signed URLs, optionally with the viewer's email watermark burned in server-side. Prototype option: render the uploaded PDF in the browser with `pdfjs-dist` to real page images so the demo shows the actual document.
- Real poster/trailer previews: keep the uploaded image as an object URL / base64 in the store instead of generated art.
- Persist Settings (name, protection toggles, default duration) in the store; make InviteForm use the default duration.
- Notifications are static mock data in `components/admin-shell.tsx`; derive them from grants.
- Phase 2: real backend (auth, storage, signed URLs, server-rendered page images, video streaming/DRM).

### Notes / decisions
- **Deploy:** `npm run build` = `next build --webpack`. Turbopack's PostCSS runs in a child Node process that some hosting build containers kill ("node process exited before we could connect to it" on globals.css). Webpack runs PostCSS in-process. Settings: Next.js preset, Node 22, build `npm run build`, output `.next`. The Céline page images are git-ignored, so on the deployed site the Céline deck shows "Page unavailable" unless `public/demo-pages/celine-paris/` is deployed.
- No create-next-app (folder name has spaces/caps) — package.json written by hand. TypeScript pinned to 5.x (TS 7 native may not work with Next 16).
- lucide-react v1: `Trash2` doesn't exist → use `Trash`.
- All state lives in `lib/store.tsx` (React context, persisted to localStorage key `orwo-family:v1`). Children render only after hydration to avoid SSR mismatches. "Reset demo data" will live in Settings.
- Mock dates are relative to "now" (`daysFromNow`) so "expires in 2 days" always reads correctly on first load.
- Posters are generated art (`components/poster-art.tsx`), not image files.
- (Superseded in round 3: the login is now split into `/` for viewers and `/owner` for the owner.)
- `ProjectView`, `PdfViewer`, `PosterGallery` and `TrailerPlayer` take `discreet` (= viewer mode) to hide all protection messaging.
- Owner can "Preview viewer portal" (session.preview = true) and return to owner view. `app/viewer/layout.tsx` uses a `leaving` ref so its guard doesn't hijack the "Return to owner view" redirect.
- Animations use `animation-fill-mode: backwards` (not `both`). `both` keeps `transform` set after the animation and breaks hover lifts and positioned transforms.
- Don't hand-write `-webkit-backdrop-filter` in globals.css. Tailwind v4/Lightning CSS then drops the unprefixed property and Chrome/Edge lose the blur. Lightning CSS adds the prefix itself.
- Icons next to `glass` inputs need `z-10` (backdrop-filter creates a stacking context that paints over them).
- `PosterArt` is `relative` itself. To fill a box, wrap it in an absolutely positioned div and pass `h-full w-full`.

### File map
- `app/page.tsx` viewer sign-in · `app/owner/page.tsx` owner sign-in · `app/invite/[token]/page.tsx` accept invite · `app/(admin)/*` owner pages (guarded by `components/admin-shell.tsx`): dashboard, projects, projects/new, projects/[id], projects/[id]/edit, access, viewers, settings
- `app/viewer/layout.tsx` (viewer guard + preview banner), `app/viewer/page.tsx` (shared projects + "Access ended"), `app/viewer/[id]/page.tsx` (blocks expired/revoked/unshared)
- `components/ui.tsx` Button/Badge/GlassCard/Field/Toggle/Segmented/Avatar/Modal/PageHeader/EmptyState
- `components/badges.tsx` status + View Only / Protected badges · `components/project-card.tsx` · `components/projects-browser.tsx`
- `components/project-form.tsx` (new/edit, fake upload progress, drag-reorder PDFs) · `components/upload-drop.tsx`
- `components/pdf-viewer.tsx` (in-page stacked-page viewer, watermark, blocks right-click/Ctrl+S/Ctrl+P)
- `components/project-view.tsx` shared by admin + viewer project pages (tabs: Presentations/Posters/Trailers/Access[admin only])
- `components/poster-gallery.tsx`, `components/trailer-player.tsx` (simulated streaming), `components/access-list.tsx` (Extend/Revoke/Reinstate/Copy Link modals), `components/invite-form.tsx`, `components/duration-picker.tsx`
- `lib/types.ts`, `lib/utils.ts`, `lib/mock-data.ts`, `lib/store.tsx`

---

## ORIGINAL SPEC

Build a Phase 1 frontend prototype for a private web app called Orwo Family.
This is a simple prototype only, not a full production system yet. Use mock data only and do not overcomplicate the backend. The purpose is to demonstrate the product flow, UI, and main user interactions.
Core idea
Orwo Family is a private project portal where Jake can manage film-related project materials and control who can view them. The portal should be designed so users can view materials online, but the system should avoid handing over files directly. The goal is view-only access, not file sharing.
Design direction
Use a premium glossy design inspired by the new iOS / Apple Liquid Glass style:
- clean white / very light background
- translucent glass panels
- soft blur / frosted glass effects
- rounded corners
- subtle shadows
- elegant minimal typography
- polished modern layout
- smooth hover states and transitions
- luxurious but simple feel
The design should feel like a high-end Apple-inspired interface.
Branding
At the top, show the brand name:
Orwo Family
Underneath, include a small supporting line such as:
Create and manage our projects privately
or
Private access for film projects, decks, posters, and trailers
Scope of Phase 1
Create a frontend prototype with the following screens and flows:
1. Login Screen
Create a modern glossy login page for Jake.
Fields:
- Email
- Password
- Sign In button
Keep it very clean and elegant.
This is only a prototype, so authentication can be mocked.
2. Admin Dashboard
After login, Jake lands on the main dashboard.
Dashboard content:
- Page title: Projects
- Button: New Project
- Search bar
- Project cards grid
Each project card should show:
- Project cover / poster thumbnail
- Project name
- short description
- number of PDFs
- whether trailer exists
- number of viewers with access
- status badge (Active / Draft / Archived)
- button: Open Project
Use 3–4 example projects with mock data.
Example projects:
- Echo Line
- The Last Horizon
- Glass River
- Midnight Archive
3. New Project / Edit Project Screen
Create a simple form where Jake can create or edit a project.
Fields:
- Project title
- Short description
- Upload poster
- Upload trailer
- Upload multiple PDF files
- Project status
Important:
For Phase 1, this can be a prototype uploader UI only. No real backend required.
Show a section for Project Materials where multiple PDFs can be listed.
Each uploaded PDF item should show:
- PDF title
- page count
- visibility toggle
- reorder handle
- preview button
- remove button
4. Project Detail Page
This is the main project page.
Sections:
- Project header with title, poster, summary
- Tabs or segmented sections:
  - Presentations
  - Posters
  - Trailers
  - Access
Presentations section
Show multiple PDF presentations for the same project.
Each PDF should appear as a card with:
- title
- number of pages
- last updated
- button: Open Viewer
When a PDF is opened, it should open a scrollable web-style viewer that simulates PDF pages as vertically stacked slides/pages.
Important:
This viewer should feel like the PDF is being viewed inside the website, not downloaded.
Each page can be shown as a styled mock preview block.
Posters section
Show poster images in a protected-looking viewer area.
Trailers section
Show a video player area for trailers.
Access section
Show a table or list of viewers who currently have access.
Fields:
- viewer email
- assigned projects
- access start date
- expiry date
- status
- actions (Extend / Revoke)
5. Invite / Access Management Screen
This is one of the most important parts.
Jake should be able to grant access to viewers by email.
Create a glossy modal or page with:
- Viewer email input
- Select project(s)
- Select access duration:
  - 1 day
  - 3 days
  - 7 days
  - custom number of days
- Optional message field
- Button: Send Access
Below that, show a list of invited viewers.
Each viewer row should have:
- email
- project access
- expiry
- status
- buttons: Extend, Revoke, Copy Link
Important interaction:
Jake controls access duration. After expiry, access should be considered expired.
6. Viewer Portal Screen
Create a separate screen to simulate what an invited viewer sees after logging in.
This view should be very simple and restricted.
The viewer should only see:
- projects shared with them
- project content that Jake allowed
- no admin controls
Show:
- project cards
- “Access expires in X days”
- click into project
- view PDF presentations in a scrollable viewer
- view posters
- watch trailer
Do not show download buttons.
7. Protected Viewing Concept
Make the UI clearly reflect that this is a protected portal.
Include small UX touches such as:
- badge: View Only
- badge: Protected Access
- text such as: “Access controlled by Orwo Family”
- “Access expires in 2 days”
- “This content is view-only”
- optional watermark overlay on presentation pages using viewer email
This is just UI simulation, but it should communicate that files are not being freely shared.
8. Navigation
Use a clean sidebar or top navigation.
Suggested nav:
- Dashboard
- Projects
- Access
- Viewers
- Settings
Top bar can include:
- search
- Jake’s profile
- notifications icon
9. What to avoid
- Do not build a complicated backend
- Do not implement real authentication logic
- Do not implement real file storage
- Do not make it look corporate or boring
- Do not use dark heavy enterprise styling
- Do not show obvious download actions
10. Deliverable requirements
I want a high-fidelity clickable prototype or polished frontend mockup.
Use:
- modern responsive layout
- reusable components
- mock data
- smooth transitions
- polished Apple-like glossy UI
If coding:
Use a modern frontend stack such as Next.js / React + Tailwind CSS.
Create:
- login page
- admin dashboard
- project detail page
- invite access modal/page
- viewer portal page
- scrollable PDF viewer mockup
The final prototype should feel like a premium private film-project portal for ORWO, focused on controlled viewing access.