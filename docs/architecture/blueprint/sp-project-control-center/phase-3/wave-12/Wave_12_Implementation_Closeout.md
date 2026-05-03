# Wave 12 — Constraints Log — Implementation Closeout

**Module:** Constraints Log (Make-Ready Constraint & Risk Exposure Center)
**Phase / Wave:** Phase 3 / Wave 12
**Status:** Implementation complete (Prompts 02–06). Reviewer prompt and hosted SPFx + tenant runtime parity remain **OPERATOR-PENDING**.

---

## 1. Anchors

| Anchor                                        | SHA                                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Pre-Wave-12 baseline (parent of Prompt 02)    | `e0c38ea6a8f524808299c0cd4dfe08ef144c1e99` (`docs(reference): HB GO/NO-GO template PDF + ignore Office lock files`) |
| Current HEAD before Prompt 07 closeout commit | `46d27eb26c2ada65d55e4cfffffac9e2f7d18d22`                                                                          |
| Branch                                        | `main`                                                                                                              |

> Note: HEAD has advanced beyond Prompt 06 (`110a5044d`) with two unrelated Wave 99 commits (`94df639e2 feat(models-pcc): complete unified lifecycle traceability contract gaps` and `46d27eb26 docs(pcc): Wave 99 unified gaps — Prompt 2A lifecycle contract depth correction`). Wave 99 work is not part of this closeout. Five files in `backend/functions/src/hosts/pcc-read-model/` carry uncommitted Wave 99 working-tree modifications at the time of this closeout; those modifications are not authored or staged here.

## 2. Prompt-by-prompt implementation summary

Each landed commit is attributed only to its own prompt (no commit-bundling).

| Prompt | Commit                                                   | Scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------ | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 02     | `bfc441fcfae8a787f3c6daa6049e1b8ce7eb19f8` (`bfc441fcf`) | `@hbc/models` Constraints Log shared contracts: vocabulary tuples, discriminated `RiskItem`/`ConstraintItem` shapes, scoring helpers, raise-only severity overrides with rationale enforcement, allowed-transition maps, read-model envelope (`PccConstraintsLogReadModel`), seed-category registry, deterministic fixture, response-map registration.                                                                                                                                                                |
| 03     | `9f67df78f`                                              | `@hbc/functions` GET-only PCC read-model route + mock provider for `pcc/projects/{projectId}/constraints-log`, with three-branch posture (available / source-unavailable / backend-unavailable) parallel to Wave 9 / 10 / 11 routes.                                                                                                                                                                                                                                                                                  |
| 04     | `a1191f4e0`                                              | SPFx read-model client `getConstraintsLog`: route id + path constants, narrow client-interface method on `IPccReadModelClient`, fixture-fallback and backend-HTTP implementations with parity tests.                                                                                                                                                                                                                                                                                                                  |
| 05     | `9c840a6c3`                                              | SPFx Constraints Log surface shell — nine `PccDashboardCard` lanes (Command Center, Make-Ready Board, Risk Matrix, Constraint Exposure Matrix, Log Table, Detail Panel, Weekly Huddle, Root Cause & Lessons Learned, Executive Exposure Summary) embedded under Project Readiness; pure adapter + view-model + hook + Regions component + CSS module + tests. One-line `IPccSurfaceRouterReadModelClient extends … IPccConstraintsLogReadModelClient` extension in `PccSurfaceRouter.tsx` — no router/MVP/nav change. |
| 06     | `110a5044d`                                              | Integration seam boundary surface — four canonical boundary notices (delay-exposure, change-exposure, evidence-link, approval-checkpoint) rendered as `data-pcc-cl-boundary-notice="<key>"`; always-present `commandCenter.integrationPosture` list (10 receiving targets) rendered as `data-pcc-cl-integration-posture="<targetId>"`; per-seam `seamKind` + `referenceOnlyLabel` on detail-panel rows rendered as `data-pcc-cl-detail-seam-kind="<kind>"`. Product-safe / stage-agnostic copy.                       |
| 07     | _captured post-commit_                                   | This closeout doc.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

## 3. Files changed by area

Sourced from `git show --name-only --format= <sha>` for each implementation commit.

### Models (`@hbc/models`) — Prompt 02 (`bfc441fcf`)

