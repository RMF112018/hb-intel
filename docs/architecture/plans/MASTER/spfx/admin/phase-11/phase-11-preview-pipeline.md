# Phase 11 — Preview, Dry-Run, and Impact-Summary Pipeline

## 1. Purpose

This document describes the reusable preview/dry-run/impact-summary pipeline implemented in Phase 11 Prompt-05. The pipeline allows any admin action to generate a safety-aware preview before execution, with structured impact items, scope declarations, truthful limitation warnings, and evidence capture.

---

## 2. Architecture

### Files added/modified

| File | Package | Purpose |
|------|---------|---------|
| `backend/functions/src/services/admin-control-plane/safety-preview-service.ts` | `@hbc/functions` | Preview pipeline: provider registry, preview execution, evidence/audit capture |
| `backend/functions/src/services/admin-control-plane/__tests__/safety-preview-service.test.ts` | `@hbc/functions` | 16 tests for provider registry and preview pipeline |
| `packages/features/admin/src/hooks/useActionSafetyPreview.ts` | `@hbc/features-admin` | React hook for consuming preview results from the backend |

### Barrel exports updated

- `backend/functions/src/services/admin-control-plane/index.ts` — preview service and types
- `packages/features/admin/src/hooks/index.ts` — hook and utilities
- `packages/features/admin/src/index.ts` — public API

---

## 3. Backend preview pipeline

### Preview provider pattern

Domain-specific preview logic is supplied via the `IPreviewProvider` interface:

```typescript
interface IPreviewProvider {
  generateImpactItems(input: IPreviewProviderInput): Promise<IPreviewProviderOutput>;
}
```

Providers are registered by action key or domain key. Action-key-specific providers take priority over domain-level providers.

### Provider output

Each provider returns:
- `impactItems` — what the action will change (with `reversible` flag and per-item risk level)
- `warnings` — structured safety warnings
- `advisoryNotes` — non-blocking informational notes
- `scope` — target entity, affected resource count, description
- `limitations` — areas that could not be fully assessed (truthfulness rule)

### Pipeline execution

`executeSafetyPreview()` runs the full pipeline:

1. Look up the action's safety profile
2. Resolve the domain-specific preview provider
3. Call the provider (or generate truthful "no preview available" output)
4. Assemble warnings (provider warnings + limitation warnings + risk-tier warnings)
5. Compute proceed recommendation
6. Capture evidence via `IAdminEvidenceService`
7. Record audit event via `IAdminAuditService`

Returns `{ preview: IAdminSafetyPreviewResult, evidenceId: string }`.

### Warning assembly

The pipeline adds framework-level warnings on top of provider warnings:

| Warning code | Condition | Severity |
|-------------|-----------|----------|
| `preview-limitation` | Provider declared an area it could not assess | warning |
| `dry-run-unavailable` | Dry-run requested but not supported by this action | warning |
| `contains-irreversible-changes` | High/critical action with irreversible impact items | critical |
| `post-run-validation-required` | Profile requires post-run validation | info |

### Truthfulness rule

When no provider is available or the provider cannot fully assess an area:
- The pipeline does **not** fake impact items.
- It returns empty impact items with structured limitation entries.
- Limitation entries become `preview-limitation` warnings in the result.
- The `proceedRecommended` field is set to `false` when a blocking limitation exists (the `full-preview` limitation is blocking).

### Proceed recommendation

`proceedRecommended` is `false` when:
- Any warning has `severity: 'critical'`
- The `full-preview` limitation is present (no provider available)

Otherwise, `proceedRecommended` is `true`.

---

## 4. Frontend integration seam

### `useActionSafetyPreview` hook

Located in `@hbc/features-admin`, the hook provides:

| Property | Type | Description |
|----------|------|-------------|
| `preview` | `IAdminSafetyPreviewResult \| null` | Current preview result |
| `isLoading` | `boolean` | Whether a request is in progress |
| `error` | `string \| null` | Error from last request |
| `previewEvidenceId` | `string \| null` | Evidence ID for linking to confirmation |
| `requestPreview` | `(request) => Promise` | Trigger a preview request |
| `clearPreview` | `() => void` | Reset state |
| `proceedRecommended` | `boolean` | Whether the preview recommends proceeding |
| `criticalWarningCount` | `number` | Count of critical warnings |
| `irreversibleItemCount` | `number` | Count of irreversible impact items |

### Utility functions

| Function | Purpose |
|----------|---------|
| `isPreviewRequired(profile)` | Whether an action requires preview before execution |
| `getConfirmationType(profile)` | What confirmation ceremony is needed |

### Backend API contract

The hook calls `POST /api/admin/safety/preview` with:
```json
{
  "actionKey": "provisioning-rollout:saga:force-state-transition",
  "commandInput": { "runId": "..." },
  "targetEntityId": "project-123",
  "dryRun": false
}
```

The backend returns:
```json
{
  "data": {
    "preview": { /* IAdminSafetyPreviewResult */ },
    "evidenceId": "ev-uuid"
  }
}
```

---

## 5. How domains plug in

Each admin domain implements `IPreviewProvider` and registers it:

```typescript
// Example: provisioning domain preview provider
const provisioningPreviewProvider: IPreviewProvider = {
  async generateImpactItems(input) {
    // Inspect the provisioning run state
    // Return impact items, warnings, scope, limitations
  },
};

registerPreviewProvider(
  'provisioning-rollout:saga:force-state-transition',
  provisioningPreviewProvider,
);
```

The existing `generateRepairPreview()` in `sharepoint-preview-service.ts` demonstrates the pattern: pure functions that transform domain state into impact items and warnings.

---

## 6. Evidence linkage

The preview result includes an `evidenceId` that links to the captured evidence. This ID is used downstream by:
- `IAdminConfirmationPayload.previewEvidenceId` — proves the operator reviewed this specific preview before confirming
- `IAdminSafetyEvidenceSummary.previewCaptured` — confirms preview evidence was captured for the run

---

## 7. Validation results

- `pnpm --filter @hbc/models build` — clean
- `pnpm --filter @hbc/functions check-types` — clean
- `pnpm --filter @hbc/functions test` — 94 files, 1779 tests passed, 3 skipped
- `pnpm --filter @hbc/features-admin check-types` — clean
- `pnpm --filter @hbc/features-admin test` — 13 files, 181 tests passed

---

## 8. Governing cross-references

| Document | Role |
|----------|------|
| [Phase 11 shared contracts](./phase-11-preview-dry-run-and-confirmation-model.md) | `IAdminSafetyPreviewResult`, `IAdminSafetyImpactItem`, `IAdminSafetyWarning`, `IAdminExecutionScope` |
| [Phase 11 backend safety enforcement](./phase-11-backend-safety-enforcement.md) | Safety profile registry consumed by the preview pipeline |
| [Phase 11 risk-tier and action classification](./phase-11-risk-tier-and-action-classification.md) | Risk tiers that determine warning behavior |
| [Phase 11 safety baseline](./phase-11-safety-baseline.md) | Preview ownership (backend generates, frontend displays) |
