# Wave 13 — Prompt 13F — Cross-Module Remediation, Validation, and Closeout

Date: 2026-05-04
Wave: 13 (Procore Data-Layer Roadmap Update)
Closeout prompt: 13F
Active execution authority: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/`

## 1. Objective and Scope Lock

Patch existing PCC module posture across Waves 6–13 against the shared
Procore data-layer contracts produced by 13B–13E, verify Buyout Log
consumes shared lineage / object-link / curated-summary / derived-signal
contracts without parallel local Procore type definitions, and close the
Wave 13 Procore data-layer remediation package.

Scope-lock inputs:

- Audit matrix: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/artifacts/wave_13a_module_remediation_target_matrix.json`
- Validation gates: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/artifacts/validation_gates.json`
- Wave-99 supersede note: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-99-procore/artifacts/module_remediation_target_matrix.json` declares historical_context_only_non_authoritative; active authority is the Wave 13 path above.

Closeout outcome: docs-only. The audit found no module that required a
13F-scope source patch. Substantive feature gaps are recorded as residual
risks under Section 9.

## 2. Per-Prompt Commit Attribution

| Prompt | Commit      | Subject                                                                         |
| ------ | ----------- | ------------------------------------------------------------------------------- |
| 13B    | `8d53bd67b` | feat(models-pcc): add hb central projects registry and procore mapping contract |
| 13C    | `b5d81bb77` | feat(models-pcc): add shared procore data layer contracts and fixtures          |
| 13D    | `2463af25e` | feat(functions-pcc): add procore data layer read model routes and mock provider |
| 13E    | `92111e31d` | feat(spfx-pcc): surface procore fixture signals across core pcc views           |
| 13F    | this commit | docs(pcc): close wave 13 procore data layer remediation                         |

Pre-edit HEAD prior to 13F: `42e917309d73a54ff1f5da42979bab6cdc35e3e5`
(commit `42e917309 feat(pcc): PCC shell webpart, SPFx build packaging, Phase 14 & Estimating Workbench docs`).

## 3. Module-by-Module Audit (Waves 6–13)

PASS = current source matches the 13F-scope criteria (shared-contract
usage where 13E touched the surface; structural absence of forbidden
runtime; guardrail tests asserting no SDK / no live URL / no write-verb
identifiers / no source-of-truth claims). REMEDIATE rows would describe
the minimum patch required; none were recorded.

