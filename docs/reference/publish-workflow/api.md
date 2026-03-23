# @hbc/publish-workflow API Reference

> **Doc Classification:** Living Reference (Diataxis) — Reference quadrant; developer audience.

## Types
`PublishState` (8), `IPublishRequest`, `IPublishTarget`, `IPublishApprovalRule`, `IPublishBicStepConfig`, `IPublishTelemetryState`, `IPublishReceiptContextStamp`, `IReadinessState`, `IApprovalState`, `ISupersessionState`, `IRevocationState`, `IPublicationReceipt`, `IReadinessRule`, `IApprovalRule`.

## Model
`createPublishRequest`, `transitionPublishState`, `VALID_PUBLISH_TRANSITIONS`, `evaluateReadiness`, `createPublishAuditEntry`.

## Storage
`IPublishStorageAdapter`, `IPublishStorageRecord`, `InMemoryPublishStorageAdapter`.

## Hooks
`usePublishWorkflowState`, `usePublishReadinessState`, `usePublishQueue`, `publishWorkflowKeys`.

## Component Shells
`PublishPanelShell`, `PublishTargetSelectorShell`, `PublishApprovalChecklistShell`, `PublishReceiptCardShell`.

## Adapters
`PublishModuleRegistry`, `createModulePublishRequest`, `IPublishModuleRegistration`.

## Testing
`createMockPublishRequest`, `mockPublishScenarios`.

## Related
- [ADR-0122](../../architecture/adr/ADR-0122-publish-workflow.md)
- [Adoption Guide](../../how-to/developer/publish-workflow-adoption-guide.md)
