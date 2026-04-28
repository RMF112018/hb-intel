# Phase 3 Wave 1 — Prompt 02 Closeout

Generated: 2026-04-28
Prompt: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Prompt_02_Wave_1_Shared_Model_Contracts.md`
Companion: `Wave_1_Scope_Lock.md`, `Wave_1_Repo_Truth_Audit.md`

## Authorization

W1-ODR-009 (code authorization for Wave 1 Prompts 02–07) is **granted by the user** for Prompt 02 only. Prompts 03–07 remain pending explicit per-prompt authorization.

## Files Added

Source modules under `packages/models/src/pcc/`:

- `types.ts` — branded identifier type aliases
- `PccProjectEnums.ts` — `PccProjectStage` (6), `PccProjectStatus` (4), `PccProjectType` (5); contract §3.2 / §4B
- `IProjectProfile.ts` — read-model profile shape
- `PccUserRoles.ts` — `PccPersona` / `PccUserRole` registry; optional `ProjectRole` mapping helper
- `PccWorkCenters.ts` — 21-entry registry from contract §8.1
- `PriorityActions.ts` — categories + read-model interface
- `WorkflowModules.ts` — MVP module registry
- `WorkflowItems.ts` — item / status / assignment types
- `BusinessAuditEvent.ts` — PCC-scoped business audit event read model
- `ApprovalCheckpoint.ts` — approval checkpoint state
- `ExternalSystems.ts` — catalog covering `sharepoint`, `onedrive`, `procore`, `sage_intacct`, `teams`, `compass`, `document_crunch`, `cupix`, plus `adobe_sign`, `outlook_calendar`. Health field renamed `integrationHealthStatus`; carries explicit "no sync/mirror/write-back" comment
- `DocumentControl.ts` — unified-access-hub source registry: `sharepoint-drive`, `onedrive`, `procore-files`, `document-crunch`, `adobe-sign`. No workflow semantics
- `SiteHealth.ts` — `SiteHealthSeverity` exactly per contract §19.3
- `PccSettings.ts` — settings scope vocabulary
- `constants.ts` — convenience aggregate re-exports
- `index.ts` — domain barrel

Tests under `packages/models/src/pcc/`:

- `PccProjectEnums.test.ts` — frozen-value coverage + type-level alignment
- `PccPersonas.test.ts` — registry + mapping coverage
- `PccWorkCenters.test.ts` — 21-entry coverage + governance tier check
- `ExternalSystems.test.ts` — required-min coverage, posture set, no-secret guard
- `DocumentControl.test.ts` — hub coverage + strict-key shape
- `NoRuntimeImports.test.ts` — source-scan guard against SPFx / PnP / Azure / HTTP / Procore / backend / sibling boundary packages
- `NoMutationGuard.test.ts` — top-level mutability + exported-function allowlist

Root barrel update:

- `packages/models/src/index.ts` — added `export * from './pcc/index.js';`

## Verification

| Command | Result |
|---|---|
| `pnpm --filter @hbc/models check-types` | Pass (0 errors) |
| `pnpm --filter @hbc/models test` | 122 passed, 13 files (21 new PCC tests) |
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

- `packages/models/src/project/ProjectEnums.ts` — untouched
- `packages/models/src/auth/ProjectRoles.ts` — untouched (only re-imported via `import type`)
- `packages/models/src/audit/IAuditRecord.ts` — untouched (`IBusinessAuditEvent` is distinct)
- `packages/project-site-template/**`, `packages/project-site-provisioning/**` — untouched
- No new external dependency; `@hbc/models@0.5.1` version retained

## Open Decisions / Follow-ups

- **W1-ODR-009 (code authorization)** — granted for Prompt 02 only; Prompts 03–07 still require per-prompt authorization
- **Business-audit consolidation** — `IBusinessAuditEvent` overlaps in spirit with `admin-control-plane/IAdminAudit`; deferred to a later ADR
- **Persona ↔ ProjectRole tightness** — Wave 3 (SPFx role gating) can decide whether to tighten the optional mapping
- **Subpath export `@hbc/models/pcc`** — supported automatically by the existing wildcard export in `packages/models/package.json`; no manifest change required

## Cross-References

- `Wave_1_Scope_Lock.md` — locked Wave 1 decisions
- `Wave_1_Repo_Truth_Audit.md` — repo-truth re-audit
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Open_Decision_Register.md` — register
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Validation_Matrix.md` — validation expectations