```
packages/models/src/pcc/ConstraintsLog.ts
packages/models/src/pcc/ConstraintsLog.test.ts
packages/models/src/pcc/fixtures/constraintsLog.ts
packages/models/src/pcc/fixtures/Fixtures.test.ts
packages/models/src/pcc/fixtures/index.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/PccReadModels.test.ts
packages/models/src/pcc/ProjectReadinessFramework.test.ts
packages/models/src/pcc/WorkflowModules.test.ts
packages/models/src/pcc/NoMutationGuard.test.ts
packages/models/src/pcc/index.ts
```

### Backend Functions (`@hbc/functions`) — Prompt 03 (`9f67df78f`)

```
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts
```

### SPFx Read-Model Client — Prompt 04 (`a1191f4e0`)

```
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/api/pccReadModelClient.test.ts
apps/project-control-center/src/api/pccBackendReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.test.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
```

### SPFx Surface Shell — Prompt 05 (`9c840a6c3`)

```
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/constraintsLog/constraintsLogViewModel.ts
apps/project-control-center/src/surfaces/constraintsLog/constraintsLogAdapter.ts
apps/project-control-center/src/surfaces/constraintsLog/useConstraintsLogReadModel.ts
apps/project-control-center/src/surfaces/constraintsLog/PccConstraintsLogRegions.tsx
apps/project-control-center/src/surfaces/constraintsLog/PccConstraintsLogRegions.module.css
apps/project-control-center/src/tests/PccConstraintsLogRegions.test.tsx
apps/project-control-center/src/tests/constraintsLogAdapter.test.ts
```

### Integration Seam Posture — Prompt 06 (`110a5044d`)

```
apps/project-control-center/src/surfaces/constraintsLog/constraintsLogViewModel.ts
apps/project-control-center/src/surfaces/constraintsLog/constraintsLogAdapter.ts
apps/project-control-center/src/surfaces/constraintsLog/PccConstraintsLogRegions.tsx
apps/project-control-center/src/tests/PccConstraintsLogRegions.test.tsx
apps/project-control-center/src/tests/constraintsLogAdapter.test.ts
```

## 4. Validation command results

Captured against current HEAD (`46d27eb26`) before Prompt 07 commit.

| Command                                                      | Result                                                                                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `git diff --check`                                           | clean (no whitespace errors)                                                                                                    |
| `pnpm --filter @hbc/models check-types`                      | green (`tsc --noEmit`, 0 errors)                                                                                                |
| `pnpm --filter @hbc/models test`                             | **435 tests passed** across 39 test files                                                                                       |
| `pnpm --filter @hbc/functions check-types`                   | green (`tsc --noEmit`, 0 errors)                                                                                                |
| `pnpm --filter @hbc/functions test`                          | **2317 tests passed, 3 skipped** across 139 test files                                                                          |
| `pnpm --filter @hbc/spfx-project-control-center check-types` | green (`tsc --noEmit`, 0 errors)                                                                                                |
| `pnpm --filter @hbc/spfx-project-control-center test`        | **933 tests passed** across 46 test files                                                                                       |
| `pnpm --filter @hbc/spfx-project-control-center build`       | green (Vite production build: `dist/spfx-project-control-center.css` 43.69 KB / `dist/project-control-center-app.js` 530.84 KB) |

`@hbc/functions` ran against current working tree, which contains five uncommitted Wave 99 modifications under `backend/functions/src/hosts/pcc-read-model/`. The package validation still passes; those modifications are not part of this closeout.

## 5. Lockfile hash

| Point                                       | MD5                                                        |
| ------------------------------------------- | ---------------------------------------------------------- |
| Pre-Wave-12 baseline (`e0c38ea6a`)          | `c56df7b79986896624536aab74d609f4`                         |
| Current HEAD before Prompt 07 (`46d27eb26`) | `c56df7b79986896624536aab74d609f4`                         |
| After Prompt 07 closeout commit             | `c56df7b79986896624536aab74d609f4` (must remain unchanged) |

`pnpm-lock.yaml` was not modified across Prompts 02–07.

## 6. Source-model placement resolution — Path B intentional dual posture

`constraints-log` is registered authoritatively in **both** of the following locations, by design:

