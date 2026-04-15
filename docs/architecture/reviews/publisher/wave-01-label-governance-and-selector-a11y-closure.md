# Wave 01 — Label governance & selector a11y closure

**Scope:** phase-12 / Prompt-06 — close the remaining author-trust
gaps around friendly labeling and selector/search accessibility on
Wave 01-touched authoring surfaces.

**Status:** closed.

## Label leaks found

A full scrub of the Wave 01-touched author-facing surfaces
(`TeamPanel.tsx`, `GalleryPanel.tsx`, `MediaComposer.tsx`,
`MetadataPanel.tsx`, `ProjectPicker.tsx`, `ArticlePreview.tsx`) found
no remaining raw enum-token leaks:

- `MediaRole` → rendered through `mediaRoleLabel()` on gallery tiles
  (resolved in the prior wave when role badges were cut over from
  verbatim `MediaRole` strings to the governed helper).
- `SpotlightType` / `ProjectStage` / `ArticleSubject` /
  `ArticleContentType` / `Destination` → already routed through their
  respective `authorLabels.ts` helpers in `MetadataPanel.tsx` via
  `ChooserGroup getLabel`.
- `WorkflowState` → already routed through `workflowOutcomeLabel`,
  `draftGroupLabel`, `draftGroupEmptyCopy`, and
  `transitionActionLabel` in the draft-rail / workspace surfaces.
- `TeamPanel` "Featured" chip and `GalleryPanel` "Card thumbnail"
  chip — already governed author-facing phrasings, not raw enum
  tokens.
- `MediaComposer` radio-group render text — author-facing strings
  ("Gallery image", "Supporting image"); the radio `value` attribute
  carries the `MediaRole` token but that is input payload, not text
  shown to the author.
- `ArticlePreview.tsx` — `MediaRole` appears only in a predicate
  (`m.MediaRole === 'gallery'` filter), never rendered.

No new helpers were needed: the live `authorLabels.ts` coverage is
already exhaustive for every enum surfaced on these surfaces. The
existing `authorLabels.test.ts` suite enforces a governance contract
across every enum value (non-empty, non-raw) plus specific-case
phrasings, and it continues to pass unchanged.

## Selector / search semantics strengthened

`ProjectPicker.tsx` was upgraded from "visually functional listbox"
to a credible ARIA combobox pattern. All lookup behavior,
debouncing, and selected-value rendering are unchanged.

Changes:

- **`role="combobox"` on the search input** with
  `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, and
  `aria-autocomplete="list"`. Previously the input declared the
  listbox relationship without identifying itself as a combobox.
- **`aria-activedescendant`** on the input, pointing to the id of
  the currently active option. Screen readers can now announce the
  active result as the author moves through it with ArrowUp /
  ArrowDown without the focus ring leaving the input.
- **Stable option ids** (`project-picker-listbox-option-N`) so
  `aria-activedescendant` resolves.
- **Option elements switched from `<button role="option">` to
  `<div role="option">`** so the combobox/listbox relationship is
  not broken by nested focusable elements. Mouse selection still
  works; keyboard selection continues to route through the input's
  Enter handler, which is the intended single keyboard entry point
  for a combobox.
- **`onMouseDown` preventDefault on options** so clicking an option
  no longer blurs the input before `onClick` fires.
- **Listbox labelled with `aria-label="Project search results"`.**
- **Status / error / empty messages wrapped in `role="status"`
  (`aria-live="polite"`) or `role="alert"`** so "Searching…", "No
  projects match…", and error copy are announced.

Keyboard contract (verified by reading through the component):

- ArrowDown / ArrowUp move `activeIndex` and update
  `aria-activedescendant`.
- Enter calls `handleSelect(results[activeIndex])` when there are
  results.
- Escape closes the dropdown.
- Tab leaves the picker naturally without trapping focus inside
  option buttons (now that options are non-focusable `<div>`s).
- Outside click still closes the dropdown via the existing
  `mousedown` listener on `document`.

## Tests

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — pass.
- `authorLabels.test.ts` (15 describe blocks covering every enum via
  the `ENUM_LABEL_CHECKS` contract plus specific-case phrasings) —
  pass unchanged. No new helpers or new coverage were needed because
  no new enum-backed surfaces were introduced.
- Full `@hbc/spfx-hb-publisher` suite — 564/570 pass; same 6
  pre-existing `publisherEndToEnd` orchestrator failures, unrelated
  to this UI work and not regressed by it.

## Keyboard / a11y checks performed

- Reviewed `ProjectPicker` keyboard handlers end-to-end:
  ArrowDown/Up clamp at the bounds; Enter only fires when a result
  exists at `activeIndex`; Escape collapses without touching the
  selection.
- Verified that `aria-activedescendant` is only set when a rendered
  option id exists (showDropdown && status === 'ready' &&
  results.length > 0 && activeIndex < results.length), so screen
  readers never follow a stale reference.
- Verified that focus never escapes into non-focusable option
  `<div>`s via Tab now that they carry no tabindex.

## Bounded residual

- `MediaComposer` radio group labels are hand-authored
  ("Gallery image", "Supporting image") rather than derived from
  `mediaRoleLabel`. The helper returns "Gallery" / "Supporting",
  which is the author-friendly label for a role *badge*; the radio
  group needs richer copy ("Gallery image" / "Supporting image"),
  so the divergence is intentional and stays local to the composer.
