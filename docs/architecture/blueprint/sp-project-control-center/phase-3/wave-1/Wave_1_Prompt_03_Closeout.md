# Phase 3 Wave 1 — Prompt 03 Closeout

Generated: 2026-04-28
Prompt: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Prompt_03_Wave_1_Role_WorkCenter_Status_Registries.md`
Companions: `Wave_1_Scope_Lock.md`, `Wave_1_Repo_Truth_Audit.md`, `Wave_1_Prompt_02_Closeout.md`

## Roadmap Naming Discipline

This is **Phase 3 / Wave 1 / Prompt 03**, not "Wave 3" or "Phase 3 Wave 3." All artifacts produced by this commit use that wording.

## Authorization

W1-ODR-009 (code authorization for Wave 1 Prompts 02–07) granted by the user for **Prompt 03 only**. Prompts 04–07 still require explicit per-prompt authorization.

## Naming Deviation

The prompt's "Files Allowed" list uses kebab-case file names (`roles.ts`, `personas.ts`, `work-centers.ts`, …). The repo-wide `@hbc/models` convention and the Prompt 02 PCC files use PascalCase. Per the better-path rule, this commit extends existing PascalCase files in place rather than create kebab-case duplicates. No twins were introduced.

Symbol mapping prompt → repo:

| Prompt name | Repo file/symbol |
|---|---|
| `roles.ts` / `personas.ts` | extended `PccUserRoles.ts` |
| `work-centers.ts` (the eight Wave 1 entries) | new `PccMvpSurfaces.ts` (renamed concept; see vocabulary mapping) |
| `workflow-modules.ts` | extended `WorkflowModules.ts` |
| `statuses.ts` | extended `WorkflowItems.ts` (`WORKFLOW_STATUS_META`) |
| `priority-actions.ts` | extended `PriorityActions.ts` (`PRIORITY_ACTION_CATEGORY_META`) |
| `capabilities.ts` | new `PccCapabilities.ts` |

## Vocabulary Mapping (surfaces vs work centers)

The prompt's "Eight primary Wave 1/MVP work centers" are PCC app-level navigation surfaces, a different abstraction from the 21 contract template work centers in `Standard_Project_Site_Template_Contract.md` §8.1.

- `PccWorkCenters.ts` — 21-entry contract template work-center registry. The word "work center" in code, types, comments, tests, and docs refers exclusively to this registry.
- `PccMvpSurfaces.ts` — eight Phase 3 PCC MVP app navigation surfaces. The word "surface" refers exclusively to this registry. The eight are never called "work centers" in any symbol, comment, test, or doc. Where a surface aggregates contract work centers, the references use `primaryWorkCenterIds`.

## Files Added

- `packages/models/src/pcc/PccMvpSurfaces.ts` — eight Phase 3 PCC MVP surfaces
- `packages/models/src/pcc/PccCapabilities.ts` — read-model role-capability matrix
- `packages/models/src/pcc/PccMvpSurfaces.test.ts`
- `packages/models/src/pcc/PccCapabilities.test.ts`
- `packages/models/src/pcc/WorkflowItems.test.ts`
- `packages/models/src/pcc/PriorityActions.test.ts`
- `packages/models/src/pcc/WorkflowModules.test.ts`

## Files Modified

- `packages/models/src/pcc/PccUserRoles.ts` — adds 4 personas (`estimating-coordinator`, `lead-estimator`, `manager-of-operational-excellence`, `safety-qaqc`); adds `PccPersonaTier`, `PccPersonaCategory`, `PCC_PERSONA_TIER`, `PCC_PERSONA_CATEGORY`
- `packages/models/src/pcc/WorkflowModules.ts` — adds 4 modules (`constraints-log`, `buyout-log`, `estimating-kickoff`, `post-bid-autopsy`); adds optional `description?` field
- `packages/models/src/pcc/WorkflowItems.ts` — adds `IWorkflowStatusMeta` and `WORKFLOW_STATUS_META`
- `packages/models/src/pcc/PriorityActions.ts` — adds `IPriorityActionCategoryMeta` and `PRIORITY_ACTION_CATEGORY_META`
- `packages/models/src/pcc/index.ts` — exports the new surfaces
- `packages/models/src/pcc/constants.ts` — re-exports `PCC_MVP_SURFACE_IDS`, `PCC_PERSONA_TIER`, `PCC_PERSONA_CATEGORY`, `PCC_CAPABILITY_IDS`
- `packages/models/src/pcc/PccPersonas.test.ts` — extended persona coverage
- `packages/models/src/pcc/NoMutationGuard.test.ts` — adds `personaHasCapability` to allowlist

## Files Untouched

- `packages/models/src/project/ProjectEnums.ts` — legacy `ProjectStatus` not mutated (W1-ODR-011)
- `packages/models/src/auth/ProjectRoles.ts` — legacy `ProjectRole` not mutated (W1-ODR-012); only re-imported via `import type`
- `packages/models/src/audit/IAuditRecord.ts` — untouched
- `packages/models/src/pcc/PccWorkCenters.ts` — 21-entry contract registry unchanged
- `packages/models/package.json` — no version bump, no new dependency
- Anything outside `@hbc/models`

## Verification

| Command | Result |
|---|---|
| `pnpm --filter @hbc/models check-types` | Pass (0 errors) |
| `pnpm --filter @hbc/models test` | 143 passed, 18 files (21 new tests since Prompt 02) |
| `pnpm --filter @hbc/models build` | Pass |
| `pnpm --filter @hbc/models lint` | 0 errors; 35 pre-existing warnings, none in `src/pcc/**` |

## Guardrail Confirmation

- No PCC shell UI implemented: **Confirmed**
- No backend route/API implemented: **Confirmed**
- No provisioning executor or tenant mutation: **Confirmed**
- No Graph/PnP live calls: **Confirmed**
- No Procore runtime, secrets, mirror, or write-back: **Confirmed**
- No package/SPFx manifest version bump: **Confirmed**
- No CI/CD deployment change: **Confirmed**

Additional invariants preserved:

- `ReadonlySet` not used in exported registry maps; `PCC_PERSONA_CAPABILITIES` uses `readonly PccCapabilityId[]` arrays.
- The eight MVP surfaces are never called "work centers" in any produced symbol or test name.

## Open Decisions / Follow-ups

- **W1-ODR-009 (code authorization)** — Prompts 04–07 still require per-prompt authorization
- **Authoritative authorization** — `PccCapabilities` matrix is read-model only; later Phase 3 SPFx and backend waves define authoritative authorization
- **Surface ↔ work center taxonomy reconciliation** — if a future Phase 3 wave wants a single combined navigation taxonomy, it can be reconciled then via ADR
- **Business-audit consolidation** — overlap with `admin-control-plane/IAdminAudit` deferred to a later ADR (carried from Prompt 02)

## Cross-References

- `Wave_1_Scope_Lock.md` — locked Wave 1 decisions
- `Wave_1_Repo_Truth_Audit.md` — repo-truth re-audit
- `Wave_1_Prompt_02_Closeout.md` — Prompt 02 closeout
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Open_Decision_Register.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Validation_Matrix.md`
