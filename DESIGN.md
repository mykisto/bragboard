---
name: Bragboard
description: A warm, personal masonry board of achievement cards for one.
colors:
  accent: "#e86a26"
  neutral: "#877F7A"
---

# Design System: Bragboard

Bragboard runs on the **Astryx Pumpkin** theme: Matcha's shape wearing Hearth's
identity. From Matcha come radius, spacing, control sizing, motion, and
elevation; from Hearth come every color token and the Bona Nova + Geist
typography. The values below are lifted from the compiled theme
(`astryx theme build themes/pumpkin.ts`) into Bragboard's own semantic token
names in `src/theme.css`, so this is a standalone Vite app that consumes Astryx
*token values*, not the Astryx React components. `theme.css` is the source of
truth; if it and this file disagree, `theme.css` wins.

## 1. Overview

**Creative North Star: "The Kept Record"**

Bragboard reads like a kept, personal record - closer to a journal you'd keep on a warm desk than a tool you'd open at work. The palette stays quiet and light by default; a single terracotta accent (`#e86a26`) is spent sparingly, reserved for the moments that actually mattered (the life-changing tag) and primary actions, rather than spread across the interface as decoration. Nothing here should read as a dashboard: no gray-on-color utility chrome, no dense data tables, no metric widgets. Light and dark are one warm pair, so dark mode reads as "the same room at night," not a separate, colder product.

This explicitly rejects: Workable's corporate dashboard sterility (reviewed and rejected directly against this project), Pinterest's utilitarian equal-width grid, and any dark mode that's a flat "invert to black."

**Key Characteristics:**
- Warm cream base (`#fff6f0`), never sterile white
- One accent color, spent rarely and deliberately (life-changing tag, primary actions)
- Soft warm-tinted shadows, big page-radius cards, pill controls, no hard edges
- Serif for the words that matter (achievement text), sans for the interface around them

## 2. Colors

Pumpkin's flat color tokens (Hearth identity) sit on top of a Radix-generated
terracotta interactive ramp, so every component still has rest/hover/active
steps. Each color is a light / dark pair (compiled from a `light-dark()` tuple);
one theme, two modes.

### Accent - terracotta
- **`--accent-9` `#e86a26`** (light) / `#ec7a37` (dark): Pumpkin's brand accent. Primary buttons (Add), the logo, the life-changing fill, the pressed toggle. Spent on <=10% of any view.
- **`--accent-11` `#c85410`** (light) / `#ff9e68` (dark): text-accent - kept deeper than the fill so accent-colored text/links stay AA.
- **`--accent-contrast` `#fff`**: on-accent text for solid fills.
- The full `--accent-1..12` ramp gives the interactive steps: 3-5 component bg (rest/hover/active), 6-8 borders, 9-10 solid fills, 11-12 text.

### Gray - warm gray-brown
- **`--gray-1..12`**: warm gray-brown ramp (source `#877F7A`), never a cool neutral. Text uses `--gray-12` `#241f1c` (primary) and `--gray-11` `#68615d` (secondary + placeholder - gray-11, not gray-10, so prompt and placeholder clear 4.5:1).

### Semantic surfaces
| token | light | dark | role |
|---|---|---|---|
| `--bg-board` | `#fff6f0` | `#15100d` | the room itself |
| `--bg-card` | `#fefdfc` | `#211b17` | card surface |
| `--bg-composer` | `#ffffff` | `#242221` | composer / popover |
| `--bg-chrome` | `#fff6f0d9` | `#15100dd9` | header wash |
| `--border-ui` | `#efe9e3` | `#3d3937` | default border |
| `--border-ui-strong` | `#e2dbd4` | `#4c4744` | emphasized border |

### Life-changing fill
- **`--life-bg` `#e86a26` + `--life-text` `#fff` bold**, identical in light and dark. White on `#e86a26` is ~3.4:1, a deliberate look-over-AA choice carried from Pumpkin/Hearth. To hold the AA-large 3:1 bar, life-changing text is always forced **bold + a 19px floor** (`--card-text-m`), so the smallest preset still clears it. (This supersedes the older `#c04e00` life-changing fill from the Radix era - Pumpkin uses the accent itself, paid for with bold + the size floor.)

