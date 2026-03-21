# P3-D4: Related-Items Registry / Presentation Contract

| Field | Value |
|---|---|
| **Doc ID** | P3-D4 |
| **Phase** | Phase 3 |
| **Workstream** | D — Shared project spines |
| **Document Type** | Contract |
| **Owner** | Platform / Core Services + Project Hub platform owner |
| **Update Authority** | Architecture lead; changes require review by Platform lead and Experience lead |
| **Last Reviewed Against Repo Truth** | 2026-03-21 |
| **References** | [Phase 3 Plan §8.5](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-A3 §6](P3-A3-Shared-Spine-Publication-Contract-Set.md); [P3-C2 §5](P3-C2-Mandatory-Core-Tile-Family-Definition.md); [ADR-0103](../../../adr/0103-related-items-unified-work-graph.md); [P3-A1](P3-A1-Project-Registry-and-Activation-Contract.md); [P3-A2](P3-A2-Membership-Role-Authority-Contract.md); [P3-D1](P3-D1-Project-Activity-Contract.md); [`@hbc/related-items`](../../../../packages/related-items/src/index.ts) |

---

## Contract Statement

This contract is the full implementation specification for the **Related-Items spine** — the cross-module record relationship registry and presentation system that Phase 3 Project Hub consumes for home/canvas relationship tiles, grouped relationship panels, cross-module navigation, AI-suggested relationships, and governance event audit.

Phase 3 uses a **hybrid relationship model** (Phase 3 plan §8.5):

- A central registry defines canonical relationship types, visibility rules, directionality, and resolution behavior.
- Modules remain responsible for local record linkage, local data authority, and richer drill-down behavior.

P3-A3 §6 defined the publication-level contract (module relationship registration expectations, registration rules, architecture boundary). This deliverable expands that into the complete specification: canonical type system, registry pattern, bidirectional registration model, resolution pipeline, batched API contract, AI suggestion contract, governance event emission, module registration expectations, rendering contract, cross-spine integration, and cross-lane consistency.

**Repo-truth audit — 2026-03-21.** The Related-Items spine is **fully implemented** in `@hbc/related-items` (v0.0.2) per SF14 and ADR-0103 (locked 2026-03-11). All canonical types (`IRelationshipDefinition`, `IRelatedItem`, `IGovernanceMetadata`, `RelationshipDirection`, `IBicNextMoveState`, `IGovernanceTimelineEvent`), registry (`RelationshipRegistry` singleton with bidirectional pair registration and AI suggestion hooks), batched API (`RelatedItemsApi` with summary and BIC enrichment routes), hook (`useRelatedItems` with session-state caching), components (`HbcRelatedItemsPanel`, `HbcRelatedItemsTile`, `HbcRelatedItemCard`), governance stub (`HbcRelatedItemsGovernance`), reference integrations (BD Scorecard ↔ Estimating Pursuit ↔ Project), activity timeline adapter (`emitGovernanceEvent` no-op ready for Activity spine), and testing exports are live and tested. P3-C2 §5 defines the `related-items` mandatory tile — currently registered as optional, requiring upgrade to mandatory. This contract codifies existing mature implementation as governance. See §1 for full reconciliation.

---

## Contract Scope

### This contract governs

- The canonical type system: `IRelationshipDefinition`, `IRelatedItem`, `IGovernanceMetadata`, `RelationshipDirection`, `IBicNextMoveState`, `IGovernanceTimelineEvent`
- The `RelationshipRegistry` singleton pattern and `registerBidirectionalPair()` contract
- The bidirectional registration model with reverse direction mapping and override options
- The `IRelatedItem` resolution pipeline (registry lookup, role filtering, ID resolution, strategy grouping, batched fetch, BIC enrichment, AI suggestions, deduplication, priority sorting)
- The batched API contract (`RelatedItemsApi` routes and request/response shapes)
- The AI suggestion contract (hook registration, resolver interface, confidence scores)
- Governance event emission (`IGovernanceTimelineEvent` and `emitGovernanceEvent()`)
- Governance metadata model (priority, resolver strategy, role relevance, AI hook binding)
- Module relationship registration expectations (expanded from P3-A3 §6.1)
- Rendering contract for relationship consumers (panel, tile, card)
- Cross-spine integration rules (Related Items ↔ Activity)
- Cross-lane consistency rules (PWA / SPFx)

