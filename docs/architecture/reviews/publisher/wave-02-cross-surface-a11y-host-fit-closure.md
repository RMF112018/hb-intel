# Wave 02 — Cross-surface keyboard, host-fit, and breakpoint closure

Scope: Phase 13 Prompt 06. Final cross-surface closure pass after the earlier Wave 02 control and metadata prompts landed (label governance, `ChooserGroup` roving-tabindex, project-lookup trust, story-editor closure, and hero/team progressive disclosure). Verifies the Article Publisher now behaves as one coherent SharePoint-hosted product and closes the remaining gaps that spanned surfaces.

## Whole-surface keyboard issues found and fixed

1. **Section-index jumps moved scroll but not focus.** The canvas nav linked to `#section-<id>` anchors; native hash navigation updates the URL and scroll position but does not move focus, so keyboard and screen-reader users ended up visually at the section while the focus ring stayed on the nav and the next Tab stop was back in the nav bar.

   **Fix.** Every canvas `<section>` now carries `tabIndex={-1}` (focusable but not in the tab sequence). A new `sectionFocus.ts` helper intercepts clicks on the section-index nav, calls `scrollIntoView({ behavior: 'smooth', block: 'start' })` on the target section, then explicitly `.focus({ preventScroll: true })` on it and mirrors the `history.replaceState` so the URL stays correct. `article-publisher.module.css` adds a tokenised `:focus-visible` outline on `.section` so keyboard users can see where focus landed after the jump. `scroll-margin-top: 64px` already on `.section` keeps the section clear of the sticky nav.

2. **Focus-treatment coverage.** Confirmed `:focus-visible` rules exist across every materially interactive primitive touched in Wave 02: `sectionIndexLink`, `section` (new), `disclosureSummary`, `chooserChip`, `readinessIssueAnchor`, `publisherButton.base`, `draftQueue.searchInput`, `draftQueue.groupHeader`, `draftQueue.row`, `mediaComposer.tileBody`, `readinessSurface.summary`, `storyBodyEditor.toolbarBtn`, `teamComposer.chipBody`. No gaps require patch.

## Breakpoint / sticky-layout issues found and fixed

1. **Readiness rail scroll-chaining at the collapsed breakpoint.** At `<1080px` the rail becomes a pinned bottom panel (`position: sticky; bottom: 0; max-height: 40vh; overflow: auto;`). Scrolling inside it previously chained into the SharePoint host page, so the author could accidentally move the host page while trying to read the issues list.

   **Fix.** Added `overscroll-behavior: contain` to the collapsed-breakpoint `.readinessRail` rule. Native browser scroll containment only, no layout or JS change, and the full rail remains keyboard-scrollable.

2. **Sticky section index overlap.** Verified the existing `.section { scroll-margin-top: 64px }` keeps section headers below the sticky `.sectionIndex` at all three desktop breakpoints (≥1280 full, 1080–1279 compressed, 720–1079 readiness-pinned-bottom). No change required.

3. **`<720px` stacking.** Verified the existing rules: workspace collapses to a single column; queue rail border rotates to the bottom; canvas padding steps down. No clipped or unreachable controls observed.

## Host-fit preserved

- Three-column shell, sticky section index, sticky readiness rail, and queue keyboard affordances are all preserved — no shell duplication, no PWA-style chrome, no header/footer invented on top of SharePoint.
- The new section-index click handler only intercepts clicks whose `target` is an `<a>` within the canvas section index; clicks on external hashes or non-anchor children are ignored and the native behaviour runs.
- No new external dependencies, no package-boundary change, no persistence / adapter / schema change.

## Manual host-fit checks performed

Documented as manual because they are layout/host-visual in nature and cannot be meaningfully asserted in jsdom:

- **Desktop keyboard path queue → canvas → readiness rail.** Tab moves from the draft-queue search, through the queue groups, into the canvas section nav, through each section and its controls, and into the readiness rail's primary actions and workflow transitions, then into destructive actions. Shift+Tab reverses cleanly.
- **Section-index anchor click and keyboard activation.** Click and Enter on a section-index link now land focus on the matching canvas section; the next Tab stop is the first interactive control inside that section. Visible focus ring appears on the section.
- **Narrow-width compression (1079px).** Queue + canvas reflow to two columns; readiness pins to the bottom with `overscroll-behavior: contain`, so internal scrolling no longer leaks into the host page.
- **<720px stack.** All columns stack vertically; queue border rotates to bottom; canvas padding tightens; no controls are clipped.
- **Icon-only controls.** Toolbar buttons, chooser chips, draft-queue row buttons, and gallery tile controls each announce their `aria-label`/`aria-pressed` and show a visible focus ring.
- **Destructive actions.** Archive / withdraw controls in the readiness rail retain their focus outline, and the confirmation flow returns focus into the rail.
- **Sticky readiness rail.** Pinned at all supported breakpoints; content inside remains scrollable via keyboard PageUp/PageDown; the containment rule prevents scroll chaining.

## Tests added

- `sectionFocus.test.tsx` — four tests proving the cross-surface focus contract: focus lands on the target section after a section-index click, `scrollIntoView` is invoked with `{ behavior: 'smooth', block: 'start' }`, external hashes / missing ids are ignored safely, and non-anchor click targets are ignored without calling `preventDefault`.

All pre-existing Wave 02 suites continue to pass. Typecheck clean. The six unrelated `publisherEndToEnd.test.ts` failures are pre-existing and unchanged.

## Section-based authoring model preserved

No structural redesign. The three-column shell, section index, and section order (`identity → hero → story → media → team → promotion → destination → preview`) are unchanged. All Wave 02 prior closures — label governance, `ChooserGroup` semantics, project-binding truthfulness, story-editor empty-state, and hero/team progressive disclosure — continue to operate without modification.
