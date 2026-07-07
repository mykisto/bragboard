# Shape brief: Masonry board (V1, whole surface)

Confirmed 2026-07-06 via /impeccable shape. Hand this to /impeccable craft or any implementation pass.
Anchors: PRODUCT.md (strategy), DESIGN.md (visual system), design-brief.md (detailed UX decisions).
This file adds what shape resolved on top of those; where they overlap, design-brief.md wins on UX detail.

## 1. Feature summary

Single full-screen achievement board: grid + cards + composer + header + empty state, light/dark.
Audience of one, opened on a bad day. Production-ready - this IS V1.

## 2. Primary user action

Reading. The board optimizes for "opened it - felt different in a minute", not for input.
Input (composer) is the second action, deliberately quiet at the bottom.

## 3. Design direction

Restrained + the Rare Accent Rule (terracotta only on life-changing cards and primary actions).
Scene: at home, evening or a low moment, soft ambient light, needing quiet reassurance - warm
cream light theme by default; dark = "the same room at night" (Warm-Twin Rule).
Anchors: mymind (board texture), Pi (composer pill + serif), Cosmos (density).

## 4. Scope

Production-ready; whole surface; shipped-quality interactivity (full states, real dnd, real
localStorage); polish to deploy within the 1-2 day window.

## 5. Layout strategy (resolved in shape discovery)

- **Row-wise masonry**: each card goes to the shortest column - reads left-to-right,
  top-to-bottom; top row = most important; a new card appears visually at the top.
  Rules out CSS columns; layout is JS-driven.
- Columns 5 -> 4 -> 3 -> 2 -> 1; uniform card width per breakpoint; height auto, bounded
  0.3x-1.5x card width.
- Density calibrated for **~10-30 cards**: the board should feel full at ~15 (generous gaps
  and radii, not emptiness compensation).
- Texture is **text-dominant** (~10-25% of cards carry an image): serif carries the board,
  images are a rare accent. base64 limit low-risk, but compress on upload anyway.
- Grid gets bottom padding so the composer never covers the last row.

## 6. Key states

Empty (first run) / populated / card hover (desktop: lift + edit icon) / drag (lifted +
**live repack during the drag**, not only on drop) / composer: collapsed, expanded,
edit-prefilled, collapsed-with-draft (pill hints at unsaved text) / image-attached (layout
switcher appears) / life-changing card / light / dark.
Edge: storage-limit warning near the ~5MB localStorage cap; JSON import error (invalid file).
No loading states - localStorage is synchronous, the board renders instantly.

## 7. Interaction model

As in design-brief.md (hover-edit, drag with movement threshold, tap / long-press on mobile,
click-outside collapse, draft preserved). Added in shape: repack animates via transforms
(FLIP), never layout properties; 150-200ms ease-out; reduced-motion -> crossfade.

## 8. Content requirements

Microcopy needed (EN): composer pill placeholder, empty state (headline + one line + CTA in
the "start your record" spirit), delete action, export/import menu items, storage warning,
import error. Mockup card content: the Ukrainian placeholders in design-brief.md.

## 9. Tech stack (fixed)

- **Vite + React** (no Next.js - no backend, no routes, nothing for SSR/SSG to do)
- **@radix-ui/colors** custom palette as CSS variables; theme via data-attribute on root
- **dnd-kit** for reorder
- **Hand-rolled shortest-column masonry** (~50 lines) + **hand-rolled FLIP** for repack;
  fallback if FLIP stalls: `motion` (the one justified escape hatch - also the library
  presentation mode would want in V1.5). **No GSAP, no masonry/grid libraries** (Bento-style
  boards solve free positioning + resize - features explicitly cut; re-confirmed 2026-07-06)
- **Phosphor icons** (regular weight, tree-shaken)
- Canvas image compression on upload (~1200px long side, ~0.8 quality)
- localStorage + JSON export/import; no state-management libraries

## 10. References for implementation

impeccable refs: layout.md (grid rhythm), animate.md (repack/entrance), onboard.md (empty state).
Visual references: pull from Mobbin via the Mobbin MCP (see CLAUDE.md, References workflow).
