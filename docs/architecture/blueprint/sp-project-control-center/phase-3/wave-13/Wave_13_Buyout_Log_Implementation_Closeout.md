# Wave 13 — Buyout Log Implementation Closeout

> Phase 3 / Wave 13 / Buyout Log / Buyout Control Center.
> Embedded Project Readiness module. No standalone shell route. No mounted PCC surface id.
> All work is fixture-first / read-only. Procore, Sage, Microsoft Graph, SharePoint, Adobe Sign,
> DocuSign, AHJ, utility, and vendor-portal references are imported lineage or reference-only —
> no runtime call, writeback, mutation, evidence-binary ownership, or approval execution exists
> in this implementation.

## 1. Objective

Wave 13 delivers the Buyout Log / Buyout Control Center as an embedded Project Readiness
workflow module under HB Project Control Center. It surfaces 10 read-only regions
(`command-center`, `package-table`, `budget-vs-commitment`, `unbought-scope`,
`procore-reconciliation`, `package-detail`, `compliance-sdi-bond`, `procurement-leadtime`,
`evidence-lineage`, `audit-history`) plus reference-only cross-surface integration seams
(boundary notices, integration-posture rows, per-package reference-seam rows). Wave 13 ships
shared model contracts, a backend GET-only mock read-model route, an SPFx read-model client
seam, an SPFx UI surface, and integration seams. Wave 14 owns approval and checkpoint
execution. This document records the validated state of Wave 13 and the readiness gate to
the next wave.

## 2. Starting and Ending Repo Truth

| Item                                                 | Value                                                                                              |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Branch                                               | `main`                                                                                             |
| Pre-Wave-13 anchor commit                            | `e59e7dce7 docs(reference): add Estimating Tracking template; remove wave7 doc-control prompt zip` |
| First Wave 13 implementation commit                  | `fa5012d2e feat(models-pcc): add wave 13 buyout log contracts` (Prompt 02)                         |
| Ending HEAD (Prompt 07 closeout)                     | recorded by `git rev-parse HEAD` after this commit lands                                           |
| Lockfile MD5 (start of Prompt 02 → end of Prompt 07) | `c56df7b79986896624536aab74d609f4` (unchanged)                                                     |

All Wave 13 implementation commits target `main`. No branch fan-out, no force-push, no rebase.

## 3. Files Changed by Prompt / Stage

Per-prompt commit attribution, derived from `git show --name-only --pretty=format: <sha>`. No commit-count phrasing; the source of truth is the git history.

### Prompt 01 — Implementation Readiness Audit

Prompt 01 was a read-only readiness validation. **No source commit was produced.** Prompt 01's decisions are locked in the wave README and reference set:

- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/README.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/Wave_13_Buyout_Log_Scope_Lock.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/Wave_13_Developer_Implementation_Decisions_And_Contracts.md`

### Prompt 02 — Shared Models, Fixtures, State Machine, Contracts

Commit: `fa5012d2e feat(models-pcc): add wave 13 buyout log contracts`

- `packages/models/src/pcc/BuyoutLog.ts`
- `packages/models/src/pcc/BuyoutLog.test.ts`
- `packages/models/src/pcc/NoMutationGuard.test.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `packages/models/src/pcc/PccReadModels.test.ts`
- `packages/models/src/pcc/fixtures/buyoutLog.ts`
- `packages/models/src/pcc/fixtures/index.ts`
- `packages/models/src/pcc/index.ts`

### Prompt 03 — Backend GET-Only Mock Read-Model

Commit: `f7c8abbfb feat(functions-pcc): add buyout log read model route`

- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts`

### Prompt 04 — SPFx Read-Model Client Seam

Commit: `fc28fa0a3 feat(spfx-pcc): add buyout log read model client seam`

- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccReadModelClient.test.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.test.ts`

### Prompt 05 — SPFx Buyout Log Project Readiness Surface

Commit: `937cd8d85 feat(spfx-pcc): add buyout log project readiness surface`

- `apps/project-control-center/src/surfaces/buyoutLog/buyoutLogViewModel.ts`
- `apps/project-control-center/src/surfaces/buyoutLog/buyoutLogAdapter.ts`
- `apps/project-control-center/src/surfaces/buyoutLog/useBuyoutLogReadModel.ts`
- `apps/project-control-center/src/surfaces/buyoutLog/PccBuyoutLogRegions.tsx`
- `apps/project-control-center/src/surfaces/buyoutLog/PccBuyoutLogRegions.module.css`
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.test.ts`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` (compile-only type-intersection seam authorized mid-execution as Option A)
- `apps/project-control-center/src/tests/buyoutLogAdapter.test.ts`
- `apps/project-control-center/src/tests/PccBuyoutLogRegions.test.tsx`
- `apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx`