- **Project Readiness source-module registry** — `PROJECT_READINESS_SOURCE_MODULES` in `packages/models/src/pcc/ProjectReadinessFramework.ts` (the constant lists `constraints-log` alongside the other Wave 8/9/10/11/14 source modules and is rendered through the existing `DownstreamModulesCard` on `PccProjectReadinessSurface`).
- **Constraints Log module identity** — `ConstraintsLogModuleIdentity` in `packages/models/src/pcc/ConstraintsLog.ts`, where `governance: 'project-readiness'` and `workCenterId: 'risk-issues-decision'` are both narrowed string literals.

This is the **Path B** resolution captured in the Prompt 01 implementation-readiness audit: the dual posture is intentional. The Constraints Log surface is governed by Project Readiness (where the user-facing region group is mounted, embedded under `PccProjectReadinessSurface`) and is also a work-center module under `risk-issues-decision`. Tests in `packages/models/src/pcc/ConstraintsLog.test.ts` and `Fixtures.test.ts` pin both registrations so the dual posture is captured rather than silently ignored. Refer to the model files directly for the canonical literal values.

## 7. Test coverage map vs Prompt 07 required validation list

| Coverage requirement                                                                                                                                 | Resolved test file                                                                                                               | Resolved assertion(s)                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Model scoring utilities (`computeGoverningImpactScore`, `computeRiskScore`, `computeConstraintExposureScore`)                                        | `packages/models/src/pcc/ConstraintsLog.test.ts`                                                                                 | lines 127, 131–135, 149, 153–156, 165–168                                                                                                                                                                                                                                  |
| Severity-band mapping (`mapSeverityBand`)                                                                                                            | `packages/models/src/pcc/ConstraintsLog.test.ts`                                                                                 | lines 187, 191–193                                                                                                                                                                                                                                                         |
| State transition maps (`isRiskTransitionAllowed`, `isConstraintTransitionAllowed`)                                                                   | `packages/models/src/pcc/ConstraintsLog.test.ts`                                                                                 | imports lines 21–22 + per-state describes                                                                                                                                                                                                                                  |
| Severity override raise-only behavior (`applySeverityOverride`)                                                                                      | `packages/models/src/pcc/ConstraintsLog.test.ts`                                                                                 | lines 199, 205, 216, 223, 232                                                                                                                                                                                                                                              |
| Residual reduction rationale gate (`assertResidualReductionAllowed`)                                                                                 | `packages/models/src/pcc/ConstraintsLog.test.ts`                                                                                 | imports line 16 + dedicated describes                                                                                                                                                                                                                                      |
| Fixture determinism + every-band severity coverage                                                                                                   | `packages/models/src/pcc/fixtures/Fixtures.test.ts`                                                                              | line 240 (`SAMPLE_CONSTRAINTS_LOG_READ_MODEL covers every severity band on both risks and constraints`)                                                                                                                                                                    |
| Workbook rows remain reference-only (no `defaultActiveItems`)                                                                                        | `packages/models/src/pcc/ConstraintsLog.test.ts`                                                                                 | lines 526–527                                                                                                                                                                                                                                                              |
| Models are mutation-free                                                                                                                             | `packages/models/src/pcc/NoMutationGuard.test.ts`                                                                                | line 44 (`PCC shared models are mutation-free`)                                                                                                                                                                                                                            |
| Backend GET-only route registration for `pcc/projects/{projectId}/constraints-log`                                                                   | `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts`                                                       | lines 17, 118–120, 239–246 (`exposes the Wave 12 constraints-log path as a single GET-only registration`)                                                                                                                                                                  |
| Backend route returns provider envelope unchanged                                                                                                    | `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts`                                                       | lines 347–364                                                                                                                                                                                                                                                              |
| Backend known-project envelope (constraints-log)                                                                                                     | `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts`                                    | line 285 (`PccMockReadModelProvider.getConstraintsLog — known project`)                                                                                                                                                                                                    |
| Backend unknown-project envelope (constraints-log)                                                                                                   | `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts`                                    | line 322 (`PccMockReadModelProvider.getConstraintsLog — unknown project`)                                                                                                                                                                                                  |
| Backend backend-unavailable envelope (constraints-log)                                                                                               | `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts`                                    | lines 374, 378–400 (`PccMockReadModelProvider.getConstraintsLog — backend-unavailable simulation`)                                                                                                                                                                         |
| Source-status warnings (`source-unavailable`, `backend-unavailable`)                                                                                 | `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts`                                    | lines 88, 134, 138, 205–209, 253–259                                                                                                                                                                                                                                       |
| SPFx client `getConstraintsLog` declared on `IPccReadModelClient`                                                                                    | `apps/project-control-center/src/api/pccReadModelClient.test.ts`                                                                 | lines 47, 107, 137                                                                                                                                                                                                                                                         |
| SPFx fixture-client constraints-log path (known + unknown + backend-unavailable)                                                                     | `apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts`                                                          | lines 278–344                                                                                                                                                                                                                                                              |
| SPFx backend HTTP-client constraints-log path (URL build, persona passthrough, parity)                                                               | `apps/project-control-center/src/api/pccBackendReadModelClient.test.ts`                                                          | lines 41, 251–319                                                                                                                                                                                                                                                          |
| SPFx surface rendering states (loading / error / ready / available / source-unavailable / backend-unavailable)                                       | `apps/project-control-center/src/tests/PccConstraintsLogRegions.test.tsx`                                                        | lines 206–252                                                                                                                                                                                                                                                              |
| Detail panel local-only selection (board interactions safe-local)                                                                                    | `apps/project-control-center/src/tests/PccConstraintsLogRegions.test.tsx`                                                        | lines 177–201                                                                                                                                                                                                                                                              |
| Bento direct-child invariant (matrix lanes structurally legible)                                                                                     | `apps/project-control-center/src/tests/PccConstraintsLogRegions.test.tsx`                                                        | lines 94–106                                                                                                                                                                                                                                                               |
| Read-only structural posture (no `<a href>`, no `<form>`, no `<input type="file">`, no enabled mutation buttons)                                     | `apps/project-control-center/src/tests/PccConstraintsLogRegions.test.tsx`                                                        | lines 125–171                                                                                                                                                                                                                                                              |
| Role/permission display gating                                                                                                                       | **N/A** — Constraints Log surface does not implement role/permission gating; coverage requirement does not apply to this surface |
| Priority Actions candidate / reference-only posture                                                                                                  | `apps/project-control-center/src/tests/PccConstraintsLogRegions.test.tsx`                                                        | lines 287–340 + lines 359+ (boundary notices + integration posture + per-seam reference-only labels covering `priority-actions` target and `priority-actions-candidate` seam kind)                                                                                         |
| Document Control evidence-link reference-only posture                                                                                                | `apps/project-control-center/src/tests/PccConstraintsLogRegions.test.tsx`                                                        | lines 287–308 (`evidence-link` boundary notice) + lines 359+ (`document-control-evidence` seam-kind label)                                                                                                                                                                 |
| Wave 14 approval/checkpoint no-execution posture                                                                                                     | `apps/project-control-center/src/tests/PccConstraintsLogRegions.test.tsx`                                                        | lines 287–308 (`approval-checkpoint` boundary notice) + lines 359+ (`approval-checkpoint` seam-kind label)                                                                                                                                                                 |
| No prohibited runtime imports (Graph / PnP / SharePoint REST / Procore / Sage / P6 / Autodesk / AHJ / utility portal / Document Crunch / Adobe Sign) | `apps/project-control-center/src/tests/PccConstraintsLogRegions.test.tsx`                                                        | lines 394+ (`FORBIDDEN_IMPORT_PREFIXES`) + lines 471+ (`Wave 12 Constraints Log — no forbidden runtime imports`)                                                                                                                                                           |
| No legal / claim / entitlement / compensability / delay-damages / forensic-analysis determinations                                                   | `apps/project-control-center/src/tests/PccConstraintsLogRegions.test.tsx`                                                        | lines 287–308 (boundary notices) + lines 158–169 (legal/claim/delay boundary marker `data-pcc-cl-boundary="legal-claim-delay"` on detail / root-cause / executive lanes) + adapter-level captions in `apps/project-control-center/src/tests/constraintsLogAdapter.test.ts` |
| Boundary-notice + integration-posture + per-seam adapter contracts                                                                                   | `apps/project-control-center/src/tests/constraintsLogAdapter.test.ts`                                                            | new describes appended in Prompt 06                                                                                                                                                                                                                                        |

