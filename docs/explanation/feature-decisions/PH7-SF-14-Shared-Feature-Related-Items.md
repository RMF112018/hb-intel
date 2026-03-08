# PH7-SF-14: `@hbc/related-items` — Cross-Module Record Relationship Panel

**Priority Tier:** 2 — Application Layer (enhances all record detail pages)
**Package:** `packages/related-items/`
**Interview Decision:** Q25 — Option B confirmed
**Mold Breaker Source:** UX-MB §3 (Unified Work Graph); ux-mold-breaker.md Signature Solution #3; con-tech-ux-study §9 (Cross-module context gaps)

---

## Problem Solved

Construction project records do not exist in isolation. A Go/No-Go Scorecard is related to the Estimating Pursuit that it spawned, which is related to the Project record it became, which has related Turnover Meeting documents, constraints, and permit log entries. Understanding a record in context requires knowing what it is connected to — but no construction platform provides this relationship visibility across module boundaries.

Without `@hbc/related-items`:
- A PM viewing a Project record has no link back to the BD scorecard that originated it
- A BD Manager cannot see that a won pursuit has been converted and is in active estimating
- An Estimating Coordinator cannot see the related BD heritage documents from the same project's record

This creates a "silo problem" — the data exists, but the connections are invisible.

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #3 (Unified Work Graph) specifies: "Every record in the system knows what it is connected to, and surfaces those connections in a consistent relationship panel." Operating Principle §7.1 (Role-awareness) extends this: the relationship panel shows the connections most relevant to the current user's role.

The con-tech UX study §9 identifies cross-module context gaps as a recurring pain point — users must navigate away from their current record to check related items in other modules, then navigate back. `@hbc/related-items` collapses this navigation into a sidebar panel on every detail page.

---

## Relationship Model

```
BD Scorecard
    └── originated → Estimating Pursuit
                         └── converted to → Project Record
                                                ├── has → Turnover Meeting
                                                ├── has → PMP
                                                ├── has → Constraints (multiple)
                                                ├── has → Permit Log entries
                                                └── has → Monthly Reviews
```

Related items are registered by each module using the `RelationshipRegistry` — a module declares that its record type has relationships to other record types, and the relationship panel renders those connections automatically.

---

## Interface Contract

```typescript
// packages/related-items/src/types/IRelatedItems.ts

export type RelationshipDirection = 'originated' | 'converted-to' | 'has' | 'references' | 'blocks' | 'is-blocked-by';

export interface IRelationshipDefinition {
  /** Source record type */
  sourceRecordType: string;
  /** Target record type */
  targetRecordType: string;
  /** Human-readable relationship label */
  label: string;
  /** Relationship direction */
  direction: RelationshipDirection;
  /** Target module identifier */
  targetModule: string;
  /** Function to resolve related record IDs from source record */
  resolveRelatedIds: (sourceRecord: unknown) => string[];
  /** URL pattern for navigating to a related record */
  buildTargetUrl: (targetRecordId: string) => string;
  /** Roles that can see this relationship */
  visibleToRoles?: string[];
}

export interface IRelatedItem {
  recordType: string;
  recordId: string;
  label: string;
  status?: string;
  href: string;
  /** BIC state of the related item (if applicable) */
  bicState?: IBicNextMoveState;
  /** Module icon key */
  moduleIcon: string;
  relationship: RelationshipDirection;
  relationshipLabel: string;
}
```

---

## Package Architecture

```
packages/related-items/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IRelatedItems.ts
│   │   └── index.ts
│   ├── registry/
│   │   └── RelationshipRegistry.ts       # cross-module relationship registration
│   ├── api/
│   │   └── RelatedItemsApi.ts            # fetch related record summaries
│   ├── hooks/
│   │   └── useRelatedItems.ts            # loads related items for a source record
│   └── components/
│       ├── HbcRelatedItemsPanel.tsx      # sidebar panel showing all related items
│       ├── HbcRelatedItemCard.tsx        # individual related item card
│       └── index.ts
```

---

## Component Specifications

### `HbcRelatedItemsPanel` — Sidebar Relationship Panel

```typescript
interface HbcRelatedItemsPanelProps {
  sourceRecordType: string;
  sourceRecordId: string;
  sourceRecord: unknown;
  /** Whether to include BIC state for each related item */
  showBicState?: boolean;
}
```

**Visual behavior:**
- Collapsible sidebar panel titled "Related Items"
- Grouped by relationship direction: "Originated from", "Converted to", "Related records"
- Each group shows its relationship label and count
- Items within each group rendered as `HbcRelatedItemCard` rows
- Empty state: "No related items" (using `@hbc/smart-empty-state` inline variant)

