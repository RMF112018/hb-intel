> **Doc Classification:** Living Reference (Diátaxis) — Reference API surface for SF20 primitive and BD adapter.

# BD Heritage Strategic Intelligence API Reference

## Packages

- Primitive: `@hbc/strategic-intelligence`
- Adapter: `@hbc/features-business-development`

## Canonical Primitive Contracts

- `IHeritageSnapshot`
- `IStrategicIntelligenceEntry`
- `IIntelligenceTrustMetadata`
- `ICommitmentRegisterItem`
- `IHandoffReviewState`
- `IIntelligenceConflict`
- `IRedactedProjection`
- `IStrategicIntelligenceApprovalQueueItem`
- `IStrategicIntelligenceTelemetryState`
- `IStrategicIntelligenceState`

## Primitive Public Runtime Surface

### APIs

- `StrategicIntelligenceApi`
- `StrategicIntelligenceLifecycleApi`

### Hooks

- `useStrategicIntelligenceState`
- `useStrategicIntelligenceApprovalQueue`
- `useHandoffReviewWorkflow`
- `useSuggestedIntelligence`

### Constants

- `STRATEGIC_INTELLIGENCE_STALE_MS`
- `STRATEGIC_INTELLIGENCE_SYNC_QUEUE_KEY`
- `STRATEGIC_INTELLIGENCE_INDEXING_VISIBILITY`
- `STRATEGIC_INTELLIGENCE_REVIEW_REMINDER_DAYS`

### Testing exports

From `@hbc/strategic-intelligence/testing`:

- `createMockHeritageSnapshot(overrides?)`
- `createMockStrategicIntelligenceEntry(overrides?)`
- `createMockCommitmentRegisterItem(overrides?)`
- `createMockHandoffReviewState(overrides?)`
- `createMockIntelligenceApprovalItem(overrides?)`
- `createMockIntelligenceConflict(overrides?)`
- `createMockSuggestedIntelligenceMatch(overrides?)`
- `mockStrategicIntelligenceStates`

## BD Adapter Public Surface

### Hook

- `useStrategicIntelligence`

### Components

- `BdHeritagePanel`
- `StrategicIntelligenceFeed`
- `IntelligenceEntryForm`
- `IntelligenceApprovalQueue`
- `HandoffReviewPanel`
- `CommitmentRegisterPanel`
- `SuggestedIntelligenceCard`
- `IntelligenceExplainabilityDrawer`

### Testing exports

From `@hbc/features-business-development/testing`:

- `createMockStrategicIntelligenceProfile(overrides?)`
- `createMockBdStrategicIntelligenceView(overrides?)`

## Boundary Notes

- Primitive owns lifecycle/workflow/trust/sensitivity/conflict/replay semantics.
- Adapter owns projection/composition/copy/role-context rendering and action wiring.
- Integration adapters consume public `@hbc/*` entrypoints only.
- Search/index projection outputs exclude pending/rejected records.

## Related Artifacts

- [SF20 Master Plan](/Users/bobbyfetting/hb-intel/docs/architecture/plans/shared-features/SF20-BD-Heritage-Panel.md)
- [ADR-0109](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0109-bd-heritage-living-strategic-intelligence.md)
- [ADR-0113](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0113-strategic-intelligence-primitive-runtime.md)
