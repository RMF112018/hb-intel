# UI-System Consumer-Level Verification Matrix

**Date:** 2026-04-08
**Scope:** W01r-P08 — Named consumer verification against shared surface family adoption

---

## Purpose

This matrix documents consumer-level verification status for all 9 named homepage webpart consumers. It distinguishes surface-family-level proof (isolated component screenshots) from consumer-level proof (actual webpart composition behavior).

---

## Consumer Verification Matrix

| # | Consumer | Shared Surface | Migration Status | Import Source | Brand Color Governance | Structural Verification | Notes |
|:---:|---|---|---|---|---|---|---|
| 1 | **LeadershipMessage** | `HbcEditorialSurface` | Cleanly migrated | `@hbc/ui-kit/homepage` | N/A — no brand colors used | check-types pass, lint pass, build pass | 86 lines; fully delegates surface grammar |
| 2 | **PriorityActionsRail** | `HbcCommandSurface` | Cleanly migrated | `@hbc/ui-kit/homepage` | N/A — no brand colors used | check-types pass, lint pass, build pass | 100 lines; pure mapping layer |
| 3 | **SafetyFieldExcellence** | `HbcOperationalSurface` | Cleanly migrated | `@hbc/ui-kit/homepage` | N/A — no brand colors used | check-types pass, lint pass, build pass | 132 lines; pure mapping layer |
| 4 | **SmartSearchWayfinding** | `HbcDiscoverySurface` | Cleanly migrated | `@hbc/ui-kit/homepage` | Governed (W01r-P08) — `HBC_PRESENTATION_ORANGE_RGB` | check-types pass, lint pass, build pass | 166 lines; custom search slot uses governed warm-orange token |
| 5 | **ToolLauncherWorkHub** | `HbcLauncherSurface` (fallback) | Partially migrated | `@hbc/ui-kit/homepage` | N/A — delegates to child components | check-types pass, lint pass, build pass | 214 lines; live path uses 4-region composition shell |
| 6 | **HbSignatureHero** | None | Local | `@hbc/ui-kit/homepage` (motion), `@hbc/ui-kit/branding` | N/A — uses CSS modules | check-types pass, lint pass, build pass | 141 lines; CSS-module composition with background-image system |
| 7 | **CompanyPulse** | None | Local by design | `@hbc/ui-kit/homepage` (helpers) | Delegates to local newsroom CSS modules | check-types pass, lint pass, build pass | 167 lines; specialized 3-mode newsroom system |
| 8 | **ProjectPortfolioSpotlight** | None | Local | `@hbc/ui-kit/homepage` (helpers + governed tokens) | **Governed (W01r-P08)** — imports `HBC_PRESENTATION_*` tokens | check-types pass, lint pass, build pass | 1,118 lines; brand colors now from governed source |
| 9 | **PeopleCultureMerged** | None | Local | `@hbc/ui-kit/homepage` (helpers + governed tokens) | **Governed (W01r-P08)** — imports `HBC_PRESENTATION_*` tokens | check-types pass, lint pass, build pass | 652 lines; brand colors now from governed source |

---

## Verification Evidence

### Structural verification (all 9 consumers)

All 9 consumers verified via:
- `pnpm --filter @hbc/ui-kit check-types` — pass
- `pnpm --filter @hbc/ui-kit build` — pass
- `pnpm --filter @hbc/spfx-hb-webparts check-types` — pass
- `pnpm --filter @hbc/spfx-hb-webparts lint` — pass (zero errors, zero warnings)
- `pnpm --filter @hbc/spfx-hb-webparts build` — pass (575.05 KB / 204.10 KB gzip)

### Build traceability (all 11 webparts)

All 11 webpart GUIDs verified in compiled bundle via manifest → `mount.tsx` → component → `dist/hb-webparts-app.js` chain. See `hb-webparts-multi-webpart-packaging-verification.md` for full matrix.

### Surface-family visual proof (5/6 families)

Screenshots exist in `docs/architecture/reviews/evidence/ui-system-visual-proof/` for:
- HbcSignatureHeroSurface (desktop, tablet, compact)
- HbcEditorialSurface (desktop, tablet)
- HbcCommandSurface (desktop, tablet, high-urgency, critical-urgency)
- HbcDiscoverySurface (desktop, tablet)
- HbcOperationalSurface (desktop, tablet)

**Missing:** HbcLauncherSurface visual proof.

### Consumer-level visual proof

Consumer-level visual proof (actual webpart compositions in homepage context) was **not produced** in this pass. This remains a gap relative to Prompt 08 requirements.

**Why:** Consumer-level visual proof requires rendering actual webpart compositions with SPFx runtime context, which is not available in the current verification pipeline. Surface-family-level proof demonstrates that the shared components render correctly; consumer-level proof would additionally demonstrate correct data wiring and composition layout.

---

## Brand Color Governance Status After W01r-P08

| Consumer | Before W01r-P08 | After W01r-P08 |
|---|---|---|
| ProjectPortfolioSpotlight | Locally hardcoded `#225391`/`#E57E46` | Imports `HBC_PRESENTATION_BLUE`/`HBC_PRESENTATION_ORANGE` from `@hbc/ui-kit/homepage` |
| PeopleCultureMerged | Locally hardcoded `#225391`/`#E57E46` | Imports `HBC_PRESENTATION_BLUE`/`HBC_PRESENTATION_ORANGE` from `@hbc/ui-kit/homepage` |
| SmartSearchWayfinding | Locally hardcoded `rgba(229, 126, 70, ...)` | Uses `HBC_PRESENTATION_ORANGE_RGB` from `@hbc/ui-kit/homepage` |
| All other consumers | No local brand colors / delegates to shared surfaces | Unchanged |

---

## Remaining Gaps

1. **Consumer-level visual proof** for all 9 consumers — requires SPFx runtime or equivalent rendering context
2. **Before/after comparison screenshots** per Prompt 00A — requires pre-refactor baseline captures
3. **HbcLauncherSurface** surface-family visual proof — missing from the visual-proof directory
4. **ToolLauncherWorkHub** live-path verification — the 4-region composition shell is not covered by shared surface family proof