### `HbcRelatedItemCard` — Related Item Row

```typescript
interface HbcRelatedItemCardProps {
  item: IRelatedItem;
}
```

**Visual behavior:**
- Module icon (left), record label (main), status badge (right)
- BIC state indicator (if `showBicState`): owner avatar + urgency dot
- Entire card is clickable → navigates to `item.href`
- Relationship direction chip: "Originated" / "Converted to" / etc.

---

## Relationship Registration Pattern

Each module registers its relationships with the `RelationshipRegistry`:

```typescript
// In BD module initialization
import { RelationshipRegistry } from '@hbc/related-items';

RelationshipRegistry.register([
  {
    sourceRecordType: 'bd-scorecard',
    targetRecordType: 'estimating-pursuit',
    label: 'Originated Pursuit',
    direction: 'originated',
    targetModule: 'estimating',
    resolveRelatedIds: (scorecard) => scorecard.linkedPursuitId ? [scorecard.linkedPursuitId] : [],
    buildTargetUrl: (id) => `/estimating/pursuits/${id}`,
    visibleToRoles: ['BD Manager', 'Chief Estimator', 'Director of Preconstruction'],
  },
]);

// In Estimating module initialization
RelationshipRegistry.register([
  {
    sourceRecordType: 'estimating-pursuit',
    targetRecordType: 'bd-scorecard',
    label: 'Originated from BD Scorecard',
    direction: 'originated',
    targetModule: 'business-development',
    resolveRelatedIds: (pursuit) => pursuit.bdScorecardId ? [pursuit.bdScorecardId] : [],
    buildTargetUrl: (id) => `/bd/scorecards/${id}`,
  },
  {
    sourceRecordType: 'estimating-pursuit',
    targetRecordType: 'project',
    label: 'Converted to Project',
    direction: 'converted-to',
    targetModule: 'project-hub',
    resolveRelatedIds: (pursuit) => pursuit.projectId ? [pursuit.projectId] : [],
    buildTargetUrl: (id) => `/projects/${id}`,
  },
]);
```

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | Related item cards show BIC state (owner + urgency) for each linked record |
| `@hbc/project-canvas` | `RelatedItemsTile` is a canvas tile version of `HbcRelatedItemsPanel` |
| `@hbc/complexity` | Essential: related items panel hidden (reduces noise); Standard: panel visible; Expert: BIC state shown for each item |
| `@hbc/search` | Search results link to related items panel of found records |

---

## SPFx Constraints

- `HbcRelatedItemsPanel` renders as a collapsible section within SPFx webpart (not a true sidebar in SPFx contexts)
- `RelatedItemsApi` routes through Azure Functions backend for cross-module record lookup
- `RelationshipRegistry` initialized at SPFx Application Customizer level for cross-webpart awareness

---

## Priority & ROI

**Priority:** P1 — Eliminates the cross-module navigation tax on every record detail page; foundational for making the "Unified Work Graph" mold breaker principle real
**Estimated build effort:** 3–4 sprint-weeks (registry, API, two components, cross-module relationship definitions)
**ROI:** Collapses multi-tab navigation into a single sidebar panel; makes the chain from BD lead to active project visible at every stage; zero incremental cost per adopting module

---

## Definition of Done

- [ ] `IRelationshipDefinition` contract defined; `RelationshipRegistry.register()` available
- [ ] `RelatedItemsApi.getRelatedItems()` fetches related record summaries for a source record
- [ ] `useRelatedItems` loads and groups related items for a source record
- [ ] `HbcRelatedItemsPanel` renders grouped related items with collapsible sections
- [ ] `HbcRelatedItemCard` renders module icon, label, status, BIC state, navigation link
- [ ] BD, Estimating, and Project Hub relationships registered (bidirectional)
- [ ] `@hbc/bic-next-move` integration: BIC state shown on each related item card
- [ ] `@hbc/complexity` integration: panel hidden in Essential, visible in Standard+
- [ ] `@hbc/project-canvas` tile integration: `RelatedItemsTile` implemented
- [ ] Unit tests on relationship registry and `resolveRelatedIds` functions
- [ ] Storybook: panel with multiple relationship groups, BIC state variants

---

## ADR Reference

Create `docs/architecture/adr/0023-related-items-unified-work-graph.md` documenting the relationship registry pattern, the bidirectional registration requirement, and the decision to use module-local `resolveRelatedIds` functions rather than a central graph database.
