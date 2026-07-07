# Bragboard — Design Brief for Claude Design

Input for generating the V1 visual design. Source of truth for scope and constraints: CLAUDE.md. Where this brief is more specific, this brief wins.

## Product in one paragraph

Bragboard is a personal web app: a full-screen masonry board of achievement cards, built from a hand-written list of accomplishments (a therapy homework assignment). It is an emotional artifact, not a productivity tool — a thing you open on a bad day to counter the inner "I'm not capable" voice with recorded evidence. Every design decision should serve that: warm, personal, journal-like, quietly encouraging.

## Mood & references

- Primary reference: mymind (masonry board, mixed card types, personal-artifact feel). Secondary: Cosmos (grid density, spacing).
- Functional reference for chrome and card creation: **Bento** web editor and **Portrait** — bottom-centered floating toolbar, FAB in the corner, grid gets bottom padding so the toolbar never covers content.
- Stylistic references: **Pi** (warm cream background, serif headlines in a deep warm color, soft rounded input pill — closest existing product to Bragboard's intended mood) and **komoot** web (warm off-white surfaces, rounded controls, calm density).
- Explicitly NOT: Pinterest utilitarian look, Notion dashboard sterility, gamification (no confetti, no streaks, no "Great job!!!").
- Warm light base (cream/off-white), soft shadows, generous border radius.
- Dark mode must stay warm and personal, not techy — this is the highest-risk area, re-check shadows, card fill, and the life-changing accent in dark specifically.

## Deliverables (screens to design)

1. **Board — light theme** (default state, populated with sample cards)
2. **Board — dark theme** (same content)
3. **Card hover state** (edit affordance on a card, shown as a callout or state of the light board)
4. **Card composer** — collapsed and expanded states (shown on the board, not a separate screen)
5. **Empty state** (first run)
6. **Mobile view** (single column, board + controls)

## Layout system

- Masonry grid = single ordered list rendered into responsive columns. Order = importance, top = most important. No free positioning, no column-spanning, no per-card resize.
- Responsive columns: 5 max (very wide desktop) → 4 → 3 → 2 → 1 (mobile). Exact breakpoints at designer's discretion.
- All cards share the same width within a breakpoint.
- Card height: auto by content, bounded — min 0.3× card width, max 1.5× card width.
- New cards appear at the top of the list.

## Chrome: minimal header + floating bottom composer (Bento/Portrait pattern)

- **Thin header**: logo + **BragBoard** wordmark on the left; on the right one control group — **theme toggle**, **edit mode toggle**, and an overflow menu containing **JSON export/import**. Header stays quiet and light, it must not read as app chrome of a dashboard.
- Bottom of the screen belongs to the **bottom-centered card composer** only (see next section) — an input pill that invites typing, like Pi's "Talk with Pi" field.
- The grid gets bottom padding so the composer never permanently covers the last row of cards (Bento does exactly this).
- Mobile: composer stays bottom-centered (works naturally with the on-screen keyboard); header collapses gracefully on a narrow screen.

## Card composer (replaces the add/edit modal)

There is **no modal** for card creation. Creation happens inline:

- **Collapsed state**: a floating input pill at bottom center with an inviting placeholder (warm microcopy, not "Add card…").
- On focus/typing it **expands in place** into a small composer: multi-line text area plus quiet controls:
  - **Font size**: a dropdown of sizes (can be more than 3 presets) — users recognize font-size dropdowns better than abstract S/M/L pills.
  - **Layout switcher**: icon buttons (stack / split). Hidden or disabled until an image is attached — without an image the card is text-only and there is nothing to choose.
  - **Life-changing**: a toggle that fills with the primary color when on.
  - **Image attach**: an icon button with an image icon, placed next to the Add/Save button.
  - **Add/Save** button. **No Cancel button.**
- **Closing**: click outside the composer collapses it. The draft is preserved — typed text must not be lost; the collapsed pill should hint at an unsaved draft.
- Saving collapses it back; the new card enters at the top of the grid with the subtle entrance animation.
- **Editing an existing card reuses the same composer**: the edit button on a card opens the composer pre-filled; a quiet **Delete** action lives here.
- Design both states (collapsed + expanded) in light theme at minimum; expanded state must be checked in dark too.

## Card anatomy

- Content: achievement text (required) + one optional image or gif. **Nothing else** — no dates, no titles, no metadata on the card.
- Layout: **text-only is implicit** — a card without an image has no layout choice at all. Once an image is attached, the user picks between two layouts via icon switcher:
  1. **Stack** (vertical) — text above image
  2. **Split** (horizontal) — text left, image right
- Font size: user picks per card from a few presets (e.g. S / M / L). Not auto-fit. Truncation only as a last-resort fallback at the smallest preset.

## Life-changing tag

- One special tag, not a category system. Applies on top of any layout preset.
- Tagged card renders with a **solid accent (primary color) background and white text**, standing out against the default light cards.
- This replaces the earlier "large/featured" preset idea — there is no separate featured layout.
- Verify contrast and warmth of this treatment in dark mode.

## Editing, reorder, delete (no edit mode)

- There is **no edit mode**. Viewing is the only mode; editing affordances appear contextually.
- **Desktop hover**: a small, quiet edit icon button appears on the card. Clicking it opens the composer pre-filled.
- **Delete** lives inside the expanded composer when editing an existing card — a quiet destructive button, not an icon on the card.
- **Drag**: the whole card is always draggable, with a small movement threshold to avoid accidental drags. Semantics unchanged: reorder-only, position in the single ordered list, grid repacks automatically, no free placement.
- **Mobile** (no hover): tap on a card reveals the edit button; long-press lifts the card for drag reordering.

## Empty state

- Centered composition: short serif headline, one supporting line, one CTA to add the first card.
- Tone: gentle invitation to "start your record" — never productivity language.

## Typography

- **Bona Nova** (Google Fonts, full Cyrillic) — achievement text on cards, and optionally large display headlines (e.g. empty state).
- **Geist** (Google Fonts, Cyrillic) — all UI chrome: buttons, modal, menus, labels.

## Color

- Radix Colors custom palette: accent `#EA722A` (warm terracotta/orange scale), gray `#877F7A` (warm gray-brown). Light and dark scales generated as a matched pair: https://www.radix-ui.com/colors/custom?accent-dark=EA722A&accent-light=EA722A&gray-light=877F7A&gray-dark=877F7A
- Light is the default theme. Dark is a user-triggered alternate.

## Motion (restrained baseline)

- Soft hover-lift on cards.
- Smooth grid repack after drag/reorder.
- Subtle entrance for a newly added card.
- Standard easing for modal and theme transitions. No stagger choreography, no spring physics showcases — presentation-mode animation is V1.5, out of scope.

## Copy & content

- All UI copy in English. Warm, personal, quietly encouraging; microcopy is part of the emotional design.
- Card content in mockups: Ukrainian, realistic, varied length. Use these placeholders (none are real):
  - "Кинув палити після десяти років" (short, text-only)
  - "Переїхав у нову країну і зібрав життя заново" (short, life-changing)
  - "Провів свій перший воркшоп для команди з двадцяти людей і отримав найкращий фідбек за квартал" (medium, vertical with image)
  - "Навчився просити про допомогу. Звучить просто, але це зайняло роки — і саме це змінило все інше." (medium, life-changing)
  - "Зробив портфоліо, яке відкладав три роки. Не ідеальне — але воно існує, і його бачать люди." (long, horizontal with image)
  - "Пробіг перші 10 кілометрів" (short, with image)

## Out of scope for these designs

- Presentation mode / slideshow (V1.5)
- Goals board, drag-between-boards, auth, sync (V2)
- Onboarding flows, settings pages, category systems
