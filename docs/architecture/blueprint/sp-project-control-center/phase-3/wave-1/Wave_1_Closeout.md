# Phase 3 Wave 1 — Final Closeout (PCC Shared Foundations)

Generated: 2026-04-28
Prompt: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Prompt_07_Wave_1_Exports_Tests_and_Documentation_Closeout.md`
Companions:
- `Wave_1_Repo_Truth_Audit.md`
- `Wave_1_Scope_Lock.md`
- `Wave_1_Prompt_02_Closeout.md`
- `Wave_1_Prompt_03_Closeout.md`
- `Wave_1_Prompt_04_Closeout.md`
- `Wave_1_Prompt_05_Closeout.md`
- `Wave_1_Prompt_06_Closeout.md`

## Roadmap Naming Discipline

This is **Phase 3 / Wave 1** — PCC Shared Foundations. Not "Wave 7" and not "Phase 3 Wave 7." Future Phase 3 waves (SPFx shell, backend read-model, etc.) are separate scopes with their own gate prompts.

## Wave 1 Result

Wave 1 produced a complete, deterministic, side-effect-free PCC shared-foundations surface inside `@hbc/models`. **No PCC shell UI, no Project Home UI, no backend route or API, no provisioning executor, no tenant mutation, no Graph/PnP live calls, no Procore runtime/secrets/mirror/write-back, no direct SPFx-to-Procore path, no production rollout, no app catalog deployment, and no CI/CD deployment changes occurred at any point in Prompts 02–07.** No package or SPFx manifest version was bumped. Phase 1 (`@hbc/project-site-template`) and Phase 2 (`@hbc/project-site-provisioning`) packages were left untouched throughout the wave.

## Final PCC Shared Surface

All exports live under `packages/models/src/pcc/` and are re-exported from `packages/models/src/index.ts` (added in Prompt 02). Subpath imports (`@hbc/models/pcc`) are supported by the existing `"./*"` wildcard in `packages/models/package.json`.

### Branded identifiers (`types.ts`)

| Symbol | Description |
|---|---|
| `PccProjectId`, `PccProjectNumber`, `PccUserId`, `PccWorkflowItemId`, `PccApprovalCheckpointId`, `PccBusinessAuditEventId`, `PccSiteUrl` | Branded string aliases for PCC identifiers |

### Project lifecycle (`PccProjectEnums.ts`, `IProjectProfile.ts`)

| Symbol | Description |
|---|---|
| `PCC_PROJECT_STAGES` (6, frozen) | Stage values verbatim from contract §3.2/§4B.0 |
| `PCC_PROJECT_STATUSES` (4) | Status values verbatim from contract §3.2 |
| `PCC_PROJECT_TYPES` (5, frozen) | Type values verbatim from contract §4B.1 |
| `IProjectProfile` | PCC project read-model profile shape |

### Personas / capabilities (`PccUserRoles.ts`, `PccCapabilities.ts`)

| Symbol | Description |
|---|---|
| `PCC_PERSONAS` (14) | PCC persona ids including Prompt 03 additions (estimating-coordinator, lead-estimator, manager-of-operational-excellence, safety-qaqc) |
| `PccPersona`, `PccUserRole` | Persona type + alias |
| `PCC_PERSONA_LABELS`, `PCC_PERSONA_TIER`, `PCC_PERSONA_CATEGORY` | Display, tier, and Prompt 03 grouping registries |
| `PCC_PERSONA_TO_PROJECT_ROLE`, `mapPccPersonaToProjectRole` | Optional mapping helper to existing `ProjectRole` (legacy untouched) |
| `PCC_CAPABILITY_IDS`, `PCC_CAPABILITIES`, `PCC_PERSONA_CAPABILITIES`, `personaHasCapability` | Read-model role-capability matrix (NOT auth runtime) |

### Work centers vs MVP surfaces

The contract template registry (21 entries) and the PCC MVP app navigation registry (8 entries) are intentionally separate.

| Symbol | Description |
|---|---|
| `PCC_WORK_CENTER_IDS` (21), `PCC_WORK_CENTERS`, `IPccWorkCenter` | Contract template work centers from §8.1 |
| `PCC_MVP_SURFACE_IDS` (8), `PCC_MVP_SURFACES`, `IPccMvpSurface` | Phase 3 PCC MVP app navigation surfaces |

### Workflow modules / items / transitions

| Symbol | Description |
|---|---|
| `PCC_WORKFLOW_MODULE_IDS` (13), `PCC_WORKFLOW_MODULES`, `IWorkflowModule` | Module registry incl. Prompt 03 additions (constraints-log, buyout-log, estimating-kickoff, post-bid-autopsy) |
| `WORKFLOW_ITEM_STATUSES` (7), `WORKFLOW_STATUS_META`, `IWorkflowStatusMeta` | Status registry + display meta |
| `IWorkflowItem`, `IWorkflowItemAssignment`, `IWorkflowItemAssignmentHistoryEntry`, `IWorkflowItemTransition` | Item, assignment, history, transition shapes |

### Priority actions

| Symbol | Description |
|---|---|
| `PRIORITY_ACTION_CATEGORIES` (10), `PRIORITY_ACTION_CATEGORY_LABELS`, `PRIORITY_ACTION_CATEGORY_META`, `IPriorityActionCategoryMeta`, `IPriorityAction` | Priority-action surfaces |

### Approvals + reviewer actions

| Symbol | Description |
|---|---|
| `APPROVAL_CHECKPOINT_STATES` (4), `APPROVAL_CHECKPOINT_TYPES` (10), `APPROVAL_AUTHORITY_TYPES` (6), `REVIEWER_ACTIONS` (5) | Locked literal sets |
| `IApprovalCheckpoint`, `IReviewerActionRecord` | Read-model shapes; `checkpointType`/`authorityType` are optional for backward compat |

### Business audit + comments

| Symbol | Description |
|---|---|
| `IBusinessAuditEvent`, `BUSINESS_AUDIT_SOURCE_CONTEXT_TYPES`, `BusinessAuditSourceContext` | PCC business audit (distinct from generic `IAuditRecord`); tagged-union source context |
| `IComment`, `ICommentHistoryEntry` | Comment + history (threading via `parentCommentId`) |

### External systems + launch links

| Symbol | Description |
|---|---|
| `EXTERNAL_SYSTEM_IDS` (10), `EXTERNAL_SYSTEM_POSTURES` (5), `EXTERNAL_SYSTEM_CATALOG`, `IExternalSystemLink`, `IExternalSystemCatalogEntry`, `IntegrationHealthStatus`, `ExternalSystemMappingStatus` | Catalog (snake_case ids) + read-model integration health |
| `LAUNCH_LINK_STATES` (2), `EXTERNAL_SYSTEM_REQUIRED_BEFORE` (4, anchored to `PccProjectStage`), `ILaunchLinkProjectContext`, `IExternalSystemMissingConfig`, `ILaunchLink` | Launch-link discriminated union + missing-config |

### Document Control sources

| Symbol | Description |
|---|---|
| `DOCUMENT_CONTROL_SOURCE_IDS`, `DOCUMENT_CONTROL_SOURCES`, `IDocumentControlSource` | Unified-access-hub sources (sharepoint-drive, onedrive, procore-files, optional document-crunch / adobe-sign) |

### Site Health + repair requests

| Symbol | Description |
|---|---|
| `SITE_HEALTH_SEVERITIES` (5, contract §19.3), `REPAIR_TIERS` (T1–T4, contract §19A) | Locked severity + tier vocabulary |
| `ISiteHealthCheck`, `IDriftIndicator`, `ISiteHealthSummary` | Read-model only; no scanner, runner, or executor |
| `REPAIR_REQUEST_STATES` (6), `REPAIR_REQUEST_OWNER_PERSONAS` (`pcc-admin`/`it-admin`), `IRepairRequest` | Read-model only; no auto-repair |

### Settings scopes

| Symbol | Description |
|---|---|
| `PCC_SETTINGS_SCOPES` (5), `PccSettingsScope`, `IPccSettingsRef` | Settings-scope vocabulary |

### Feature / module flags

| Symbol | Description |
|---|---|
| `PCC_FEATURE_FLAG_IDS` (11), `PCC_FEATURE_FLAG_POSTURES` (4), `PCC_FEATURE_FLAGS`, `IPccFeatureFlag` | Read-model metadata only |
| `PCC_MODULE_FLAG_POSTURES`, `PCC_MODULE_FLAGS`, `IPccModuleFlag` | Read-model metadata only |

### Fixture guards + fixtures

| Symbol | Description |
|---|---|
| `PCC_FORBIDDEN_FIXTURE_KEYS`, `PCC_FORBIDDEN_FIXTURE_VALUE_PATTERNS`, `findForbiddenFixtureKeys` | Exact-name forbidden-key guard (read-model health vocabulary like `syncHealth`/`lastSyncStatus` is NOT flagged) |
| `SAMPLE_*` constants + `PCC_FIXTURES` aggregate | Deterministic, non-secret fixtures spanning every Wave 1 model type; both `ILaunchLink` branches; both `BusinessAuditSourceContext` branches; all 6 repair-request states; all 4 `SiteHealthCheckState` values |

## Test Coverage Matrix

All seven Prompt-07 required test categories are covered by tests already in place from Prompts 02–06. **No new tests are added in Prompt 07.**

| Required category | Test file(s) |
|---|---|
| Frozen PCC enum/status values | `PccProjectEnums.test.ts`, `ApprovalCheckpoint.test.ts`, `BusinessAuditEvent.test.ts`, `LaunchLinks.test.ts`, `RepairRequests.test.ts`, `SiteHealth.test.ts`, `WorkflowItems.test.ts` |
| Work center registry | `PccWorkCenters.test.ts` |
| Workflow module registry | `WorkflowModules.test.ts` |
| External system registry | `ExternalSystems.test.ts` |
| Site Health severity values | `SiteHealth.test.ts` |
| No-mutation / no-secret / no-Procore-mirror fixture posture | `fixtures/Fixtures.test.ts` (walks every `SAMPLE_*` with `findForbiddenFixtureKeys`), `PccFixtureGuards.test.ts`, `NoMutationGuard.test.ts`, `NoRuntimeImports.test.ts` |
| Source-scan boundary (no SPFx/PnP/Azure/HTTP/Procore/backend imports; non-runtime feature/module flags) | `NoRuntimeImports.test.ts`, `PccFeatureFlags.test.ts`, `PccModuleFlags.test.ts`, `ExternalSystems.test.ts` (sync/mirror/write-back), `RepairRequests.test.ts` (sync/mirror/write-back) |

Final test count: **205 passed across 29 test files.**

## Intended Consumers

- **Wave 2 (SPFx shell)** — read-only consumption of personas, MVP surfaces, capabilities, work-center registry, workflow modules, priority-action categories, launch links, missing-config models, comments, fixtures (for storybook / preview surfaces). The shell must NOT depend on `@hbc/project-site-provisioning` and must NOT introduce Procore runtime, Graph live calls, or tenant mutation. The capability matrix is **not** authoritative — SPFx role resolution remains the source of truth.
- **Wave 3 (backend read-model)** — DTOs derived from `IProjectProfile`, `IWorkflowItem`, `IBusinessAuditEvent`, `IApprovalCheckpoint`, `IRepairRequest`, `ISiteHealthSummary`, etc. Backend persistence and route handlers are Wave 3 scope, not Wave 1.
- **Existing `backend/functions`** — already imports `@hbc/models`. Can adopt `@hbc/models/pcc` subpath imports immediately for any read-model needs without code changes elsewhere.

## Wave 2 Readiness (no implementation by this commit)

Wave 2 (SPFx shell) is **not started by this commit**. Wave 2 may consume the entire PCC shared-foundations surface listed above. Wave 2 must NOT:

- introduce Procore SDKs, Procore secrets, or any direct SPFx-to-Procore HTTP path;
- introduce Graph/PnP secrets;
- introduce tenant mutation, list writes, permission changes, or repair execution;
- run app catalog uploads or CI/CD deployment changes;
- bump package or SPFx manifest versions without explicit authorization.

## Wave 3 Readiness (no implementation by this commit)

Wave 3 (backend read-model) is **not started by this commit**. Wave 3 may consume the PCC shared types as DTO seeds and may introduce backend routes, persistence, and live integration boundaries. Wave 3 must NOT bypass the existing backend `withAuth` / `requireAdmin` patterns and must NOT mutate Phase 1/Phase 2 packages without an ADR.

## Vocabulary Discipline Recap

- **Surfaces vs work centers** — `PccMvpSurfaces.ts` (8) for PCC MVP navigation surfaces; `PccWorkCenters.ts` (21) for contract template work centers. Surfaces are never called "work centers" in any symbol, comment, or test.
- **External system ids** — snake_case (`sage_intacct`, `document_crunch`, `outlook_calendar`) as shipped from Prompt 02; the prompt-language kebab forms are not propagated into produced symbols.
- **Read-model health vocabulary** — `syncHealth`, `lastSyncStatus`, `lastSyncedAtUtc`, `procoreSyncEnabled`, `syncProfile` are explicitly allowed in PCC fixtures and shapes. Forbidden-key matching is exact-name (case-sensitive); `sync` and `mirror` substrings are not blanket-forbidden.
- **Discriminated unions** — `ILaunchLink` and `BusinessAuditSourceContext` use TypeScript discriminated unions so consumers narrow on `state` / `type` rather than passing optional fields around.
- **Read-model only** — `PccCapabilities`, `PccFeatureFlags`, `PccModuleFlags`, all fixtures, and all guard utilities are pure metadata. No environment-variable reads, no `localStorage`/`sessionStorage`/cookie reads, no tenant config reads, no auth runtime, no I/O.

## Open Decisions Carried Forward

- **W1-ODR-009** — closed for **Phase 3 / Wave 1 shared-foundation work (Prompts 02–07)** once this commit lands. **Future waves require separate authorization through their own gate prompts.** Wave 1 closure does not implicitly authorize Wave 2 (SPFx shell), Wave 3 (backend read-model), or any later Phase 3 wave.
- **Business audit consolidation** — overlap between PCC `IBusinessAuditEvent` and `admin-control-plane/IAdminAudit` deferred to a later ADR. Both stay in place for now.
- **`IApprovalCheckpoint` field tightening** — `checkpointType` and `authorityType` remain optional. Tightening to required is deferred until Wave 2/3 consumers exist and a repo grep confirms no instantiation risk.
- **Surface ↔ work center taxonomy reconciliation** — if a future Phase 3 wave wants a single combined navigation taxonomy, that reconciliation is its own ADR. Wave 1 keeps the two registries deliberately separate.
- **`packages/models/README.md`** — no package README exists today. Wave 1 did not create one; the Wave 1 Scope Lock allowed adding only "if PCC additions warrant a note." If a later wave wants a README, that work should be paired with a broader package-wide docs update rather than a closeout-only addition.

## Verification

| Command | Result |
|---|---|
| `pnpm --filter @hbc/models check-types` | Pass (0 errors) |
| `pnpm --filter @hbc/models test` | 205 passed, 29 files |
| `pnpm --filter @hbc/models build` | Pass |
| `pnpm --filter @hbc/models lint` | 0 errors; 35 pre-existing warnings, none in `src/pcc/**` |

## Cross-References

- `Wave_1_Repo_Truth_Audit.md`
- `Wave_1_Scope_Lock.md`
- `Wave_1_Prompt_02_Closeout.md` — shared model contracts
- `Wave_1_Prompt_03_Closeout.md` — role / surface / status registries
- `Wave_1_Prompt_04_Closeout.md` — workflow / audit / approval types
- `Wave_1_Prompt_05_Closeout.md` — external system / Site Health types
- `Wave_1_Prompt_06_Closeout.md` — fixtures / feature flags / no-mutation guards
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Open_Decision_Register.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Validation_Matrix.md`
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
