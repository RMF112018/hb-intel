# @hbc/saved-views API Reference

> **Doc Classification:** Living Reference (Diataxis) — Reference quadrant; developer audience.

## Types

`SavedViewScope`, `IFilterClause` (11 operators), `ISortDefinition`, `IGroupDefinition`, `IViewPresentationState`, `ISavedViewDefinition`, `ISavedViewSchemaDescriptor`, `ISavedViewStateMapper<TState>`, `SavedViewCompatibilityStatus`, `ISavedViewCompatibilityResult`, `ISavedViewScopePermissions`, `ISavedViewOwnershipCheck`, `ISavedViewContext`, `SavedViewAction` (8-variant union), `IComplexityViewDefault`, `SavedViewTelemetryEvent`.

## Model

`createSavedView`, `VIEW_LIFECYCLE_STATES`, `reconcile`.

## Storage

`ISavedViewsStorageAdapter`, `InMemorySavedViewsStorageAdapter`.

## Hooks

`useSavedViews`, `useViewCompatibility`, `useWorkspaceStateMapper`, `savedViewsKeys`.

## Components (Shells)

`SavedViewPickerShell`, `SavedViewChipShell`, `SaveViewDialogShell`, `ViewCompatibilityBannerShell`.

## Adapters

`SavedViewModuleRegistry`, `createTanStackTableMapper`, `TanStackTableState`.

## Testing (`@hbc/saved-views/testing`)

`createMockSavedViewDefinition`, `mockPersonalView`, `mockTeamView`, `mockRoleView`, `mockSystemView`, `mockDegradedView`, `mockIncompatibleView`, `mockPermissionsPersonalOnly`, `mockPermissionsTeamWriter`, `mockSchemaV1`, `mockSchemaV2`.

## Related

- [ADR-0121](../../architecture/adr/ADR-0121-saved-views.md)
- [Adoption Guide](../../how-to/developer/saved-views-adoption-guide.md)
