# Safety Field Excellence — Homepage Checklist (Wave 06)

Evaluated against `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`.

## Doctrine and host compliance

| Item | Status | Evidence |
|---|---|---|
| Surface uses governed shared component | ✅ | `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx:140` consumes `HbcSafetyHomepageSurface` from `@hbc/ui-kit/homepage`. |
| No fake-shell / duplicated SharePoint chrome | ✅ | Single `<section>` per zone; no chrome injection. `safetyFieldExcellence` directory contains no chrome wrappers. |
| Light theme first | ✅ | `safety-homepage-surface.module.css:5-6` uses `--hbc-surface-*` tokens; no dark-only paths. |
| Reduced-motion respected | ✅ | `safety-homepage-surface.module.css:438-460` guards `signalRow` transform + chevron transitions. |

## UI-kit / premium-stack compliance

| Item | Status | Evidence |
|---|---|---|
| `motion/react` used | ✅ | `HbcSafetyHomepageSurface/index.tsx:3` imports `motion`. |
| `lucide-react` used (no Unicode pseudo-icons) | ✅ | `HbcSafetyHomepageSurface/index.tsx:5-13` imports `AlertTriangle`, `Clock`, `Eye`, `Shield`, `ShieldAlert`, `ShieldCheck`. |
| `clsx` used | ✅ | `HbcSafetyHomepageSurface/index.tsx:2`. |
| Imports from approved entry points | ✅ | All app-side consumption is from `@hbc/ui-kit/homepage`. ESLint-enforced. |

## Token and styling discipline

| Item | Status | Evidence |
|---|---|---|
| New CSS uses tokens | ✅ | `safety-homepage-surface.module.css` Wave 06 additions reuse `--surface-warning`, `--surface-success`, `--surface-brand`, `--surface-muted`, `--surface-shell`, `--surface-elevated`, `--surface-ring`. |
| No new raw hex | ✅ | grep `#[0-9a-fA-F]{6}` finds only the existing pre-Wave 06 token defaults at lines 5-11. |
| Existing alpha rgba values consistent | ✅ | Wave 06 reuses the same `rgba(34, 83, 145, X)` and `rgba(181, 71, 8, X)` values already used in the file. |

## Surface composition and hierarchy

| Item | Status | Evidence |
|---|---|---|
| Standard mode shows posture / primary / evidence / signals / CTA | ✅ | `HbcSafetyHomepageSurface/index.tsx:298-456`. |
| Compact intentionally reduces (badges, secondary count) | ✅ | `SIGNAL_CAP_BY_MODE.compact = 3`; `showSurfaceAction` and `showPrimaryCta` mode-aware. |
| Minimal preserves status / cadence / primary title / one signal | ✅ | `SIGNAL_CAP_BY_MODE.minimal = 2`; minimal hides updatedLabel / postureSummary but keeps title + stale chip. |
| Stale and preview indicators survive shell compression | ✅ | `staleChip` rendered in `primaryHeaderEnd` regardless of mode. Test: `SafetyFieldExcellence.uiUxStates.test.tsx:138-167`. |

## State-model completeness

See `safety-field-excellence-state-matrix.md`. All 11 documented states tested.

## Contract, data, and backend seam rigor

| Item | Status | Evidence |
|---|---|---|
| Adapter calls only `homepage/current` | ✅ | `SafetyFieldExcellenceDataAdapter.ts:53` (Wave 05). Grep `/api/safety-field-excellence/(rollup\|highlights\|reporting-periods)` returns no production hits. |
| No admin/control-plane endpoint calls | ✅ | grep `/highlights/.*/(approve\|publish\|override\|suppress\|rollback)` returns no production hits. |
| No SharePoint raw-list aggregation | ✅ | grep for SharePoint REST `/_api/web/lists` and Graph `/sites/.../lists` in `apps/hb-webparts/src/webparts/safetyFieldExcellence` returns no hits. |
| No `RawChecklistJson` in production code | ✅ | grep returns only test-guard assertion hits in `__tests__/`. |
| No MSAL imports | ✅ | grep `msal` in `apps/hb-webparts/src/webparts/safetyFieldExcellence` and `apps/hb-webparts/src/webparts/hbHomepage` returns no hits. |
| No frontend scoring/ranking | ✅ | `SafetyFieldExcellence.tsx` and provider only consume the backend payload via the mapper. |

## Identity, media, attribution

| Item | Status | Evidence |
|---|---|---|
| Confidence visible on every dynamic-published render | ✅ | `mapBackendPublishedToConfig` plumbs `dataConfidence`; `SafetyFieldExcellence.tsx` reads via `pickDataConfidence`; surface renders `confidenceChip`. |
| Preview content clearly labeled | ✅ | Preview fallback chip with `Eye` icon plus "Preview — awaiting published weekly data" copy on top-line. |
| No fake project name in preview | ✅ | `safetyFieldExcellencePreviewFallback.ts:43` title "Weekly Safety Excellence Preview"; metadata "Preview content — not a live project recognition". |
| Period label preserved | ✅ | `mapBackendPublishedToConfig` reads `periodLabel`/`weekStartDate`/`weekEndDate` from the response and passes through. |

## Accessibility and keyboard behavior

| Item | Status | Evidence |
|---|---|---|
| Color-non-reliance on `degradedNotice` | ✅ | `degradedNoticeIcon` (default `AlertTriangle`) + text. |
| Color-non-reliance on stale | ✅ | `Clock` icon + "Stale" text in chip. |
| Color-non-reliance on fallback reason | ✅ | `Eye` icon + textual fallback label in chip. |
| `role="status"` on stale + degraded + fallback chips | ✅ | `index.tsx:357, 359, 386, 393`. |
| Focus-visible on signal rows | ✅ | `safety-homepage-surface.module.css:312-315`. |
| No hover-only meaning on signal rows | ✅ | Baseline `›` chevron rendered always (lines 264-275 of CSS); reveals on focus + hover. |
| Reduced-motion guards | ✅ | `safety-homepage-surface.module.css:438-460`. |
| Touch target ≥ 44px | ✅ | `signalRow` `min-height: 52px` (standard), 46px (compact). `postureAction a` and `primaryAction a` `min-height: 44px`. |
| Semantic `<section>` with `aria-label` | ✅ | `index.tsx:330`. |
| `aria-hidden` on decorative icons | ✅ | All lucide icons inside chips and badges. |

## Validation and closure proof

| Item | Status | Evidence |
|---|---|---|
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | ✅ | Clean for Safety Field Excellence files. 3 pre-existing unrelated errors in `priorityActionsRail` / kudos / hero tests unchanged. |
| `pnpm --filter @hbc/ui-kit check-types` | ✅ | Clean. |
| `pnpm --filter @hbc/features-safety check-types` | ✅ | Clean. |
| `pnpm --filter @hbc/functions check-types` | ✅ | Clean. |
| Targeted vitest run | ✅ | 6 test files / 52 tests pass for `src/webparts/safetyFieldExcellence` (10 new Wave 06 + 42 carryover). |
| Pre-existing webparts failures unchanged | ✅ | 24 unrelated failures in `src/homepage/__tests__/*` and `src/webparts/hbKudos/*` — Wave 06 does not increase the failure count. |
| Manifest bumped | ✅ | `SafetyFieldExcellenceWebPart` `0.0.7.0` → `0.0.8.0`. |
| ui-kit version unchanged | ✅ | Additive optional props; no breaking change. |
