# @hbc/related-items — API Reference

> **Doc Classification:** Living Reference (Diátaxis) — Reference quadrant; developer audience; related-items API reference.

**Package:** `packages/related-items/`
**Locked ADR:** [ADR-0103](../../architecture/adr/0103-related-items-unified-work-graph.md)

---

## Main Exports (`@hbc/related-items`)

### Types

| Export | Kind | Description |
|--------|------|-------------|
| `RelationshipDirection` | Type | `'originated' \| 'converted-to' \| 'has' \| 'references' \| 'blocks' \| 'is-blocked-by'` — six-value direction union (D-02) |
| `IGovernanceMetadata` | Interface | `{ relationshipPriority, resolverStrategy?, roleRelevanceMap?, aiSuggestionHook?, dataSource? }` — governance and sorting metadata (D-03) |
| `IRelationshipDefinition` | Interface | `{ sourceRecordType, targetRecordType, label, direction, targetModule, resolveRelatedIds, buildTargetUrl, visibleToRoles?, governanceMetadata? }` — full relationship registration contract (D-01) |
| `IRelatedItem` | Interface | `{ recordType, recordId, label, status?, href, bicState?, moduleIcon, relationship, relationshipLabel, versionChip?, aiConfidence? }` — resolved related-item summary (D-05) |
| `IBicNextMoveState` | Interface | BIC next-move state shape for card-level indicators |
| `IRelationshipRegistry` | Interface | Registry contract: `registerBidirectionalPair`, `registerAISuggestionHook`, `getBySourceRecordType`, `getAll`, `reset` |
| `IRelatedItemsApi` | Interface | API contract: `getRelatedItems(sourceRecordType, sourceRecordId, sourceRecord, options?)` |
| `UseRelatedItemsResult` | Interface | Hook return type: `{ groups, isLoading, error, refetch }` |
| `HbcRelatedItemsPanelProps` | Interface | `{ sourceRecordType, sourceRecordId, sourceRecord, showBicState? }` — panel component props |
| `HbcRelatedItemCardProps` | Interface | Card component props for individual related-item rendering |
| `HbcRelatedItemsTileProps` | Interface | Tile component props for canvas compact variant |
| `HbcRelatedItemsGovernanceProps` | Interface | Governance admin component props (stub — future scope) |

### Constants

| Export | Kind | Value | Description |
|--------|------|-------|-------------|
| `RELATED_ITEMS_PANEL_TITLE` | Constant | `'Related Items'` | Default panel heading (D-05) |
| `DEFAULT_RELATIONSHIP_PRIORITY` | Constant | `50` | Default governance priority when not specified (D-03) |
| `MAX_TILE_ITEMS` | Constant | `3` | Maximum items shown in canvas tile before "View all" (D-08) |

### Registry

| Export | Kind | Signature | Description |
|--------|------|-----------|-------------|
| `RelationshipRegistry` | Singleton | — | Module-level relationship registry (D-01) |
| `RelationshipRegistry.registerBidirectionalPair` | Method | `(forward: IRelationshipDefinition, reverseOverrides?: Partial<IRelationshipDefinition>) => void` | Registers a bidirectional pair with automatic reverse entry creation (D-09) |
| `RelationshipRegistry.registerAISuggestionHook` | Method | `(hookId: string, hook: AISuggestionHook) => void` | Registers an AI suggestion hook for Expert complexity (D-07) |
| `RelationshipRegistry.getBySourceRecordType` | Method | `(sourceRecordType: string) => IRelationshipDefinition[]` | Returns all definitions for a given source record type |
| `RelationshipRegistry.getAll` | Method | `() => IRelationshipDefinition[]` | Returns all registered definitions |
| `RelationshipRegistry.reset` | Method | `() => void` | Clears all registrations (testing only) |

### API

| Export | Kind | Signature | Description |
|--------|------|-----------|-------------|
| `RelatedItemsApi` | Class | — | Batched related-item summary fetcher (D-04) |
| `RelatedItemsApi.getRelatedItems` | Method | `(sourceRecordType: string, sourceRecordId: string, sourceRecord: unknown, options?) => Promise<IRelatedItem[]>` | Fetches related-item summaries via batched backend route with role/governance filtering |

### Hooks