### Prompt 06 — Unified Lifecycle Integration Seams

Commit: `0286c7d97 feat(spfx-pcc): wire buyout log lifecycle integration seams`

- `apps/project-control-center/src/surfaces/buyoutLog/buyoutLogViewModel.ts`
- `apps/project-control-center/src/surfaces/buyoutLog/buyoutLogAdapter.ts`
- `apps/project-control-center/src/surfaces/buyoutLog/PccBuyoutLogRegions.tsx`
- `apps/project-control-center/src/tests/buyoutLogAdapter.test.ts`
- `apps/project-control-center/src/tests/PccBuyoutLogRegions.test.tsx`

### Prompt 07 — Tests, Guardrails, and Implementation Closeout

Commit: this commit (recorded by `git rev-parse HEAD` after landing).

- `apps/project-control-center/src/tests/buyoutLogGuardrails.test.ts`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/Wave_13_Buyout_Log_Implementation_Closeout.md`

## 4. Model Contract Proof

Authoritative source: `packages/models/src/pcc/BuyoutLog.ts`.

- `PccBuyoutLogReadModel` envelope payload registered as `'buyout-log'` in `PccReadModelResponseMap`.
- 19-state lifecycle vocabulary (`BUYOUT_PACKAGE_STATES`) with explicit reference-posture states `procore-commitment-pending` and `procore-commitment-created` documented as imported lineage only.
- Independent reconciliation-state vocabulary (`BUYOUT_RECONCILIATION_STATES`, 8 values).
- Independent completion-gate vocabulary (`BUYOUT_COMPLETION_GATE_RESULTS`, 5 values).
- Exhaustive field-mutability map (`BUYOUT_FIELD_MUTABILITY`) over `keyof BuyoutPackage` via `satisfies`.
- `BuyoutReferenceSeams` declares the cross-surface seam fields consumed by Wave 13 Prompts 05–06.
- Sample fixture: `packages/models/src/pcc/fixtures/buyoutLog.ts` — `SAMPLE_BUYOUT_LOG_READ_MODEL` with eight stable scenario IDs (`ready`, `blocked`, `compliance-hold`, `over-budget`, `missing-lineage`, `missing-evidence`, `missing-commitment`, `unknown-degraded`) and a snapshot dated `2026-05-01T18:30:00Z`.

Tests in `packages/models/src/pcc/BuyoutLog.test.ts`, `NoMutationGuard.test.ts`, and `PccReadModels.test.ts` covered the model contract at the time of Prompt 02 (`fa5012d2e`).

## 5. Backend Read-Model Proof

Authoritative source: `backend/functions/src/hosts/pcc-read-model/`.

- Route registered at `pcc/projects/{projectId}/buyout-log` via `PCC_READ_MODEL_ROUTE_IDS` and `PCC_READ_MODEL_ROUTE_PATHS`.
- GET-only. No write seam. No external API call.
- Mock provider returns the shared fixture envelope (`SAMPLE_BUYOUT_LOG_READ_MODEL`) for known projects, an empty envelope for unknown projects, and a `backend-unavailable` envelope under simulated failure.

Tests in `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts` and `read-models/pcc-mock-read-model-provider.test.ts` covered the backend route at the time of Prompt 03 (`f7c8abbfb`).

## 6. SPFx UI Proof

Authoritative source: `apps/project-control-center/src/surfaces/buyoutLog/`.

- `buyoutLogViewModel.ts` — narrow `IPccBuyoutLogReadModelClient` (single method `getBuyoutLog`), discriminated-union view-model (`loading | error | ready`), region-id tuple `PCC_BL_REGION_IDS` (10 ids), seam tuple `PCC_BL_SEAM_KINDS` (9), integration-target tuple `PCC_BL_INTEGRATION_TARGET_IDS` (11), boundary-key tuple `PCC_BL_BOUNDARY_KEYS` (5).
- `buyoutLogAdapter.ts` — pure envelope-in adapter; returns `status: 'ready'` for `available`, `source-unavailable`, and `backend-unavailable`; degraded posture flows through `cardState` and `sourceStatus`. No `'loading'` branch in the adapter output.
- `useBuyoutLogReadModel.ts` — owns `loading` and promise-rejection `error`; cancels in-flight effects on unmount or input change.
- `PccBuyoutLogRegions.tsx` — Fragment of direct `<PccDashboardCard>` children carrying `data-pcc-readiness-section="buyout-log"` and per-region `data-pcc-bl-region="<region-id>"` markers. Loading/error render a single full-width `PccPreviewState` card with the command-center marker so the surface does not duplicate ten regions during degraded states.
- Embedding host: `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx` renders `PccBuyoutLogRegions` immediately after `PccConstraintsLogRegions` in both fixture-only and read-model-driven Fragment paths. `IPccBuyoutLogReadModelClient` joins the surface's read-model intersection.
- Compile-only type seam: `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` extends `IPccSurfaceRouterReadModelClient` with `IPccBuyoutLogReadModelClient`. Mirrors the Wave 12 Constraints Log precedent. No runtime route, mount, host, or surface-registration change.
- Project Readiness downstream-module status: `projectReadinessAdapter.ts` marks `buyout-log` as `implemented` with the caption "Wave 13 — Buyout Log / Buyout Control Center is live as the embedded Project Readiness module."

Tests across `apps/project-control-center/src/tests/{buyoutLogAdapter.test.ts, PccBuyoutLogRegions.test.tsx, PccProjectReadinessSurface.test.tsx}` and `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.test.ts` cover region rendering, bento direct-child invariant, structural read-only posture, source-lineage badges, HBI eligibility, surface-level integration in both render paths, and the non-call architectural lock on `getBuyoutLog`.

## 7. Unified Lifecycle Integration Proof

Authoritative source: Prompt 06 commit `0286c7d97`.

- `PCC_BL_SEAM_KINDS` (9): `priority-actions-candidate`, `document-control-evidence`, `lifecycle-readiness-gate`, `responsibility-role`, `approval-checkpoint`, `external-system-launcher`, `project-memory-contribution`, `traceability-edge`, `project-readiness-source-module`.
- `PCC_BL_INTEGRATION_TARGET_IDS` (11): `project-readiness`, `priority-actions`, `lifecycle-readiness`, `permit-inspection`, `responsibility-matrix`, `constraints-log`, `approvals-checkpoints`, `document-control`, `external-systems`, `project-memory`, `traceability`. The adapter validator throws if a target id is missing from the registry.
- `PCC_BL_BOUNDARY_KEYS` (5): `no-procore-runtime`, `no-sage-accounting`, `no-evidence-binary`, `no-approval-execution`, `no-legal-determination`. Each boundary notice uses "reference only" / "not enabled here" / "imported lineage only" vocabulary.
- Per-package reference-seam rows are derived only from populated `BuyoutReferenceSeams` fields; the always-present `project-readiness-source-module` seam carries the literal reference `buyout-log`.
- Integration is internal to the Buyout Log surface only. No sibling-surface edits, no mounted surface id, no shell route, no runtime call.

## 8. Guardrail Proof

Authoritative source: `apps/project-control-center/src/tests/buyoutLogGuardrails.test.ts` (Prompt 07).

The four buyout-log source files (`buyoutLogViewModel.ts`, `buyoutLogAdapter.ts`, `useBuyoutLogReadModel.ts`, `PccBuyoutLogRegions.tsx`) are scanned with comments stripped before substring/regex tests. Assertions:

| #   | Assertion                                                                                                                                                                               | Result |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | No `https?://` URLs in stripped source                                                                                                                                                  | pass   |
| 2   | No write-verb identifiers (`create…`, `post…`, `put…`, `delete…`, `writeBack…`, `sendTo…`, `syncTo…`, `upload…`, `submitTo…`, `mutate…`) anchored to identifier start                   | pass   |
| 3   | No HBI source-of-truth claim copy (`HBI is the source of truth`, `HBI is the system of record`, `replaces Procore`, `replaces Sage`, `replaces Microsoft Graph`, `replaces SharePoint`) | pass   |
| 4   | No affirmative legal/claim/accounting determination claims (negation form `No legal determination` remains valid)                                                                       | pass   |
| 5   | `IPccBuyoutLogReadModelClient` keys are exactly `'getBuyoutLog'` (type-level + runtime mock)                                                                                            | pass   |
| 6   | Loading view-model surfaces `aria-busy="true"` via `PccPreviewState`                                                                                                                    | pass   |
| 7   | Error view-model surfaces `role="alert"` via `PccPreviewState`                                                                                                                          | pass   |
| 8   | Rendered tree has no `[data-pcc-surface-id="buyout-log"]`                                                                                                                               | pass   |
| 9   | Rendered tree has no `[data-pcc-active-surface-panel="buyout-log"]`                                                                                                                     | pass   |