### This contract does NOT govern

- The publication-level contract definition (already locked in [P3-A3 §6](P3-A3-Shared-Spine-Publication-Contract-Set.md))
- Related-Items tile UI design — see [P3-C2 §5](P3-C2-Mandatory-Core-Tile-Family-Definition.md) for mandatory tile spec
- Other spine specifications — see P3-D1 (Activity), P3-D2 (Health), P3-D3 (Work Queue)
- Module-internal record linkage, local data authority, or richer drill-down behavior — module-owned per the hybrid model

---

## Definitions

| Term | Meaning |
|---|---|
| **Relationship definition** | A declarative contract describing a directional relationship between two record types (`IRelationshipDefinition`) |
| **Related item** | A resolved record ready for display with label, status, navigation, and metadata (`IRelatedItem`) |
| **Relationship direction** | One of 6 directional values forming 3 bidirectional pairs: `originated`/`converted-to`, `has`/`references`, `blocks`/`is-blocked-by` |
| **Governance metadata** | Priority, resolver strategy, role relevance, AI hook, and data source configuration attached to a relationship definition |
| **Bidirectional pair** | A forward relationship definition and its automatically generated reverse counterpart, registered atomically |
| **Resolver strategy** | The backend method for fetching related item summaries: `sharepoint`, `graph`, `ai-suggested`, or `hybrid` |
| **AI suggestion hook** | A registered resolver function that returns AI-suggested related items with confidence scores |
| **Governance timeline event** | A typed event recording relationship lifecycle changes for audit: created, removed, updated, AI suggestion accepted/dismissed |
| **Relationship priority** | Numeric priority (higher = first) controlling display ordering (default: 50) |
| **Role visibility** | Per-role filtering that controls which relationships are visible to which user roles |

---

## 1. Current-State Reconciliation

| Artifact | Location | Status | Relevance |
|---|---|---|---|
| `IRelationshipDefinition`, `IRelatedItem`, `IGovernanceMetadata`, `RelationshipDirection`, `IBicNextMoveState` | `packages/related-items/src/types/index.ts` | **Live** — mature | Core type contracts |
| `IGovernanceTimelineEvent` | `packages/related-items/src/reference/activityTimelineAdapter.ts` | **Live** — mature | 5 governance event types |
| `RelationshipRegistry` | `packages/related-items/src/registry/index.ts` | **Live** — mature | Singleton with bidirectional pair, AI hooks, deterministic sorting, validation |
| `RelatedItemsApi` | `packages/related-items/src/api/RelatedItemsApi.ts` | **Live** — mature | Batched API with summary fetch, BIC enrichment, AI suggestions, deduplication |
| `useRelatedItems` | `packages/related-items/src/hooks/useRelatedItems.ts` | **Live** — mature | Orchestration hook with session-state caching, error fallback, grouping, AI separation |
| `HbcRelatedItemsPanel` | `packages/related-items/src/components/HbcRelatedItemsPanel.tsx` | **Live** — mature | Grouped panel with collapsible sections, smart empty state, complexity-aware |
| `HbcRelatedItemsTile` | `packages/related-items/src/components/HbcRelatedItemsTile.tsx` | **Live** — mature | Compact canvas tile showing top-3 priority items |
| `HbcRelatedItemCard` | `packages/related-items/src/components/HbcRelatedItemCard.tsx` | **Live** — mature | Individual item card with metadata badges, version chips, AI indicators |
| `HbcRelatedItemsGovernance` | `packages/related-items/src/governance/HbcRelatedItemsGovernance.tsx` | **Live** — stub | TODO: priority editing, role-visibility controls, preview-as-role |
| `emitGovernanceEvent()` | `packages/related-items/src/reference/activityTimelineAdapter.ts` | **Live** — no-op | Dev-mode console.info; ready for Activity spine integration |
| Reference registrations | `packages/related-items/src/reference/referenceRegistrations.ts` | **Live** — mature | BD Scorecard ↔ Estimating Pursuit ↔ Project bidirectional pairs |
| Reference AI hook | `packages/related-items/src/reference/referenceAISuggestionHook.ts` | **Live** — mature | `bd-pursuit-ai-suggest` hook with 0.82 confidence |
| Constants | `packages/related-items/src/constants/index.ts` | **Live** — mature | `RELATED_ITEMS_PANEL_TITLE`, `DEFAULT_RELATIONSHIP_PRIORITY` (50), `MAX_TILE_ITEMS` (3) |
| Testing exports | `packages/related-items/testing/` | **Live** — mature | 5 factory/mock files (ADR-0103 D-10) |
| ADR-0103 | `docs/architecture/adr/0103-related-items-unified-work-graph.md` | **Accepted** | 10 governance decisions locking SF14 production behavior |
| P3-A3 §6 | Phase 3 deliverables | **Locked** (plan) | Publication-level module registration expectations |
| P3-C2 §5 | Phase 3 deliverables | **Locked** (spec) | Mandatory `related-items` tile — currently optional, requires upgrade |

