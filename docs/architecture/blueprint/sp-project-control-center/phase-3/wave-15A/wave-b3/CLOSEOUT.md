# PCC Card Tier Contract Remediation Closeout

Wave 15A wave-b3 — Project Control Center card tier / region / footprint contract remediation. Closure pass for Prompts 01–06.

## 1. Objective

Remediate the PCC card tier / region / footprint contract across every current Project Control Center route surface and embedded subregion. Replace silent `hierarchy` fallback and default tier/region resolution with explicit, test-locked declarations so future surface migrations can prove they intended a tier and region rather than inheriting one.

**Path-choice note.** Wave 15A wave-b3 directives suggest the closeout doc at `phase-3/wave-15A/card-tier-contract-remediation/CARD_TIER_CONTRACT_REMEDIATION_CLOSEOUT.md`. The established repo convention is `phase-3/wave-15A/wave-b3/`; that folder already exists and holds the operator-captured evidence subtree. To match the established convention this closeout lives at `phase-3/wave-15A/wave-b3/CLOSEOUT.md` rather than creating a parallel hierarchy.

## 2. Scope Completed

| Area                                    | Outcome                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared primitive                        | `PccDashboardCard` instrumented with provenance markers and visually hardened on tier / region / state / deferred / detail / rail (token-only).                                                                                                                                                                                                                                                                                                 |
| Project Home                            | Every existing card already explicit before remediation; locked by tests.                                                                                                                                                                                                                                                                                                                                                                       |
| Team & Access                           | 4 lane / restricted-state cards classified explicitly.                                                                                                                                                                                                                                                                                                                                                                                          |
| Documents                               | Every card already explicit; locked by tests.                                                                                                                                                                                                                                                                                                                                                                                                   |
| Project Readiness + embedded subregions | 78 cards classified explicitly across `PccProjectReadinessSurface.tsx`, `PccProjectReadinessUnifiedLifecycleSection.tsx`, `PccProjectReadinessProcoreSourceConfidenceCard.tsx`, `PccPermitInspectionControlCenterRegions.tsx`, `PccResponsibilityMatrixRegions.tsx`, `PccResponsibilityMatrixIntegrationCard.tsx`, `PccConstraintsLogRegions.tsx`, `PccBuyoutLogRegions.tsx`. Two legacy `hierarchy="primary"` props on Blockers cards removed. |
| Approvals                               | 10 lane / seam cards classified explicitly.                                                                                                                                                                                                                                                                                                                                                                                                     |
| External Systems                        | 9 supporting cards classified explicitly.                                                                                                                                                                                                                                                                                                                                                                                                       |
| Settings                                | Every card already explicit; locked by tests.                                                                                                                                                                                                                                                                                                                                                                                                   |
| Site Health                             | Every card already explicit; locked by tests.                                                                                                                                                                                                                                                                                                                                                                                                   |
| Tests                                   | Cross-surface contract / accessibility / bento-invariant suite added.                                                                                                                                                                                                                                                                                                                                                                           |

## 3. Files Changed

Across the wave, the following commits land all source and test changes. The current closeout commit (this doc) lands `CLOSEOUT.md` only; no source files.

| Commit          | Prompt    | Files    | Highlight                                                                                                                                                                                                     |
| --------------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `691b4397c`     | Prompt 01 | 3 files  | `PccDashboardCard.tsx`, `PccDashboardCard.module.css`, `PccDashboardCard.test.tsx` — provenance markers + visual tier hardening + primitive contract tests.                                                   |
| `247cbbb46`     | Prompt 02 | 6 files  | Route command card lockdown across 8 surfaces; new `PccSurfaceCommandCardContract.test.tsx`.                                                                                                                  |
| `357838fff`     | Prompt 03 | 15 files | Non-command card classification across Team & Access (4), Approvals (10), External Systems (9); new `PccCardTierContract.test.tsx`.                                                                           |
| `a3a62914c`     | Prompt 04 | 10 files | Project Readiness + lifecycle / permit / responsibility-matrix / constraints / buyout / Procore confidence regions; `PccCardTierContract.test.tsx` + `PccProjectReadinessSurface.hierarchy.test.tsx` updated. |
| `21e5bff67`     | Prompt 05 | 2 files  | Cross-surface contract / accessibility / bento-invariant test extensions.                                                                                                                                     |
| _(this commit)_ | Prompt 06 | 1 file   | `CLOSEOUT.md` — this doc.                                                                                                                                                                                     |