Prompt 05 added the forbidden-import scan over `@microsoft/sp-`, `@pnp/`, `@microsoft/microsoft-graph`, `axios`, `fetch-`, `node-fetch` for the same four files; that scan continues to pass.

## 9. Validation Evidence

| Check                          | Command                                                                                                                                                                                                            | Outcome                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Repo state pre-edit            | `git status --short`                                                                                                                                                                                               | clean                                                                                               |
| Branch                         | `git branch --show-current`                                                                                                                                                                                        | `main`                                                                                              |
| HEAD pre-edit                  | `git rev-parse HEAD`                                                                                                                                                                                               | `0286c7d9763a82e9ad27281ab1d559a47ba2f6bd`                                                          |
| Lockfile MD5 pre/post          | `md5 pnpm-lock.yaml`                                                                                                                                                                                               | `c56df7b79986896624536aab74d609f4` (unchanged)                                                      |
| Wave 13 grep                   | `git log --oneline --all-match --grep="wave 13" --grep="buyout"`                                                                                                                                                   | implementation chain confirmed                                                                      |
| `af85b687…` inspection         | `git show --stat af85b687042ca14cd0d71d0296e47a3ac00f0798`                                                                                                                                                         | confirmed Procore-roadmap closeout under `docs/architecture/plans/**`; not used as a precedent path |
| Type-check (Prompt 07)         | `pnpm --filter @hbc/spfx-project-control-center check-types`                                                                                                                                                       | pass                                                                                                |
| Tests (Prompt 07)              | `pnpm --filter @hbc/spfx-project-control-center test`                                                                                                                                                              | 1334 / 1334 across 59 files                                                                         |
| Prettier check                 | `pnpm exec prettier --check apps/project-control-center/src/tests/buyoutLogGuardrails.test.ts docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/Wave_13_Buyout_Log_Implementation_Closeout.md` | pass                                                                                                |
| `git diff --check` (Prompt 07) | clean                                                                                                                                                                                                              | clean                                                                                               |