### Utility - danger (outside the Pumpkin scales)
- **`--danger` `#b3261e`** (light) / `#ff8a80` (dark): the quiet destructive action (Delete in the composer). Mirrors Pumpkin's `--color-error`.
- **Error toast** `--toast-error-bg` `#6e2a1c` / `--toast-error-text` `#ffe9e2`: Bragboard's own warm-toned danger surface (Pumpkin ships no toast token, and terracotta cannot double as danger - here accent means celebration).

### Named Rules
**The Rare Accent Rule.** Terracotta appears only on the life-changing tag and primary actions. If more than one card per screen is solid terracotta, the tag has lost its meaning.
**The Warm-Twin Rule.** Dark mode is not an inversion. Every dark-mode color comes from the same Pumpkin source as light, so shadows, the life-changing fill, and the card surface all stay warm - re-check these three specifically whenever dark drifts toward looking techy.

## 3. Typography

**Display / Body Font:** Bona Nova (serif, Cyrillic) - `--font-serif`
**UI Font:** Geist (sans, Cyrillic) - `--font-sans`

**Character:** Bona Nova carries the achievement text itself - the words the owner actually wrote - like handwriting made typographic. Geist stays out of the way for every button, label, and menu so the interface never competes with the content.

Pumpkin's type scale is base 16 / ratio 1.2 at the DS level. The **achievement-text presets** are a fixed, user-chosen set: `--card-text-s/m/l/xl` = 16 / 19 / 24 / 30px. UI-chrome font sizes are currently a hand-tuned set (13-17px) rather than scale tokens; that gap is known and deliberately left until it can be remapped without disturbing the AA-pinned sizes (the 19px-bold white-on-accent in Add and life-changing).

### Hierarchy
- **Display** (Bona Nova, `clamp` for the empty-state headline): the one or two moments the app speaks to the owner directly.
- **Body / Achievement text** (Bona Nova, `--card-text-*` preset per card): the recorded accomplishments - the reason the app exists. Size chosen manually, never auto-fit.
- **UI Label** (Geist, 13-17px): buttons, dropdown, toggle labels, menu items; the header wordmark is Bona Nova.

### Named Rules
**The Human-Chosen Size Rule.** Achievement text size is a preset the owner picks per card, never algorithmically fit - curation over automation.

## 4. Shape, spacing & sizing (Matcha)

### Radii
| token | value | use |
|---|---|---|
| `--radius-inner` | 6px | innermost details |
| `--radius-element` / `--radius-control` | 12px | small controls |
| `--radius-container` | 18px | composer, menu, toast |
| `--radius-page` / `--radius-card` | 42px | Matcha's signature big-radius card |
| `--radius-pill` | 999px | every button, select, toggle |

### Spacing - `--space-1..7`
Matcha's compact 6px scale: 6 / 12 / 18 / 24 / 30 / 36 / 42px. All padding, gaps, and layout offsets use these, not raw px.

### Control sizing - `--size-element-*` + `--control-h`
Astryx's element-height scale: **`--size-element-sm` 36 / `--size-element-md` 40 / `--size-element-lg` 44**. `--control-h` is the one height every button, select, and toggle reaches for - it resolves to `md` (40px) and bumps to `lg` (44px) under `@media (pointer: coarse)` so touch gets a 44px hit target without breaking row alignment. Because every control in a row reads the same `--control-h`, a control row (e.g. the composer footer) is uniform by construction, not by matching padding.

### Named Rule
**The One-Control-Height Rule.** Never size a control by stacking padding + font + border. Set `height: var(--control-h)` and let horizontal padding do the rest. One token moves the whole row together.

## 5. Elevation & motion (Matcha)

Soft and shallow, not layered or dramatic. Shadows carry a warm terracotta-brown tint (`#3a1c08`) in light, falling back to neutral black in dark so elevation stays visible on the warm near-black surfaces.

