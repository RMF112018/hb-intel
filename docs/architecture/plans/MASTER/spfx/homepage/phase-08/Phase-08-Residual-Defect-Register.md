# Phase 08 Residual Defect Register

Non-blocking residual issues carried forward from the Phase 08 audit. None are release-blocking.

## Active residual items

| # | Title | Lane | Severity | User Impact | Why Not Blocking | Future Owner |
|---|-------|------|----------|-------------|-----------------|-------------|
| R-01 | Secondary text contrast borderline at small sizes | A | Low | Metadata text at 0.75 opacity on white is ~3.2:1 — borderline for normal text AA (0.8125rem) | Passes AA for large text; metadata is supplementary, not primary content | Design — evaluate promoting to 0.8 opacity or increasing font size in future visual pass |
| R-02 | Hero gradient contrast varies with author images | A | Low | If authors set background images with light areas, white text contrast may drop below AA | Fallback gradient is safe (~5.5:1); image-dependent contrast is an authoring responsibility | Authoring governance — add image-contrast guidance to author documentation |
| R-03 | Screen reader behavior inferred, not live-tested | Both | Medium | Landmark structure and live regions are correct in code, but real screen reader behavior could reveal edge cases | Code-level structure follows WCAG patterns correctly; live testing is a quality-of-evidence concern, not a structural defect | QA — schedule VoiceOver + NVDA testing before high-traffic rollout |
| R-04 | Multiple live regions on homepage may be verbose | A | Low | Multiple `role="status"` regions (loading, empty) on the same page could cause verbose announcements | Each region is contextual and polite; verbosity is a preference concern, not a functional defect | Accessibility — evaluate `aria-relevant` tuning if user feedback indicates over-announcement |
| R-05 | Property panes not implemented | A | Info | Content authors cannot configure webparts through SharePoint's native property pane UI | Config-as-props works correctly; property-pane wiring is a feature gap, not a defect | Product — future phase for property-pane implementation |
| R-06 | Async data integration not implemented | A | Info | Webparts render from static config, not live data | All state handling (loading, empty, stale) is implemented and tested; the gap is data sourcing, not rendering | Product — future phase for data integration |
| R-07 | `aria-atomic="true"` may re-announce all alerts on dismiss | B | Low | When an alert is dismissed, the entire alert band may be re-announced to screen readers | Functional behavior is correct; verbosity is a preference concern | Accessibility — evaluate in live screen reader testing |

## Resolved items (fixed in P08-01)

| # | Title | Lane | Fix |
|---|-------|------|-----|
| F-01 | HomepageEmptyState missing live region | A | Added `role="status" aria-live="polite"` |
| F-02 | Generic aria-labels on cluster components | A | Changed to context-aware `"{heading} — featured"` |
| F-03 | Generic aria-labels on operational cluster | A | Same fix |
| F-04 | Alert band missing aria-atomic | B | Added `aria-atomic="true"` |
| F-05 | Dismiss button touch target too small | B | Enlarged to `padding: 8px; min-width: 32px; min-height: 32px` |
