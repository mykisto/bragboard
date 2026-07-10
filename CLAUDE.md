# Bragboard — Project Context

## Name & rationale

The project is called **Bragboard**. Reasoning behind the choice:
- "Brag document" is an established industry concept (a running record of professional wins kept for performance reviews). The name instantly communicates the idea to anyone in tech/design and gives the portfolio case a ready naming story: "took a known concept and gave it an emotional, visual form."
- Existing brag-doc tools (bragdocs.com, getbragdoc.com, LogYourWork) are text-first logs for performance reviews. Bragboard differentiates as a **visual, emotional artifact** — a board you open on a bad day, not a log you scrape before a review. Keep this differentiation in mind for any design/copy decision.
- Known minor collision: "BragBoard" exists as a Telegram Mini App for digital business cards — different product, different category, acceptable for a portfolio mini-project.
- Alternatives considered and rejected: Proof (namespace fully occupied by large companies in identity, legal tech, and marketing), Tally (tally.so), Ledger (crypto).

Suggested repo name: `bragboard`.

## What this is

A personal web app: a full-screen masonry board of achievement cards. Built by Mykyta for himself, based on a hand-written list of accomplishments (a therapy homework assignment). The emotional function matters more than features: this is a thing you open on a bad day to counter the inner "I'm not capable" voice with recorded evidence.

Dual purpose:
1. **Personal tool** — must be usable and finished fast.
2. **Training project** — practicing the Claude Design → Claude Code workflow before applying it to the main portfolio project (Flows). If the result is good enough to be proud of, it becomes a mini portfolio case (GitHub repo + Vercel live preview).

## Hard constraints

- **Timeline: 1-2 days for V1.** Deadline anchor: showing a working board at the next therapy session.
- **Ship V1 before touching anything from V1.5/V2.** This is non-negotiable project discipline: the owner has a known tendency to expand scope as a way of postponing completion. If a request drifts toward V2 features before V1 is deployed, flag it explicitly and ask whether to proceed.
- No research phase, no user validation — audience of one, requirements already defined below.

## Scope

