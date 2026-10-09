import type { AccessGrant, Project } from "./types";
import { daysFromNow } from "./utils";

export const ADMIN = {
  email: "jake@orwo.family",
  name: "Jake Orwo",
};

/** Default viewer used for the "Viewer demo" sign-in shortcut. */
export const DEMO_VIEWER_EMAIL = "sarah.chen@northlightfilms.com";

export function createMockProjects(): Project[] {
  return [
    {
      id: "echo-line",
      title: "Echo Line",
      description: "A sound engineer discovers a voice in a decades-old broadcast — one that knows her name.",
      summary:
        "Restoring a forgotten 1974 radio archive, sound engineer Mara Voss hears a woman's voice calling her by name. As the recordings begin to predict her own life, Mara must decide whether to follow the signal back to its source — or let it go silent forever. A slow-burn psychological thriller about memory, grief and the things we choose to hear.",
      genre: "Psychological Thriller",
      year: 2026,
      status: "Active",
      palette: { from: "#0b2a3a", via: "#126b7a", to: "#8fe3e0", glow: "#4fd1c5" },
      pdfs: [
        { id: "el-1", title: "Pitch Deck", pages: 24, format: "deck", updatedAt: daysFromNow(-2), visible: true },
        { id: "el-2", title: "Visual Lookbook", pages: 18, format: "deck", updatedAt: daysFromNow(-6), visible: true },
        { id: "el-3", title: "Screenplay — Draft 3", pages: 112, format: "document", updatedAt: daysFromNow(-12), visible: true },
        { id: "el-4", title: "Budget Summary", pages: 8, format: "document", updatedAt: daysFromNow(-20), visible: false },
      ],
      posters: [
        { id: "el-p1", title: "Teaser One-Sheet", variant: 0 },
        { id: "el-p2", title: "Character Poster — Mara", variant: 1 },
        { id: "el-p3", title: "Festival Key Art", variant: 2 },
      ],
      trailers: [
        { id: "el-t1", title: "Official Teaser", duration: 94 },
        { id: "el-t2", title: "Mood Reel", duration: 152 },
      ],
      updatedAt: daysFromNow(-2),
    },
    {
      id: "the-last-horizon",
      title: "The Last Horizon",
      description: "The final crew of a failing orbital station must decide who gets to return to Earth.",
      summary:
        "Aboard Meridian, the last inhabited station in low orbit, seven crew members receive word that a single return capsule will be launched. With ninety hours of oxygen and no instructions from the ground, loyalty fractures into something older and more dangerous. An intimate, sun-drenched sci-fi drama about sacrifice.",
      genre: "Sci-Fi Drama",
      year: 2027,
      status: "Active",
      palette: { from: "#2a0f2e", via: "#c2410c", to: "#fdba74", glow: "#fb923c" },
      pdfs: [
        { id: "lh-1", title: "Pitch Deck", pages: 32, format: "deck", updatedAt: daysFromNow(-1), visible: true },
        { id: "lh-2", title: "Series Bible", pages: 46, format: "document", updatedAt: daysFromNow(-9), visible: true },
        { id: "lh-3", title: "VFX Breakdown", pages: 14, format: "deck", updatedAt: daysFromNow(-15), visible: true },
      ],
      posters: [
        { id: "lh-p1", title: "Theatrical One-Sheet", variant: 2 },
        { id: "lh-p2", title: "Station Teaser", variant: 0 },
      ],
      trailers: [{ id: "lh-t1", title: "Announcement Trailer", duration: 131 }],
      updatedAt: daysFromNow(-1),
    },
    {
      id: "glass-river",
      title: "Glass River",
      description: "Two estranged sisters drift a frozen river to scatter their mother's ashes.",
      summary:
        "When their mother dies, Ines and Leah — who haven't spoken in nine years — honour her final wish: a winter canoe journey down the river where they grew up. A tender, luminous coming-of-age story for adults about the currents that pull families apart, and back together.",
      genre: "Drama",
      year: 2027,
      status: "Draft",
      palette: { from: "#1e3a5f", via: "#6aa6d6", to: "#e0f2fe", glow: "#7dd3fc" },
      pdfs: [
        { id: "gr-1", title: "Treatment", pages: 12, format: "document", updatedAt: daysFromNow(-4), visible: true },
        { id: "gr-2", title: "Mood Board", pages: 20, format: "deck", updatedAt: daysFromNow(-4), visible: true },
      ],
      posters: [{ id: "gr-p1", title: "Concept Poster", variant: 1 }],
      trailers: [],
      updatedAt: daysFromNow(-4),
    },
    {
      id: "midnight-archive",
      title: "Midnight Archive",
      description: "A night archivist uncovers a film reel that was never meant to be developed.",
      summary:
        "In the basement vaults of a shuttered film lab, night archivist Theo Lane finds an unlabelled reel dated the night of a decades-old disappearance. Each frame he restores rewrites what the city thinks it knows. A neon-soaked mystery about the stories cinema keeps, and the ones it buries.",
      genre: "Neo-Noir Mystery",
      year: 2025,
      status: "Archived",
      palette: { from: "#0f0c29", via: "#5b21b6", to: "#f472b6", glow: "#e879f9" },
      pdfs: [
        { id: "ma-1", title: "Pitch Deck", pages: 28, format: "deck", updatedAt: daysFromNow(-60), visible: true },
        { id: "ma-2", title: "Archive Research Notes", pages: 36, format: "document", updatedAt: daysFromNow(-75), visible: true },
        { id: "ma-3", title: "Festival Strategy", pages: 10, format: "deck", updatedAt: daysFromNow(-90), visible: false },
      ],
      posters: [
        { id: "ma-p1", title: "Noir One-Sheet", variant: 0 },
        { id: "ma-p2", title: "Reel Teaser", variant: 2 },
      ],
      trailers: [{ id: "ma-t1", title: "Festival Trailer", duration: 118 }],
      updatedAt: daysFromNow(-60),
    },
  ];
}

