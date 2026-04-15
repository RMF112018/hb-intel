# Wave 01 — Publisher iconography, toolbar & avatar closure

**Scope:** phase-12 / Prompt-03 — remove pseudo-iconography and
under-finished interaction treatment from the Publisher's most visible
editorial surfaces; replace them with a governed icon, avatar, and
interaction model.

**Status:** closed.

## Icon strategy chosen

Two layers, no new package dependency:

1. **Cross-surface icons** — reuse the existing governed
   `@hbc/ui-kit` icon library (`Star`, `StarFilled`, `ChevronBack`,
   `ChevronForward`, `ChevronUp`, `ChevronDown`). These already exist,
   already follow the HB Intel three-weight / three-size stroke system,
   and are already consumed elsewhere in the product. Using them keeps
   the Publisher aligned with the same icon vocabulary as the rest of
   the platform.
2. **Editor-specific formatting glyphs** — a small local inline-SVG
   set at
   `storyBodyEditor/editorIcons.tsx` (Bold, Italic, Link, H2, H3,
   Paragraph, BulletList, OrderedList, Quote, Undo, Redo). Text
   formatting iconography is editor-surface-specific and doesn't
   belong in the governed cross-surface library; keeping these local
   prevents the shared `@hbc/ui-kit` icon set from bloating with
   controls only the Publisher toolbar needs.

No runtime dependency was added. The new local glyphs are pure JSX /
SVG at `currentColor`, sized to 16px to match the governed icon weight
already used in `PublisherButton`.

## Pseudo-iconography scrubbed

### Story body editor toolbar (`storyBodyEditor/editorToolbar.tsx`)

Before: every formatting control used a typographic label —
`"Bold"`, `"Italic"`, `"Link"`, `"H2"`, `"H3"`, `"Paragraph"`,
`"• List"` (pseudo-bullet), `"1. List"` (pseudo-numbered-list), `"""`
(pseudo-quote), `"Undo"`, `"Redo"`. The `•`, `1.`, and `""` were the
most obviously pseudo-iconographic.

After: each control renders a real SVG glyph. Accessible name is
preserved via `aria-label` (+ optional keyboard hint) and `title`;
`aria-pressed` still reflects the current selection state.

### Team panel (`teamComposer/TeamPanel.tsx`)

Before: `★` Unicode star in the featured-toggle icon-only button;
text-label `Up` / `Down` buttons for reorder.

After:
- Featured toggle: `StarFilled` (active) / `Star` (inactive) from
  `@hbc/ui-kit`; the button is now authentically icon-only with
  pressed-state semantics already supplied by `PublisherButton`.
- Reorder: `ChevronUp` / `ChevronDown` icon-only buttons. Keyboard
  reorder via Alt+ArrowUp / Alt+ArrowDown on the chip body is
  preserved; the buttons remain as a mouse/touch affordance.

### Gallery panel (`mediaComposer/GalleryPanel.tsx`)

Before: `★` Unicode star; `←` / `→` arrow glyphs for reorder.

After: `StarFilled` / `Star` featured toggle; `ChevronBack` /
`ChevronForward` reorder. Alt+Arrow keyboard reorder inside the tile
body is preserved.

## Toolbar keyboard credibility

The story-body toolbar now follows the W3C roving-tabindex pattern:

- Only the currently-focused control is in the tab order
  (`tabIndex=0`); the rest are `tabIndex=-1`.
- `ArrowRight` / `ArrowDown` / `ArrowLeft` / `ArrowUp` move focus
  within the toolbar without mutating the document.
- `Home` / `End` jump to the first / last control.
- `Tab` enters the toolbar on the currently-focused control and exits
  it, instead of tabbing through eleven buttons.
- Every button still activates with `Enter` / `Space` and carries
  `aria-pressed` for selection-reflective state.
- Focus ring upgraded to a 2px brand-action outline with a 2px offset
  (previously 1px), so keyboard focus is visibly premium.
- Hover/active/disabled treatments strengthened with token-backed
  transitions (`--hb-transition-fast`), a soft `:active` tint, and a
  light elevation on the pressed/active button.

## Avatar treatment

`teamComposer/TeammateAvatar.tsx` is a new thin component that:

