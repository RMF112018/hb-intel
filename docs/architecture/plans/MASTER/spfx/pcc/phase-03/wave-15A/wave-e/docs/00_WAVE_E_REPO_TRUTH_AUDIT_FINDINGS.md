# 00 — Wave E Repo-Truth Audit Findings


## Repo-Truth Evidence Baseline

Audited repository: `RMF112018/hb-intel`  
Remote snapshot observed in GitHub search results: `6b9f3fc4608f95ae728f94aba4999e6cd15491e4`  
Audit date: 2026-05-05

Confirmed source and documentation references:

- `apps/project-control-center/src/ui/PccPreviewState.tsx`
- `apps/project-control-center/src/ui/PccDisabledAffordance.tsx`
- `apps/project-control-center/src/ui/pccSurfacePostureCopy.ts`
- `apps/project-control-center/src/api/pccReadModelStateMapping.ts`
- `apps/project-control-center/src/tests/PccPreviewState.states.test.tsx`
- `apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/layout/PccDashboardCard.tsx`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/README.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/06_STATE_MODEL_AND_CONTENT_LANGUAGE_STANDARD.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-05/PROMPT_05_CLOSEOUT.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-06/PROMPT_06_CLOSEOUT.md`
- `docs/reference/ui-kit/standards/SPFx-State-Model-Standard.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

Important repo-truth note:

The repository already contains a Wave 15A Prompt 05 closeout that claims the state-model and product-language remediation was implemented and validated for `@hbc/spfx-project-control-center` with passing `tsc --noEmit`, test, and Prettier checks. This package therefore instructs the local code agent to begin with verification and hardening. If the local worktree does not include the Prompt 05 changes, execute these prompts as staged implementation prompts.


## Audit Scope

The audit targeted PCC preview, read-only, degraded, unavailable, blocked, setup-required, disabled-action, empty, loading, and error-state behavior and language. It used the uploaded Wave E prompt as the controlling scope and repo truth as the authority.

## Confirmed Prior Wave Inputs

| Wave / Prompt | Repo-truth status | Finding |
|---|---|---|
| Wave 15A top-level guide | Present | Defines Wave 15A as a product-readiness correction wave aimed at evidence-backed 56/56, with state model after shell/header/layout remediation. |
| Wave B / shell-host-nav package | Present under `wave-b/` | Prompt packages exist; local agent must verify implementation closeouts before Wave E changes. |
| Wave C / surface context package | Present under `wave-c/` | Shared `PccSurfaceContextHeader` exists and is consumed by current surfaces. |
| Wave D / card-layout primitive work | No dedicated `wave-d/` package found in the search result set, but runtime primitives exist | `PccDashboardCard`, `PccBentoGrid`, footprint helpers, and row-span logic exist and are referenced by Prompt 06 closeout. |
| Wave E implementation closeout | Present as Wave 15A Prompt 05 closeout | Repo claims product language and state remediation landed before this package was generated. |
| Prompt 06 first-impression remediation | Present | Uses shared state primitives, posture copy, and disabled-affordance helper already landed in Prompt 05. |

## Confirmed State Components and Utilities

| Area | Confirmed files | Current posture |
|---|---|---|
| State display primitive | `apps/project-control-center/src/ui/PccPreviewState.tsx` | Eight-state catalog: `preview`, `empty`, `loading`, `error`, `missing-config`, `unavailable-fixture`, `unauthorized-persona`, `not-yet-implemented-operation`. Supports `reason` and `nextStep`. |
| State tests | `apps/project-control-center/src/tests/PccPreviewState.states.test.tsx` | Exact-string assertions exist for all eight state specs; loading uses `aria-busy`; error uses `role="alert"`; `reason` / `nextStep` slots are covered. |
| Read-model mapping | `apps/project-control-center/src/api/pccReadModelStateMapping.ts` | Maps `PccReadModelSourceStatus` to existing preview-state states. `source-unavailable` still maps to `unavailable-fixture`, preserving an internal state key with fixture vocabulary. |
| Disabled controls | `apps/project-control-center/src/ui/PccDisabledAffordance.tsx` | Inert `<button>` with `aria-disabled="true"`, required visible reason, optional next step, and `aria-describedby`. |
| Surface posture copy | `apps/project-control-center/src/ui/pccSurfacePostureCopy.ts` | Centralized header posture labels for `reference`, `loading`, `error`, `unavailable`; comments document that prior developer vocabulary was removed. |
| Documents source messages | `apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts` | Lane-specific product copy exists for source health, disabled sources, and envelope status. |
| Surface router fallback | `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` | Fallback still renders `PccPreviewState state="unavailable-fixture"` for unknown/fallback surface IDs. |
| Card primitive | `apps/project-control-center/src/layout/PccDashboardCard.tsx` | Emits footprint/hierarchy/data markers and supports active-surface panel ownership without wrappers. |

