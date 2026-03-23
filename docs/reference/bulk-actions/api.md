# @hbc/bulk-actions API Reference

> **Doc Classification:** Living Reference (Diataxis) — Reference quadrant; developer audience.

## Types
`BulkSelectionScope`, `BulkActionKind`, `BulkExecutionPhase` (7), `BulkResultKind` (4), `IBulkActionItemRef`, `IBulkSelectionSnapshot`, `IBulkActionDefinition<TInput>`, `IBulkEligibilityResult`, `IBulkActionContext`, `IBulkExecutionPlan`/`Progress`/`Result`, `IBulkItemExecutionResult`, `IBulkGroupedFailureReason`, `IBulkResultsSummary`, `IBulkPermissionGate`, `IBulkDestructiveActionMetadata`, `IBulkConfiguredInputSchema`, `IBulkSelectionAdapter`, `IBulkAuditEmission`. 6 reason-code enums.

## Model
`evaluateEligibility`, `filterEligible`.

## Selection
`createSelectionSnapshot`, `escalateScope`, `validateScopeIntegrity`.

## Execution
`planExecution`, `aggregateResults`.

## Hooks
`useBulkSelection`, `useBulkActionExecution`, `bulkActionKeys`.

## Component Shells
`BulkSelectionBarShell`, `BulkActionMenuShell`, `BulkActionConfirmDialogShell`, `BulkActionInputDialogShell`, `BulkActionResultsPanelShell`, `SelectAllFilteredBannerShell`.

## Adapters
`BulkActionModuleRegistry`, `IBulkActionModuleRegistration`.

## Testing
`createMockBulkSelectionSnapshot`, `mockBulkActionScenarios`.

## Related
- [ADR-0123](../../architecture/adr/ADR-0123-bulk-actions.md)
- [Adoption Guide](../../how-to/developer/bulk-actions-adoption-guide.md)