**Audit conclusion: zero material guardrail-test gaps.** Doc-only commit; no test additions in Prompt 07.

## 8. Guardrail attestation

Confirmed across Prompts 02–07:

- No model field invention. Prompt 06 used the existing 10-field `ConstraintsLogReferenceSeams` shape from Prompt 02; no new model exports were added.
- No fixture mutation in Prompts 05–07. The Wave 12 fixture (`packages/models/src/pcc/fixtures/constraintsLog.ts`) is exactly as landed in Prompt 02.
- No backend write routes. Backend Functions remain GET-only across all PCC read-model endpoints; the constraints-log route mirrors the Wave 9/10/11 GET-only registration.
- No router / MVP / navigation surface change beyond the one-line `IPccSurfaceRouterReadModelClient extends … IPccConstraintsLogReadModelClient` structural-type extension in Prompt 05. No new switch case, no new MVP surface entry.
- No external runtime imports (Microsoft Graph, PnP, SharePoint REST, Procore, Sage, Primavera/P6, Autodesk, AHJ portals, utility portals, Document Crunch, Adobe Sign). Verified by the in-test forbidden-import scan over the four constraintsLog implementation files in `PccConstraintsLogRegions.test.tsx`.
- No `<a href>` external launchers, no `<form>`, no `<input type="file">` in the constraints-log region group. Verified structurally.
- No enabled mutation buttons in the constraints-log region group. The only enabled buttons are the local-selection log-row buttons (`data-pcc-cl-log-select`); selection-state is local React state only.
- No evidence-binary upload / download / sync / mirror / writeback. Evidence references are reference-only ids.
- No Wave 14 approval / checkpoint execution. Approval/checkpoint references are reference-only ids; surface copy explicitly states execution is not enabled.
- No scheduler / look-ahead mutation. Scheduler-look-ahead seam is reference-only; integration-posture row affirms the boundary even when no items reference it.
- No legal / claim / compensability / delay-damages / forensic-schedule conclusions. The four boundary notices and the unified `legal-claim-delay` boundary marker assert the absence of these conclusions; user-facing copy is product-safe and stage-agnostic.
- `pnpm-lock.yaml`, `package.json`, manifest files, GitHub workflows, deployment files, app settings, secrets, and tenant settings are unchanged across Prompts 02–07. Lockfile MD5 verified at `c56df7b79986896624536aab74d609f4`.