**Classification:** All Related-Items spine artifacts are live and implemented at production maturity. The `related-items` tile requires upgrade from optional to mandatory (P3-C2 §5.4). Governance component is a stub pending SF14-T05. Module-specific relationship registrations are controlled-evolution scope (§9). `emitGovernanceEvent()` requires upgrade from no-op to real Activity spine emission.

---

## 2. Canonical Type System

All types are defined in `packages/related-items/src/types/index.ts` and exported through the `@hbc/related-items` public surface (ADR-0103 D-01).

### 2.1 RelationshipDirection

```typescript
type RelationshipDirection =
  | 'originated'
  | 'converted-to'
  | 'has'
  | 'references'
  | 'blocks'
  | 'is-blocked-by';
```

Directions form 3 bidirectional pairs:

| Forward | Reverse |
|---|---|
| `originated` | `converted-to` |
| `has` | `references` |
| `blocks` | `is-blocked-by` |

The reverse direction mapping is used by `registerBidirectionalPair()` to automatically generate symmetric reverse entries (ADR-0103 D-02).

### 2.2 IGovernanceMetadata

| Field | Type | Required | Description |
|---|---|---|---|
| `relationshipPriority` | `number` | Yes | Numeric priority for display ordering (higher = first; default: 50) |
| `resolverStrategy` | `'sharepoint' \| 'graph' \| 'ai-suggested' \| 'hybrid'` | No | Backend resolution strategy (default: `sharepoint`) |
| `roleRelevanceMap` | `Record<string, RelationshipDirection[]>` | No | Per-role direction filtering |
| `aiSuggestionHook` | `string` | No | Hook ID linking to a registered AI suggestion resolver |
| `dataSource` | `'sharepoint' \| 'graph'` | No | Data source indicator for the backend |

### 2.3 IRelationshipDefinition

| Field | Type | Required | Description |
|---|---|---|---|
| `sourceRecordType` | `string` | Yes | Source record type identifier |
| `targetRecordType` | `string` | Yes | Target record type identifier (must differ from source) |
| `label` | `string` | Yes | Human-readable relationship label shown in UI |
| `direction` | `RelationshipDirection` | Yes | Directional relationship type |
| `targetModule` | `string` | Yes | Target module for routing |
| `resolveRelatedIds` | `(sourceRecord: unknown) => string[]` | Yes | Module-local function resolving target record IDs from a source record |
| `buildTargetUrl` | `(targetRecordId: string) => string` | Yes | URL builder for navigation to target records |
| `visibleToRoles` | `string[]` | No | Role-gated visibility filter (ADR-0103 D-06) |
| `governanceMetadata` | `IGovernanceMetadata` | No | Priority, resolver strategy, role relevance, AI hook |

### 2.4 IRelatedItem