Cross-package validations (`@hbc/models`, `@hbc/functions`) were performed at the time of Prompts 02 and 03 against their respective commits and were not re-run during Prompt 07 because no cross-package files were changed in Prompts 04–07.

Hosted / tenant / browser proof is **operator-pending**. Per-prompt validation in this implementation chain is package-local truth, not hosted-runtime truth.

## 10. Lockfile / Package / Manifest Posture

- `pnpm-lock.yaml` MD5 is unchanged across the entire Wave 13 implementation chain: `c56df7b79986896624536aab74d609f4` (start of Prompt 02 → end of Prompt 07).
- No `package.json` modifications across Prompts 02–07.
- No SharePoint manifest changes; no SPFx manifest version bump. Buyout Log is embedded under the existing Project Readiness surface and emits no new SPFx web-part / extension manifest.
- No CI / GitHub Actions / workflow changes.
- No Azure deployment artifact changes.
- No app-catalog `.sppkg` generation or upload.

## 11. Deferred Items

The following are deliberately excluded from Wave 13 and remain deferred:

- **Wave 14 — approval / checkpoint execution.** Buyout Log surfaces `wave14ApprovalCheckpointRef` as a reference-only seam; Wave 14 owns the execution wiring.
- **Procore / Sage / Microsoft Graph / SharePoint / Adobe Sign / DocuSign / AHJ / utility / vendor-portal runtime calls.** Reference posture only. No writeback, mirroring, scraping, sync, polling, production rollout, or tenant mutation.
- **Procore commitment / PO / subcontract / SOV / CCO / invoice / payment creation.** Not enabled; reference-posture lifecycle states record imported lineage only.
- **Sage accounting determinations and payment authorization.** Not enabled.
- **Legal, claim entitlement, compensability, delay-damages, and forensic-schedule-analysis determinations.** Boundary captions explicitly disclaim these.
- **Evidence binary upload, download, sync, or storage.** Document Control / SharePoint own the binaries; Wave 13 surfaces references only.
- **Live HBI Ask-HBI / grounded-answer integration.** HBI eligibility markers are recorded for future surfaces only; no grounded answer, summarization, or generation runs from this surface.
- **Standalone `buyout-log` shell route or mounted PCC surface id.** Buyout Log remains an embedded Project Readiness module; the unified lifecycle route taxonomy treats it as a workflow / module region.
- **Hosted / tenant / browser proof.** Operator-pending.

## 12. Readiness for Wave 14 / Next Wave

Wave 14 planning recommended to proceed.

Wave 14 inputs already in place:

- `BuyoutReferenceSeams.wave14ApprovalCheckpointRef` field declared in `packages/models/src/pcc/BuyoutLog.ts`.
- Buyout package detail entry in the SPFx surface renders the Wave 14 approval-checkpoint seam as a reference-only row (`data-pcc-bl-detail-seam-kind="approval-checkpoint"`) with the canonical "Wave 14 owns it" caption.
- Integration-posture row for `approvals-checkpoints` is registered with reference-only posture in the buyout-log command center.

Wave 14 must NOT introduce any of the deferred items in Section 11 except the explicit `wave14ApprovalCheckpointRef` execution wiring it owns.
