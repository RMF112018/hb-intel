# Phase 3 Wave 1 — Prompt 04 Closeout

Generated: 2026-04-28
Prompt: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Prompt_04_Wave_1_Workflow_Audit_Approval_Types.md`
Companions: `Wave_1_Scope_Lock.md`, `Wave_1_Repo_Truth_Audit.md`, `Wave_1_Prompt_02_Closeout.md`, `Wave_1_Prompt_03_Closeout.md`

## Roadmap Naming Discipline

This is **Phase 3 / Wave 1 / Prompt 04**. Not "Wave 4" or "Phase 3 Wave 4."

## Authorization

W1-ODR-009 (code authorization for Wave 1 Prompts 02–07) granted by the user for **Prompt 04 only**. Prompts 05–07 still require explicit per-prompt authorization.

## Naming Deviation

Prompt 04's "Files Allowed" list uses kebab-case. Per the established Wave 1 better-path convention, this commit extends existing PascalCase files in place rather than create kebab-case duplicates.

| Prompt name | Repo file/symbol |
|---|---|
| `workflow.ts` | extended `WorkflowItems.ts` (transition record) |
| `assignments.ts` | extended `WorkflowItems.ts` (assignment-history entry) |
| `audit.ts` | extended `BusinessAuditEvent.ts` |
| `approvals.ts` | extended `ApprovalCheckpoint.ts` |
| `comments.ts` | new `Comments.ts` |

## Vocabulary Preservation

- PCC `IBusinessAuditEvent` remains distinct from generic `IAuditRecord` (`../audit/IAuditRecord.ts`). No consolidation in this commit.
- `subjectType`/`subjectId` continue to play the prompt's "entity type / entity id" role; no duplicate `entityType`/`entityId` fields were introduced.
- `IBusinessAuditEvent.sourceContext` is a tagged union (`type: 'workflow-module' | 'mvp-surface'`, `id: WorkflowModuleId | PccMvpSurfaceId`) rather than a flat union — prevents semantic drift between module ids and MVP surface ids.

## Backward Compatibility

- `IApprovalCheckpoint.checkpointType` and `IApprovalCheckpoint.authorityType` are **optional** fields. The Prompt 02 minimal shape (without these fields) remains accepted; this is asserted by `ApprovalCheckpoint.test.ts`. Tightening to required is deferred until Wave 2/3 consumers exist and a repo grep confirms no instantiation risk.
- `IBusinessAuditEvent` extends additively only; the Prompt 02 minimal shape still typechecks (asserted by `BusinessAuditEvent.test.ts`).

## Files Added

- `packages/models/src/pcc/Comments.ts` — `IComment`, `ICommentHistoryEntry`
- `packages/models/src/pcc/Comments.test.ts`
- `packages/models/src/pcc/WorkflowTransitions.test.ts`
- `packages/models/src/pcc/BusinessAuditEvent.test.ts`
- `packages/models/src/pcc/ApprovalCheckpoint.test.ts`

## Files Modified

- `packages/models/src/pcc/WorkflowItems.ts` — adds `IWorkflowItemTransition` and `IWorkflowItemAssignmentHistoryEntry`
- `packages/models/src/pcc/BusinessAuditEvent.ts` — adds `BUSINESS_AUDIT_SOURCE_CONTEXT_TYPES`, `BusinessAuditSourceContextType`, `BusinessAuditSourceContext`, plus optional `projectId`, `sourceContext`, `beforeSummary`, `afterSummary` on `IBusinessAuditEvent`
- `packages/models/src/pcc/ApprovalCheckpoint.ts` — adds `APPROVAL_CHECKPOINT_TYPES`, `ApprovalCheckpointType`, `APPROVAL_AUTHORITY_TYPES`, `ApprovalAuthorityType`, `REVIEWER_ACTIONS`, `ReviewerAction`, `IReviewerActionRecord`, plus optional `checkpointType`/`authorityType` on `IApprovalCheckpoint`
- `packages/models/src/pcc/index.ts` — exports the new symbols
- `packages/models/src/pcc/constants.ts` — re-exports the new arrays

## Files Untouched

- `packages/models/src/audit/IAuditRecord.ts` — generic write-op audit unchanged
- `packages/models/src/project/ProjectEnums.ts` — legacy `ProjectStatus` unchanged (W1-ODR-011)
- `packages/models/src/auth/ProjectRoles.ts` — legacy `ProjectRole` unchanged (W1-ODR-012)
- `packages/models/package.json` — no version bump, no new dependency
- Anything outside `@hbc/models`

## Verification

| Command | Result |
|---|---|
| `pnpm --filter @hbc/models check-types` | Pass (0 errors) |
| `pnpm --filter @hbc/models test` | 160 passed, 22 files (17 new tests since Prompt 03) |
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

- **W1-ODR-009 (code authorization)** — Prompts 05–07 still require per-prompt authorization
- **`IApprovalCheckpoint` field tightening** — `checkpointType` and `authorityType` may be tightened to required after Wave 2/3 consumers exist and a repo grep confirms no instantiation risk
- **Business-audit consolidation** — overlap with `admin-control-plane/IAdminAudit` deferred to a later ADR (carried from Prompt 02)
- **`BusinessAuditSourceContext` extensibility** — additional source types (`'external-system'`, `'site-health-check'`, etc.) can extend the discriminator without renaming the field

## Cross-References

- `Wave_1_Scope_Lock.md`
- `Wave_1_Repo_Truth_Audit.md`
- `Wave_1_Prompt_02_Closeout.md`
- `Wave_1_Prompt_03_Closeout.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Open_Decision_Register.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Validation_Matrix.md`
