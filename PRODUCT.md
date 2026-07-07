# Product

## Register

product

## Users

Mykyta - a Senior Product Designer, and the only user. He opens the board on days he needs proof he's capable, to counter an inner "I'm not capable" voice with recorded evidence of real accomplishments. No onboarding, no discovery, no multi-user flows - the requirements are already fully known (see project CLAUDE.md).

## Product Purpose

A full-screen masonry board of achievement cards, seeded from a hand-written therapy-homework list of accomplishments. Success = a working personal artifact that feels good to open on a bad day - not a productivity or tracking tool. Secondary purpose: rehearsing the Claude Design -> Claude Code pipeline before the larger portfolio project (Flows); if the result is strong enough, it doubles as a small portfolio case.

## Brand Personality

Warm, personal, quietly encouraging - a journal / personal artifact, never corporate, never gamified (no confetti, no "Great job!!!" exclamations, no streaks).

## Anti-references

Workable (reviewed directly during Mobbin research and rejected - reads as corporate dashboard sterility). Pinterest's utilitarian equal-width grid look. Notion-style dashboard sterility. A dark mode that's just "invert to black" - dark must stay warm, generated from the same accent/gray as light, not a generic cold theme.

Positive references (the feel to reach for): mymind (personal-artifact masonry), Cosmos (grid density/spacing), Pi (warm cream + serif + bottom input pill), komoot web (warm surfaces, rounded controls), Bento/Portrait (bottom composer pattern).

## Design Principles

- Curation over automation - layout, font size, and tags are chosen by the human per card, not auto-fit or auto-generated; matches a personal-artifact ethos over a dashboard-tool feel.
- Order is the only hierarchy control - list position (drag reorder), not free X/Y placement, is the single source of visual importance. Chosen deliberately over Bento-style free positioning to fit a 1-2 day build.
- One tag, not a taxonomy - "life-changing" is a single special marker, not a category system, matching how the owner actually used his handwritten list.
- Ship V1 before touching V1.5/V2 - non-negotiable project discipline against scope creep.

## Accessibility & Inclusion

Baseline target: WCAG 2.1 AA (contrast, focus-visible states, keyboard nav for composer/menu) as good practice for portfolio quality, even though the actual audience is one person. Not formally audited - this is an inferred default, flag if a different bar is wanted.

Contrast risk points to check specifically: card text on the solid life-changing accent fill, and the warm tinted neutrals in dark. Every interactive element needs full default/hover/active/focus-visible/disabled states keyed to Radix Colors' semantic steps, not ad hoc colors. Restrained baseline motion (hover-lift, grid repack, card entrance) must ship a `prefers-reduced-motion` alternative.
