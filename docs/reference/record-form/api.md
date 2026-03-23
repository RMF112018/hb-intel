# @hbc/record-form API Reference

> **Doc Classification:** Living Reference (Diataxis) — Reference quadrant; developer audience; record-form API reference.

## Types

`RecordFormMode`, `RecordFormStatus` (8), `RecordSyncState` (6), `RecordStateConfidence` (5), `RecordFormComplexityTier`, `IRecordFormDefinition<TRecord>`, `IRecordFormState`, `IRecordFormExplanationState`, `IRecordValidationState`, `IRecordFormDraft`, `IRecordDraftComparisonState`, `IRecordReviewStepState`, `IRecordBicStepConfig`, `IRecordNextRecommendedAction`, `IRecordRecoveryState`, `IRecordConflictState`, `IRecordSubmitGuardState`, `IRecordFormFailureState`, `IRecordFormRetryState`, `IRecordFormTelemetryState`, reason codes (5 unions).

## Model Functions

`createRecordFormSession`, `transitionRecordFormStatus`, `VALID_RECORD_TRANSITIONS`, `computeRecordConfidence`, `detectDraftConflict`, `createDraft`, `markDraftDirty`, `compareDrafts`, `createRecordFormAuditEntry`.

## Storage

`IRecordFormStorageAdapter`, `IRecordFormStorageRecord`, `InMemoryRecordFormStorageAdapter`.

## Hooks

`useRecordFormState`, `useRecordDraftPersistence`, `useRecordSubmission`, `recordFormKeys`.

## Component Shells

`RecordFormShell`, `RecordSubmitBarShell`, `RecordReviewPanelShell`, `RecordRecoveryBannerShell`.

## Adapters

`RecordFormModuleRegistry`, `createModuleRecordFormSession`, `IRecordFormModuleRegistration`, `IRecordFormSchemaProvider`.

## Testing (`@hbc/record-form/testing`)

`createMockRecordFormState`, `createMockRecordRecoveryState`, `createMockRecordReviewStepState`, `createMockRecordFormQueueState`, `mockRecordFormScenarios` (11), `mockRecordFormComplexityProfiles`.

## Related

- [ADR-0120](../../architecture/adr/ADR-0120-record-form.md)
- [Adoption Guide](../../how-to/developer/record-form-adoption-guide.md)