| Field | Type | Required | Description |
|---|---|---|---|
| `recordType` | `string` | Yes | Target record type |
| `recordId` | `string` | Yes | Target record identifier |
| `label` | `string` | Yes | Human-readable record label |
| `status` | `string` | No | Record status for badge display |
| `href` | `string` | Yes | Navigation URL to the target record |
| `bicState` | `IBicNextMoveState` | No | BIC Next Move state (enrichment) |
| `moduleIcon` | `string` | Yes | Module icon identifier for display |
| `relationship` | `RelationshipDirection` | Yes | Direction of this relationship |
| `relationshipLabel` | `string` | Yes | Human-readable relationship label |
| `versionChip` | `{ lastChanged: string; author: string }` | No | Version metadata for audit |
| `aiConfidence` | `number` | No | AI suggestion confidence score (0–1) |

### 2.5 IBicNextMoveState

| Field | Type | Description |
|---|---|---|
| `currentState` | `string` | Current BIC state |
| `nextMove` | `string` | Next recommended move |

### 2.6 IGovernanceTimelineEvent

| Field | Type | Description |
|---|---|---|
| `eventType` | `'relationship-created' \| 'relationship-removed' \| 'relationship-updated' \| 'ai-suggestion-accepted' \| 'ai-suggestion-dismissed'` | Governance event classification |
| `sourceRecordType` | `string` | Source record type in the relationship |
| `targetRecordType` | `string` | Target record type in the relationship |
| `changedBy` | `string` | UPN of the user who triggered the event |
| `timestamp` | `string` | ISO 8601 timestamp |
| `details` | `Record<string, unknown>` | Optional structured event details |

---

## 3. Registry Contract

The `RelationshipRegistry` is a singleton for cross-module relationship definitions (ADR-0103 D-01). Implemented in `registry/index.ts`.

### 3.1 Registry pattern

| Property | Value |
|---|---|
| Pattern | Module singleton |
| Registration method | `registerBidirectionalPair()` — atomic forward + reverse |
| Late registration | Supported (no freeze-on-write) |
| Unregistration | Not supported |
| Validation | On register — validates all fields, rejects duplicates |
| AI hook registration | `registerAISuggestionHook()` — separate hook-by-ID pattern |

### 3.2 Composite key format

Definitions are indexed by composite key: `${sourceRecordType}::${targetRecordType}::${direction}`

### 3.3 Retrieval API

| Method | Description |
|---|---|
| `getBySourceRecordType(sourceRecordType)` | Returns definitions filtered by source type, sorted deterministically |
| `getRelationships(sourceRecordType)` | Backward-compatible alias for `getBySourceRecordType()` |
| `getAll()` | Returns all registered definitions, sorted deterministically |
| `getAISuggestionHook(hookId)` | Returns a registered AI suggestion resolver by hook ID |

### 3.4 Deterministic sorting

Definitions are sorted by:
1. Higher `relationshipPriority` first (descending)
2. Alphabetical `label`
3. Alphabetical `targetRecordType`
4. Alphabetical `direction`

### 3.5 Validation rules

| Rule | Error condition |
|---|---|
| Non-empty strings | `sourceRecordType`, `targetRecordType`, `label`, `targetModule` must be non-empty trimmed strings |
| Source ≠ target | `sourceRecordType` and `targetRecordType` must differ |
| Function checks | `resolveRelatedIds` and `buildTargetUrl` must be functions |
| Array check | `visibleToRoles` must be an array when provided |
| Priority check | `governanceMetadata.relationshipPriority` must be a valid number |
| Direction check | `roleRelevanceMap` directions must be valid `RelationshipDirection` values |
| Duplicate check | Forward and reverse composite keys must not already exist |

---

## 4. Bidirectional Registration Model

Every relationship is registered as a bidirectional pair (ADR-0103 D-09). `registerBidirectionalPair()` atomically creates both forward and reverse entries.

### 4.1 Reverse direction mapping

| Forward direction | Reverse direction |
|---|---|
| `originated` | `converted-to` |
| `converted-to` | `originated` |
| `has` | `references` |
| `references` | `has` |
| `blocks` | `is-blocked-by` |
| `is-blocked-by` | `blocks` |

### 4.2 Reverse overrides

The reverse entry inherits all fields from the forward definition with source/target swapped and direction reversed. Optional overrides allow customization:

| Override field | Effect |
|---|---|
| `label` | Custom label for the reverse direction (default: `"Related {sourceRecordType}"`) |
| `visibleToRoles` | Different role visibility for the reverse direction |
| `governanceMetadata` | Different priority, resolver strategy, or role relevance for the reverse direction |

### 4.3 Symmetry guarantee

Both entries share the same `resolveRelatedIds` and `buildTargetUrl` functions. If either the forward or reverse composite key already exists, the entire pair registration is rejected.

---

## 5. Resolution Pipeline

The resolution pipeline is implemented in `RelatedItemsApi.getRelatedItems()`. All resolution follows a deterministic, non-fatal failure model.

### 5.1 Pipeline stages

```
Registry Lookup → Role Filtering → ID Resolution → Strategy Grouping → Parallel Fetch → BIC Enrichment → AI Suggestions → Deduplication → Priority Sorting
```

| Stage | Description |
|---|---|
| **Registry lookup** | `RelationshipRegistry.getBySourceRecordType(sourceRecordType)` |
| **Role filtering** | Filter definitions by `visibleToRoles` and `roleRelevanceMap` |
| **ID resolution** | Call `resolveRelatedIds(sourceRecord)` on each definition; normalize and deduplicate IDs |
| **Strategy grouping** | Group requests by `resolverStrategy` (default: `sharepoint`) |
| **Parallel fetch** | POST to `/api/related-items/summaries` per strategy via `Promise.allSettled()` (non-fatal) |
| **BIC enrichment** | POST to `/api/related-items/bic-enrichment` for items missing BIC state (non-fatal) |
| **AI suggestions** | Call registered AI hooks in deterministic order (non-fatal) |
| **Deduplication** | Dedupe by composite key: `${recordType}::${recordId}::${relationship}::${relationshipLabel}` |
| **Priority sorting** | Sort by governance priority (descending), then by label, then by recordId |

### 5.2 Non-fatal failure model

- Individual strategy fetches failing do not block other strategies.
- BIC enrichment failure does not block summary results.
- AI hook failure does not block relationship retrieval.
- ID resolution errors for individual definitions are caught and skipped.

---

## 6. Batched API Contract

### 6.1 Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/related-items/summaries` | POST | Fetch batched summaries grouped by resolver strategy |
| `/api/related-items/bic-enrichment` | POST | Non-fatal BIC state enrichment pass |

### 6.2 Summary request shape

```typescript
interface IRelatedSummaryRequest {
  sourceRecordType: string;
  sourceRecordId: string;
  requests: Array<{
    sourceRecordType: string;
    targetRecordType: string;
    resolverStrategy: ResolverStrategy;
    targetModule: string;
    relationshipLabel: string;
    relationshipDirection: string;
    recordIds: string[];
  }>;
}
```

### 6.3 Summary response shape

The API accepts both array and object response formats for backward compatibility:

```typescript
// Object format
interface IRelatedSummaryResponse {
  summaries: IRelatedSummaryRecord[];
}

// Array format — also accepted
IRelatedSummaryRecord[]
```

Each `IRelatedSummaryRecord` contains: `recordType`, `recordId`, `label?`, `status?`, `moduleIcon?`, `bicState?`, `versionChip?`, `aiConfidence?`.

### 6.4 Request ordering

Resolver strategies are sorted alphabetically before dispatching to ensure deterministic request order.

---

## 7. AI Suggestion Contract

AI suggestions provide confidence-scored relationship recommendations (ADR-0103 D-07 Expert tier).

### 7.1 Hook registration

```typescript
RelationshipRegistry.registerAISuggestionHook(hookId: string, resolver: AISuggestionResolver): void
```

- Hook IDs must be unique; duplicates throw.
- Hooks are linked to definitions via `governanceMetadata.aiSuggestionHook`.

### 7.2 Resolver interface

```typescript
type AISuggestionResolver = (params: {
  sourceRecordType: string;
  sourceRecordId: string;
  sourceRecord: unknown;
  role?: string;
}) => IRelatedItem[] | Promise<IRelatedItem[]>;
```

### 7.3 Suggestion behavior

