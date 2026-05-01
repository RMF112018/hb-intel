# Wave 8 — Project Readiness Module Framework Closeout

Generated: 2026-05-01
Classification: Canonical Current-State (PCC Phase 3 / Wave 8)
Status: Closed

Companion documents:

- `Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md`
- `Wave_8_Implementation_Authorization.md`

## 1. Summary

PCC Phase 3 / Wave 8 delivered the **Project Readiness Module Framework** — the shared, reusable framework layer that downstream Waves 9–14 plug into. The Wave 8 user-facing surface is the **Project Readiness Center**, an eight-region read-only framework shell rendered as a Fragment of direct `PccDashboardCard` children inside the PCC bento grid.

Wave 8 was implemented end-to-end as fixture/read-model preview only. Hosted/tenant invocation remains operator-pending. No production rollout was attempted.

Seven commits delivered the wave across six implementation prompts:

| Prompt          | Commit      | Subject                                                          |
| --------------- | ----------- | ---------------------------------------------------------------- |
| 01              | `51ddfc9ab` | docs(pcc): authorize wave 8 readiness framework implementation   |
| 02              | `992542f27` | feat(models-pcc): add project readiness framework contracts      |
| 02 (corrective) | `3d3e81250` | fix(models-pcc): require project readiness source lineage        |
| 03              | `17e727de5` | feat(functions-pcc): add project readiness mock read-model route |
| 04              | `aeeb61cfd` | feat(spfx-pcc): add project readiness read-model client parity   |
| 05              | `4749ff0e1` | feat(spfx-pcc): render project readiness center framework shell  |
| 06              | `5e43e5e15` | test(spfx-pcc): harden project readiness framework summaries     |

## 2. Research-Informed Design Basis

The framework reflects the principles documented in `Wave_8_Implementation_Authorization.md`. The closeout does not re-derive them. In short:

- **OSHA safety readiness** — management responsibility, worker participation, hazard identification, hazard prevention/control, training, multi-employer coordination.
- **CII / PDRI readiness** — domain/gate readiness, project-definition completeness, risk-factor identification, mitigation visibility, repeated readiness checks.
- **CMAA / AIA closeout readiness** — closeout responsibility clarity, interdependent procedures, substantial-completion responsibilities, evidence/document readiness.
- **Procore / Autodesk workflow patterns** — template vs. project instance, customizable sections/items, comments/evidence/status, project-level customization without master-template corruption.
- **Microsoft governance** — metadata, lifecycle, records, permissions, source-of-record boundaries.

No external standard, product, or system was adopted at runtime. Wave 8 borrows principles only.

## 3. Files Changed by Prompt

### Prompt 01 — `51ddfc9ab` (docs only)

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md` (edited — Constraints/Exclusions and Acceptance Criteria sections updated to reference the Authorization doc)
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Implementation_Authorization.md` (created)

### Prompt 02 — `992542f27` (8 files in `@hbc/models`)

Created:

- `packages/models/src/pcc/ProjectReadinessFramework.ts`
- `packages/models/src/pcc/ProjectReadinessFramework.test.ts`
- `packages/models/src/pcc/fixtures/projectReadiness.ts`

Edited:

- `packages/models/src/pcc/PccReadModels.ts`
- `packages/models/src/pcc/PccReadModels.test.ts`
- `packages/models/src/pcc/PccMvpSurfaces.ts`
- `packages/models/src/pcc/index.ts`
- `packages/models/src/pcc/fixtures/index.ts`

### Prompt 02 corrective pass — `3d3e81250` (3 files in `@hbc/models`)

- `packages/models/src/pcc/ProjectReadinessFramework.ts` (made `IProjectReadinessSourceLineage.sourceModuleId` required and made `IProjectReadinessItem.sourceLineage` required)
- `packages/models/src/pcc/fixtures/projectReadiness.ts` (every fixture item now has a `sourceLineage` whose `sourceModuleId` matches the item)
- `packages/models/src/pcc/ProjectReadinessFramework.test.ts` (regression coverage)

### Prompt 03 — `17e727de5` (4 files in `backend/functions`)

- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts`

### Prompt 04 — `aeeb61cfd` (6 files in `apps/project-control-center/src/api`)

- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccReadModelClient.test.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.test.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts`

### Prompt 05 — `4749ff0e1` (9 files)

Created:

- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessViewModel.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.test.ts`
- `apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx`

Edited:

- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx` (full replacement)
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.module.css`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/tests/PccPrompt07.surfaces.test.tsx` (copy cascade)
- `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts` (controlled-consumption guard cascade)

### Prompt 06 — `5e43e5e15` (6 files edited)

- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessViewModel.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.test.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.module.css`
- `apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx`

## 4. Implementation Slices Completed

1. Documentation + authorization gate (Prompt 01).
2. Shared model contracts + deterministic fixtures (Prompt 02 + corrective).
3. Backend mock provider + 9th GET-only read-model route (Prompt 03).
4. SPFx fixture/backend client parity + 9th client interface method (Prompt 04).
5. Six-region Project Readiness Center shell (Prompt 05).
6. Eight-region hardening with ownership / priority-actions preview / risk tags (Prompt 06).

## 5. Shared Model / Read-Model Summary

Const tuples (9): `PROJECT_READINESS_DOMAINS` (14), `PROJECT_READINESS_LIFECYCLE_GATES` (10), `PROJECT_READINESS_SOURCE_MODULES` (10), `PROJECT_READINESS_STATUSES` (9), `PROJECT_READINESS_POSTURES` (6), `PROJECT_READINESS_BLOCKER_STATES` (5), `PROJECT_READINESS_SEVERITIES` (4), `PROJECT_READINESS_CONFIDENCE_STATES` (4), `PROJECT_READINESS_EVIDENCE_STATES` (6).

Interfaces (10) + alias (1):

- `IProjectReadinessSourceLineage` (sourceModuleId required after corrective pass)
- `IProjectReadinessEvidenceRequirement`
- `IProjectReadinessItem` (sourceLineage required after corrective pass)
- `IProjectReadinessDomainSummary`
- `IProjectReadinessGateSummary`
- `IProjectReadinessOwnershipSummary`
- `IProjectReadinessEvidenceSummary`
- `IProjectReadinessBlockerSummary`
- `IProjectReadinessSourceHealthSummary`
- `IProjectReadinessFrameworkSnapshot`
- `PccProjectReadinessFrameworkReadModel` (alias of the snapshot)

Fixtures (9 sample constants): `SAMPLE_PROJECT_READINESS_ITEMS` (7 items), `SAMPLE_PROJECT_READINESS_DOMAIN_SUMMARIES`, `SAMPLE_PROJECT_READINESS_GATE_SUMMARIES`, `SAMPLE_PROJECT_READINESS_OWNERSHIP_SUMMARIES`, `SAMPLE_PROJECT_READINESS_EVIDENCE_SUMMARY`, `SAMPLE_PROJECT_READINESS_BLOCKER_SUMMARY`, `SAMPLE_PROJECT_READINESS_SOURCE_HEALTH_SUMMARY`, `SAMPLE_PROJECT_READINESS_FRAMEWORK_SNAPSHOT`, `SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL`.

Registry updates:

- `PccReadModelResponseMap` extended with key `'project-readiness'` (10th key).
- `PCC_MVP_SURFACES['project-readiness'].description` updated to framework/shell language.

## 6. Backend Mock-Provider / Route Summary

- `IPccReadModelProvider.getProjectReadiness(projectId, viewerPersona?)` added (10th provider method).
- `PccMockReadModelProvider.getProjectReadiness` follows the existing `simulate-backend-unavailable → unknown-project → known-project` pattern using `EMPTY_PROJECT_READINESS_SNAPSHOT` for degraded states and `SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL` for available envelopes.
- GET-only route `pcc/projects/{projectId}/project-readiness` registered as `getPccProjectReadiness` via the existing `registerPccReadRoute` helper. Middleware: `withAuth(withTelemetry(...))`. AuthLevel: `anonymous`. Response shape: `{ data: envelope }` via `successResponse`. Validation: `projectId` required → 400 `VALIDATION_ERROR`.
- `EXPECTED_ROUTES` array in route tests grew 8 → 9; route count test name updated. No write methods (POST/PUT/PATCH/DELETE) introduced.

## 7. SPFx Client / Fixture Parity Summary

- `IPccReadModelClient.getProjectReadiness` (9th interface method).
- Route id `'project-readiness'` added to `PCC_READ_MODEL_ROUTE_IDS` (8 → 9) and to `PCC_READ_MODEL_ROUTE_PATHS`.
- Fixture client method follows the existing simulate-unavailable / unknown / known pattern with module-level `EMPTY_PROJECT_READINESS_SNAPSHOT`.
- Backend client adds one method routing through the existing `callBackend` helper. No new fetch callsites. No changes to fetch resolution, base-URL normalization, envelope validation, or response parsing.
- Test parity preserved via existing exhaustive loops (`ROUTE_METHOD_TUPLES`, default + simulate-backend-unavailable Promise.all loops); related count assertions updated 8 → 9.
- Controlled-consumption guard (`pcc-api-dormancy.test.ts`) updated:
  - `PROJECT_READINESS_ADAPTER_FILE` allowlisted for the narrow `mapPccSourceStatusToPreviewState` import (mirroring the `PROJECT_HOME_ADAPTER_FILE` exception).
  - Router prop count 3 → 4; consumer set extended to include `'project-readiness'`.

## 8. Project Readiness Center Shell Summary

The shell is rendered as a React Fragment of direct `PccDashboardCard` children inside the bento grid. Eight regions:

1. **Hero** — read-only badge, no-execution caption, surface description, active-gate / overall-posture / blocker-count / evidence-confidence stats, source-health badge row. Carries `data-pcc-active-surface-panel="project-readiness"` (the single active marker).
2. **Lifecycle gate map** — 10 gates with per-gate posture chip.
3. **Domain grid** — 14 domains with posture, item count, blocker count, pending-evidence count, confidence.
4. **Blockers and exceptions** — blocked + at-risk items with owner, due, source, severity, posture, and presentational risk-tag chip.
5. **Ownership and accountability** — 5 owner-persona entries with unassigned-gap signal sourced from `assignedUserUpn === undefined`, escalation chips per persona.
6. **Priority Actions preview** — eligible items derived from `relatedPriorityActionId` only; inert "Preview only — Priority Actions remains its own surface" caption.
7. **Evidence and source health** — evidence-state buckets, source-health entries, Document Control reference-only caption.
8. **Downstream modules** — Waves 6, 7, 9, 10, 11 RACI, 12, 13, 14, 15+, plus Site Health.

Optional `readModelClient?: IPccProjectReadinessReadModelClient` prop. Inline `ReadModelContent` child calls the hook unconditionally. Fixture fallback renders the same eight regions from `SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL`.

Stable structural test markers: `data-pcc-readiness-region`, `-gate-id`, `-domain-id`, `-blocker-id`, `-ownership-persona`, `-ownership-unassigned`, `-ownership-escalation`, `-priority-action-id`, `-evidence-state`, `-source-health`, `-downstream-source`, `-downstream-wave`, `-downstream-status`, `-risk-tag`.

All affordances are inert: every readiness `<button>` carries `disabled`; no `<input type="file">`; no enabled Upload control; no executable-label buttons (Submit / Approve / Upload / Run / Execute / Sync / Write back / Writeback / Complete checklist / Run workflow). Verified by structural assertions in `PccProjectReadinessSurface.test.tsx`.

## 9. Ownership / Evidence / Blocker / Risk / Source-Health Summary

- **Ownership-accountability**: 5 owner-persona entries (project-manager, project-coordinator, safety-qaqc, project-executive, superintendent). Total unassigned items: 4 (fixture-pcc-readiness-002, -004, -005, -006). Safety-qaqc carries an unassigned-gap signal because item 004 has no `assignedUserUpn`. Project-manager owns items 001/003/006 with item 006 unassigned. Escalation chips for project-manager include `project-executive` and `manager-of-operational-excellence` (sourced from item 003 `escalationPath`).
- **Evidence**: evidence-state buckets and source-health entries derived from snapshot summaries; explicit reference-only caption tied to HB Document Control Center as the source of record. No upload controls.
- **Blockers**: filtered to items where `posture ∈ {'blocked', 'at-risk'}` or `blockerState ∉ {'none', 'resolved'}`. Items 001, 002, 003, 004 surface in the fixture preview.
- **Risk tags** (presentational): `'critical-blocker' | 'open-blocker' | 'at-risk-warning' | 'monitor'` derived per blocker (precedence: critical → open/escalated → high/at-risk → monitor). Verified: 003 = open-blocker (escalated), 002 = open-blocker (open), 001 = at-risk-warning (posture at-risk), 004 = at-risk-warning (posture at-risk).
- **Priority Actions preview**: lists items carrying `relatedPriorityActionId` (item 003 → `priority-action-permit-001` only). Inert chips, no buttons, explanatory caption.
- **Source-health degraded states**: permit-log (`stale`), buyout-log + external-systems (`source-unavailable`), other modules `available`. Degraded entries rendered structurally and asserted via test markers.

## 10. Validation Results

Captured at closeout time (this prompt's pre-commit run):

| Package                            | Command       | Result                                                                                                       |
| ---------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| `@hbc/models`                      | `check-types` | **PASS**                                                                                                     |
| `@hbc/models`                      | `test`        | **245 / 245** passed across 32 files                                                                         |
| `@hbc/models`                      | `lint`        | **0 errors** (35 pre-existing warnings unrelated to Wave 8)                                                  |
| `@hbc/functions`                   | `check-types` | **PASS**                                                                                                     |
| `@hbc/functions`                   | `test`        | **2283 passed / 3 skipped (2286 total)** across 138 files                                                    |
| `@hbc/functions`                   | `lint`        | **3 pre-existing errors** (see exception note below) + 170 warnings                                          |
| `@hbc/spfx-project-control-center` | `check-types` | **PASS**                                                                                                     |
| `@hbc/spfx-project-control-center` | `test`        | **689 / 689** passed across 38 files                                                                         |
| `@hbc/spfx-project-control-center` | `build`       | **PASS** (`vite v6.4.1` built in 1.34s; bundle 307.92 kB / 85.76 kB gzipped; CSS 31.13 kB / 5.16 kB gzipped) |
| `@hbc/spfx-project-control-center` | `lint`        | **0 errors** (2 pre-existing warnings in unrelated files)                                                    |

`git diff --check` clean. Closeout doc passes `pnpm exec prettier --check`.

### Pre-existing validation exceptions (NOT caused by Wave 8)

`@hbc/functions lint` reports 3 errors in files that predate Wave 8 and are out of scope for this closeout. They were present before Wave 8 started and were not introduced by any Wave 8 commit:

- `backend/functions/src/services/__tests__/safety-ingestion-cutover-guard.test.ts:340` — `no-regex-spaces`
- `backend/functions/src/services/legacy-fallback/matching-contracts.ts:24` — `no-useless-escape`
- `backend/functions/src/services/safety-field-excellence-graph-repository.ts:670` — `no-useless-catch`

These are recorded as pre-existing exceptions per the closeout's "do not fix unrelated lint issues in this prompt" guardrail.

## 11. Lockfile / Package Confirmation

`pnpm-lock.yaml` MD5 unchanged across **all seven Wave 8 commits**.

- Baseline (start of Prompt 01): `c56df7b79986896624536aab74d609f4`
- After Prompt 01 (`51ddfc9ab`): `c56df7b79986896624536aab74d609f4`
- After Prompt 02 (`992542f27`): `c56df7b79986896624536aab74d609f4`
- After Prompt 02 corrective (`3d3e81250`): `c56df7b79986896624536aab74d609f4`
- After Prompt 03 (`17e727de5`): `c56df7b79986896624536aab74d609f4`
- After Prompt 04 (`aeeb61cfd`): `c56df7b79986896624536aab74d609f4`
- After Prompt 05 (`4749ff0e1`): `c56df7b79986896624536aab74d609f4`
- After Prompt 06 (`5e43e5e15`): `c56df7b79986896624536aab74d609f4`
- Pre-closeout (this prompt): `c56df7b79986896624536aab74d609f4`

No `pnpm install`, `pnpm add`, or `pnpm update` was run during Wave 8. No `package.json` modifications. No `@hbc/models` / `@hbc/functions` / `@hbc/spfx-project-control-center` package version bump. No SPFx manifest version bump. No `.sppkg` generation. No deployment.

## 12. Explicit Exclusions

Wave 8 did **not** introduce:

- Wave 9 checklist library implementation
- Startup / Safety / Closeout checklist execution
- RACI implementation
- Permit Log implementation
- Constraints Log implementation
- Buyout Log implementation
- approval / workflow execution
- scoring engine runtime
- live Microsoft Graph file operations
- PnP / SharePoint REST runtime
- SharePoint list / library mutations
- OneDrive folder creation runtime
- Procore writeback / sync / mirror
- Sage runtime / writeback
- Adobe Sign execution
- Document Crunch runtime
- external-system writeback
- tenant mutation
- permission mutation
- Power Automate flow
- SPFx package / deployment change
- package dependency changes
- `pnpm-lock.yaml` changes
- secrets / app settings changes
- production rollout

## 13. Remaining Risks / Operator-Pending Items

- **Hosted/tenant invocation of `getPccProjectReadiness`** is operator-pending. Package-level proof only: route registration validated via Vitest mocks; runtime invocation against a deployed Azure Functions instance was not exercised.
- **SPFx hosted render of the Project Readiness Center** is operator-pending. Package-level proof only via JSDOM (vitest + RTL); SharePoint host (`SharePointFullPage` / `SharePointSection`) execution was not exercised.
- **SPFx backend opt-in** for the readiness surface is **deferred**. The `'project-readiness'` route is registered in the read-model response map and backend route family, but the readiness surface is intentionally not yet included in the SPFx app's backend opt-in surface list. `PccApp.optIn.test.tsx` continues to assert exactly 3 fetch calls (home, priority-actions, document-control). Wiring readiness into backend opt-in is a future-prompt decision and was not done in Wave 8.
- **`apps/project-control-center/README.md` modernization is deferred.** The file contains stale historical Wave 2 / Wave 3 / earlier-wave posture; comprehensive modernization was deemed out of scope for this closeout. Readers should treat this Wave 8 closeout (and the linked authorization/scope-lock docs) as authoritative for Wave 8 truth.
- No new lockfile, package-version, or manifest changes; no production rollout was attempted.

## 14. Wave 9 Handoff Notes

Wave 9 — Project Lifecycle Readiness Center — implements the first lifecycle-readiness _module_ on top of the Wave 8 _framework_. Wave 9 consumes (does not redefine) the Wave 8 contracts:

- the readiness item shape (`IProjectReadinessItem`) and required `sourceLineage`;
- the lifecycle gate enum (10 gates);
- the domain enum (14 domains);
- the source-module-id enum (10 modules);
- the posture / severity / blocker-state / confidence / evidence-state vocabularies;
- the ownership / accountability / blocker / evidence / source-health roll-up shapes;
- the response-map key `'project-readiness'`.

Wave 9 introduces the Startup, Safety, and Closeout _checklist item libraries_ — Wave 8 framework explicitly does not.

Downstream modules surfaced as `'preview-deferred'` in the Wave 8 readiness shell:

- `project-lifecycle-readiness` — Wave 9
- `permit-log` — Wave 10
- `responsibility-matrix` — Wave 11 RACI
- `constraints-log` — Wave 12
- `buyout-log` — Wave 13
- `approvals-checkpoints` — Wave 14
- `external-systems` — Wave 15+

Wave 9 should flip `project-lifecycle-readiness` from `'preview-deferred'` to `'implemented'` and resolve the operator-pending items above where in scope.

## 15. Recommended Next Prompt / Wave

**Wave 9 / Prompt 01** — Project Lifecycle Readiness Center scope-lock + implementation authorization gate, mirroring the Wave 8 / Prompt 01 pattern.

## Cross-Links

- `Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md`
- `Wave_8_Implementation_Authorization.md`
- `phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `phase-3/wave-9/` (forward link)
- `apps/project-control-center/src/surfaces/projectReadiness/`
- `packages/models/src/pcc/ProjectReadinessFramework.ts`
- `backend/functions/src/hosts/pcc-read-model/`