| Export | Kind | Params | Returns | Description |
|--------|------|--------|---------|-------------|
| `useRelatedItems` | Hook | `(sourceRecordType: string, sourceRecordId: string, sourceRecord: unknown, options?)` | `UseRelatedItemsResult` | Orchestrates registry lookup, API fetch, grouping, priority sorting, role filtering, and AI suggestion derivation with `@hbc/session-state` cache fallback (D-05, D-06, D-07) |

### Components

| Export | Kind | Props | Description |
|--------|------|-------|-------------|
| `HbcRelatedItemsPanel` | Component | `HbcRelatedItemsPanelProps` | Complexity-aware grouped panel with priority-sorted relationship groups, role-aware smart empty state, version chips, and Expert AI group/CTA (D-05, D-06, D-07) |
| `HbcRelatedItemCard` | Component | `HbcRelatedItemCardProps` | Individual related-item card with module icon, status badge, direction chip, version-history chip, BIC state, and AI confidence indicator (D-05) |
| `HbcRelatedItemsTile` | Component | `HbcRelatedItemsTileProps` | Canvas compact variant showing top 3 priority items with "View all" action (D-08) |

### Governance

| Export | Kind | Props | Description |
|--------|------|-------|-------------|
| `HbcRelatedItemsGovernance` | Component | `HbcRelatedItemsGovernanceProps` | Admin governance surface (stub — future scope); will support editable priority/visibility, archiving, and activity-timeline emission |

### Reference Integrations

| Export | Kind | Description |
|--------|------|-------------|
| `registerReferenceRelationships` | Function | Registers BD↔Estimating and Estimating↔Project bidirectional pairs with governance metadata |
| `registerReferenceAIHooks` | Function | Registers `bd-pursuit-ai-suggest` AI suggestion hook |
| `emitGovernanceEvent` | Function | Activity-timeline governance event adapter |
| `MOCK_BD_SCORECARD_001` | Constant | Mock BD scorecard record |
| `MOCK_BD_SCORECARD_002` | Constant | Mock BD scorecard record |
| `MOCK_BD_SCORECARDS` | Constant | Array of all mock BD scorecards |
| `MOCK_ESTIMATING_PURSUIT_001` | Constant | Mock estimating pursuit record |
| `MOCK_ESTIMATING_PURSUIT_002` | Constant | Mock estimating pursuit record |
| `MOCK_ESTIMATING_PURSUIT_003` | Constant | Mock estimating pursuit record |
| `MOCK_ESTIMATING_PURSUITS` | Constant | Array of all mock estimating pursuits |
| `MOCK_PROJECT_001` | Constant | Mock project record |
| `MOCK_PROJECT_002` | Constant | Mock project record |
| `MOCK_PROJECTS` | Constant | Array of all mock projects |
| `IBdScorecardRecord` | Type | BD scorecard record shape |
| `IEstimatingPursuitRecord` | Type | Estimating pursuit record shape |
| `IProjectRecord` | Type | Project record shape |
| `IGovernanceTimelineEvent` | Type | Governance timeline event shape |

---

## Testing Sub-Path (`@hbc/related-items/testing`)

| Export | Kind | Description |
|--------|------|-------------|
| `createMockRelatedItem(overrides?)` | Factory | Minimal mock `IRelatedItem` with defaults: recordType `'test-record'`, relationship `'has'` |
| `createMockRelationshipDefinition(overrides?)` | Factory | Minimal mock `IRelationshipDefinition` with defaults: sourceRecordType `'source'`, targetRecordType `'target'` |
| `createMockSourceRecord(overrides?)` | Factory | Minimal mock source record with configurable fields for resolver testing |
| `mockRelationshipDirections` | Constant | `readonly ['originated', 'converted-to', 'has', 'references', 'blocks', 'is-blocked-by']` — all `RelationshipDirection` values for parameterized tests |
| `mockRelationshipRegistry` | Object | Pre-configured mock registry with BD↔Estimating and Estimating↔Project pairs for integration testing |

> **Note:** The `testing/` sub-path is excluded from the production bundle. Import only in test files.

---

## References

- [ADR-0103 — Related Items Unified Work Graph Primitive](../../architecture/adr/0103-related-items-unified-work-graph.md)
- [Adoption Guide](../../how-to/developer/related-items-adoption-guide.md)
- [SF14 Master Plan](../../architecture/plans/shared-features/SF14-Related-Items.md)
