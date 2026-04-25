# Safety Field Excellence — UI/UX Scorecard (Wave 06)

| Item | Value |
|---|---|
| Date | 2026-04-25 |
| Branch | `main` |
| Wave | Phase 02, Wave 06 (UI/UX flagship remediation) |
| Manifest | `SafetyFieldExcellenceWebPart 0.0.8.0` |
| Audit instrument | `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md` |
| Doctrine | `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md` + `…-Homepage-Overlay.md` |

## Files inspected

- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDynamicProvider.tsx`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceConsumerModel.tsx`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePayloadMapper.ts`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePreviewFallback.ts`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceRuntimeProof.ts`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx`
- `packages/ui-kit/src/HbcSafetyHomepageSurface/index.tsx`
- `packages/ui-kit/src/HbcSafetyHomepageSurface/safety-homepage-surface.module.css`
- `packages/ui-kit/src/homepage.ts`

## Files changed (Wave 06)

- `packages/ui-kit/src/HbcSafetyHomepageSurface/index.tsx` — added `isPreview`, `isStale`, `fallbackReason`, `dataConfidence`, `degradedNoticeIcon`, `lastUpdatedLabel` props; rendered visible chips with lucide icons; preserved reduced-motion behavior.
- `packages/ui-kit/src/HbcSafetyHomepageSurface/safety-homepage-surface.module.css` + `.d.ts` — added stale wash, preview dashed accent, fallback chip variants, confidence chip variants, baseline interactive cue (`›` chevron) replacing hover-only meaning, reduced-motion safeguards.
- `packages/ui-kit/src/homepage.ts` — re-exported `SafetyDataConfidence` and `SafetySurfaceFallbackReason`.
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx` — derived `isPreview`, `isStale`, `fallbackReason`, `dataConfidence`, `primaryLastUpdatedLabel` from dynamic state; passed through to surface model.
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceConsumerModel.tsx` — `mapSafetySurfaceModel` now accepts a typed `extras` argument; suppresses legacy duplicate Stale badge when surface-level chip is active.
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePayloadMapper.ts` — plumbs `dataConfidence` from the backend response into the canonical config.
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePreviewFallback.ts` — secondary signals carry distinct indicator variants so preview reads as a productized preview, not flat-gray filler.
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceRuntimeProof.ts` — non-sensitive `previewFallbackRendered` and `staleTreatment` proof fields.
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDynamicProvider.tsx` — populates new proof fields.
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceWebPart.manifest.json` — version `0.0.7.0` → `0.0.8.0`.
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/__tests__/SafetyFieldExcellence.uiUxStates.test.tsx` — 10 new tests covering Wave 06 UI/UX states.

## Per-category score