- Uses the governed `usePersonPhotoCache` hook from `@hbc/ui-kit`, so
  the authoring surface shares the same fetch/cache semantics as
  `HbcPeoplePicker`, the homepage Team Viewer, and any future
  person-bearing surface.
- Resolves, in order: cached directory photo → initials circle.
- Degrades cleanly when no `fetchPersonPhoto` adapter is threaded in
  (e.g., tests, SPFx mount without Graph token) — the initials circle
  renders unchanged.
- Upgrades the initials circle itself: token-backed subtle gradient
  surface, editorial-blue initials color, light elevation. Still
  `aria-hidden="true"` because the surrounding chip button already
  announces the teammate's name.

`TeamPanel` now threads its already-threaded `fetchPersonPhoto` prop
into `TeammateAvatar`, which previously was unused inside the panel
itself (the prop was already being passed *through* to the composer
flyout; this wires it into the main chip list as well).

`ArticlePreview`'s `TeammateChip` was deliberately left on the
initials-only pattern. The preview renders from `PreviewOutcome` which
carries `PublisherTeamMemberRow` but no resolved photo URL and is not
threaded to a Graph adapter; introducing a second photo-fetch path
inside the preview would broaden scope beyond this closure. Flagged as
follow-up when the preview gains a directory-backed enrichment seam.

## Accessibility checks performed

- Every icon-only button carries a non-empty, descriptive `aria-label`
  (e.g., `Feature {name} on the article card`, `Move {name} up`).
- Every icon-only button carries a `title` for pointer users.
- `aria-pressed` is present on toolbar toggles and the featured toggle,
  reflecting the true active state.
- SVG glyphs render with `aria-hidden="true"` and `focusable="false"`
  so screen readers never announce the glyph on top of the button's
  accessible name.
- Forced-colors fallback (`@media (forced-colors: active)`) is already
  supplied by `PublisherButton` and covers the new icon content.
- Roving tabindex verified: 11 toolbar controls present one tab stop;
  arrow keys traverse within; focus ring visibly wraps the active
  control.

## Dependency decisions

- No new runtime dependency added.
- `@hbc/ui-kit` was already a workspace dependency; only the import
  surface widened to include `Star`, `StarFilled`, `ChevronBack`,
  `ChevronForward`, `ChevronUp`, `ChevronDown`, `usePersonPhotoCache`.
- Local `editorIcons.tsx` contains ~110 lines of inline SVG — the
  minimum needed to replace all formatting pseudo-icons with no
  hand-rolled icon font, no lucide-react, no heroicons, no Fluent UI
  icons pulled in.

## Preserved behavior

- TipTap editor, link prompt, bold/italic/link/heading/list/quote/
  undo/redo commands unchanged.
- Team invariants (mutually-exclusive featured, 1-indexed SortOrder,
  Alt+Arrow keyboard reorder) unchanged.
- Gallery invariants (single featured, SortOrder restamp, Alt+Arrow
  keyboard reorder) unchanged.
- `PublisherButton` primitive (including `iconOnly` and `pressed`
  variants) unchanged.

## Proof of closure

- Pseudo-icons removed from all audited surfaces; confirmed by grep
  (`★`, `←`, `→`, `• List`, `1. List`, and the typographic quote
  button no longer appear in the Publisher feature sources).
- `pnpm --filter @hbc/spfx-hb-publisher check-types` — pass.
- Full `@hbc/spfx-hb-publisher` test suite — 564/570 pass; same 6
  pre-existing `publisherEndToEnd` orchestrator failures, unrelated to
  this work and not regressed.
- `@hbc/ui-kit` icon usage compiles against the published type
  surface.
- `.module.css.d.ts` surfaces updated for the three new classes
  introduced (`toolbarIcon`, `avatarPhoto`, `avatarPhotoImg`).

## Follow-up handed to later phase-12 prompts

- Prompt-04 — preview/readiness trust loop internals; good place to
  introduce the directory-backed photo enrichment path that would let
  `ArticlePreview` upgrade from initials-only to photo-when-available.
- Later wave — consider promoting the editor formatting glyphs into
  `@hbc/ui-kit` if a second editor surface emerges elsewhere on the
  platform.
