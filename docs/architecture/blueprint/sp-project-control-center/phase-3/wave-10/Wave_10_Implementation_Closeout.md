# Wave 10 Implementation Closeout

Generated: 2026-05-02

This closeout covers the Phase 3 / Wave 10 **Permit & Inspection Control Center** implementation sequence (Prompts 02–07). It is sibling to `Wave_10_Documentation_Closeout.md`, which closes the planning/documentation package; this document closes the implementation package.

## 1. Baseline

- Branch: `main`
- Prompt 06 baseline commit: `af77151fd56b892750399eb7ad3285b003035b69`
- HEAD at start of Prompt 07: `f2bb14665c97be59675d82d4e0e1332d3930ca6c` (two doc-only commits past Prompt 06; both confined to `docs/architecture/blueprint/sp-project-control-center/phase-3/**` and `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-10/prompts/{06,07}*.md` and the new `wave-13/_doc-updates/**` package; no Wave 10 source/test, package, manifest, lockfile, or CI scope was touched)
- Lockfile (`pnpm-lock.yaml`) MD5 at start: `c56df7b79986896624536aab74d609f4`

## 2. Implementation Prompt Sequence

- **Prompt 02 — Shared model and fixture contracts.** Established `IPermitInspectionControlCenterReadModel`, the eleven permit statuses, eleven inspection statuses, five `PERMIT_INSPECTION_CHECKPOINT_KINDS`, source-family identifiers (`permits`, `required-inspections`), AHJ launcher-only profile, evidence reference-only links, target-added field set (`revision`, `applicationValue`, `permitFee`, `reInspectionFee`), priority-action / readiness / approval signal shapes, and a deterministic launcher-only / references-only fixture; published `permit-inspection-control-center` on `PccReadModelResponseMap`; static source-level no-runtime guard added to the model unit test.
- **Prompt 03 — Backend GET-only mock read model.** Added `getPermitInspectionControlCenter` to `PccMockReadModelProvider` returning `readOnly: true`, `mode: 'mock'`, fixture data for known projects and degraded empty data for unknown / backend-unavailable cases; registered the GET-only Azure Functions route at `pcc/projects/{projectId}/permit-inspection-control-center` under existing `withAuth` posture; added provider-behavior tests and route-registration tests.
- **Prompt 04 — SPFx read-model client parity.** Extended `IPccReadModelClient` with the Wave 10 method, mirrored deterministic data through `PccFixtureReadModelClient`, and routed the same path through `PccBackendReadModelClient` using the existing `callBackend` pattern (no new `fetch(` callsite); added type-symmetric interface tests, fixture deterministic / unknown / backend-unavailable tests, and backend GET-only / base-URL normalization / fetch-availability-guard tests.
- **Prompt 05 — Project Readiness-hosted Wave 10 surface shell.** Implemented `permitInspectionControlCenterViewModel.ts`, `usePermitInspectionControlCenterReadModel.ts`, and `PccPermitInspectionControlCenterRegions.tsx` (with a co-located CSS module) hosted **inside** `PccProjectReadinessSurface`; preserved `permit-log` as the source-module identifier in `projectReadinessAdapter.ts`; surface remains inert (no enabled buttons, no anchors, no forms, no file inputs) and renders all thirteen Wave 10 lanes; **no** standalone top-level PCC surface, **no** new `PccMvpSurfaceId`, **no** new `PccSurfaceRouter` case, **no** new `readModelClient={...}` JSX thread.
- **Prompt 06 — Priority Actions / Readiness / Approvals signal integration.** Extended fixtures and adapters so the Wave 10 read-model surfaces all eleven required signal conditions (missing evidence, failed inspection, expired/overdue permit, expiring permit, open permit fee, open reinspection fee, revision required, reinspection required, inspection ready to request, inspection not scheduled in target window, closeout / TCO / CO exposure); rendered Priority Actions Rail and Project Readiness signals with no new categories or readiness-source identifiers; added rendered-DOM guardrails (no anchors / forms / file inputs / enabled buttons / executable button labels / Procore / Graph / SharePoint runtime tokens; AHJ as text; metadata-only approval/checkpoint rendering).
- **Prompt 07 — Tests, guardrails, narrow cleanup, and implementation closeout.** Final repo-truth audit; one explicit Wave-10-path-specific GET-only registration assertion added to the routes test; three narrow comment cleanups (checkpoint-kind cardinality `(3)`→`(5)`, fixture header refresh to enumerate Prompt 06 coverage, target-architecture markdown bullet typo `n- inspection blockers` → `- inspection blockers`); this closeout document.

## 3. Files Changed

### Prompt 02 — Shared model and fixture contracts