| Wave | Module                                                         | Posture                                                                                                                                                                                                                                | Evidence (paths / markers / tests)                                                                                                                                                                                                                                                                                                             |
| ---- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6    | Team & Access                                                  | PASS — guardrail-only Procore surface; Procore Directory Comparison surface itself is deferred (residual risk).                                                                                                                        | `apps/project-control-center/src/surfaces/teamAccess/PccAccessExecutionQueue.test.tsx:291,308` (`'procore'`, `'ProcoreClient'` listed in forbidden specifiers); same forbidden-import block in `PccAccessRequestForm.test.tsx`, `PccAccessReviewControls.test.tsx`, `PccExecutionStatusPanel.test.tsx`.                                        |
| 7    | HB Document Control Center                                     | PASS — no Procore-aware document/drawing/spec/photo metadata seam present; no parallel Procore type definitions; document-currency contract deferred (residual risk).                                                                  | `apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx:24` (boundary comment only — “3. External Systems — Procore / Document Crunch / Adobe Sign”).                                                                                                                                                                      |
| 8    | Project Readiness Module Framework                             | PASS — Procore source-confidence card landed in 13E; readiness-impact (RFI / submittal / observation / punch / daily-log / drawing-spec) deferred (residual risk).                                                                     | `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessProcoreSourceConfidenceCard.tsx`; client/view-model wired via `PccProjectReadinessSurface.tsx:71,77,259,268`; uses `IPccProcoreSurfaceClient`, `useProcoreSurfaceReadModel`.                                                                                     |
| 9    | Project Lifecycle Readiness Center                             | PASS — startup/safety/closeout consume the same Procore surface client landed in 13E; deeper source-confidence binding is deferred (residual risk).                                                                                    | Same `useProcoreSurfaceReadModel` seam reused via `projectReadiness` surface; no parallel Procore type definitions in `lifecycleReadinessAdapter.ts`, `lifecycleReadinessViewModel.ts`.                                                                                                                                                        |
| 10   | Permit & Inspection Control Center                             | PASS — Wave 10 preview docblock asserts no AHJ/Procore/Graph/SharePoint runtime; object-link evidence binding is deferred (residual risk).                                                                                             | `apps/project-control-center/src/surfaces/projectReadiness/permitInspectionControlCenterViewModel.ts:75` (`'Read-only Wave 10 preview — no AHJ, Procore, Graph, or SharePoint runtime.'`); inline `sourceLineage` references at `PccPermitInspectionControlCenterRegions.tsx:492-493` are workbook-source lineage, not parallel Procore types. |
| 11   | Responsibility Matrix                                          | PASS — no Procore surface code; no parallel Procore type definitions; Procore-vs-PCC comparison surface is deferred (residual risk).                                                                                                   | `apps/project-control-center/src/surfaces/responsibilityMatrix/**` — zero matches for `procore` / `sourceLineage` / `objectLink` / `curatedSummary` / `derivedSignal`.                                                                                                                                                                         |
| 12   | Constraints Log (Make-Ready Constraint & Risk Exposure Center) | PASS — `sourceLineage` references are workbook-source (`workbook · sheetSection · rowReference`), not parallel Procore type definitions; Procore-derived constraint candidates and human-acceptance gate are deferred (residual risk). | `apps/project-control-center/src/surfaces/constraintsLog/constraintsLogAdapter.ts:668,705,717,755`; `constraintsLogViewModel.ts:279`; `PccConstraintsLogRegions.tsx:590`.                                                                                                                                                                      |
| 13   | Buyout Log                                                     | PASS — extensive shared-contract-aligned reference posture; Procore lineage / commitment fields are inline reference-only; structural absence of forbidden runtime enforced by guardrail tests.                                        | Buyout Log verification — see Section 4.                                                                                                                                                                                                                                                                                                       |

## 4. Buyout Log Verification

Verification targets came from the Wave 13 row of
`wave_13a_module_remediation_target_matrix.json`: object-links / curated
summaries / reconciliation evidence / derived signals only; no
write-back; no Sage posting or accounting truth; reuse shared 13C–13E
contracts without parallel local Procore type definitions.

### 4.1 Shared-contract structural compatibility

- The Wave 13 Buyout domain contract `BuyoutSourceLineage`
  (`packages/models/src/pcc/BuyoutLog.ts:392-394`) is a multi-source
  lineage type discriminated by
  `sourceSystem: BuyoutSourceSystem`, with `'procore'` as one of the
  branches. It is not a parallel Procore-specific type — it is the
  Buyout-domain unified lineage shape.
- The shared 13C Procore contracts `PccProcoreSourceLineage`,
  `PccProcoreObjectLink`, `PccProcoreCuratedSummary`,
  `PccProcoreDerivedSignal` live in
  `packages/models/src/pcc/PccProcoreDataLayer.ts:370,385,424,513` and
  are exported from `packages/models/src/pcc/index.ts:380,383-390` for
  use by Procore-specific surfaces (Project Home, Project Readiness,
  External Systems, Site Health) wired in 13E.
- `BuyoutSourceLineage` and the shared 13C contracts are
  complementary, not parallel-conflicting. Buyout records carry
  Procore reference fields inline (`procoreCommitmentNumber`,
  `procoreCompanyId`, `procoreCurrentCommitmentAmount`,
  `procoreOriginalCommitmentAmount` —
  `apps/project-control-center/src/surfaces/buyoutLog/buyoutLogAdapter.ts:949-952`)
  whose shape is structurally compatible with `PccProcoreObjectLink` /
  `PccProcoreCuratedSummary` for any later surface that wishes to map
  Buyout commitments into the shared envelope.
- The view-model interface
  `IPccBlProcoreReconciliationViewModel`
  (`apps/project-control-center/src/surfaces/buyoutLog/buyoutLogViewModel.ts:320`)
  is a UI display projection, not a domain-level parallel Procore type.

### 4.2 Read-only marker posture

- `procore-commitment-pending` and `procore-commitment-created` are
  members of `BUYOUT_PACKAGE_STATES`
  (`packages/models/src/pcc/BuyoutLog.ts` lifecycle tuple). Inline
  comments mark each entry as
  `// Reference-posture state: imported lineage only; no Procore I/O.`
