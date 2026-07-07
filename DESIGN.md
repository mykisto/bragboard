---
name: Bragboard
description: A warm, personal masonry board of achievement cards for one.
colors:
  accent: "#EA722A"
  neutral: "#877F7A"
---

# Design System: Bragboard

## 1. Overview

**Creative North Star: "The Kept Record"**

Bragboard reads like a kept, personal record - closer to a journal you'd keep on a warm desk than a tool you'd open at work. The palette stays quiet and light by default; a single terracotta accent (`#EA722A`) is spent sparingly, reserved for the moments that actually mattered (the life-changing tag), rather than spread across the interface as decoration. Nothing here should read as a dashboard: no gray-on-color utility chrome, no dense data tables, no metric widgets. Both the light theme and its dark counterpart are generated from the same two source colors, so dark mode reads as "the same room at night," not a separate, colder product.

This explicitly rejects: Workable's corporate dashboard sterility (reviewed and rejected directly against this project), Pinterest's utilitarian equal-width grid, and any dark mode that's a flat "invert to black."

**Key Characteristics:**
- Warm cream/off-white base, never sterile white
- One accent color, spent rarely and deliberately (life-changing tag, primary actions)
- Soft shadows, generous corner radius, no hard edges
- Serif for the words that matter (achievement text), sans for the interface around them

## 2. Colors

Custom Radix Colors palette (light + dark generated as a matched pair from the same two source colors - see [radix-ui.com/colors/custom](https://www.radix-ui.com/colors/custom?accent-dark=EA722A&accent-light=EA722A&gray-light=877F7A&gray-dark=877F7A)).

### Primary
- **Terracotta** (`#EA722A`, resolves to Radix's `orange` scale): the life-changing tag's solid fill, primary buttons, the theme toggle's active state. Spent on <=10% of any given view - its rarity is what makes the life-changing tag feel special.

### Neutral
- **Warm Gray-Brown** (`#877F7A`): text, borders, card backgrounds, the cream/off-white base. Deliberately warm-toned, not a cool/neutral gray - this is what keeps the whole board feeling like paper rather than plastic.

### Utility additions (outside the two Radix scales)
- **Danger** (`#b3261e` light / `#ff8a80` dark): the quiet destructive action (Delete in the composer) and error toasts (`#6e2a1c` bg / `#ffe9e2` text). Deliberate addition: the custom palette has no red, and terracotta cannot double as danger - here the accent means celebration. Kept warm-toned.
- **Accent contrast** (`#fff`): Radix's official contrast color for solid accent fills.

### Named Rules
**The Rare Accent Rule.** Terracotta appears only on the life-changing tag and primary actions. If more than one card per screen is solid terracotta, the tag has lost its meaning.
**The Warm-Twin Rule.** Dark mode is not an inversion. Every dark-mode color is generated from the same accent/gray source as light mode, so shadows, the life-changing fill, and the card surface all stay warm - re-check these three specifically whenever dark mode drifts toward looking techy.

## 3. Typography

**Display/Body Font:** Bona Nova (serif, Cyrillic support)
**UI Font:** Geist (sans, Cyrillic support)

**Character:** Bona Nova carries the achievement text itself - the words the owner actually wrote - like handwriting made typographic. Geist stays out of the way for every button, label, and menu so the interface never competes with the content.

### Hierarchy
- **Display** (Bona Nova, large sizes for the empty-state headline): the one or two moments the app speaks to the owner directly.
- **Body / Achievement text** (Bona Nova, a few user-chosen preset sizes per card): the actual recorded accomplishments - the reason the app exists. Size is chosen manually per card, never auto-fit.
- **UI Label** (Geist, small-medium): buttons, dropdown, toggle labels, menu items, header wordmark.

### Named Rules
**The Human-Chosen Size Rule.** Achievement text size is a preset the owner picks per card, never algorithmically fit - curation over automation.

## 4. Elevation

Soft and shallow, not layered or dramatic. Cards rest with a very light ambient shadow at all times; hover adds a subtle lift (shadow increases, 150-200ms ease-out) to signal interactivity, and that's the full vocabulary - no deep drop shadows, no glow.

### Shadow Vocabulary
- **Card rest**: a barely-there ambient shadow - presence without weight.
- **Card hover/lift**: shadow grows one step + slight upward transform, on the whole card (desktop only) - pairs with revealing the edit icon.

### Named Rules
**The No-Snap Rule.** Every shadow, color, and transform change animates 150-200ms ease-out. No instant state changes anywhere in the UI.

## 5. Components

### Iconography
All UI icons come from **Phosphor** (`@phosphor-icons/react`), regular weight - rounded and warm, matching the mymind/Pi mood better than a neutral geometric set. Tree-shake to only what's used: edit, image-attach, layout-switch (stack / split), theme toggle, overflow, delete. Never generate bespoke SVG icons for these.

### Buttons / Toggles
- **Shape:** generous corner radius, matching the cards
- **Primary (life-changing toggle, Add/Save):** fills solid terracotta when active/pressed
- **Hover / Focus:** use Radix's own interactive step system - steps 3-5 for component background rest/hover/active, 6-8 for borders, 9-10 for solid fills, 11-12 for text. Hover = one step up, active = one more. Focus-visible gets a visible ring, never removed.
- **Disabled:** reduced opacity + `cursor: not-allowed`, visually inert

### Cards
- **Corner Style:** generous radius (mymind/Cosmos-inspired, not sharp)
- **Background:** warm off-white by default; solid terracotta fill when tagged life-changing
- **Shadow Strategy:** see Elevation - ambient at rest, lift on hover
- **Height:** auto by content, bounded (min 0.3x card width, max 1.5x card width)
- **Hover (desktop only):** lift + reveal edit icon

### Composer (signature component)
The bottom-center floating input pill (Bento/Portrait/Pi-inspired) that expands on focus into a font-size dropdown, layout switcher, life-changing toggle, and image attach - the single place all card editing happens. No modal, no Cancel button; clicking outside collapses it back to a pill, draft preserved.

### Navigation
Minimal header only: logo + wordmark left, theme toggle + overflow menu (export/import) right. No side nav, no tabs - the composer and the board are the whole product.

## 6. Do's and Don'ts

### Do:
- **Do** keep terracotta rare - life-changing tag and primary actions only.
- **Do** generate dark mode from the same accent/gray source colors as light - never a flat inversion.
- **Do** use Radix's semantic steps (3-5 interactive, 6-8 border, 9-10 solid, 11-12 text) for every state instead of inventing new colors.
- **Do** animate every state change 150-200ms ease-out.
- **Do** pull every icon from Phosphor (regular weight); keep the set small and tree-shaken.

### Don't:
- **Don't** build anything that reads like Workable - corporate dashboard sterility, explicitly rejected for this project.
- **Don't** default to Pinterest's utilitarian equal-width-grid feel - height variance and the life-changing accent are what keep this personal.
- **Don't** let dark mode drift cold/techy - re-check card shadows and the life-changing fill specifically.
- **Don't** auto-fit or auto-shrink font size - the owner picks it per card.
- **Don't** hand-draw bespoke SVG icons - use the Phosphor set.