```text
packages/models/src/pcc/PermitInspectionControlCenter.ts
packages/models/src/pcc/PermitInspectionControlCenter.test.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/fixtures/permitInspectionControlCenter.ts
packages/models/src/pcc/fixtures/index.ts
```

### Prompt 03 — Backend GET-only mock read model

```text
backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
```

### Prompt 04 — SPFx read-model client parity

```text
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.ts
apps/project-control-center/src/api/pccReadModelClient.test.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
apps/project-control-center/src/api/pccBackendReadModelClient.test.ts
```

### Prompt 05 — SPFx Wave 10 surface shell

```text
apps/project-control-center/src/surfaces/projectReadiness/permitInspectionControlCenterViewModel.ts
apps/project-control-center/src/surfaces/projectReadiness/usePermitInspectionControlCenterReadModel.ts
apps/project-control-center/src/surfaces/projectReadiness/PccPermitInspectionControlCenterRegions.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccPermitInspectionControlCenterRegions.module.css
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccPermitInspectionControlCenterRegions.test.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

### Prompt 06 — Priority Actions / Readiness / Approvals integration

```text
packages/models/src/pcc/PermitInspectionControlCenter.ts
packages/models/src/pcc/PermitInspectionControlCenter.test.ts
packages/models/src/pcc/fixtures/permitInspectionControlCenter.ts
packages/models/src/pcc/fixtures/priorityActions.ts
apps/project-control-center/src/surfaces/projectReadiness/PccPermitInspectionControlCenterRegions.tsx
apps/project-control-center/src/tests/PccPermitInspectionControlCenterRegions.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.test.tsx
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.test.ts
```

### Prompt 07 — Tests, guardrails, cleanup, closeout

```text
packages/models/src/pcc/PermitInspectionControlCenter.ts
packages/models/src/pcc/fixtures/permitInspectionControlCenter.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Permit_Inspection_Control_Center_Target_Architecture.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Implementation_Closeout.md
```

## 4. What Was Implemented

- A unified Wave 10 Permit & Inspection Control Center read-model surfaced through the existing PCC read-model client family, hosted inside Project Readiness, and rendered as a thirteen-lane inert command-center.
- Eleven permit statuses, eleven inspection statuses, five checkpoint kinds, and four checkpoint trigger concepts (closeout authorization, no-reinspection exception, evidence override-by-reason, transition exception override) — all read-only metadata, with `override-by-reason` preserved for backward compatibility.
- Required target-added fields: `revision`, `applicationValue`, `permitFee`, `reInspectionFee`.
- Failed/reinspection lineage with parent/child traceability and a dedicated reinspection fee record using `relatedRecordType: 'reinspection'` and `reInspectionFee`.
- All eleven Project Readiness signal conditions called for in the Wave 10 architecture (missing evidence, failed inspection, expired/overdue permit, expiring permit, open permit fee, open reinspection fee, revision required, reinspection required, inspection ready to request, inspection not scheduled, closeout/TCO/CO exposure), all preserving `readinessSourceModuleId === 'permit-log'`.
- AHJ launcher-only posture (`launcherOnly: true`, no anchors, no live links, AHJ rendered as text).
- Evidence reference-only posture (no upload affordance, no file input, Document Control ownership preserved).
- GET-only backend route at `pcc/projects/{projectId}/permit-inspection-control-center` with deterministic fixture data for known projects and a degraded source-unavailable envelope for unknown / backend-unavailable cases.
- A static no-runtime guardrail layer (model-side static-source scan, dormancy walker over SPFx surfaces/shell/api/, rendered-DOM scans) confirming no AHJ / Procore / Microsoft Graph / SharePoint REST / PnP runtime tokens, no `fetch(` outside the existing backend client allowlist, no mutation/execution identifiers, and no write-route handlers.

## 5. What Was Intentionally Not Implemented

- Live AHJ scraping, AHJ API calls, AHJ inspection scheduling, AHJ permit submission, AHJ status polling.
- Procore runtime integration, Procore sync, write-back, or mirror.
- Microsoft Graph runtime integration; SharePoint REST or PnP runtime operations.
- Evidence upload, evidence storage, evidence sync, or evidence mirror.
- Backend write routes; approval execution; workflow mutation; checkpoint resolution.
- New top-level PCC surface, new `PccMvpSurfaceId`, new `PccSurfaceRouter` case, new `readModelClient={...}` JSX thread, or a `apps/project-control-center/src/surfaces/permitInspectionControlCenter/` directory.
- New Priority Action category; new Project Readiness source-module identifier; rename of `permit-log`.
- SPFx packaging / `.sppkg` generation / app catalog deployment / tenant mutation / production rollout.
- Package or dependency changes; lockfile changes; manifest version bumps; CI/workflow edits.

## 6. Guardrail Coverage Summary

- **Shared model contract** (`packages/models/src/pcc/PermitInspectionControlCenter.test.ts`, 33 tests): cardinalities (11/11/5), all target-added fields, failed/reinspection lineage, four trigger concepts plus `override-by-reason` preservation, `readinessSourceModuleId === 'permit-log'`, AHJ launcher-only, evidence reference-only, source-level forbidden-import / mutation-token scan of the model and fixture files.
- **Backend mock provider** (`pcc-mock-read-model-provider.test.ts`): `readOnly: true`, `mode: 'mock'`, known/unknown/backend-unavailable envelope shape, source-level forbidden-import / mutation-token scan of the provider source.
- **Backend routes** (`pcc-read-model-routes.test.ts`, 7 tests including the Prompt 07 addition): exactly eleven GET registrations across the host (no POST/PUT/PATCH/DELETE anywhere), `withAuth` everywhere, unknown-project degradation, projectId validation, and an explicit Wave-10-path-specific assertion that exactly one registration exists at `pcc/projects/{projectId}/permit-inspection-control-center` named `getPccPermitInspectionControlCenter` with `methods === ['GET']` and no write-method handler against the same path.
- **SPFx clients** (`pccReadModelClient.test.ts`, `pccFixtureReadModelClient.test.ts`, `pccBackendReadModelClient.test.ts`): type-symmetric interface, eleven-route GET-only mapping, fixture/known/unknown/backend-unavailable behavior, base-URL normalization, fetch-availability guard, fetch-callsite allowlist confined to `pccBackendReadModelClient.ts` and its test.
- **Wave 10 surface** (`PccPermitInspectionControlCenterRegions.test.tsx`): thirteen regions render, bento direct-child invariant, target-added fields rendered, lineage details, AHJ-as-text (no anchors), evidence reference-only (no file inputs / no upload buttons), full inert posture, readiness-source preservation, four checkpoint trigger renderings, no Procore / Graph / SP runtime tokens in DOM.
- **Project Readiness host** (`PccProjectReadinessSurface.test.tsx`): Wave 10 marked `implemented` with the Wave 10 label; no enabled buttons or external anchors across readiness surfaces.
- **Project Home** (`PccProjectHome.test.tsx`): ten-card bento, Priority Actions inert, no live hrefs, Wave 5 priority-action suppressions intact.
- **Static dormancy** (`pcc-api-dormancy.test.ts`): recursive walk of `apps/project-control-center/src/` (surfaces/, shell/, api/, mount.tsx) with comment + string-literal stripping (template expressions preserved); forbidden import paths, forbidden runtime identifiers, forbidden mutation/execution identifiers, and `fetch(` callsites with the backend-client allowlist. Wave 10 surface and shell files are auto-included by `SRC_ROOT` recursion.

## 7. Validation Results

### 7.1 Prior validation history (Prompts 02–06)

The Prompt 02–05 closeouts and the existing `Wave_10_Documentation_Closeout.md` capture per-prompt validation history at the corresponding commits. Each landed with the package-local `check-types` + `test` validation suite green; SPFx app `build` green from Prompt 04 onward. Lockfile MD5 unchanged across the entire sequence (`c56df7b79986896624536aab74d609f4`). Reference those closeout files and commit-level evidence (Prompt 06 commit `af77151fd56b892750399eb7ad3285b003035b69` is the final pre-Prompt-07 implementation commit) for prompt-specific outcomes; this section does **not** restate them.

### 7.2 Prompt 07 validation actually executed in this run

| Command                                                         | Result                                                                                                                           |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short` (pre-edit)                                 | clean working tree (no Prompt 06 spec-doc working-tree noise; the prior modifications had already been committed in `f2bb14665`) |
| `git rev-parse HEAD` (pre-edit)                                 | `f2bb14665c97be59675d82d4e0e1332d3930ca6c`                                                                                       |
| `md5 pnpm-lock.yaml` (pre-edit)                                 | `c56df7b79986896624536aab74d609f4`                                                                                               |
| `pnpm --filter @hbc/models check-types`                         | passed                                                                                                                           |
| `pnpm --filter @hbc/models test`                                | 35 test files / 303 tests passed                                                                                                 |
| `pnpm --filter @hbc/functions check-types`                      | passed                                                                                                                           |
| `pnpm --filter @hbc/functions test`                             | 139 test files / 2293 tests passed (3 skipped, all pre-existing)                                                                 |
| `pnpm --filter @hbc/functions test --run pcc-read-model-routes` | 7 tests passed (was 6; +1 Wave 10 absence test)                                                                                  |
| `pnpm --filter @hbc/spfx-project-control-center check-types`    | passed                                                                                                                           |
| `pnpm --filter @hbc/spfx-project-control-center test`           | 40 test files / 779 tests passed                                                                                                 |
| `pnpm --filter @hbc/spfx-project-control-center build`          | succeeded; bundle 404.07 kB (gzip 104.15 kB), CSS 35.49 kB (gzip 5.85 kB)                                                        |
| `git diff --check`                                              | clean (no whitespace errors)                                                                                                     |
| `pnpm exec prettier --check <Prompt 07 touched files>`          | "All matched files use Prettier code style!"                                                                                     |
| `md5 pnpm-lock.yaml` (post-validation)                          | `c56df7b79986896624536aab74d609f4` (unchanged)                                                                                   |

## 8. Lockfile Checksum Before/After

- Before Prompt 07: `c56df7b79986896624536aab74d609f4`
- After Prompt 07: `c56df7b79986896624536aab74d609f4`

No lockfile change.

## 9. Change-Safety Confirmations

- **No package/dependency changes.** No `pnpm add`, `pnpm install`, `pnpm update`, or any other dependency-manager command was run.
- **No manifest changes.** SPFx manifests, `config/package-solution.json`, and the SPFx 4-part version were not modified. No manifest title bump was performed; Prompt 07 makes no UI/manifest behavior change.
- **No CI/workflow changes.** GitHub workflows, deployment scripts, and `.github/**` were not modified.
- **No tenant mutation.** No app catalog upload, no `.sppkg` generation, no provisioning scripts, no live tenant calls.
- **No AHJ runtime.** No AHJ API client, scraping, polling, scheduling, submission, or status endpoint code; AHJ posture remains launcher-only.
- **No Procore runtime.** No Procore client, sync, write-back, or mirror behavior was introduced; Procore posture remains reference-only.
- **No Microsoft Graph / SharePoint REST / PnP runtime.** No `@pnp/`, `@microsoft/microsoft-graph-client`, `MSGraphClient`, `GraphServiceClient`, `SPHttpClient`, `_api/web`, or `sp.web` code was introduced; static dormancy guard continues to enforce absence.
- **No evidence storage / upload / sync / mirror.** Evidence remains references-only with no file input or upload affordance.
- **No backend write route.** Wave 10 path is exactly one GET-only registration; no POST/PUT/PATCH/DELETE handler exists for `pcc/projects/{projectId}/permit-inspection-control-center` (now explicitly asserted by the Prompt 07 route test).
- **No approval execution.** Approval/checkpoint signals are local read-only metadata; no execution or mutation API is introduced.

## 10. Project Readiness / Wave 8 Boundary Confirmation

- `permit-log` remains in `PROJECT_READINESS_SOURCE_MODULES` and continues to be the Wave 10 readiness compatibility identifier.
- Wave 10 readiness signals carry `readinessSourceModuleId === 'permit-log'` end-to-end.
- The Wave 8 Project Readiness Module Framework is not renamed, restructured, or rewritten by Wave 10.
- Wave 10 is hosted inside `PccProjectReadinessSurface`; no standalone top-level PCC surface was introduced.

## 11. Approvals / Wave 14 Boundary Confirmation

- Wave 10 approval/checkpoint signals are local read-only metadata published from the Wave 10 read-model.
- Wave 14 remains the authoritative owner of the canonical Approvals / Checkpoints vocabulary, queue, and authority logic. Wave 10 introduces no approval execution surface, no `executeApproval`, `approveCheckpoint`, or `createApproval` API, and no mutation path.
- `override-by-reason` is preserved as a checkpoint kind for backward compatibility alongside the four trigger concepts.

## 12. Remaining Deferred Items

- Live AHJ adapters (scraping, API integration, scheduling, submission, status).
- Procore live data adapters; Microsoft Graph / SharePoint REST adapters.
- Evidence ingestion / upload / sync / mirror; canonical evidence storage path.
- Approval execution and Wave 14 Approvals / Checkpoints implementation.
- SPFx packaging, `.sppkg` build, app catalog deployment, tenant rollout, production rollout.
- Final runtime policy vocabularies for ambiguous fields and import normalization rules; role/action policy granularity enforcement design — all carried forward from `Wave_10_Documentation_Closeout.md`.

## 13. Recommended Next Wave

Per the committed Phase 3 Development Roadmap (`docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`), the next Milestone 4 Project Readiness module after Wave 10 is **Wave 11 — Responsibility Matrix** (subtitle: RACI + Owner-Contract Responsibility Control Center). Recommend Wave 11 planning proceed using its existing plan-library scaffold under `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-11/`.