- The Buyout adapter copy (`buyoutLogAdapter.ts:351-352`) renders
  these as `Procore commitment pending (imported lineage)` and
  `Procore commitment created (imported lineage)`.
- No exported function in `BuyoutLog.ts` triggers Procore I/O,
  write-back, commitments, POs, subcontracts, SOVs, CCOs, invoices,
  or payments (module-level docblock declares this; structural absence
  is enforced at runtime by `tests/buyoutLogGuardrails.test.ts`).

### 4.3 Forbidden I/O — structural absence (grep evidence)

Workspace grep across
`apps/project-control-center/src/surfaces/buyoutLog/**`,
`packages/models/src/pcc/BuyoutLog.ts`, and
`packages/models/src/pcc/fixtures/buyoutLog.ts` for any of:

```
fetch(   axios.   @pnp/   sp.web   _api/web   MSGraphClient
ProcoreClient   @microsoft/microsoft-graph   @microsoft/sp-http
procore-sdk   @sage/
```

returned **zero** matches (excluding boundary copy and forbidden-token
catalogues in tests).

### 4.4 Guardrail test coverage anchor

`apps/project-control-center/src/tests/buyoutLogGuardrails.test.ts`
asserts (eight describe blocks):

1. No live URLs in stripped Buyout Log source files.
2. No write-verb identifiers (`create*`, `post*`, `put*`, `delete*`,
   `writeBack*`, `sendTo*`, `syncTo*`, `upload*`, `submitTo*`,
   `mutate*`).
3. No HBI source-of-truth claim copy
   (`HBI is the source of truth`, `system of record`,
   `replaces Procore/Sage/Microsoft Graph/SharePoint`).
4. No affirmative legal / claim / accounting determination claims.
5. `IPccBuyoutLogReadModelClient` exposes only `getBuyoutLog`.
6. Loading view-model surfaces `aria-busy="true"` via
   `PccPreviewState`.
7. Error view-model surfaces `role="alert"` via `PccPreviewState`.
8. No standalone shell-route or active-surface marker for
   `buyout-log` in the rendered `PccApp`.

### 4.5 Verification outcome

Buyout Log: PASS. Shared-contract usage is structurally compatible;
reference-posture markers are read-only; no I/O; guardrail tests
enforce structural absence.

## 5. 13E Marker Vocabulary (repo-truth, do not change)

The Procore degraded-state vocabulary actually exported by 13E is the
seven-value tuple at
`apps/project-control-center/src/viewModels/procoreSurfaceAdapter.ts:56-64`:

```
unmapped | stale | permission-denied | tool-disabled | rate-limited | partial-sync | backend-unavailable
```

`available` is represented as `degradedStateId === null` on
`IPccProcoreSurfaceViewModel` (line 107 of the same file; null tone
maps to `'success'`). The complementary envelope-level
`PCC_READ_MODEL_SOURCE_STATUSES`
(`packages/models/src/pcc/PccReadModels.ts:61-69`) is the seven-value
tuple `available | backend-unavailable | source-unavailable |
missing-config | stale | unauthorized | forbidden`. Both are locked.

## 6. Guardrail Attestation

13F preserved every Wave 13 Procore data-layer guardrail. None of the
following were introduced or weakened in 13B / 13C / 13D / 13E or in
this 13F closeout pass:

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
  CI/CD edit, or workflow change.
- No `package.json` / `pnpm-lock.yaml` / manifest edit.

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

Per the Wave 13 lockfile-discipline rule, lockfile drift is forbidden in
this docs-only closeout.

## 9. Residual Risks

These items are **out of scope** for 13F under the user-approved narrow
patch rule (no `packages/models/**`, no `backend/**`, no new model
exports, no vocabulary changes, minimal SPFx surface patches only when
the audit records REMEDIATE). They remain valid product work for a
later, separately-authorized prompt.

1. **Wave 6 — Team & Access Procore Directory Comparison surface** is
   not implemented. Mismatch categories
   (`in Procore not PCC`, `in PCC not Procore`, `inactive`,
   `company/role mismatch`) and the no-auto-grant rule are documented
   in the matrix as Wave 6 target posture but not landed.
