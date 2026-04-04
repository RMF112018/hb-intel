# Phase 11 — Post-Run Validation, Recovery Guidance, and Evidence Model

## 1. Purpose

This document describes the post-execution hardening layer implemented in Phase 11 Prompt-08. After a risky admin action executes, this layer validates the outcome, generates recovery guidance when needed, and assembles a complete safety evidence summary linking all artifacts from the safety pipeline.

---

## 2. Architecture

### Files added/modified

| File | Package | Purpose |
|------|---------|---------|
| `backend/functions/src/services/admin-control-plane/safety-post-run-service.ts` | `@hbc/functions` | Post-run validation, recovery guidance, evidence summary assembly |
| `backend/functions/src/services/admin-control-plane/__tests__/safety-post-run-service.test.ts` | `@hbc/functions` | 12 tests |
| `packages/features/admin/src/hooks/usePostRunSafetyValidation.ts` | `@hbc/features-admin` | React hook for validation, recovery, and evidence |

---

## 3. Post-run validation

### Provider pattern

Domain-specific validation logic is supplied via `IPostRunValidationProvider`:

```typescript
interface IPostRunValidationProvider {
  generateChecks(input: IPostRunValidationInput): Promise<IAdminPostRunValidationCheck[]>;
}
```

Providers are registered by action key or domain. When no provider is registered, a truthful default check is returned indicating manual verification is recommended.

### Execution

`executePostRunValidation()` runs the pipeline:
1. Resolve domain-specific validation provider
2. Generate checks (or produce truthful "no provider" result)
3. Capture validation evidence (`AdminEvidenceType.PostValidationSummary`)
4. Record audit event (`RunCompleted` or `RunFailed` based on check results)

Returns `{ summary, evidenceId, allPassed }`.

---

## 4. Recovery guidance

### Provider pattern

Domain-specific recovery logic is supplied via `IRecoveryGuidanceProvider`:

```typescript
interface IRecoveryGuidanceProvider {
  generateGuidance(input: IRecoveryGuidanceInput): Promise<IAdminRecoveryGuidance>;
}
```

### Default guidance

When no provider is registered, a truthful default is generated with three steps:
1. Review execution evidence
2. Assess failure impact (includes the specific `failureClass`)
3. Contact support if needed

Default: `estimatedComplexity: 'moderate'`, `compensationAvailable: false`, external action to review Azure portal.

### Truthfulness rule

Recovery guidance is honest about what it can and cannot do:
- `compensationAvailable` is only `true` when automatic rollback is actually implemented
- Default guidance does not imply automatic rollback
- Failure class is included in guidance text so the operator knows the failure category

---

## 5. Safety evidence summary

`assembleSafetyEvidenceSummary()` builds a complete `IAdminSafetyEvidenceSummary` by:

1. Looking up the action's safety profile for required controls
2. Checking which evidence IDs were provided (preview, confirmation, validation, recovery)
3. Querying the evidence service for all evidence references associated with the run
4. Computing `controlsSatisfied` vs `controlsSkipped`

### Control satisfaction logic

| Control | Satisfied when |
|---------|---------------|
| Preview, PreviewEvidence | `previewEvidenceId` provided |
| StandardConfirmation, EnhancedConfirmation | `confirmationEvidenceId` provided |
| PostRunValidation, ValidationEvidence | `validationEvidenceId` provided |
| RecoveryGuidance | `recoveryEvidenceId` provided |
| AuditRecord, InputEvidence, ExecutionEvidence | Always (captured by run infrastructure) |
| DryRun, ScopeRestriction | Always (validated at gate-check time) |

---

## 6. Complete evidence chain

After P11-08, the full evidence chain for a destructive action is:

```
1. Preview evidence (P11-05)
   ├── evidenceType: PreviewResult
   └── captures: impact items, warnings, scope, limitations

2. Confirmation evidence (P11-07)
   ├── evidenceType: CommandInputSnapshot
   └── captures: acknowledgment text, preview link, scope, rationale

3. Execution evidence (existing run model)
   ├── evidenceType: StepResultDetail
   └── captures: per-step timing, attempts, failure class

4. Post-run validation evidence (P11-08)
   ├── evidenceType: PostValidationSummary
   └── captures: check results, pass/fail counts

5. Recovery guidance evidence (P11-08, when needed)
   ├── evidenceType: CompensationRecord
   └── captures: steps, complexity, compensation availability

6. Safety evidence summary (P11-08)
   └── links all above + reports controlsSatisfied/controlsSkipped
```

An auditor can reconstruct the entire safety lifecycle from evidence alone.

---

## 7. Frontend integration

`usePostRunSafetyValidation` hook provides:

| Property | Type | Description |
|----------|------|-------------|
| `validation` | `IAdminPostRunValidationSummary \| null` | Validation result |
| `recoveryGuidance` | `IAdminRecoveryGuidance \| null` | Recovery guidance |
| `evidenceSummary` | `IAdminSafetyEvidenceSummary \| null` | Evidence summary |
| `isLoading` | `boolean` | Request in progress |
| `error` | `string \| null` | Error |
| `allPassed` | `boolean` | Whether all checks passed |
| `requestValidation` | `(request) => Promise` | Trigger validation |
| `requestRecoveryGuidance` | `(request) => Promise` | Trigger recovery guidance |
| `requestEvidenceSummary` | `(request) => Promise` | Trigger evidence assembly |
| `reset` | `() => void` | Reset state |

### Backend API endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/admin/safety/validate` | Execute post-run validation |
| `POST /api/admin/safety/recover` | Generate recovery guidance |
| `POST /api/admin/safety/evidence-summary` | Assemble evidence summary |

---

## 8. Validation results

- `pnpm --filter @hbc/functions check-types` — clean
- `pnpm --filter @hbc/functions test` — 96 files, 1811 tests passed, 3 skipped
- `pnpm --filter @hbc/features-admin check-types` — clean
- `pnpm --filter @hbc/features-admin test` — 13 files, 181 tests passed

---

## 9. Governing cross-references

| Document | Role |
|----------|------|
| [Phase 11 backend safety enforcement](./phase-11-backend-safety-enforcement.md) | `isPostRunValidationRequired`, `isRecoveryGuidanceRequired` |
| [Phase 11 shared contracts](./phase-11-preview-dry-run-and-confirmation-model.md) | `IAdminPostRunValidationSummary`, `IAdminRecoveryGuidance`, `IAdminSafetyEvidenceSummary` |
| [Phase 11 destructive-action model](./phase-11-destructive-action-execution-model.md) | Confirmation evidence linked to validation |
| [Phase 11 operator safety UX](./phase-11-operator-safety-ux.md) | `PostRunValidationPanel`, `HbcRecoveryGuidancePanel`, `HbcEvidenceSummaryBar` |