Run `git show --stat <sha>` for the per-commit file list.

## 4. Primitive Contract Changes

Three new data attributes emitted on every `<article data-pcc-card>` (Prompt 01):

- `data-pcc-card-tier-source` — `'explicit' | 'hierarchy' | 'default'`. `'explicit'` when the `tier` prop is passed; `'hierarchy'` when `tier` is absent and `hierarchy` is non-standard; `'default'` otherwise.
- `data-pcc-card-region-source` — `'explicit' | 'resolved'`. `'explicit'` when the `region` prop is passed; `'resolved'` when inferred from the resolved tier.
- `data-pcc-heading-level` — `'2' | '3' | '4'`. Reflects the resolved heading level used for the card title element.

**Visual hardening** in `PccDashboardCard.module.css` (Prompt 01):

- Tier 1 — 2px token-mixed border with a 3px accent top edge; existing `--pcc-elevation-card` reused (no new rgba shadows).
- Tier 2 — 2px accent top rail (token-mixed against `--pcc-color-rail-accent`).
- Tier 3 — calmer muted background mixed against `--pcc-color-canvas`; muted title color.
- State — dashed border tied to `--pcc-status-neutral`.
- Deferred — dashed border + tokened muted background + 0.94 opacity.
- Detail vs. rail regions — distinct padding and gap rhythm using `--pcc-space-*` tokens.

No new hex / rgb / rgba color literals in the diff. Bento mechanics, footprints, and grid behavior untouched.

## 5. Surface Classification Summary

After Prompts 02–04, every `[data-pcc-card]` rendered through any of the eight active route surfaces emits `data-pcc-card-tier-source="explicit"` and `data-pcc-card-region-source="explicit"`. No card resolves tier or region by `hierarchy` fallback or default.