2. **Wave 7 — Document Control** lacks Procore document /
   drawing / spec / photo metadata seam, evidence object-links, and
   document-currency contract on the SPFx surface.
3. **Wave 8 — Project Readiness** has the source-confidence card from
   13E but lacks Procore-derived readiness impacts (unresolved RFI,
   overdue submittal, open observation, open punch, missing daily log,
   stale drawing/spec, unmapped Procore project). Stale-data-cannot-
   support-green-readiness rule needs explicit policy expression.
4. **Wave 9 — Lifecycle Readiness** lacks startup / safety / closeout
   binding to Procore supporting context and source-confidence scoring
   based on mapping / sync health / freshness.
5. **Wave 10 — Permit & Inspection Control Center** lacks Procore
   object-link evidence for drawings / specs / photos / daily logs /
   observations / RFIs / Procore inspections.
6. **Wave 11 — Responsibility Matrix** lacks PCC-vs-Procore actual
   workflow ownership comparison surface.
7. **Wave 12 — Constraints Log** lacks Procore-derived constraint /
   risk / exposure candidates and the human-acceptance gate.
8. **Buyout Log shared-envelope adoption** — Buyout adapter could
   later expose `PccProcoreObjectLink[]` / `PccProcoreCuratedSummary[]`
   shapes derived from `BuyoutSourceLineage` records where
   `sourceSystem === 'procore'`, for cross-surface composition. Not a
   correctness gap; an enhancement.
9. **Hosted / tenant runtime parity unproven.** Per Section 10 below,
   13B–13F establish package truth only; hosted behavior, runtime
   stamps, manifest / app-catalog parity, and any browser-rendered
   evidence remain operator-pending.
10. **Procore subject-area registry expansion.** The MVP write-blocked
    posture in `PCC_PROCORE_SUBJECT_AREA_REGISTRY`
    (`PccProcoreDataLayer.ts`) constrains coverage; later expansion
    requires its own ADR.
11. **Wave-99-procore historical package** remains on disk per the
    supersede note. Not edited; not authoritative; left as historical
    context.

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
be appended to this section **only** by a separately authorized hosted
proof prompt.

## 11. Next-Gate Recommendation — Controlled Non-Production Live-Read Proof

The next gate after the Wave 13 Procore data-layer remediation closes is
a **controlled non-production live-read proof** with the following hard
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
- Post-gate evidence package mirrors the structure of this closeout
  (audit table, validation evidence, lockfile MD5, operator-pending
  marker downgraded to operator-confirmed for the proven scope).

This recommendation supersedes any earlier informal next-step language;
no live Procore I/O is authorized prior to this gate.

## 12. Manifest / Package-Solution Decision

13F is **docs-only**. Per the user-approved manifest rule:

> If 13F is docs-only, do not bump `package-solution.json`.

`apps/project-control-center/config/package-solution.json` was not
modified by 13F. `package.json` and `pnpm-lock.yaml` were not modified
by 13F. No version bump landed.

A bump policy citation was not located for docs-only closeout commits in
the active repo guidance (`docs/reference/developer/verification-commands.md`,
`.claude/rules/13-spfx-runtime-and-manifest-routing.md`,
`.claude/rules/projects/pcc-phase-3.md`). The docs-only rule is therefore
applied without a bump.

## 13. Concrete Commit Proof

Captured at the moment of staging the 13F closeout commit (this commit):

- `git diff --cached --name-only`:
  ```
  docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/Wave_13_Procore_Data_Layer_Closeout.md
  docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/docs/11_WAVE_13F_CROSS_MODULE_REMEDIATION_AND_CLOSEOUT.md
  ```
- `git diff --cached --stat`: see commit description; only the two
  closeout `.md` files are staged. No source / model / backend /
  manifest / lockfile / package files are staged.
- Validation results:
  - `git diff --check`: clean (no whitespace errors).
  - `pnpm exec prettier --check` against the two new closeout `.md`
    files: pass.
- Lockfile MD5 (post-staging): `c56df7b79986896624536aab74d609f4`
  (unchanged from pre-edit).
- Manifest decision: untouched (docs-only).

If any of the above lines materially differ from the actual commit
artefact, treat the actual commit as the source of truth and supersede
this section with a follow-up amendment in a later prompt.
