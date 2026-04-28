# Phase 3 Wave 1 — Prompt 05 Closeout

Generated: 2026-04-28
Prompt: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Prompt_05_Wave_1_External_System_and_Site_Health_Types.md`
Companions: `Wave_1_Scope_Lock.md`, `Wave_1_Repo_Truth_Audit.md`, `Wave_1_Prompt_02_Closeout.md`, `Wave_1_Prompt_03_Closeout.md`, `Wave_1_Prompt_04_Closeout.md`

## Roadmap Naming Discipline

This is **Phase 3 / Wave 1 / Prompt 05**. Not "Wave 5" or "Phase 3 Wave 5."

## Authorization

W1-ODR-009 (code authorization for Wave 1 Prompts 02–07) granted by the user for **Prompt 05 only**. Prompts 06–07 still require explicit per-prompt authorization.

## Naming Deviation

Prompt 05's "Files Allowed" list uses kebab-case. Per the established Wave 1 better-path convention, this commit extends existing PascalCase files in place rather than create kebab-case duplicates.

| Prompt name | Repo file/symbol |
|---|---|
| `external-systems.ts` | extended `ExternalSystems.ts` |
| `document-control.ts` | no change to `DocumentControl.ts` (already covers Prompt 05 scope) |
| `site-health.ts` | extended `SiteHealth.ts` |
| `repair-requests.ts` | new `RepairRequests.ts` |

## External System Identifier Discipline

Prompt 05 lists external system ids in kebab-case (`sage-intacct`, `document-crunch`, `outlook`). Prompt 02 shipped the catalog with snake_case identifiers (`sage_intacct`, `document_crunch`, `outlook_calendar`) and tests that lock those values. Snake_case retained — changing would break shipped tests and any consumer pinned to those keys. The kebab-case form in the prompt is treated as prompt-language only.

## Vocabulary and Type Discipline

- `ILaunchLink` is implemented as a **TypeScript discriminated union** keyed on `state`. The `configured` branch requires a `url`; the `missing` branch forbids `url` (`url?: never`) and accepts an optional inline `IExternalSystemMissingConfig` payload. Tests narrow on both branches.
- `EXTERNAL_SYSTEM_REQUIRED_BEFORE` is anchored to the locked `PccProjectStage` vocabulary (`'preconstruction'`, `'active_construction'`, `'closeout'`) plus `'always'` for non-stage-gated requirements. A type-level test asserts the three stage-aligned values are assignable to `PccProjectStage`.
- The no-sync/mirror/write-back source-scan guards in `ExternalSystems.test.ts` and `RepairRequests.test.ts` strip line comments, block comments, and string literals before scanning. Legitimate guardrail wording in header comments and JSDoc (e.g. "no sync, no mirror, no write-back") does not trip the test.

## Files Added

- `packages/models/src/pcc/RepairRequests.ts` — `IRepairRequest`, `REPAIR_REQUEST_STATES`, `REPAIR_REQUEST_OWNER_PERSONAS`
- `packages/models/src/pcc/RepairRequests.test.ts`
- `packages/models/src/pcc/LaunchLinks.test.ts`
- `packages/models/src/pcc/SiteHealth.test.ts`

## Files Modified

- `packages/models/src/pcc/ExternalSystems.ts` — adds `LAUNCH_LINK_STATES`, `LaunchLinkState`, `EXTERNAL_SYSTEM_REQUIRED_BEFORE`, `ExternalSystemRequiredBefore`, `ILaunchLinkProjectContext`, `IExternalSystemMissingConfig`, `ILaunchLink` (discriminated union)
- `packages/models/src/pcc/SiteHealth.ts` — adds `REPAIR_TIERS`, `SiteHealthRepairTier`, `ISiteHealthCheck`, `IDriftIndicator`; extends `ISiteHealthSummary` additively with optional `projectId`, `checks`, `driftIndicators`, `repairRequestAvailable`
- `packages/models/src/pcc/index.ts` — exports the new symbols
- `packages/models/src/pcc/constants.ts` — re-exports the new arrays
- `packages/models/src/pcc/ExternalSystems.test.ts` — adds the comment-resilient no-sync/mirror/write-back guard

## Files Untouched

- `packages/models/src/pcc/DocumentControl.ts` — unified-access-hub source registry already covers Prompt 05 scope
- `packages/models/src/project/ProjectEnums.ts` — legacy `ProjectStatus` unchanged (W1-ODR-011)
- `packages/models/src/auth/ProjectRoles.ts` — legacy `ProjectRole` unchanged (W1-ODR-012)
- `packages/models/src/audit/IAuditRecord.ts` — generic write-op audit unchanged
- `packages/models/package.json` — no version bump, no new dependency
- Anything outside `@hbc/models`

## Verification

| Command | Result |
|---|---|
| `pnpm --filter @hbc/models check-types` | Pass (0 errors) |
| `pnpm --filter @hbc/models test` | 177 passed, 25 files (17 new tests since Prompt 04) |
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

## Open Decisions / Follow-ups

- **W1-ODR-009 (code authorization)** — Prompts 06–07 still require per-prompt authorization
- **Launch-link state extensibility** — additional states (`'error'`, `'health-degraded'`) can be added additively to the discriminated union
- **Drift indicator key format** — currently free-form `string` because the underlying surface is heterogeneous; can tighten to a discriminated union when consumers exist
- **Repair-request state extensibility** — current set is conservative; future `'awaiting-evidence'` or `'escalated'` additions are intentional tradeoffs

## Cross-References

- `Wave_1_Scope_Lock.md`
- `Wave_1_Repo_Truth_Audit.md`
- `Wave_1_Prompt_02_Closeout.md`
- `Wave_1_Prompt_03_Closeout.md`
- `Wave_1_Prompt_04_Closeout.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Open_Decision_Register.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Validation_Matrix.md`