### V1 (now)
- Single full-screen board: **Achievements**
- Masonry grid, single ordered list model: cards live in one ordered sequence, columns are just the rendering of that list. User reorders cards by drag; the grid repacks automatically. No free positioning, no per-column placement. Order = importance (top = most important). All cards share the same width within a breakpoint - no column-spanning, no per-card resize.
- Responsive columns: 5 max (very wide desktop) down to 1 (mobile), stepping down through intermediate breakpoints (~4/3/2). Exact breakpoints and side-padding behavior to be finalized during implementation.
- Card height: auto by content, bounded - min-height 0.3x card width (so short entries don't render as a razor-thin strip), max-height 1.5x card width.
- Font size: a few preset sizes, chosen manually by the user per card in edit mode - not auto-fit/auto-shrink. If text still overflows max-height at the smallest preset, truncate as a last-resort edge case (not the primary UX).
- New cards are added to the **top** of the list
- Card content: text (required) + one optional image or gif
- Card layout: text-only is implicit (no image = no layout choice). With an image attached, user picks via icon switcher: stack (text above image) or split (text left, image right). All cards are vertical-format friendly for masonry. (The earlier "large/featured" preset was dropped 2026-07-03 - it duplicated the life-changing tag.)
- **Life-changing tag**: one special tag (not a category system). Tagged cards render as solid accent color, standing out against the default light cards.
- **No edit mode**: editing affordances are contextual. Desktop - edit icon button on card hover; mobile - tap reveals edit, long-press lifts card for drag. Whole card always draggable (reorder-only, movement threshold against accidental drags). Delete lives inside the composer when editing.
- **Minimal header**: logo + BragBoard wordmark left; right side - theme toggle, overflow menu with JSON export/import. Bottom of the screen belongs to the composer only.
- Add/edit card via **inline bottom composer**, not a modal: a floating input pill at bottom center (Bento/Portrait pattern, Pi-style input) that expands on focus into a small composer with font-size dropdown (3+ presets), layout icon switcher (visible only when an image is attached), life-changing toggle (fills primary when on), and an image icon button next to Add/Save. No Cancel button - click outside collapses the composer, draft preserved. Editing an existing card reuses the same composer pre-filled.
- Empty state (first-run)
- **Light/dark mode toggle**, powered by Radix Colors (see Design direction + Tech notes). Light is the default theme; dark is an alternate the user switches to, not the startup state. Preference persisted in localStorage.
- Data: **localStorage** + JSON export/import (backup without a backend)
- Deploy: GitHub repo + Vercel live preview

### V1.5 (only after V1 is deployed and populated)
- **Presentation mode**: a Play button starts a slideshow — each card appears full-screen one at a time with pleasant animations. Directly serves the "open on a bad day" function.

### V2 (separate effort, not this week)
- Second board: **Goals / Visualization** (future accomplishments)
- The signature interaction: marking a goal as achieved and dragging it from Goals into Achievements — physically closing the loop
- Auth (Google login) + cross-device sync. Suggested stack when the time comes: Supabase (auth + db in one)

## Design direction

Primary reference: **mymind** (mobbin.com — masonry board, mixed card types, personal-artifact feel). Secondary: **Cosmos** (grid density, spacing). Explicitly NOT: Pinterest's utilitarian look, Notion-style dashboard sterility.

- Warm light base (cream/off-white), not sterile white
- Cards: soft shadows, generous border radius
- Typography: **Bona Nova** (serif, Cyrillic) for achievement text and large display headlines; **Geist** (sans, Cyrillic) for UI chrome. Both on Google Fonts.
- Life-changing cards: solid accent color fill
- Overall mood: personal journal / artifact, not a productivity dashboard

**Color system: Radix Colors**, custom palette generated at [radix-ui.com/colors/custom](https://www.radix-ui.com/colors/custom?accent-dark=EA722A&accent-light=EA722A&gray-light=877F7A&gray-dark=877F7A) - accent `EA722A` (resolves to the orange scale; the same warm terracotta noted in the Etsy reference during Mobbin research), gray `877F7A` (warm gray-brown, not cool/neutral gray). Light and dark scales are generated as a matched pair from the same source colors, so both themes stay on-brand rather than dark mode becoming a generic "invert to black" treatment. Dark mode must still read as warm/personal, not techy/dashboard - re-check shadows, card fill, and the life-changing solid accent specifically in dark, since these are the elements most likely to drift toward a cold look.

A design generated in Claude Design may be provided as input; implement it faithfully, flag deviations.

## Interaction & states

Claude Design/Code defaults to static-looking mockups unless interactivity is spelled out as an explicit requirement, not inferred from a layout description. State it here so every pass is held to it, instead of re-explaining it per prompt.

- Every interactive element needs default / hover / active (pressed) / focus-visible / disabled states, not just default. Applies to: the whole card (hover - subtle lift/shadow increase + reveal edit icon, desktop only), edit icon button, delete button (inside composer's edit state), life-changing toggle, font-size dropdown, layout icon switcher, image-attach icon button, Add/Save button, theme toggle, header overflow menu and its export/import items, the composer pill itself (collapsed to expanded transition), drag affordance on the card.
- Use Radix Colors' own semantic step system for hover/active instead of inventing new colors: steps 3-5 are the interactive-component-background steps (roughly rest/hover/active), 6-8 are borders, 9-10 are solid/accent fills, 11-12 are text. Hover = step up within that component range, active = one more step up. This keeps every state on-contrast and on-brand automatically instead of ad hoc.
- Baseline motion: 150-200ms ease-out transitions on color/shadow/transform changes - no instant snap between states.
- `cursor: pointer` on anything clickable; disabled elements visually distinct (reduced opacity, `cursor: not-allowed`) and non-interactive.
- Treat each Claude Design/Code output as a working prototype meant to be clicked through, not a static visual reference - say so explicitly in the prompt, since it changes how much interactive fidelity gets prioritized.

## Tech notes

- Single responsive web app. React.
- Masonry with reorder: prefer a simple, proven approach (e.g. CSS columns or a light masonry lib + dnd for list reordering). Avoid heavy grid-dashboard libraries (react-grid-layout etc.) — free positioning was explicitly cut from scope.
- Theming: `@radix-ui/colors` custom palette (see Design direction) exposed as CSS custom properties, light and dark sets swapped via a class/data-attribute on the root element. No CSS-in-JS theming library, no extra state management - a single "theme" value in React state (or just the DOM attribute) plus localStorage for persistence is enough.
- Keep it light: no backend, no state management libs beyond React state, no over-engineering. This should stay readable as a portfolio artifact.
- Images stored as base64 in localStorage for V1 is acceptable; warn about size limits (~5MB) and compress/resize images on upload.

## Workflow

This project deliberately exercises the Design → Code pipeline the owner will reuse on the main portfolio project (Flows):
1. **Claude Design**: generate the visual design from this file's Scope + Design direction + Interaction & states sections. Iterate until the owner approves.
2. **Claude Code**: implement the approved design. Stay faithful to it; flag any deviation instead of silently improvising.
3. Deploy to Vercel, repo on GitHub, populate with the owner's real achievement list.

### Design context files (Impeccable)

`PRODUCT.md` and `DESIGN.md` at the project root are written for the [Impeccable](https://github.com/pbakaus/impeccable) skill (installed project-local in `.claude/skills/impeccable`, hook wired in `.claude/settings.local.json`). They're derived from this file and should stay in sync with it - if a decision here changes brand personality, anti-references, colors, typography, or motion, mirror the change there too. `DESIGN.md` is currently pre-implementation (real tokens, no rendered components yet); re-run `/impeccable document` once there's real code to capture actual component markup into the `.impeccable/design.json` sidecar.

Run Impeccable commands in Claude Code at these checkpoints, not just ad hoc:
- **`/impeccable critique`** on the generated design before showing the owner - hierarchy, consistency, usability issues introduced along the way.
- **`/impeccable audit`** before considering V1 done - accessibility (WCAG 2.1 AA), responsive behavior, performance.
- **`/impeccable polish`** as the final pre-ship pass.
- `/impeccable detect` (via the bundled CLI, no LLM needed) can be run any time for a quick deterministic check against the 45 anti-pattern rules (gradients, cards-in-cards, overused fonts, etc.).

## Definition of done (V1)

V1 is done when ALL of the following are true:
- Deployed on Vercel, code on GitHub
- Owner has added his real achievement cards (content lives in the app, not in mockups)
- Cards can be added, edited, deleted, reordered; life-changing tag works; JSON export/import works
- Light and dark themes both implemented and switchable; life-changing accent and card shadows checked in both
- Works on desktop and mobile
- Nothing from V1.5/V2 has been started

## UX copy & tone

- All UI copy in English (portfolio artifact)
- Tone: warm, personal, quietly encouraging - never corporate, never gamified (no confetti, no "Great job!!!" exclamations, no streaks)
- Empty state should invite the first entry gently, e.g. framing around "start your record" rather than productivity language
- Microcopy matters here more than in a typical CRUD app; treat it as part of the emotional design

## References workflow

When design work needs visual references (patterns, screens, flows), pull them from **Mobbin via the Mobbin MCP** (`mcp__mobbin__search_screens` / `search_flows` / `search_sections`) - it's connected and it's where all prior research for this project happened (mymind, Bento, Portrait, Workable review). Don't substitute generic web search for reference lookups.

When you need how a **DS component behaves** (its states, ring/border/shadow structure, token wiring - e.g. matching a card's hover/active to the Pumpkin text-input), read the **readable StyleX source**, not the compiled output. `@astryxdesign/core` ships `src` in its `files`, so the source is on disk at `/Users/mykist/Claude-Projects/Design/ASTRYX-DS/node_modules/@astryxdesign/core/src/**/*.stylex.ts` (e.g. `Field/inputStyles.stylex.ts` holds the shared input wrapper appearance). Never reverse-engineer state values from `dist/` atomic classes or the compiled `.next` CSS - that's the slow, error-prone path (learned 2026-07-09 doing exactly that for the card hover/active restyle). BragBoard mirrors DS token values by hand (see the Astryx decision-log entries), so copy the structure from the source and map its `--color-*` tokens onto BragBoard's `theme.css` equivalents (`--color-border-emphasized` -> `--border-ui-strong`, `--color-accent` -> `--accent-9`, `--color-accent-muted` -> `--accent-muted`).

## Design Context

Strategic and visual context for design work live at the project root - read both before any design/UI task:
- **PRODUCT.md** - register (product), users, purpose, brand personality, anti-references, design principles, accessibility bar.
- **DESIGN.md** - the visual system: Radix palette (terracotta `EA722A` / warm gray `877F7A`), Bona Nova + Geist, named rules (Rare Accent, Warm-Twin, Human-Chosen Size, No-Snap), component character, iconography (Phosphor). Pre-implementation; exact radii/spacing/shadow tokens land after first code via `/impeccable document` rerun.

## Decision log

Keep this updated as decisions are made (owner's standard practice):
- Masonry = single ordered list rendered into responsive columns; user controls order, not position. Chosen over free grid placement (react-grid-layout) to guarantee no gaps and cut the riskiest technical scope. Revisited 2026-07-03 after comparing to Bento's free drag+resize grid - confirmed rejection stands (collision handling / gap-free positioning too risky for the 1-2 day timeline); personalization instead comes from content-driven height, manual font-size choice, and card tags (life-changing / featured / solid background), not from size or position control.
- Max columns raised from 3 to 5 for very wide screens (min stays 1 on mobile) - follows the responsive step-down pattern observed in Mobbin's mobile app collection.
- Card height bounded (min 0.3x / max 1.5x card width) rather than fully free - avoids both razor-thin cards on short entries and runaway-tall cards on long ones.
- Font size is user-chosen per card from a few presets, not auto-fit via JS measurement - keeps implementation simple within the timeline and keeps curation human rather than algorithmic (matches the project's personal-artifact ethos over a dashboard-tool feel). Truncation is only a last-resort fallback for long text at the smallest preset.
- Card customization = fixed layout presets, not free-form editing. Personal feel without building an editor.
- One "life-changing" tag instead of a category system - matches how the owner actually used his hand-written list.
- localStorage + JSON export for V1; auth/sync deferred to V2 (Supabase candidate).
- Light/dark mode toggle added to V1 scope (was not originally planned) - flagged as real added scope, mitigated by using Radix Colors instead of a hand-rolled second palette. Light stays the default/startup theme, matching the "warm light base" primary design direction; dark is a user-triggered alternate, generated as a matched pair from the same custom accent/gray so it doesn't drift into a generic cold "inverted" look.
- Name: Bragboard (see Name & rationale).
- Design brief decisions (2026-07-03, see design-brief.md): card = text + optional image only, no dates or metadata;
- Header reinstated (2026-07-03, supersedes the earlier "no header - floating controls" decision from the same day): thin header with logo + BragBoard wordmark left, and theme toggle + edit mode toggle + overflow (export/import) grouped right. Rationale: composer took over the bottom of the screen, controls needed one home; header also gives the artifact its name/identity. Drag confirmed as reorder-only (change of position in the ordered list), consistent with the original masonry model - no free placement.
- Edit mode removed after iteration 1 (2026-07-03, supersedes "edit mode as explicit toggle"): edit button on card hover replaces the mode entirely; drag always on (whole card, movement threshold); delete moved inside the composer's edit state; mobile - tap for edit, long-press for drag. Composer refined: no Cancel (click outside collapses, draft preserved), font-size dropdown instead of S/M/L pills, layout switcher = icons shown only when an image is attached (text-only is implicit), life-changing = toggle filled with primary when on, image attach = icon button next to Add/Save.
- Modal replaced by inline bottom composer (2026-07-03, after reviewing Bento's editor footer on Mobbin): card creation happens in a bottom-centered floating input that expands with controls (font size, life-changing, image, layout preset); same component serves editing. Functional refs: Bento editor footer, Portrait floating toolbar. Stylistic refs added: Pi (warm cream + serif + bottom input pill), komoot web (warm surfaces, rounded controls). Workable reviewed and rejected - reads as the corporate dashboard sterility this project explicitly avoids. "large/featured" preset dropped in favor of the life-changing tag (solid primary background, white text, applies over any layout preset); fonts fixed - Bona Nova + Geist; empty state = centered text + CTA; motion = restrained baseline (hover-lift, smooth repack, subtle card entrance); mockup card content in Ukrainian (plausible placeholders, not real entries), UI copy stays English.
- Icons come from a library, not hand-drawn (2026-07-06): Phosphor (`@phosphor-icons/react`), regular weight - rounded/warm, fits the mymind/Pi mood better than neutral-geometric Lucide. Tree-shake to only the icons used (edit, image-attach, layout-switch, theme, overflow, delete). Claude does not generate bespoke SVG icons. De-scopes work rather than adding it.
- Customization layers deferred to V1.5/V2 (2026-07-06): owner proposed user-selectable primary color, a typography "style" attribute (3 curated pairings - business / personal / minimal), and a customize panel replacing the theme toggle. Flagged as scope creep against the "ship V1 before V1.5/V2" hard constraint and, more fundamentally, as building a preference engine for an audience of one whose taste is already fixed (terracotta + Bona Nova/Geist = the "personal" pairing). Owner agreed to defer. Parked for later, in rough cost order: (a) typography style presets - most defensible, bounded to 3 pairings, but each needs light+dark + per-font-size + overflow testing; (b) 3-4 precomputed warm accent presets - cheap-ish, still needs per-accent contrast check on the white-on-accent life-changing card; (c) arbitrary primary-color picker - most expensive, needs runtime 12-step scale generation (culori/colorjs or Radix custom algorithm), not a CSS-var swap; (d) the customize panel that houses (a)-(c). V1 stays committed: fixed terracotta + Bona Nova/Geist, simple light/dark toggle.
- Impeccable `/critique` acted on (2026-07-07, score 32/40, detector clean). Changes shipped from that pass:
  - Life-changing fill moved from the accent `#EA722A` to a deeper `#c04e00`. Reason: white-on-`#EA722A` was 3.03:1 (AA-large only, zero headroom) and forced life-changing text to bold + a 19px size floor. `#c04e00` is 4.8:1 with white at any size, so the size floor and forced weight were removed - life-changing cards now honor their chosen preset like any card. The accent `#EA722A` stays the brand color for primary actions/logo; only the solid card fill changed.
  - Placeholder/prompt text token (`--text-placeholder`) raised from gray-10 to gray-11 in both themes - the collapsed-pill prompt and textarea placeholder were ~3.8:1 (light) / ~3.0:1 (dark), under the 4.5:1 AA bar.
  - Keyboard/a11y: the card no longer spreads dnd-kit's `attributes` (which announced a Space/Enter drag that was never wired). It sets its own `role=button` + `aria-keyshortcuts`; Enter/Space now opens the editor, Ctrl/Cmd+Arrow reorders. Fixes the "draggable button that does nothing on Space" dead-end.
  - Interaction change (supersedes "edit icon on card hover", 2026-07-03): the hover edit button is gone. Clicking anywhere on a card opens the editor (drag still reorders, guarded by dnd-kit's 8px threshold + a matching click-distance guard). Mobile tap = edit, long-press = drag, unchanged.
  - Composer edit is now live: editing an existing card writes to it on every change (no Save button in edit state). Only new cards keep an explicit Add. Emptying an edited card's text and closing deletes it. New-card drafts still persist and return after an edit.
  - Composer polish: all composer controls fully rounded (pill); size picker gained a caret; focus ring follows each element's own radius + 3px offset (was a forced 10px that mismatched the 18px card); icon-button hover uses a warm translucent token (`--control-hover/-active`) instead of an opaque cool gray that read cold on the cream header.
- Deferred from the same critique (P2/P3, logged not built, in priority order): (a) actionable error toasts (storage-full) shouldn't auto-dismiss at 5s - keep them until dismissed; (b) undo on delete via the post-delete toast (delete is emotionally high-stakes and currently permanent after a two-tap confirm); (c) JSON import uses `replaceAll` and silently overwrites the whole board - add a confirm; (d) polite `aria-live` announcements on add/edit/delete for screen readers (success is currently silent). V1.5 question parked: whether opening should surface one card larger first (a "bad-day" first impression) rather than the flat wall - natural seed for presentation mode.
- Astryx Pumpkin token-compliance pass (2026-07-07, follows the "Apply Astryx Pumpkin" commit): the DS was applied to color/radius/spacing/motion but Bragboard had no control-height token, so composer-footer controls each derived height from padding+font+border and came out at 5 different heights (36-47px). Added the missing Astryx primitive `--size-element-sm/md/lg` (36/40/44, lifted from Matcha) + semantic `--control-h` (= md, bumps to lg on touch). Routed every footer control and every icon button through `--control-h`; all now 40px (44 on touch), row uniform by construction. New rule in DESIGN.md: "One-Control-Height Rule" - never fake a control height with padding. Side effect accepted by owner: header icon buttons went 36->40 so all icon buttons share one height. DESIGN.md re-synced to Astryx/Pumpkin reality (was still describing the pre-Astryx Radix `#EA722A` system): real token values, and the life-changing fill is now the accent `#e86a26` + forced bold/19px floor (supersedes the Radix-era `#c04e00`). Deliberately NOT done: remapping UI-chrome font sizes (13-17px hand-tuned set) onto Pumpkin's base16/ratio1.2 scale - no clean mapping and it would disturb the AA-pinned 19px-bold-on-accent; left as a known gap.
- Architectural decision deferred (2026-07-07): whether to make BragBoard *consume* Astryx components instead of hand-writing its own CSS that only copies token values. Root cause behind DS drift (e.g. the missing control-height token above): BragBoard reimplements every button/composer in bespoke CSS, so each control can drift from the DS one at a time; tactical token fixes treat the symptom, not the cause. "Vite vs React" is a false framing - BragBoard already IS React (Vite is only the bundler); the real blocker to importing `@astryxdesign/core` is StyleX (its components ship as `*.stylex.ts` needing a StyleX build plugin). Two real paths: (1) keep Vite, add the StyleX plugin, then `import` Astryx components under `<Theme theme={pumpkinTheme}>`; (2) rebuild BragBoard on Next.js mirroring ASTRYX-DS (its native, documented stack). Both are a rearchitecture of already-deployed V1, so both collide with the "Ship V1 before touching V1.5/V2" hard constraint. Decision: NOT now. Tactical token compliance keeps V1 consistent; component adoption is a separate, post-V1 effort and is arguably better exercised on the main portfolio project (Flows, which ASTRYX-DS was built for) than retrofitted here.

- Polish pass 2026-07-10 (owner-directed, after `/impeccable polish`): five changes, all mirroring Astryx Pumpkin by hand rather than importing it - consistent with the "don't consume Astryx components yet" decision above; these are BragBoard-native reimplementations of the DS structure/token values.
  - **Tooltip** (`Tooltip.tsx`): new component mirroring Astryx's Tooltip - inverted surface (`--gray-12`/`--gray-1`, same as the toast), quiet caption type, 200ms show + hover-bridge, touch-suppressed, Escape-dismiss, `display:contents` wrapper so it never disturbs layout. Replaces the card's native `title` and now also labels the icon-only buttons (theme toggle, image-attach, layout switch, remove-image). Radius dialed to `--radius-element`, not the DS `--radius-container` - same "too round for the size" call already made on the cards.
  - **Menu** (`Menu.tsx`): new popover-menu mirroring Astryx's DropdownMenu - `--radius-container` surface, `--space-1` padding, items at container-minus-padding radius, `--control-hover` overlay highlight, roving arrow keys, light-dismiss, Escape returns focus to the trigger. The composer font-size picker moved off a native `<select>` onto it (radio items with an accent check); the header overflow menu was rebuilt on it. One menu vocabulary in both places, placement/align via modifier classes (above/start for the composer, below/end for the header).
  - **Drag handle**: a Phosphor `DotsSix` dot grid fades in on card hover (desktop only) in the card's top padding gutter, signalling the whole card is draggable; `pointer-events:none` (the card stays the drag target), translucent white on the life-changing fill.
  - **Life-changing toggle states**: off-state hover now only warms the background (`--control-hover`); the stronger terracotta tint moved to `:active`. Ladder is rest -> hover (gray) -> press (terracotta preview) -> on (solid accent).
  - **Dark composer surface**: dark `--bg-composer` was `#242221` (a cooler gray that stood apart); now `#211b17`, matching `--bg-card`, so the input reads as the same warm surface as the cards.

## Working preferences (owner)

- Communicates in Ukrainian, technical terms often in English. Respond in Ukrainian unless working in code/docs.
- Direct, critical feedback with reasoning over validation. Push back when something is a bad idea and say why.
- Regular dashes (-), never em dashes.
- No filler phrases ("honestly", "to be fair").
- The owner is a Senior Product Designer — treat design decisions as peer discussion, not tutorials.
