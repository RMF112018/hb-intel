# Foleon Connector — Manage Route Breakpoint Contract

This artifact defines how the **manage** SPFx route behaves across viewports. Implementation: `src/pages/manage/useManageBreakpoint.ts` exposes bands to layout code; the root `ManageOrchestrator` surface also sets `data-breakpoint-*` attributes for audit evidence.

## Width bands

| Band | Approx. viewport | Layout behavior |
|------|------------------|-----------------|
| **wide-desktop** | ≥ 1440px | Full horizontal rhythm; metric cards use widest auto-fit tracks. |
| **desktop** | 1024–1439px | Standard two-column eligibility when row-sharing rules pass. |
| **tablet-landscape** | 900–1023px | Prefer stacked registry/main unless row-sharing still eligible. |
| **tablet-portrait** | 600–899px | Single-column stack (`layoutStacked`). |
| **phone-portrait** | &lt; 600px | Single column; touch-first spacing from CSS tokens. |

## Height & stability

| Mode | Rule | UX |
|------|------|----|
| **short-height** | `window.innerHeight` &lt; 640px | Registry `max-height` uses `min(560px, 55vh)` to avoid trapping scroll on short laptops. |
| **narrowest-stable** | width &lt; 360px | Minimum readable mode; row-sharing forced off; avoid horizontal overflow. |
| **row-sharing eligibility** | width ≥ 1100px and not narrowest-stable | Two-column grid: registry + main (`layoutTwoCol`). |
| **stacked (default under width)** | width &lt; 960px or not row-sharing | Registry above main content. |

## Evidence placeholders (hosted validation)

1. Open `foleonRoute=manage` on a wide desktop browser — expect `data-breakpoint-width="wide-desktop"` and `data-breakpoint-row-sharing="true"` when viewport ≥ 1100px.
2. Resize to 800px — expect `tablet-portrait`, row-sharing false, stacked layout.
3. Resize height below 640px — expect `data-breakpoint-short-height="true"`.
4. Capture screenshots for audit workbook linking to this file.

## Related doctrine

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`

## Split-Lane Reader Preview Fallback

The Project Spotlight and Company Pulse preview fallbacks use explicit CSS media queries rather than runtime viewport logic. Validation should cover:

| Case | Viewport | Expected preview behavior |
|------|----------|---------------------------|
| **wide-desktop** | ≥ 1440px | Richest two-column composition with feature placeholder, supporting cards, and visible status rail. |
| **desktop** | 1024–1439px | Same composition with tighter spacing and no horizontal overflow. |
| **tablet-landscape** | 900–1023px | Stacked feature/support composition; status rail and support zones use compact multi-card rows. |
| **tablet-portrait** | 600–899px | Single-column stack; feature placeholder appears before supporting zones. |
| **phone-portrait** | < 600px | Touch-first single-column preview with no iframe, fake reader button, or fake archive button. |
| **short-height** | height < 640px | Reduced padding and placeholder heights to avoid trapping the user in a tall preview panel. |
| **narrowest-stable** | width < 360px | Single-column metadata/status rails; wrapping pills and readable text with no horizontal overflow. |

Manual screenshot validation, if no automated visual harness is available:

1. Open `foleonRoute=projectSpotlight` with no active edition and capture at 1440, 1024, 900, 768, 390, and 320px widths.
2. Repeat for `foleonRoute=companyPulse`.
3. Capture one short-height case below 640px.
4. Confirm the preview contains no `iframe`, fake read/open/archive controls, anchors, fake Foleon URLs, or production content telemetry triggers.
