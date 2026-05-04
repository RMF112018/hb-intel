# Wave 13 Procore Data-Layer Closeout

Date: 2026-05-04
Wave: 13 (Procore Data-Layer Roadmap Update)
Closeout prompt: 13F
Module: PCC Procore Data Layer (cross-module — Waves 6–13)
Active execution authority: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/`

## 1. Closeout Objective and Scope Lock

Formally close the Wave 13 Procore data-layer remediation by validating
that PCC modules across Waves 6–13 honor the shared 13C contracts and
13E surface posture, that Buyout Log uses Procore data only as imported
lineage / object-link / curated-summary references with no I/O or
write-back, and that no live Procore runtime, SDK, or write-back was
introduced. Companion plan-package closeout:
`docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/docs/11_WAVE_13F_CROSS_MODULE_REMEDIATION_AND_CLOSEOUT.md`.

Audit-input artifact:
`docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/artifacts/wave_13a_module_remediation_target_matrix.json`.

Validation-gates artifact:
`docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/artifacts/validation_gates.json`.

The wave-99 Procore planning package remains historical context only,
per its in-file supersede note.

Closeout outcome: docs-only. The audit recorded no module that required
a 13F-scope source patch under the user-approved narrow patch rule.
Substantive feature gaps are recorded as residual risks under
Section 9.

## 2. Per-Prompt Commit Attribution (Baseline Lineage)

| Prompt | Commit      | Subject                                                                         |
| ------ | ----------- | ------------------------------------------------------------------------------- |
| 13B    | `8d53bd67b` | feat(models-pcc): add hb central projects registry and procore mapping contract |
| 13C    | `b5d81bb77` | feat(models-pcc): add shared procore data layer contracts and fixtures          |
| 13D    | `2463af25e` | feat(functions-pcc): add procore data layer read model routes and mock provider |
| 13E    | `92111e31d` | feat(spfx-pcc): surface procore fixture signals across core pcc views           |
| 13F    | this commit | docs(pcc): close wave 13 procore data layer remediation                         |

Pre-edit HEAD prior to 13F: `42e917309d73a54ff1f5da42979bab6cdc35e3e5`.

## 3. Module-by-Module Audit (Waves 6–13)

PASS = current source matches the 13F-scope criteria (shared-contract
usage where 13E touched the surface; structural absence of forbidden
runtime; guardrail tests asserting no SDK / no live URL / no write-verb
identifiers / no source-of-truth claims). REMEDIATE rows would describe
the minimum patch required; none were recorded.

| Wave | Module                                                         | Posture                                                                                                                         | Evidence (paths / markers / tests)                                                                                                                                                                                                                                      |
| ---- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6    | Team & Access                                                  | PASS — guardrail-only Procore surface; Procore Directory Comparison surface deferred (residual risk).                           | Forbidden specifiers `'procore'` / `'ProcoreClient'` listed in `apps/project-control-center/src/surfaces/teamAccess/PccAccessExecutionQueue.test.tsx:291,308`, `PccAccessRequestForm.test.tsx`, `PccAccessReviewControls.test.tsx`, `PccExecutionStatusPanel.test.tsx`. |
| 7    | HB Document Control Center                                     | PASS — no parallel Procore type definitions; document-currency contract deferred (residual risk).                               | `apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx:24` (boundary comment only).                                                                                                                                                                |
| 8    | Project Readiness Module Framework                             | PASS — Procore source-confidence card landed in 13E; readiness-impact taxonomy deferred (residual risk).                        | `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessProcoreSourceConfidenceCard.tsx`; `PccProjectReadinessSurface.tsx:71,77,259,268`; `useProcoreSurfaceReadModel`; `IPccProcoreSurfaceClient`.                                               |
| 9    | Project Lifecycle Readiness Center                             | PASS — same `useProcoreSurfaceReadModel` seam reused via projectReadiness surface; deeper binding deferred (residual risk).     | `surfaces/projectReadiness/lifecycleReadinessAdapter.ts`, `lifecycleReadinessViewModel.ts`.                                                                                                                                                                             |
| 10   | Permit & Inspection Control Center                             | PASS — Wave 10 preview docblock asserts no AHJ/Procore/Graph/SharePoint runtime; object-link evidence deferred (residual risk). | `apps/project-control-center/src/surfaces/projectReadiness/permitInspectionControlCenterViewModel.ts:75`; `PccPermitInspectionControlCenterRegions.tsx:492-493` (workbook-source lineage, not parallel Procore type).                                                   |
| 11   | Responsibility Matrix                                          | PASS — no Procore surface code; comparison surface deferred (residual risk).                                                    | `apps/project-control-center/src/surfaces/responsibilityMatrix/**` — zero Procore matches.                                                                                                                                                                              |
| 12   | Constraints Log (Make-Ready Constraint & Risk Exposure Center) | PASS — `sourceLineage` references are workbook-source only; Procore-derived candidates deferred (residual risk).                | `surfaces/constraintsLog/constraintsLogAdapter.ts:668,705,717,755`; `constraintsLogViewModel.ts:279`; `PccConstraintsLogRegions.tsx:590`.                                                                                                                               |
| 13   | Buyout Log                                                     | PASS — extensive shared-contract-aligned reference posture; structural absence enforced by guardrail tests.                     | See Section 4.                                                                                                                                                                                                                                                          |

## 4. Buyout Log Verification

### 4.1 Shared-contract structural compatibility

- `BuyoutSourceLineage` (`packages/models/src/pcc/BuyoutLog.ts:392`) is a
  multi-source unified lineage type discriminated by `sourceSystem`,
  with `'procore'` as one branch. It is **not** a parallel
  Procore-specific type.
- The 13C shared contracts (`PccProcoreSourceLineage`,
  `PccProcoreObjectLink`, `PccProcoreCuratedSummary`,
  `PccProcoreDerivedSignal`) live in
  `packages/models/src/pcc/PccProcoreDataLayer.ts:370,385,424,513` and
  re-export from `packages/models/src/pcc/index.ts:380,383-390`.
- Buyout commitment-link rows carry Procore reference fields inline
  (`procoreCommitmentNumber`, `procoreCompanyId`,
  `procoreCurrentCommitmentAmount`, `procoreOriginalCommitmentAmount` —
  `surfaces/buyoutLog/buyoutLogAdapter.ts:949-952`). These shapes are
  structurally compatible with `PccProcoreObjectLink` /
  `PccProcoreCuratedSummary` for any later surface that wishes to
  project Buyout commitments into the shared envelope.
- `IPccBlProcoreReconciliationViewModel`
  (`buyoutLogViewModel.ts:320`) is a UI display projection, not a
  parallel domain contract.

### 4.2 Read-only marker posture

`procore-commitment-pending` and `procore-commitment-created` are
members of `BUYOUT_PACKAGE_STATES` in `BuyoutLog.ts`, with inline
comments declaring `Reference-posture state: imported lineage only; no
Procore I/O.` Buyout adapter labels at `buyoutLogAdapter.ts:351-352`
render them as `Procore commitment pending (imported lineage)` /
`Procore commitment created (imported lineage)`. No `BuyoutLog.ts`
export triggers Procore I/O, write-back, commitment / PO / subcontract /
SOV / CCO / invoice / payment authoring.

### 4.3 Forbidden I/O — structural absence

Workspace grep across `apps/project-control-center/src/surfaces/buyoutLog/**`,
`packages/models/src/pcc/BuyoutLog.ts`, and
`packages/models/src/pcc/fixtures/buyoutLog.ts` for any of `fetch(`,
`axios.`, `@pnp/`, `sp.web`, `_api/web`, `MSGraphClient`,
`ProcoreClient`, `@microsoft/microsoft-graph`, `@microsoft/sp-http`,
`procore-sdk`, `@sage/` returned **zero** matches.

### 4.4 Guardrail test coverage anchor

`apps/project-control-center/src/tests/buyoutLogGuardrails.test.ts`
covers (eight describe blocks):

1. No live URLs in stripped Buyout Log source files.
2. No write-verb identifiers
   (`create*`, `post*`, `put*`, `delete*`, `writeBack*`, `sendTo*`,
   `syncTo*`, `upload*`, `submitTo*`, `mutate*`).
3. No HBI source-of-truth claim copy
   (`HBI is the source of truth`, `system of record`,
   `replaces Procore/Sage/Microsoft Graph/SharePoint`).
4. No affirmative legal / claim / accounting determination claims.
5. `IPccBuyoutLogReadModelClient` exposes only `getBuyoutLog`.
6. Loading view-model surfaces `aria-busy="true"` via
   `PccPreviewState`.
7. Error view-model surfaces `role="alert"` via `PccPreviewState`.
8. No standalone shell-route / active-surface marker for `buyout-log`.

### 4.5 Verification outcome

Buyout Log: PASS. Shared-contract usage is structurally compatible;
reference-posture markers are read-only; no Procore I/O, write-back, or
parallel Procore type definitions; guardrail tests enforce structural
absence.

## 5. 13E Marker Vocabulary (repo-truth)

The Procore degraded-state vocabulary actually exported by 13E is the
seven-value tuple at
`apps/project-control-center/src/viewModels/procoreSurfaceAdapter.ts:56-64`:

```
unmapped | stale | permission-denied | tool-disabled | rate-limited | partial-sync | backend-unavailable
```

`available` is represented as `degradedStateId === null` on
`IPccProcoreSurfaceViewModel` (`procoreSurfaceAdapter.ts:107`). The
complementary envelope-level `PCC_READ_MODEL_SOURCE_STATUSES`
(`packages/models/src/pcc/PccReadModels.ts:61-69`) is the seven-value
tuple `available | backend-unavailable | source-unavailable |
missing-config | stale | unauthorized | forbidden`. Both are locked.

## 6. Guardrail Attestation

Confirmed in this closeout wave:

- No live Procore HTTP / network call from SPFx.
- No Procore SDK adoption (forbidden specifiers
  `procore-sdk`, `procoreApi`, `procore-client` enforced at
  `apps/project-control-center/src/tests/pcc-import-guards.test.ts:17-19`).
- No Procore write-back method, route, or UI action.
- No file mirror / binary replication / SharePoint copy of Procore
  file tree.
- No direct SPFx-to-Procore call site.
- No Sage posting, accounting truth, legal / claim / entitlement /
  delay-damage determination derived from Procore data.
- No tenant mutation, app catalog deployment, `.sppkg` generation,
  CI/CD edit, workflow change.
- No source / runtime code, backend, route, model, manifest, package,
  dependency, or lockfile changes in 13F.

## 7. Validation Evidence

Per `validation_gates.json`. Lockfile MD5 captured before any edits and
re-verified after staging.

| #   | Command                                                      | Outcome                                                               |
| --- | ------------------------------------------------------------ | --------------------------------------------------------------------- |
| 1   | `git status --short` (pre-edit)                              | clean working tree                                                    |
| 2   | `git rev-parse HEAD` (pre-edit)                              | `42e917309d73a54ff1f5da42979bab6cdc35e3e5`                            |
| 3   | `md5 pnpm-lock.yaml` (pre-edit)                              | `MD5 (pnpm-lock.yaml) = c56df7b79986896624536aab74d609f4`             |
| 4   | `pnpm --filter @hbc/models check-types`                      | pass — `tsc --noEmit`, no errors                                      |
| 5   | `pnpm --filter @hbc/models test`                             | pass — 42 files, 635 tests passed                                     |
| 6   | `pnpm --filter @hbc/functions check-types`                   | pass — `tsc --noEmit`, no errors                                      |
| 7   | `pnpm --filter @hbc/functions test`                          | pass — 139 files, 2346 passed, 3 skipped                              |
| 8   | `pnpm --filter @hbc/spfx-project-control-center check-types` | pass — `tsc --noEmit`, no errors                                      |
| 9   | `pnpm --filter @hbc/spfx-project-control-center test`        | pass — 61 files, 1373 tests passed                                    |
| 10  | `pnpm --filter @hbc/spfx-project-control-center build`       | pass — vite v6.4.1 production build, 2305 modules transformed         |
| 11  | `pnpm exec prettier --check <new closeouts>`                 | pass after `--write` reformat of both files                           |
| 12  | `git diff --check`                                           | clean (no whitespace errors)                                          |
| 13  | `md5 pnpm-lock.yaml` (post-edit)                             | `MD5 (pnpm-lock.yaml) = c56df7b79986896624536aab74d609f4` (unchanged) |

All listed gates ran. No skips. Package tests / build serve as
regression confirmation that 13B–13E source remains green at HEAD;
13F itself adds zero source/runtime/model/backend code.

## 8. Lockfile MD5 Before / After

- Before any 13F edits: `c56df7b79986896624536aab74d609f4`
- After staging 13F: see Section 13.

## 9. Residual Risks and Follow-Up

These items are **out of scope** for 13F under the user-approved narrow
patch rule and remain valid product work for a later authorized prompt.

1. Wave 6 — Team & Access Procore Directory Comparison surface and
   mismatch-categories taxonomy.
2. Wave 7 — Document Control Procore document / drawing / spec /
   photo metadata seam, evidence object-links, document-currency
   contract.
3. Wave 8 — Project Readiness deeper Procore-derived readiness impacts
   (RFI / submittal / observation / punch / daily-log / drawing-spec)
   and the stale-data-cannot-support-green-readiness rule.
4. Wave 9 — Lifecycle Readiness binding to Procore supporting context
   and source-confidence scoring.
5. Wave 10 — Permit & Inspection object-link evidence for drawings /
   specs / photos / daily logs / observations / RFIs / Procore
   inspections.
6. Wave 11 — Responsibility Matrix PCC-vs-Procore actual workflow
   ownership comparison surface.
7. Wave 12 — Constraints Log Procore-derived constraint / risk /
   exposure candidates and human-acceptance gate.
8. Buyout Log enhancement: optional adapter projection from
   `BuyoutSourceLineage` records (`sourceSystem === 'procore'`) into
   `PccProcoreObjectLink[]` / `PccProcoreCuratedSummary[]` for
   cross-surface composition. Not a correctness gap.
9. Hosted / tenant runtime parity unproven — see Section 10.
10. `PCC_PROCORE_SUBJECT_AREA_REGISTRY` MVP write-blocked posture;
    expansion requires its own ADR.
11. Wave-99-procore historical package remains on disk per supersede
    note; not edited; not authoritative.

## 10. Operator-Pending Hosted / Tenant / Browser Proof Marker

13F is package and documentation truth only. The following are
explicitly **operator-pending** and are NOT claimed in this closeout:

- Hosted SPFx runtime stamp parity in any tenant.
- App-catalog deployment.
- `.sppkg` generation.
- Browser-rendered evidence of any Procore-related card in any tenant.
- Live Procore endpoint reachability.
- Tenant smoke-test screenshots.
- Manifest / package-solution upload to any catalog.

Operator commit, tenant URL, runtime version stamp, and timestamp will
be appended only by a separately authorized hosted proof prompt.

## 11. Next-Gate Recommendation — Controlled Non-Production Live-Read Proof

The next gate after Wave 13 Procore data-layer remediation closes is a
**controlled non-production live-read proof** with the following hard
constraints:

- One mapped pilot project only.
- GET-only against the existing data-layer routes
  (`pcc/projects/{projectId}/procore-project-mapping`,
  `pcc/projects/{projectId}/procore-sync-health`,
  any 13D-registered Procore read-model route).
- Redacted logs only — no project / vendor / contract / financial
  identifiers in retained log artifacts.
- No SharePoint write-back.
- No PCC writes (read-models remain read-only).
- Procore credential rotated post-test; no long-lived secret.
- Reviewed by `hb-tenant-deployment-gatekeeper` and
  `hb-security-and-secrets-auditor` before any live call.
- Post-gate evidence package mirrors the structure of this closeout.

No live Procore I/O is authorized prior to this gate.

## 12. Manifest / Package-Solution Decision

13F is **docs-only**. Per the user-approved manifest rule:

> If 13F is docs-only, do not bump `package-solution.json`.

`apps/project-control-center/config/package-solution.json` was not
modified by 13F. `package.json` and `pnpm-lock.yaml` were not modified
by 13F. No version bump landed.

A bump policy citation was not located for docs-only closeout commits in
the active repo guidance (`docs/reference/developer/verification-commands.md`,
`.claude/rules/13-spfx-runtime-and-manifest-routing.md`,
`.claude/rules/projects/pcc-phase-3.md`). The docs-only rule is
therefore applied without a bump.

## 13. Concrete Commit Proof

Captured at the moment of staging the 13F closeout commit (this commit):

- `git diff --cached --name-only`:
  ```
  docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/Wave_13_Procore_Data_Layer_Closeout.md
  docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/docs/11_WAVE_13F_CROSS_MODULE_REMEDIATION_AND_CLOSEOUT.md
  ```
- `git diff --cached --stat`: only the two closeout `.md` files are
  staged. No source / model / backend / manifest / lockfile / package
  files are staged.
- Validation results:
  - `git diff --check`: clean (no whitespace errors).
  - `pnpm exec prettier --check` against the two new closeout `.md`
    files: pass.
- Lockfile MD5 (post-staging): `c56df7b79986896624536aab74d609f4`
  (unchanged from pre-edit).
- Manifest decision: untouched (docs-only).

If any line above materially differs from the actual commit artefact,
treat the actual commit as source of truth and supersede this section
with a follow-up amendment in a later prompt.

## 14. Recommended Next Prompt

Authorize and execute the controlled non-production live-read proof
described in Section 11, gated by `hb-tenant-deployment-gatekeeper` and
`hb-security-and-secrets-auditor`. Do not begin live-read work without
that gate.
