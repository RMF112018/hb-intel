# Safety Field Excellence — Breakpoint and Host-Fit Evidence (Wave 06)

This document captures **code-confirmed** breakpoint behavior. Hosted-runtime
proof against real SharePoint browsers belongs to **Prompt 07** and is
intentionally out of scope for Wave 06.

No screenshots are claimed here. Where the evidence is "code-confirmed via
mode-aware logic", the file:line and the test that exercises it are cited.

## Coverage summary

| Viewport / mode | Expected behavior | Observed (code-confirmed) | Status | Reference |
|---|---|---|---|---|
| Desktop ultrawide (≥ 1024px) | Two-column layout (`primary` + `secondary` 1.4fr/1fr); generous posture padding | `safety-homepage-surface.module.css:550-563` `@media (min-width: 1024px)` grid + padding | ✅ | CSS confirmed |
| Standard laptop / desktop (1180–1400px) | Same two-column layout, slightly tighter | Same media query; container width ≥ 1024px triggers the 2-col grid | ✅ | CSS confirmed |
| Tablet landscape (980–1250px) | Two-column or single-column depending on host slot | Single-column body fallback below 1024px (no `grid-template-columns` set) | ✅ | CSS confirmed |
| Tablet portrait (720–950px) | Single-column body | Default body grid is single column (`gap: 12px; padding: 14px`) | ✅ | CSS confirmed |
| Phone portrait (375–430px) | Single-column body, compact mode triggered by shell | Default `mode='standard'` would still single-column; shell-driven `mode='compact'` further reduces padding (`14px → 12px`) and font sizes | ✅ | `modeCompact` rules at CSS:486-503 |
| Phone landscape / short-height | Minimal mode triggered by shell | `summary-collapsed` → `minimal` via `resolveOperationalMode`; CSS:512-538 `modeMinimal` reduces gap and font sizes; secondary cap drops to 2 | ✅ | `safetyFieldExcellenceConsumerModel.tsx` `resolveOperationalMode` + `SIGNAL_CAP_BY_MODE` |
| 125% zoom | No horizontal overflow | All chips and meta items use `flex-wrap: wrap`; posture lead uses `flex-wrap` (CSS:38) | ✅ | CSS confirmed |
| 150% zoom | No clipped CTA | CTA uses `min-height: 44px` + inline-flex; chevron baseline guard ensures no overlap | ✅ | CSS confirmed |

## Stale + preview cue persistence across modes

Critical for cat. 9 (state-model completeness) and cat. 12 (a11y):

| Mode | Stale chip | Preview chip | Fallback-reason chip | Confidence chip |
|---|---|---|---|---|
| Standard | Visible | Visible | Visible | Visible |
| Compact | Visible (CSS does not gate `staleChip` by mode) | Visible | Visible | Visible |
| Minimal | Visible | Visible | Visible | Hidden by `mode !== 'minimal'` guard (intentional content reduction) |

Tested in `SafetyFieldExcellence.uiUxStates.test.tsx:138-186`.

## Hover-only meaning regression guard

`safety-homepage-surface.module.css:264-275` adds a baseline `›` chevron on
interactive `signalRow` elements. The chevron is always present and sits at
60% opacity; hover and focus-visible reveal it to full color and shift it 2px.

Reduced-motion guard at `safety-homepage-surface.module.css:438-460` removes
the transition and the transform, keeping the icon static for users who
opt out of motion.

## Touch-target validation

| Element | min-height | Pass |
|---|---|---|
| `signalRow` (standard) | 52px | ✅ |
| `signalRow` (compact) | 46px (`signalRowCompact`) | ✅ — above 44px AAA touch minimum |
| `postureAction a` / `primaryAction a` | 44px | ✅ |
| `postureChip` / `staleChip` / `confidenceChip` / `fallbackChip` | 22px chip + adjacent 14–18px text | n/a (chips are status, not interactive) |

## Outstanding host-runtime items (Prompt 07)

Intentionally not closed in Wave 06:

- Real SharePoint hosted page render at the documented breakpoints.
- Cross-browser visual regression at production endpoint.
- Real Function App `homepage/current` response shapes captured at runtime
  vs. the unit-test mocks used here.
- Mobile-device taps and on-device focus-ring rendering.
- Reduced-motion verification on a real browser.

## Reproduction

```bash
cd /Users/bobbyfetting/hb-intel/apps/hb-webparts
pnpm exec vitest run --config vitest.config.ts src/webparts/safetyFieldExcellence
```

Result (Wave 06): `Test Files 6 passed (6) | Tests 52 passed (52)`.