## 9. Residual risks and follow-ups

- **Hosted SPFx + tenant runtime parity is OPERATOR-PENDING.** Package-local validation (check-types / lint / test / build) is **not** hosted proof; no `.sppkg` was generated, no app-catalog deployment occurred, no live tenant smoke test was run. Hosted parity requires explicit operator action under the sensitive-operation gate.
- **Vercel / GitHub Actions status checks not inspected in this prompt.** Their state at HEAD `46d27eb26` is not asserted by this closeout; the next reviewer should inspect the relevant pull-request checks before approving wave closure.
- **Fixture coverage of two seam kinds** (`scheduler-look-ahead` and `team-access-role`) is intentionally absent from the Wave 12 sample fixture per the Prompt 02 design. The integration-posture row for both targets is always present in the Command Center lane regardless, so the boundary remains structurally legible. If a downstream wave wants detail-panel coverage of these two kinds, the fixture (not the surface) is the change point.
- **No canonical reviewer prompt has been authored for Wave 12 yet.** This closeout doc is the input for the reviewer prompt to work against.
- **Working-tree noise.** Five uncommitted Wave 99 modifications exist under `backend/functions/src/hosts/pcc-read-model/` at the time of this closeout. They are not part of Wave 12 and were not staged or modified here. The reviewer should expect to see those five paths as `M` in `git status` until Wave 99 lands or reverts them.

## 10. Reviewer handoff

The next agent should:

1. Read this closeout document end-to-end and the linked `Wave_12_Constraints_Log_Scope_Lock.md` / `Constraints_Log_Target_Architecture.md` / `Wave_12_Risk_And_Constraint_Exposure_Model.md` reference docs.
2. Re-run the validation suite recorded in §4 against current HEAD; confirm the lockfile MD5 still equals `c56df7b79986896624536aab74d609f4`.
3. Perform a repo-truth audit: spot-check each row in §7 against the actual test file at the cited line range, verify the per-prompt commits in §2 and §3 still match `git show --name-only`, and confirm the dual-posture registration in §6 is still present in both `ProjectReadinessFramework.ts` and `ConstraintsLog.ts`.
4. Either capture hosted SPFx + tenant runtime evidence or explicitly mark hosted parity OPERATOR-PENDING in the reviewer report.
5. List any additional gaps before approving wave closure.

**Wave 12 reviewer prompt recommended to proceed.**