## Confirmed Product-Language Improvements Already Present

- `PccPreviewState` no longer uses developer-facing default titles such as "fixture-driven" or "preview content not available."
- `PccDisabledAffordance` requires a user-facing `reason`.
- `pccSurfacePostureCopy` centralizes header posture language.
- Documents source-state messages explain source health, configuration, access, throttling, and unavailable conditions.
- Prompt 05 closeout reports zero user-visible hits for forbidden strings across source scans, excluding tests/comments/internal type literals.
- Prompt 05 closeout reports tests for state catalog, disabled affordance, Documents source-state messaging, Approvals disabled action reasons, and Project Home priority rail.

## Confirmed Remaining Risk Areas

| Risk | Evidence | Required local-agent treatment |
|---|---|---|
| Internal state keys retain developer vocabulary | `unavailable-fixture` remains in `PccPreviewState` and read-model mapping | Do not rename blindly. Verify whether the key leaks into DOM/data attributes, tests, analytics, or user-facing diagnostics. Consider aliasing to `unavailable` while preserving backward-compatible mapping. |
| Current state taxonomy is narrower than the Wave E target taxonomy | Current primitive has 8 states; target prompt defines 10 state kinds including `live`, `readOnly`, `degraded`, `blocked`, `setupRequired`, `unavailable` | Determine whether current 8-state catalog is sufficient after Prompt 05 or whether a wrapper/model should normalize target kinds to display specs. |
| Product language uses "Reference view" heavily | `PccPreviewState` and `pccSurfacePostureCopy` use "Reference view" / "Reference content" | Product-owner review may be needed to decide whether "Sample data mode" is clearer for executives. |
| Screenshot evidence remains operator-pending | Prompt 05 and Prompt 06 closeouts defer screenshots and tenant validation | Prompt 06 or later must capture evidence before any 56/56 claim. |
| Tenant-hosted evidence absent for this wave | Prompt 05/06 closeouts explicitly defer tenant evidence | Must not claim final readiness. |
| Fallback router still renders generic unavailable state | `PccSurfaceRouter` fallback uses `unavailable-fixture` with only `surface.description` | Agent must verify this fallback is not reachable in normal navigation or upgrade it to a full operational fallback with reason and next step. |

## Confirmed Findings Against Required Issues

| Required issue from assignment | Current repo-truth finding |
|---|---|
| Preview/read-only/no-live-data language too developer-facing | Prompt 05 reports remediation completed; verify local branch grep. |
| Generic unavailable states dominate surfaces | Prompt 05 likely reduced this; router fallback and unavailable cards still require verification. |
| Disabled controls not consistently explained | `PccDisabledAffordance` exists; local agent must enforce usage across all inert controls. |
| Build/wave/fixture diagnostics occupy primary hierarchy | Prompt 05 reports zero user-visible `Wave` / `Prompt` hits in source scans; local agent must rerun grep locally. |
| State messages do not explain what is available, disabled, why, next | `reason` / `nextStep` slots exist but may not be used everywhere; enforce matrix. |
| Approvals and External Systems may rely on placeholders | Prompt 05 changed Approvals and External Systems; verify surface-specific cards. |
| Documents may not communicate source availability/binding | `sourceStateMessaging.ts` now does this; verify all lane cards consume it. |
| Site Health and Readiness severity may not be explicit | Prompt 05 touched Site Health and Readiness; verify severity tokens and copy. |

## Audit Conclusion

Wave E appears substantially implemented in current repo truth, but not finally closed as evidence-backed flagship readiness. The local agent should not re-implement from scratch. It should verify the current implementation, close any taxonomy gaps, ensure every surface consumes shared state/product-language primitives, produce missing screenshot/accessibility evidence, and prepare a Wave E closeout that avoids 56/56 overclaiming.