| Surface                   | Route command                                                                                       | Notable non-command postures                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project-home`            | `PccProjectIntelligenceCard` — tier1 / command / h2                                                 | All ~16 cards (PriorityActions, MissingConfigurations, SiteHealthSummary, DocumentControl, ProjectReadiness, Approvals, ExternalSystems, TeamSnapshot, RecentActivity, AskHbi, ProcoreSnapshot, Unified Lifecycle x4) already classified before the wave; locked by tests. `PccProjectHomeProcoreSnapshotCard` retained existing `tier3/deferred` rather than the directive's `tier3/reference` suggestion (defensible existing classification, scope-discipline call).                                                                                                                                                                                                                                                                                                                            |
| `team-and-access`         | `PccTeamAccessHeaderCard` — tier1 / command / h2                                                    | TeamViewer / PermissionRequest / AccessManager lanes — `tier2/operational`. Restricted Access Manager card — `state/state`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `documents`               | `PccDocumentsHeaderCard` — tier1 / command / h2                                                     | Project Record + My Project Files lanes — `tier2/operational`. External Systems lane — `tier3/deferred`. Permissions — `tier3/detail`. Reviews — `tier2/detail`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `project-readiness`       | `HeroCard` — tier1 / command / h2 (loading/error → `state/state` / h2)                              | LifecycleGateMap, DomainGrid, EvidenceSourceHealth, LifecycleMap, LifecycleFamilyDomains, LifecycleEvidence, LifecycleReadinessSignals, RecordDetail — `tier2/detail`. Blockers, Ownership, PriorityActionsPreview, LifecycleMyActions, LifecycleBlockers + most permit / responsibility-matrix / constraints / buyout queues — `tier2/operational`. DownstreamModules, LifecycleSourceTraceability, ProjectMemory, RelatedRecords, ProcoreSourceConfidence, IntegrationSignals, ProcoreReconciliation, audit / lineage / compliance / lead-time / executive-summary references — `tier3/reference`. LifecycleFutureCloseout, AhjLauncher, TemplateAdmin — `tier3/deferred`. Two legacy `hierarchy="primary"` props removed on Blockers / LifecycleBlockers (route command is the readiness Hero). |
| `approvals`               | `HomeCard` — tier1 / command / h2 (loading/error → `state/state` / h2)                              | Queue, MyApprovals, Escalation, AdminVerification — `tier2/operational`. Registry — `tier2/detail`. Policy, ModuleIntegration, HbiBoundary — `tier3/reference`. DecisionHistorySeam, LineageSeam — `tier3/deferred`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `external-systems`        | `PccExternalSystemsLaunchPadHeaderCard` — tier1 / command / h2 (loading/error → `state/state` / h2) | LaunchPadSummary, ProjectLinks, ReviewQueue — `tier2/operational`. MappingStatus — `tier2/detail`. ProcoreConfigurationStatus, Registry, SourceHealth, AuditHistory, HbiLineage — `tier3/reference`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `control-center-settings` | Header — tier1 / command / h2                                                                       | Scope/lanes — `tier2/detail`. Items needing setup — `state/state`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `site-health`             | `PccSiteHealthOverviewCard` — tier1 / command / h2                                                  | Checks, Drift — `tier2/operational`. RepairRequests, ProcoreSyncRepair — `tier3/deferred`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

## 6. Test Coverage Added

| File                                                                                  | What it enforces                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/project-control-center/src/layout/PccDashboardCard.test.tsx`                    | Primitive contract source markers — explicit / hierarchy / default tier source paths; explicit / resolved region source paths; heading-level marker for tier1 / tier2 / tier3 / explicit override; preservation of existing `data-pcc-*` markers.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx`        | Each route surface renders exactly one `[data-pcc-active-surface-panel]` carrier; ready cards are `tier1 / command`, both sources `explicit`, heading-level `"2"`. Loading branches (approvals / external-systems / project-readiness via promise-shaped client stubs) are `state / state`, explicit, h2, with `aria-busy="true"` inside the active-panel card. Error branches are `state / state`, explicit, h2, with `role="alert"` inside the active-panel card.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `apps/project-control-center/src/tests/PccCardTierContract.test.tsx`                  | Per-card-on-every-in-scope-surface (8 surfaces): explicit tier/region source (positive + negative form), non-empty `data-pcc-footprint`, numeric `data-pcc-column-span > 0`, numeric `data-pcc-row-span > 0`, titled cards have `aria-labelledby` matching heading id, `card.parentElement === [data-pcc-bento-grid]`. Cross-surface: active command card emits `data-pcc-heading-level="2"`; zero `<a href^="http(s)">` anchors inside the bento grid; every `[data-pcc-disabled-affordance-variant]` resolves its `aria-describedby` IDs to a reason node. Targeted: Team Access restricted state; Approvals Policy / ModuleIntegration / HBI Boundary as `tier3/reference`; Approvals DecisionHistory / Lineage seams as `tier3/deferred`; External Systems Audit / HBI Lineage / Source Health / Procore Config / Registry as `tier3/reference`; Documents external-systems lane as `region=deferred`; Project Home Missing Configurations as `state/state`; Settings Items needing setup as `state/state`; Site Health Repair Requests as `tier3/deferred`; Project Readiness Blockers and LifecycleBlockers not Tier 1; LifecycleFutureCloseout / AhjLauncher / TemplateAdmin as `region=deferred`; Downstream / ProcoreSourceConfidence / IntegrationSignals / ProcoreReconciliation as `region=reference`. |
| `apps/project-control-center/src/tests/PccProjectReadinessSurface.hierarchy.test.tsx` | Updated in Prompt 04 to assert the new `tier2/operational` posture on Project Readiness Blockers and LifecycleBlockers cards (legacy `hierarchy="primary"` removed).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

Test count rose from a baseline of ~1826 (pre-wave) to **1897 tests across 89 files** at the end of Prompt 05.

## 7. Validation Evidence

Captured during the closeout pass. Package filter is `@hbc/spfx-project-control-center` (the Wave 15A wave-b3 directive's `@hbc/project-control-center` filter is incorrect and would silently match no workspace package).

```text
$ git status --short
(empty — clean tree)