### Shadow vocabulary
- **`--shadow-rest`**: barely-there ambient shadow - presence without weight (card at rest).
- **`--shadow-lift`**: one step up + slight upward transform on hover (whole card; desktop only) - the affordance that the card is clickable and draggable.
- **`--shadow-drag`**: the lifted, tilted card while dragging to reorder.
- **`--shadow-composer`**: the floating composer / menu.

### Motion
- **Easing:** `--ease-out` = ease-out quart `cubic-bezier(0.25, 1, 0.5, 1)`; `--ease-out-expo` for entrances.
- **Durations:** `--dur-fast` 125ms (color/hover on controls), `--dur-base` 200ms (card shadow/transform, theme swap), `--dur-repack` 300ms (masonry reflow).
- **Reduced motion:** ships a `prefers-reduced-motion` alternative.

### Named Rule
**The No-Snap Rule.** Every shadow, color, and transform change animates. No instant state changes anywhere in the UI.

## 6. Components

### Iconography
All UI icons come from **Phosphor** (`@phosphor-icons/react`), regular weight - rounded and warm, matching the mymind/Pi mood better than a neutral geometric set. Tree-shake to only what's used: image-attach, layout-switch (stack / split), theme toggle, overflow, delete, caret. Never generate bespoke SVG icons.

### Buttons / Toggles
- **Height:** `--control-h` for every one - the composer footer and header icon buttons all sit at 40px (44 on touch).
- **Shape:** `--radius-pill`.
- **Primary (life-changing toggle on, Add):** solid `--accent-9`, white text.
- **Hover / Active:** step up the accent/gray ramp (hover = one step, active = one more); icon buttons use the translucent `--control-hover` / `--control-active` wash so the warm surface shows through. Focus-visible keeps a visible ring, never removed.
- **Disabled:** reduced opacity + `cursor: not-allowed`, visually inert.

### Cards
- **Corner:** `--radius-card` (42px).
- **Background:** `--bg-card` by default; `--life-bg` when tagged life-changing.
- **Shadow:** `--shadow-rest` at rest, `--shadow-lift` on hover (desktop).
- **Height:** auto by content, bounded (min 0.3x / max 1.5x card width).
- **Interaction:** click anywhere opens the editor; drag reorders (8px threshold). No separate edit icon.

### Composer (signature component)
The bottom-center floating pill (Bento/Portrait/Pi-inspired) that expands into a font-size select, layout switcher (only when an image is attached), life-changing toggle, image attach, and Add - the single place all card editing happens. Every footer control is one `--control-h` tall so the row lines up. No modal, no Cancel; clicking outside collapses it back to a pill with the draft preserved. New cards commit with Add; editing writes live on every change, so the edit state has Delete but no Save.

### Navigation
Minimal header only: logo + wordmark left, theme toggle + overflow menu (export/import) right. No side nav, no tabs - the composer and the board are the whole product.

## 7. Do's and Don'ts

### Do:
- **Do** keep terracotta rare - life-changing tag and primary actions only.
- **Do** keep light and dark as one warm Pumpkin pair - never a flat inversion.
- **Do** use the accent/gray ramp steps (3-5 interactive, 6-8 border, 9-10 solid, 11-12 text) for every state instead of inventing colors.
- **Do** size every control with `--control-h`; never stack padding to fake a height.
- **Do** animate every state change with the Matcha durations/easing.
- **Do** pull every icon from Phosphor (regular weight), tree-shaken.

### Don't:
- **Don't** build anything that reads like Workable - corporate dashboard sterility, explicitly rejected.
- **Don't** default to Pinterest's equal-width-grid feel - height variance and the life-changing accent are what keep this personal.
- **Don't** let dark drift cold/techy - re-check card shadows and the life-changing fill specifically.
- **Don't** auto-fit or auto-shrink font size - the owner picks it per card.
- **Don't** introduce raw px/rem where a token exists (spacing, radius, control height, color, motion).
- **Don't** hand-draw bespoke SVG icons - use the Phosphor set.
