# Wave 02 — Shared selector semantics and control accessibility closure

Scope: Phase 13 Prompt 02. Finish the control-level accessibility contract for the shared `ChooserGroup` primitive that sits underneath the Metadata, Hero, and Team Presentation authoring panels.

## Prior semantic gap

`ChooserGroup.tsx` rendered a `role="radiogroup"` containing `role="radio"` buttons, but the interaction model was keyboard-incomplete:

- every chip was tab-reachable, so Tab walked through the whole group instead of entering it once.
- arrow keys had no handler, so the standard radio-group navigation contract was missing.
- there was no focus-visible treatment, so keyboard focus could not be distinguished from hover on the chip.

This made the primitive appear accessible in DOM inspection while failing the WAI-ARIA APG radio-group interaction contract in actual keyboard use.

## Chosen keyboard and focus model

Adopted the WAI-ARIA APG roving-tabindex pattern:

- exactly one chip owns `tabIndex=0` at any time — the currently checked option, or the first option when nothing is checked or `allowClear` yields an implicit "cleared" tab stop.
- all other chips carry `tabIndex=-1`.
- `ArrowRight` / `ArrowDown` move selection and focus to the next chip, wrapping at the end.
- `ArrowLeft` / `ArrowUp` move selection and focus to the previous chip, wrapping at the start.
- `Home` and `End` jump to the first and last chip respectively.
- `Space` activates the currently focused chip.
- Click continues to select, preserving pointer ergonomics.
- The `allowClear` sentinel ("Any" / "Default") is modeled as the first option in the roving group so keyboard users can reach and leave the cleared state the same way they move between real values.

Added a `:focus-visible` outline to `.chooserChip` in `article-publisher.module.css` so keyboard focus is always distinguishable from the active/selected state, using the existing `--hb-color-focus-ring` token.

No product language, label governance, or visual identity changed.

## Consuming surfaces regression-checked

- `authoringPanels/MetadataPanel.tsx` — content-type chooser.
- `authoringPanels/HeroPanel.tsx` — hero-theme chooser.
- `authoringPanels/TeamPresentationPanel.tsx` — mode, grouping, and sort choosers.

All consumers use the same `ChooserGroup` API (`label`, `value`, `options`, `onChange`, `getLabel`, optional `allowClear` / `clearLabel` / `helpText` / `ariaLabel`); no call-site changes were required. Typecheck and the publisher Vitest suite still pass for the consuming surfaces.

## Tests

New coverage in `sharedChrome/chooserGroup.test.tsx` proves the control-level contract:

- radiogroup role and per-option accessible labels
- roving-tabindex with checked-option tab stop
- first-option fallback tab stop when nothing is checked
- ArrowRight / ArrowLeft navigation and wrap-around
- Home / End jumps
- Space activation on the focused option
- clear-chip participation in the roving group under `allowClear`
- click selection parity

All nine tests pass. The previously-existing `publisherEndToEnd.test.ts` failures are pre-existing and unrelated to this primitive.

## Result

`ChooserGroup` now behaves credibly as a radio group for keyboard users: tab enters and exits the group once, arrow keys navigate selection and focus together, focus is visibly distinguishable, and the checked state stays coherent with focus. The closure is proved by targeted tests at the primitive level, and consuming panels are unchanged.