- AI suggestions are appended after registry-resolved items.
- Suggestions default to `relationshipLabel: 'AI Suggestion'`, `relationship: 'references'`, `moduleIcon: 'ai-assist'` when not specified.
- Suggestions carry `aiConfidence` for UI display and filtering.
- AI hooks are called in deterministic order (alphabetical by hook ID).

### 7.4 Non-fatal execution

AI hook failures are caught and silently skipped. Suggestions are advisory; failures MUST NOT block relationship retrieval.

### 7.5 UI separation

The hook (`useRelatedItems`) derives `aiSuggestions` separately by filtering items where `aiConfidence` is a number or `relationshipLabel` contains "AI Suggestion". Expert tier renders these in a separate group; Standard tier filters them out.

---

## 8. Governance Event Emission

Governance events provide audit trail for relationship lifecycle changes. Defined in `activityTimelineAdapter.ts`.

### 8.1 Event types

| Event type | Trigger |
|---|---|
| `relationship-created` | A new relationship is established between records |
| `relationship-removed` | An existing relationship is removed |
| `relationship-updated` | Relationship metadata (priority, visibility) is modified |
| `ai-suggestion-accepted` | An AI-suggested relationship is accepted by a user |
| `ai-suggestion-dismissed` | An AI-suggested relationship is dismissed by a user |

### 8.2 Current implementation

`emitGovernanceEvent()` is currently a **no-op** in production. In development mode (`NODE_ENV === 'development'`), events are logged to `console.info` for observability.

### 8.3 Upgrade path

When the Activity spine (P3-D1) is operational, `emitGovernanceEvent()` must be upgraded to publish real events into the Activity spine per P3-D1 §7.3. Governance events map to activity events:

| Governance event | Activity event type | Significance |
|---|---|---|
| `relationship-created` | `related-items.relationship-created` | `routine` |
| `relationship-removed` | `related-items.relationship-removed` | `routine` |
| `relationship-updated` | `related-items.relationship-updated` | `routine` |
| `ai-suggestion-accepted` | `related-items.ai-suggestion-accepted` | `notable` |
| `ai-suggestion-dismissed` | `related-items.ai-suggestion-dismissed` | `routine` |

---

## 9. Module Relationship Registration Expectations

Each always-on core module that has cross-module record relationships MUST register relationship definitions with `RelationshipRegistry`. This section expands P3-A3 §6.1.

### 9.1 Module registration matrix

| Module | Required registrations | Example relationships |
|---|---|---|
| Financial | Budget → Schedule milestones, Financial → Constraints (cost impact) | `financial-forecast` → `schedule-milestone` |
| Schedule | Milestones → Constraints (schedule impact), Schedule → Permits (timeline dependency) | `schedule-milestone` → `constraint` |
| Constraints | Constraints → Financial (cost impact), Constraints → Schedule (delay impact) | `constraint` → `financial-forecast` |
| Permits | Permits → Inspections (linked required inspections), Permits → Schedule (timeline) | `permit` → `inspection` |
| Safety | Incidents → Follow-up actions, Safety plans → Subcontractor orientations | `safety-incident` → `safety-follow-up` |
| Reports | Reports → Module snapshots (data sources), Reports → Approvals | `report-run` → `module-snapshot` |

### 9.2 Registration rules (from P3-A3 §6.2)

- Relationships MUST use `RelationshipRegistry.registerBidirectionalPair()` to ensure symmetric visibility.
- Relationship definitions MUST include `governanceMetadata` with `relationshipPriority` for consistent ordering.
- `visibleToRoles` MUST align with the module visibility matrix in P3-A2 §4.1.
- Relationships MUST NOT create cross-feature package imports — resolution functions use record IDs and URL builders only.

### 9.3 Architecture boundary (from P3-A3 §6.3)

| Owned by spine | Owned by module |
|---|---|
| Relationship type registry | Local record linkage and data authority |
| Directionality and visibility rules | Richer drill-down behavior within the module |
| AI suggestion hooks and resolver contracts | Relationship creation/deletion business logic |
| Governance event emission |  |

---

## 10. Rendering Contract

Related-items consumers MUST render relationship data consistently across surfaces (ADR-0103 D-05, D-07, D-08).

### 10.1 Complexity-tier variants

From P3-C2 §5.2:

| Tier | Rendering |
|---|---|
| `essential` | **Hidden** — panel and tile are not rendered (ADR-0103 D-07) |
| `standard` | Grouped relationship list by module with status chips and navigation links; AI suggestions filtered out |
| `expert` | Full relationship graph with directionality, governance metadata, AI-suggested items with confidence scores, and version chips |

### 10.2 Component inventory

| Component | Purpose |
|---|---|
| `HbcRelatedItemsPanel` | Grouped relationship panel with collapsible sections, smart empty state, degraded banner on error |
| `HbcRelatedItemsTile` | Compact canvas tile showing top-3 priority items with view-all button |
| `HbcRelatedItemCard` | Individual item card with metadata badges, version chips, BIC state, AI indicators |

### 10.3 Panel behavior

- Groups items by `relationshipLabel` into collapsible sections with count badges.
- First group is open by default; subsequent groups are closed.
- Shows degraded banner when error occurs but cached content is available.
- Shows smart empty state with coaching tips when no items and no error.
- Expert tier: AI suggestion group rendered at bottom with "Suggest new relationships" CTA.
- Standard tier: AI groups are filtered out.

### 10.4 Tile behavior

- Shows top 3 items by priority (constant: `MAX_TILE_ITEMS = 3`).
- "View all" button appears when `items.length > 3`.
- Auto-hidden when no items and no error.
- Module icons display first 2 uppercase characters.

### 10.5 Card behavior

- Renders as link (when `href` is set) or div.
- Header: module icon + label + recordType + optional status badge.
- Metadata badges: relationship label, direction, BIC state (when `showBicState`), version details.
- Version details in expandable `<details>` element.
- AI suggestions show "Suggest" button in Expert tier.

### 10.6 Caching

The hook caches resolved items to `@hbc/session-state` DraftStore with key: `related-items:${sourceRecordType}:${sourceRecordId}:${role}`. On API error, cached items are used as fallback with error message preserved.

---

## 11. Cross-Spine Integration Rules

### 11.1 Related Items → Activity

Governance events (§8) are published as activity events when the Activity spine (P3-D1) is operational. The `emitGovernanceEvent()` function is the emission seam — currently no-op, pending upgrade per P3-D1 §7.3.

Related Items → Activity integration includes:
- Relationship creation/removal events published via the existing `IGovernanceTimelineEvent` emission seam (P3-D1 §7.3).
- Phase 3 must upgrade `emitGovernanceEvent()` from a no-op placeholder to real publication into the Activity spine.

### 11.2 Activity → Related Items

Activity events MAY link to related records via `sourceRecordId` for navigation. Activity surfaces can deep-link to related items via the standard `context.href` pattern.

### 11.3 Boundary rule

Cross-spine integration uses each spine's public contract only. No direct internal coupling between spine implementations is permitted.

---

## 12. Cross-Lane Consistency

The following MUST remain consistent across both the PWA and SPFx lanes:

1. **Same registry.** Both lanes use the same `RelationshipRegistry` definitions.
2. **Same type system.** `IRelationshipDefinition`, `IRelatedItem`, and all sub-types are shared.
3. **Same resolution.** Both lanes use the same `RelatedItemsApi` pipeline.
4. **Same role visibility.** `visibleToRoles` and `roleRelevanceMap` produce identical filtering.
5. **Same governance metadata.** Priority, resolver strategy, and AI hook binding are identical.
6. **Same mandatory tile rendering.** The `related-items` mandatory tile (P3-C2 §5) shows the same data in both lanes.
7. **Lane-specific depth.** The PWA MAY offer richer panel interaction (full grouped panel, AI suggestion management, governance controls); SPFx provides the standard relationship tile and compact card list.

---

## 13. Repo-Truth Reconciliation Notes

1. **`IRelationshipDefinition` type system — compliant**
   All types in `related-items/src/types/index.ts` are live, tested, and match this contract exactly. Classified as **compliant**.

2. **`RelationshipRegistry` — compliant**
   Singleton with `registerBidirectionalPair()`, `registerAISuggestionHook()`, deterministic sorting, comprehensive validation, and composite key indexing. Classified as **compliant**.