| # | Category (max 4) | Score | Evidence |
|---|---|---|---|
| 1 | Doctrine and host compliance | **4** | Surface uses governed `HbcSafetyHomepageSurface`; ui-kit additions are token-driven (no raw hex outside the existing `--surface-*` token block). Light theme first; reduced-motion respected. |
| 2 | UI-kit / premium-stack compliance | **4** | Lucide icons (`AlertTriangle`, `Clock`, `Eye`, `Shield`, `ShieldAlert`, `ShieldCheck`); `motion/react` already present; `clsx` for class composition; no Unicode pseudo-icons; no Fluent dominance. |
| 3 | Token and styling discipline | **4** | New CSS uses existing `--surface-*` tokens. Two existing alpha rgba values reused (`rgba(34, 83, 145, 0.04)` etc., consistent with surrounding file). No new raw hex. |
| 4 | Purpose-fit sophistication and persona expression | **4** | Preview now reads as a productized preview of four evidence categories (info / success / warning / neutral indicator variants). Stale state uses a Clock-icon chip. Confidence chip uses Shield-family icons. |
| 5 | Surface composition and hierarchy | **4** | Posture band carries fallback-reason + confidence chips; primary signal carries stale chip + last-updated caption + severity icon; secondary list keeps severity stripe + chevron baseline; minimal mode keeps stale visible. |
| 6 | Homepage integration quality | **4** | Zone wrapper unchanged in shape; provider/render-prop pattern preserved; backward-compatible (curated-only render unaffected; existing curated tests pass). |
| 7 | Breakpoint and shell-fit quality | **4** | Stale + preview cues survive `compact` and `summary-collapsed → minimal`; CSS already mode-tunes spacing/typography. See `safety-field-excellence-breakpoint-and-host-fit-evidence.md`. |
| 8 | Interaction completeness | **4** | Hover-only meaning replaced with baseline chevron `›` indicator + focus-visible parity. Touch target ≥44px on `signalRow` (`min-height:52px` standard, 46px compact). No dead CTA paths. |
| 9 | State-model completeness | **4** | All 11 states tested (curated, dynamic-preview, dynamic-with-curated-fallback × {valid, no-published+curated, no-published+no-curated}, dynamic-only × {valid, no-published, stale, auth-error, network-error, invalid-payload}). See `safety-field-excellence-state-matrix.md`. |
| 10 | Contract, data, and backend seam rigor | **4** | Frontend calls only `GET /api/safety-field-excellence/homepage/current`. No admin/control-plane calls (grep-confirmed). No raw checklist / inspector / token leakage. No SharePoint raw-list aggregation. No MSAL. |
| 11 | Identity, media, and attribution quality | **4** | Confidence chip on every dynamic-published render; preview chip on every preview render; freshness caption on primary signal; aria-labels on chips; period label preserved through to surface. |
| 12 | Accessibility and keyboard behavior | **4** | `degradedNotice` icon + text (no color-only); stale chip text + Clock icon (no color-only); focus-visible outlines; `role="status"` on chips and degraded notice; baseline `›` chevron is icon-only and doesn't depend on hover; reduced-motion guards on transforms. |
| 13 | Host-runtime resilience | **3** | Code-confirmed via mode-aware logic + jsdom render tests. Hosted-runtime proof is owned by Prompt 07 and explicitly deferred. |
| 14 | Validation and closure proof | **4** | 52 Safety Field Excellence tests pass (42 Wave 05 + 10 Wave 06). Cross-impact `@hbc/features-safety` and `@hbc/functions` typechecks clean. Evidence docs filed under `docs/architecture/plans/MASTER/spfx/safety-public/evidence/`. |

**Total: 55/56**

## Hard-stop status

None.

- WCAG-relevant items (focus-visible, color-non-reliance, no hover-only meaning) are addressed.
- No fake-shell chrome; surface is the only thing rendered, scoped under one `<section>`.
- No generic enterprise card-grid posture; surface uses governed shared family.
- No dead CTAs; preview CTA only renders when `safetyHubUrl` is configured.
- Loading/empty/error/preview/stale states all have credible treatments.
- Premium stack is materially used (motion, lucide, clsx).

## Remaining exceptions

- **Cat. 13 host-runtime resilience capped at 3** — full hosted-runtime proof is owned by Prompt 07. Wave 06 evidence is code-confirmed via mode-aware logic + jsdom render tests, which is the right scope for this wave per the prompt.
- The backend timer's reporting-period resolution remains env-var-only (Wave 04 risk note); this is a **backend** concern and does not affect the SPFx surface score.

## Remediation summary

1. Color-only `degradedNotice` → icon + text via `AlertTriangle`.
2. Stale-meaning vanishing in compact/minimal → surface-level `Stale` chip with `Clock` icon, visible in all modes via `primaryHeaderEnd`.
3. Color-only severity in fallback states → distinct `fallbackReason` chip ("Live data temporarily unavailable", "Awaiting published weekly data", "Preview", "Authoring source") with `Eye` icon.
4. Preview fallback flat-gray filler → four indicator variants (info/success/warning/neutral) with category labels ("Example · Inspection", "Example · Exposure", "Example · Response", "Example · Trend").
5. Hover-only interactivity hint → baseline `›` chevron indicator (icon-only) with hover/focus reveal; reduced-motion safeguarded.
6. Missing `dataConfidence` UI surfacing → confidence chip in posture band (`high`/`medium`/`low` with Shield-family icons).
7. Missing primary freshness caption → "Published … · Fresh through …" caption derived from `freshness.updatedAt` / `expiresAt`.
