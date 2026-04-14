# Workstream H — Visual System and Doctrine Conformance

Brings the Article Publisher into visual alignment with the SPFx Governing Standard + Homepage Overlay doctrine. Replaces neutral admin-chrome styling with a premium editorial product language rooted in governed `@hbc/ui-kit` tokens and Publisher-scoped primitives.

## Steps
- [Step 01 — Audit and target-language design](./step-01/DESIGN.md)
- [Step 02 — sharedChrome foundations (tokens + PublisherButton + EditorialChip)](./step-02/CLOSURE.md)
- [Step 03 — Chip and action migration (panels)](./step-03/CLOSURE.md)
- [Step 03b — Chip and action migration (Publisher shell)](./step-03b/CLOSURE.md)
- [Step 04 — Focus + empty + loading + error + author-safety hardening](./step-04/CLOSURE.md)
- [Step 05 — Doctrine-conformance proof + dead-CSS scrub](./step-05/CLOSURE.md)

## Final architecture

```
apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/
├── tokens.module.css               # :root { --hb-* } mirroring @hbc/ui-kit theme
├── PublisherButton.tsx             # primary / secondary / danger + iconOnly + pressed
├── publisherButton.module.css
├── publisherButton.test.tsx        # 8 RTL tests
├── EditorialChip.tsx               # success / warn / danger / info / neutral / featured
├── editorialChip.module.css
├── editorialChip.test.tsx          # 9 RTL tests
├── StatusBanner.tsx                # info / success / error last-action feedback
├── statusBanner.module.css
├── statusBanner.test.tsx           # 5 RTL tests
└── index.ts                        # barrel
```

## Token flow

`packages/ui-kit/src/theme/tokens.ts | radii.ts | elevation.ts | grid.ts | animations.ts` → `sharedChrome/tokens.module.css` (`:root { --hb-* }`) → every Publisher module CSS `var(--hb-*)`.

## Before / after

| Concern | Before workstream H | After |
| --- | --- | --- |
| Colour palette | `#e3e3e6` neutral + ad-hoc `#225391` on everything | `HBC_BRAND_ACTION` for CTAs, `HBC_PRESENTATION_BLUE` for editorial highlights + focus, `HBC_PRIMARY_BLUE` for hover / pressed, authoritative role separation |
| Chip styles | six duplicated implementations (`.chipReady`, `.chipTodo`, `.chipBlocked`, `.featuredBadge`, `.severityError`, `.severityWarn`, `.groupAttention` …) | one `EditorialChip` primitive with six variants |
| Button styles | five+ duplicated (`.primaryBtn`, `.btn`, `.dangerBtn`, `.linkBtn`, `.addBtn`, `.actionBtn`, `.iconBtn`) with drifting colours | one `PublisherButton` primitive with three variants + iconOnly + pressed |
| Focus ring | nine per-surface `outline: 2px solid #225391` declarations | one governed `:focus-visible` treatment in primitives |
| Last-action status | single `aria-live="polite"` banner for every outcome | `StatusBanner` with `role="alert"` assertive for errors, `role="status"` polite for info and success, distinct tinted chrome per tone |
| Motion | ad-hoc `150ms ease` / `100ms linear` / none | `var(--hb-transition-fast)` collapsing to 0ms under `prefers-reduced-motion: reduce` |
| High-contrast | tinted chrome survived forced-colors | `forced-colors: active` swaps chips and status to `ButtonText` / `ButtonFace` / `ButtonBorder` |
| Tokens | hard-coded hex, raw spacing numbers, mixed radii | `var(--hb-color-*)`, `var(--hb-space-*)`, `var(--hb-radius-*)`, `var(--hb-elevation-*)` across the Publisher surface |

## Lifecycle invariants preserved
- No schema change.
- No adapter / orchestrator / write-seam change.
- No new shared `@hbc/ui-kit` primitive introduced.
- `sharedChrome/` is Publisher-scoped; nothing is exported outside `apps/hb-webparts/src/webparts/articlePublisher/`.

## Conformance proof
- Every action button on the Publisher surface routes through `PublisherButton`.
- Every status chip routes through `EditorialChip` (one exception: the `ArticlePreview` surface retains feature-scoped badges for hosted-page-adjacent typography — read-only visual preview, not an authoring surface).
- Every last-action status message routes through `StatusBanner` with severity-aware ARIA politeness.
- Every focusable element in the Publisher inherits the unified `HBC_PRESENTATION_BLUE` focus outline from the primitives.
- The bespoke `.btn` / `.primaryBtn` / `.dangerBtn` / `.linkBtn` CSS declarations in `article-publisher.module.css` are removed in Step 05 with a waypoint comment preserved for grep discoverability.