export function createMockGrants(): AccessGrant[] {
  return [
    {
      id: "g1",
      email: DEMO_VIEWER_EMAIL,
      name: "Sarah Chen",
      projectIds: ["echo-line", "the-last-horizon"],
      startDate: daysFromNow(-3),
      expiryDate: daysFromNow(2),
      revoked: false,
      message: "Sarah — here's the latest deck and the teaser. Would love your notes before Friday.",
      token: "nl7x2c",
    },
    {
      id: "g2",
      email: "marcus.reid@atlasdistribution.com",
      name: "Marcus Reid",
      projectIds: ["the-last-horizon"],
      startDate: daysFromNow(-1),
      expiryDate: daysFromNow(6),
      revoked: false,
      token: "ad93kq",
    },
    {
      id: "g3",
      email: "priya.nair@lumenstudios.com",
      name: "Priya Nair",
      projectIds: ["echo-line", "glass-river"],
      startDate: daysFromNow(0),
      expiryDate: daysFromNow(14),
      revoked: false,
      token: "lm4p0z",
    },
    {
      id: "g4",
      email: "elena.voss@festivalcircuit.org",
      name: "Elena Voss",
      projectIds: ["echo-line", "midnight-archive"],
      startDate: daysFromNow(-10),
      expiryDate: daysFromNow(-3),
      revoked: false,
      token: "fc2m8r",
    },
    {
      id: "g5",
      email: "james.whitaker@meridianpictures.com",
      name: "James Whitaker",
      projectIds: ["echo-line"],
      startDate: daysFromNow(-5),
      expiryDate: daysFromNow(2),
      revoked: true,
      token: "mp6t1w",
    },
  ];
}

/** Palettes offered when creating a new project (stand-in for real poster colour extraction). */
export const PALETTE_PRESETS = [
  { from: "#111827", via: "#4b5563", to: "#e5e7eb", glow: "#cbd5e1" },
  { from: "#052e16", via: "#15803d", to: "#bbf7d0", glow: "#4ade80" },
  { from: "#3b0764", via: "#9333ea", to: "#f5d0fe", glow: "#c084fc" },
  { from: "#450a0a", via: "#b91c1c", to: "#fecaca", glow: "#f87171" },
];