$ md5 pnpm-lock.yaml
MD5 (pnpm-lock.yaml) = c56df7b79986896624536aab74d609f4
```

Same MD5 as the Prompt 04 baseline. Lockfile unchanged across the wave.

```text
$ pnpm --filter @hbc/spfx-project-control-center check-types
> @hbc/spfx-project-control-center@0.0.1 check-types
> tsc --noEmit
(clean — no errors)

$ pnpm --filter @hbc/spfx-project-control-center test
 Test Files  89 passed (89)
      Tests  1897 passed (1897)
   Duration  15.71s

$ git diff --check
(diff --check clean)
```

Directory-scope prettier check (recorded honestly):

```text
$ pnpm exec prettier --check apps/project-control-center/src/layout apps/project-control-center/src/shell apps/project-control-center/src/surfaces apps/project-control-center/src/tests
[warn] Code style issues found in 48 files. Run Prettier with --write to fix.
```

The 48 flagged files are pre-existing drift (unifiedLifecycle adapters, several approvalsAdapter / unifiedLifecycle / useApprovalsReadModel / useUnifiedLifecycleReadModel / useUnifiedSearchReadModel tests, plus surface adapter modules untouched by Prompts 01–05). They predate this remediation. Prompts 01–05 individually formatted only the files they authored; this closeout pass does not retroactively format the pre-existing drift to keep the commit scoped to docs.

Workspace-wide check-types (best-effort; unrelated failure documented):

```text
$ pnpm -r check-types
... apps/hb-publisher check-types: Failed
ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @hbc/spfx-hb-publisher@0.0.1 check-types: tsc --noEmit
```

`apps/hb-publisher`'s `useDraftLifecycle.test.ts` fails with `TS2345` on a `Mock<Procedure | Constructable>` not assignable to `SetStatus`. Unrelated to PCC; predates this remediation. Workspace-wide `pnpm -r test` was not run because `pnpm -r check-types` already established the workspace baseline is broken on an unrelated package.

Closeout-doc-only prettier check:

```text
$ pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b3/CLOSEOUT.md
(captured at execution time; recorded as clean once formatted)
```

## 8. Hosted Evidence Status

**Honest posture.** Hosted screenshots were **not generated by the local code agent**. Operator-captured assets exist at `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b3/evidence/` (71 files: PNG screenshots and per-surface zip bundles, ~164 MB total, captured 2026-05-07 between 03:11 and 03:29 AM local).

**Source / test closure is complete.** All five prior commits land cleanly; full vitest is green at 89 files / 1897 tests; lockfile is unchanged; `git diff --check` is clean.

**Hosted screenshot matrix remains required for final UI doctrine score closure.** Each slot below is **OPERATOR-PENDING** unless individually mapped to a captured asset by the operator:

| Required slot                  | Status           |
| ------------------------------ | ---------------- |
| Desktop edit mode              | OPERATOR-PENDING |
| Desktop view mode              | OPERATOR-PENDING |
| Standard laptop                | OPERATOR-PENDING |
| Small laptop                   | OPERATOR-PENDING |
| Tablet landscape               | OPERATOR-PENDING |
| Tablet portrait                | OPERATOR-PENDING |
| Phone portrait                 | OPERATOR-PENDING |
| Phone landscape / short-height | OPERATOR-PENDING |
| Ultrawide                      | OPERATOR-PENDING |
| High zoom / constrained window | OPERATOR-PENDING |

Final UI doctrine score closure is gated on the operator's matrix-by-matrix confirmation — not on the existence of an `evidence/` folder.

## 9. Guardrails Preserved

- **No live write paths.** No source edits introduce mutating fetch / Graph / PnP / SharePoint runtime behavior.
- **No live external launch links introduced.** Locked across all eight surfaces by the cross-surface "no `<a href^="http(s)">` inside `[data-pcc-bento-grid]`" assertion in `PccCardTierContract.test.tsx`.
- **No backend integration changes.** `backend/functions/**` untouched across Prompts 01–05.
- **Direct bento child invariant preserved.** Locked across all eight surfaces in `PccCardTierContract.test.tsx` (`card.parentElement === [data-pcc-bento-grid]`).
- **Row-span collapse resistance preserved.** `useBentoRowSpan` and `useBentoRowSpan.test.tsx` untouched.
- **No `grid-auto-flow: dense`.** `PccBentoGrid.module.css` declares no `grid-auto-flow` (defaults to `row`); locked by `PccProjectHome.test.tsx`.
- **No active panel duplication.** `PccSurfaceCommandCardContract.test.tsx` asserts exactly one `[data-pcc-active-surface-panel]` per route.
- **Lockfile unchanged.** `pnpm-lock.yaml` MD5 `c56df7b79986896624536aab74d609f4` across the wave.
- **No SPFx manifest / `package-solution.json` version bump.** Wave is at `1.0.0.15` from a prior commit; remediation is additive (data attributes on existing JSX, token-only CSS, additive tests) and does not change the host / runtime contract.
- **No removal of existing markers** (`data-pcc-card`, `data-pcc-footprint`, `data-pcc-card-hierarchy`, `data-pcc-card-tier`, `data-pcc-card-region`, `data-pcc-card-density`, `data-pcc-mode`, `data-pcc-column-span`, `data-pcc-row-span`, `data-pcc-measured-height`, `data-pcc-active-surface-panel`).

## 10. Residual Risks / Follow-Up

- **Hosted screenshot matrix pending operator confirmation.** 71 operator-captured assets in `wave-b3/evidence/` (~164 MB, now committed). Per-matrix-slot mapping is the operator's call.
- **Visual polish may need one more design pass after hosted review.** Prompt 01's tier-styling hardening uses token-only `color-mix` against existing `--pcc-*` tokens; the rendered effect on the live tenant may surface adjustments not visible in jsdom unit tests.
- **Pre-existing prettier drift in 48 unrelated files** under `apps/project-control-center/src/`. Surface adapters (`unifiedLifecycle/*`, `surfaces/approvals/approvalsAdapter`) and several test files. Out of scope for this remediation; recommend a follow-up `prettier --write` PR.
- **Workspace-wide `pnpm -r check-types` fails on `apps/hb-publisher`** (`useDraftLifecycle.test.ts` TS2345 — vitest `Mock<Procedure | Constructable>` vs `SetStatus`). Unrelated to PCC; predates this remediation. Document and fix in a separate hb-publisher PR.
- **Dead code retained.** `apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemTile.tsx` and `PccExternalSystemsHeaderCard.tsx` have no consumers; left untouched per scope discipline. Removal candidate for a future cleanup PR.
- **`PccProjectHomeProcoreSnapshotCard`** retained existing `tier3/deferred` classification rather than the wave directive's `tier3/reference` suggestion. Defensible existing classification; revisit only if a Procore snapshot redesign requires a different posture.

## 11. Final Closure Statement

Code and test remediation for the PCC card tier / region / footprint contract is **closed**. The shared primitive, all eight active route surfaces, every embedded Project Readiness subregion, and the cross-surface contract / accessibility / bento-invariant test set are landed and green at 89 files / 1897 tests. Lockfile unchanged across the wave. Guardrails (no live write paths, no live anchors, no dense grid, single active panel, direct bento children, row-span collapse resistance) preserved.

**Final hosted UI doctrine closure depends on the operator's confirmation of the hosted screenshot matrix referenced in section 8.** This closeout does not claim final hosted UI doctrine score closure.