3. **`RelatedItemsApi` — compliant**
   Batched API with summary fetch, BIC enrichment, AI suggestion integration, deduplication, and priority sorting. Non-fatal failure model throughout. Classified as **compliant**.

4. **`useRelatedItems` hook — compliant**
   Orchestration hook with session-state caching, error fallback, deterministic sorting, group derivation, and AI suggestion separation. Classified as **compliant**.

5. **Components (Panel, Tile, Card) — compliant**
   All three components are implemented with complexity-tier awareness, Storybook stories, and test coverage. Panel uses smart empty state and degraded banner. Tile shows top-3 with view-all. Card renders metadata badges and version chips. Classified as **compliant**.

6. **ADR-0103 — compliant**
   All 10 governance decisions (D-01 through D-10) are reflected in both implementation and this contract. Classified as **compliant**.

7. **Reference integrations — compliant**
   BD Scorecard ↔ Estimating Pursuit ↔ Project bidirectional pairs and `bd-pursuit-ai-suggest` AI hook are registered and tested. Classified as **compliant**.

8. **Module relationship registrations — controlled evolution**
   Module-specific relationship registrations (§9) exist as contract expectations. Per-module implementation is Phase 3 execution-time work. Each always-on core module must register its bidirectional pairs during the module delivery workstream. Classified as **controlled evolution**.

9. **`related-items` tile upgrade (optional → mandatory) — requires extension**
   P3-C2 §5.4 documents the upgrade requirement: set `mandatory: true`, `lockable: true`, populate `defaultForRoles`. Three complexity variants exist. Classified as **requires extension**.

10. **`HbcRelatedItemsGovernance` component — controlled evolution**
    Currently a TODO stub (SF14-T05 scope). Priority editing, role-visibility controls, preview-as-role, and activity timeline emission are planned. Classified as **controlled evolution**.

11. **`emitGovernanceEvent()` Activity spine integration — requires extension**
    Currently a no-op with dev-mode console logging. Must be upgraded to real publication into the Activity spine when P3-D1 is implemented. Classified as **requires extension**.

---

## 14. Acceptance Gate Reference

**Gate:** Shared spine gates — related-items component (Phase 3 plan §18.4)

| Field | Value |
|---|---|
| **Pass condition** | Related-Items spine is fed by normalized module relationship registrations; canvas tile, panel, and card surfaces consume the relationship data coherently with role-gated visibility |
| **Evidence required** | P3-D4 (this document), `RelationshipRegistry` implementation, module relationship registrations, `related-items` tile upgrade to mandatory, panel/tile/card rendering, role visibility tests, cross-lane consistency verification |
| **Primary owner** | Platform / Core Services + Project Hub platform owner |

---

## 15. Policy Precedence

This contract establishes the **Related-Items spine implementation specification** that downstream work must conform to:

| Deliverable | Relationship to P3-D4 |
|---|---|
| **ADR-0103** | Provides the 10 locked governance decisions that this contract codifies; breaking changes to registry pattern, direction model, API model, or visibility model require a superseding ADR |
| **P3-A3 §6** — Related-Items Spine Publication Contract | Provides the publication-level module registration expectations that this contract expands |
| **P3-C2 §5** — Related-Items Tile | Defines the mandatory `related-items` tile that consumes relationship data per the rendering contract in §10 |
| **P3-A1** — Project Registry | Provides `projectId` context for project-scoped relationship views |
| **P3-A2** — Membership / Role Authority | Provides role-based visibility rules that `visibleToRoles` and `roleRelevanceMap` must align with |
| **P3-D1** — Project Activity Contract | Defines the Activity spine that Related-Items publishes governance events into per §11.1 |
| **P3-E1** — Module Classification Matrix | Module relationship registration expectations in §9 must align with module classifications |
| **P3-H1** — Acceptance Checklist | Must include related-items spine gate evidence |
| **Any module implementation** | Must register bidirectional relationship pairs per §9 expectations |

If a downstream deliverable conflicts with this contract, this contract takes precedence unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-21
**Governing Authority:** [Phase 3 Plan §8.5](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [ADR-0103](../../../adr/0103-related-items-unified-work-graph.md)
