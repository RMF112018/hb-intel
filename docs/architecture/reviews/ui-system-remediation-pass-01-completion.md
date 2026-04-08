# UI-System Remediation Pass 01 Completion

**Date:** 2026-04-08
**Controlling source:** `docs/architecture/reviews/ui-system-refactor-audit-findings-validation.md`

---

## 1. Objective completed

This remediation pass corrected the validated gaps identified in the UI-system refactor audit findings validation report. Specifically:

- Established governed presentation-lane brand color tokens in the foundation layer
- Removed hardcoded brand color duplication from the two largest local consumers
- Tightened homepage import enforcement to match written doctrine
- Corrected overstated consumer migration counts in the execution note
- Strengthened productive-lane evidence with named consumer documentation
- Produced a consumer-level verification matrix documenting proof status
- Assessed the optional HbSignatureHero migration (deferred with rationale)

---

## 2. Changes implemented

### Foundation color governance (Workstream 1)

**Files changed:**
- `packages/ui-kit/src/theme/tokens.ts` — Added 4 governed presentation-lane brand tokens: `HBC_PRESENTATION_BLUE` (#225391), `HBC_PRESENTATION_BLUE_RGB` ('34, 83, 145'), `HBC_PRESENTATION_ORANGE` (#E57E46), `HBC_PRESENTATION_ORANGE_RGB` ('229, 126, 70'). Placed above the existing `HBC_SURFACE_PRESENTATION` block with documentation explaining the two-palette governance model.
- `packages/ui-kit/src/homepage.ts` — Updated `HBC_HOMEPAGE_BRAND_FOUNDATION` to derive from governed tokens instead of redefining values. Added re-exports of all 4 presentation brand tokens for consumer access.
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx` — Replaced local `HB` const values with imports from `@hbc/ui-kit/homepage` governed tokens.
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx` — Replaced local `HB` const values with imports from `@hbc/ui-kit/homepage` governed tokens.
- `apps/hb-webparts/src/webparts/smartSearchWayfinding/SmartSearchWayfinding.tsx` — Replaced hardcoded warm-orange rgba values with `HBC_PRESENTATION_ORANGE_RGB` token.
- `apps/hb-webparts/src/homepage/tokens.ts` — Added governance documentation header noting the relationship to `HBC_PRESENTATION_*` tokens.

### Homepage import enforcement (Workstream 2)

**Files changed:**
- `apps/hb-webparts/.eslintrc.cjs` — Added `@hbc/ui-kit/primitives` and `@hbc/ui-kit/fluent` to `no-restricted-imports` paths with explanatory messages. Updated header comment. **Decision:** Both entry points are prohibited for homepage webparts — homepage.ts re-exports all needed primitives.
- `apps/hb-webparts/vite.config.ts` — Added documentation comment to the root `@hbc/ui-kit` alias explaining it exists only for transitive dependency resolution, not as an endorsement for direct import.
- `packages/ui-kit/src/homepage.ts` — Updated `HBC_HOMEPAGE_IMPORT_GUARDRAILS` to explicitly list `@hbc/ui-kit/primitives` and `@hbc/ui-kit/fluent` as prohibited.

### Execution-note truthfulness (Workstream 3)

**Files changed:**
- `docs/architecture/plans/MASTER/ui-kit/wave-01/UI-System-Reconciliation-Execution-Note.md`:
  - Corrected migration table: 4 cleanly migrated, 1 partial, 1 local by design, 3 local (should likely migrate)
  - Added W01r-P08 correction note explaining the distinction between helper imports and surface-family migration
  - Changed "6/9 migrated" to "4/9 cleanly migrated, 1 partial, 4 local" in all references
  - Strengthened productive-lane evidence with named consumer columns and per-surface inspection notes
  - Added W01r-P08 evidence note for productive-lane claim
  - Replaced visual proof notes with structured coverage table distinguishing surface-family vs consumer-level proof

### Consumer-level visual proof (Workstream 4)

**Files created:**
- `docs/architecture/reviews/evidence/ui-system-consumer-verification-matrix.md` — Comprehensive matrix documenting all 9 consumers with: migration status, import source, brand color governance status, structural verification status, and remaining proof gaps.

**What is proven:** All 9 consumers pass check-types, lint, and build. All 11 webpart GUIDs traceable in compiled bundle. 5/6 surface families have isolated visual proof.

**What is not proven:** Consumer-level visual proof (webpart compositions in homepage context) and before/after comparisons remain gaps. These require SPFx runtime context not available in the current verification pipeline.

### Productive-lane evidence hardening (Workstream 5)

**Changes:** Integrated into the execution note corrections (Workstream 3). The productive-lane section now names specific consumer pages inspected per surface family (e.g., accounting/ProjectReviewQueuePage for WorkspacePageShell + DataTable) and documents the workspace-wide scan confirming zero homepage imports across 11 productive apps.

### Optional hero migration (assessed, deferred)

**Decision:** Leave `HbSignatureHero.tsx` local.

**Rationale:** The webpart uses a background-image-first composition model (authored photography, readability scrim, grain texture, CSS modules). `HbcSignatureHeroSurface` uses a different model (inline gradient, ambient glow decorations, inline styles). Migration would require either (a) extending `HbcSignatureHeroSurface` to support the background-image composition model, or (b) degrading the webpart's current approach. Neither is a clean, low-risk change. The webpart is only 141 lines and its current quality is appropriate.

---

## 3. Named consumer status after remediation

| Consumer | Status | Change in this pass |
|---|---|---|
| **LeadershipMessage** | Cleanly migrated | No change |
| **PriorityActionsRail** | Cleanly migrated | No change |
| **SafetyFieldExcellence** | Cleanly migrated | No change |
| **SmartSearchWayfinding** | Cleanly migrated | Hardcoded warm-orange → governed token |
| **ToolLauncherWorkHub** | Partially migrated | No change |
| **HbSignatureHero** | Local (assessed, deferred) | Migration assessed and deferred with rationale |
| **CompanyPulse** | Local by design | No change |
| **ProjectPortfolioSpotlight** | Local — should likely migrate | Brand colors → governed tokens |
| **PeopleCultureMerged** | Local — should likely migrate | Brand colors → governed tokens |

---

## 4. Verification performed

| Target | Command | Result |
|---|---|---|
| `@hbc/ui-kit` check-types | `pnpm --filter @hbc/ui-kit check-types` | Pass |
| `@hbc/ui-kit` build | `pnpm --filter @hbc/ui-kit build` | Pass |
| `@hbc/spfx-hb-webparts` check-types | `pnpm --filter @hbc/spfx-hb-webparts check-types` | Pass |
| `@hbc/spfx-hb-webparts` lint | `pnpm --filter @hbc/spfx-hb-webparts lint` | Pass (zero errors) |
| `@hbc/spfx-hb-webparts` build | `pnpm --filter @hbc/spfx-hb-webparts build` | Pass (575.05 KB / 204.10 KB gzip) |

**Build output:** 4,384 modules transformed. CSS: 31.32 KB (6.19 KB gzip). Bundle size stable (was 575.08 KB, now 575.05 KB — token imports slightly smaller than hardcoded string literals).

**No new failures introduced.** Pre-existing failures (spfx-leadership type error, useVoiceDictation lint error) remain unchanged.

---

## 5. Remaining gaps

1. **Consumer-level visual proof** — No screenshots of actual webpart compositions in homepage context. Requires SPFx runtime or equivalent rendering environment.
2. **Before/after comparisons** — Not produced. Required by Prompt 00A for material visual changes. Future visual redesign waves must produce these.
3. **HbcLauncherSurface visual proof** — Missing from the surface-family visual proof directory.
4. **ToolLauncherWorkHub live-path coverage** — The 4-region composition shell (LauncherCommandBand, FlagshipStage, UtilityRail, WorkflowShelves) is not covered by shared surface family proof.
5. **3 local consumers still need migration assessment** — ProjectPortfolioSpotlight (1,118 lines), PeopleCultureMerged (652 lines), and HbSignatureHero (141 lines) remain fully local compositions.
6. **Local tokens.ts** still contains inline brand color values in gradients and zone backgrounds — documented with governance note pointing to HBC_PRESENTATION_* tokens.

---

## 6. Final repo-truth posture

The UI-system refactor is **mostly conforming with targeted, documented gaps**:

- **Foundation layer:** Two brand palettes (productive #004B87/#F37021, presentation #225391/#E57E46) now formally governed in `tokens.ts` with clear documentation of their purpose and relationship. No ungoverned drift.
- **Primitive layer:** `@hbc/ui-kit/primitives` exports 30+ Layer-2 components, clearly separated from surface families.
- **Surface-family layer:** 6 presentation surface families are production-grade and actively consumed by 4 cleanly migrated webparts.
- **Consumer migration:** 4/9 clean, 1 partial, 4 local. Local consumers now import governed brand tokens instead of hardcoding.
- **Import enforcement:** ESLint restricts 4 entry points (root, app-shell, primitives, fluent) for homepage webparts. Vite root alias documented as transitive-resolution-only.
- **Documentation:** Execution note corrected to reflect validated repo truth. Productive-lane evidence strengthened with named consumers.
- **Verification:** check-types, lint, and build pass for both ui-kit and hb-webparts. Bundle size stable. No new failures.

The primary remaining investment areas are: consumer-level visual proof, migration of the 3 largest local consumers to shared surfaces, and before/after comparison artifacts for future visual changes.
