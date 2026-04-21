# UI System Visual Proof — Closure Note

**Date:** 2026-04-21  
**Closes:** Safety homepage state-matrix visual proof gap after rebuild  
**Evidence location:** `docs/architecture/reviews/evidence/ui-system-visual-proof/`

---

## Closure Scope

The rebuilt Safety consumer now renders `HbcSafetyHomepageSurface` (`apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx`), so proof for safety closure must target Safety stories directly, not only the legacy `HbcOperationalSurface` family.

This closure captures decisive proof for:

- `standard`
- `compact`
- `minimal`
- `one-primary-signal`
- `multiple-active-signals`
- `stale-content`
- `empty-state-applicable`
- `invalid-state-applicable`
- `runtime-error-state-applicable`

All states were captured in both desktop (1280) and tablet (768) widths via the repository-preferred Playwright capture workflow.

---

## Exact Routes Used

All screenshots used Storybook iframe routes with this pattern:

- `/iframe.html?id=<story-id>&viewMode=story`

Exact Safety routes:

- `/iframe.html?id=homepage-surfaces-hbcsafetyhomepagesurface--standard&viewMode=story`
- `/iframe.html?id=homepage-surfaces-hbcsafetyhomepagesurface--compact&viewMode=story`
- `/iframe.html?id=homepage-surfaces-hbcsafetyhomepagesurface--minimal&viewMode=story`
- `/iframe.html?id=homepage-surfaces-hbcsafetyhomepagesurface--one-primary-signal&viewMode=story`
- `/iframe.html?id=homepage-surfaces-hbcsafetyhomepagesurface--multiple-active-signals&viewMode=story`
- `/iframe.html?id=homepage-surfaces-hbcsafetyhomepagesurface--stale-content&viewMode=story`
- `/iframe.html?id=homepage-surfaces-hbcsafetyhomepagesurface--empty-state-applicable&viewMode=story`
- `/iframe.html?id=homepage-surfaces-hbcsafetyhomepagesurface--invalid-state-applicable&viewMode=story`
- `/iframe.html?id=homepage-surfaces-hbcsafetyhomepagesurface--runtime-error-state-applicable&viewMode=story`

---

## State Validation Notes

| State | Artifacts | Validation claim |
|---|---|---|
| `standard` | `HbcSafetyHomepageSurface--desktop.png`, `HbcSafetyHomepageSurface--tablet.png` | Confirms baseline hierarchy and safety posture structure are deliberate, not a generic lane card. |
| `compact` | `HbcSafetyHomepageSurface-compact--desktop.png`, `HbcSafetyHomepageSurface-compact--tablet.png` | Confirms compact mode trims content intentionally and preserves premium structure at narrower slot pressure. |
| `minimal` | `HbcSafetyHomepageSurface-minimal--desktop.png`, `HbcSafetyHomepageSurface-minimal--tablet.png` | Confirms summary-collapsed behavior maps to minimal signal-first posture without visual stress. |
| `one-primary-signal` | `HbcSafetyHomepageSurface-one-primary-signal--desktop.png`, `HbcSafetyHomepageSurface-one-primary-signal--tablet.png` | Confirms primary-only state remains coherent with no secondary clutter. |
| `multiple-active-signals` | `HbcSafetyHomepageSurface-multiple-active-signals--desktop.png`, `HbcSafetyHomepageSurface-multiple-active-signals--tablet.png` | Confirms severity hierarchy and scanability under denser active signal conditions. |
| `stale-content` | `HbcSafetyHomepageSurface-stale-content--desktop.png`, `HbcSafetyHomepageSurface-stale-content--tablet.png` | Confirms stale/freshness risk is explicitly communicated through degraded notice and stale badges. |
| `empty-state-applicable` | `HbcSafetyHomepageSurface-empty-state--desktop.png`, `HbcSafetyHomepageSurface-empty-state--tablet.png` | Confirms empty/no-signal posture is intentional and does not collapse into broken shell rendering. |
| `invalid-state-applicable` | `HbcSafetyHomepageSurface-invalid-state--desktop.png`, `HbcSafetyHomepageSurface-invalid-state--tablet.png` | Confirms invalid authoring is presented as a guided degraded posture with recovery CTA. |
| `runtime-error-state-applicable` | `HbcSafetyHomepageSurface-runtime-error-state--desktop.png`, `HbcSafetyHomepageSurface-runtime-error-state--tablet.png` | Confirms runtime disruption remains bounded with explicit fallback and operator path. |

---

## Doctrine and Anti-Regression Assessment

Against governing doctrine and homepage overlay:

- The Safety proof now targets the rebuilt Safety surface family directly.
- The captured modes show purposeful posture band + dominant primary lane + bounded secondary lane structure.
- No captured state regresses into thin-border generic card-grid posture as dominant structure.
- Narrow/compact behavior is represented as selective reduction, not compressed duplication of the full desktop payload.

---

## Checklist and Scorecard Closure Gate

Materially improved checklist categories in touched scope:

- `0. Doctrine preflight`
- `1. Doctrine and host compliance`
- `5. Surface composition and hierarchy`
- `6. Homepage-specific integration quality`
- `7. Breakpoint and shell-fit quality`
- `9. State-model completeness`
- `14. Validation and closure`

Categories still below acceptable threshold in touched scope:

- `13. Host-runtime resilience` remains partially unproven because evidence is Storybook/component-level and not packaged SharePoint-hosted capture for these new Safety state variants.

Scorecard impact note:

- Improves homepage integration quality for Safety proof from weak/partial toward strong by replacing single-state narrow proof with an explicit multi-state, multi-width matrix.

Remaining hard-stop risks for full closure:

- Hosted runtime screenshots for the same Safety matrix are still absent.
- Interactive a11y path proof (focus/keyboard flow) is not represented by static screenshots alone.

---

## Capture Method

- **Tool:** Playwright (Chromium) against static Storybook build
- **Script:** `scripts/capture-visual-proof.ts` + `scripts/capture-visual-proof.config.ts`
- **Viewports:** `1280x900` and `768x900`
- **Animation settle:** `800ms` after network idle
- **Execution date run:** 2026-04-21 (`29` tests passed)
