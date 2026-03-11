# How to Add Related Items to a Module

> **Doc Classification:** Living Reference (Diátaxis) — How-to quadrant; developer audience; related-items module adoption.

This guide walks you through wiring `@hbc/related-items` into a consuming module for cross-module relationship visibility, role-aware panels, and canvas tile integration.

**Locked ADR:** [ADR-0103](../../architecture/adr/0103-related-items-unified-work-graph.md)
**API Reference:** [related-items/api.md](../../reference/related-items/api.md)

---

## 1. When to Use the Related Items Panel

Add the related-items panel when your module's detail pages need to show connections to records in other modules:

- **Cross-module navigation** — users need to see what a record is connected to (e.g., a Project's originating BD Scorecard)
- **Lifecycle chain visibility** — BD → Estimating → Project Hub heritage needs to be discoverable
- **Role-aware context** — different roles need to see different relationship groups

If your module has no cross-module record relationships, you do not need `@hbc/related-items`.

---

## 2. Registering Relationships with `RelationshipRegistry.registerBidirectionalPair`

Register bidirectional relationship pairs during module initialization. The registry automatically creates symmetric reverse entries:

```tsx
import { RelationshipRegistry } from '@hbc/related-items';

// In your module's initialization code
RelationshipRegistry.registerBidirectionalPair(
  {
    sourceRecordType: 'bd-scorecard',
    targetRecordType: 'estimating-pursuit',
    label: 'Originated Pursuit',
    direction: 'originated',
    targetModule: 'estimating',
    resolveRelatedIds: (scorecard) =>
      scorecard.linkedPursuitId ? [scorecard.linkedPursuitId] : [],
    buildTargetUrl: (id) => `/estimating/pursuits/${id}`,
    visibleToRoles: ['BD Manager', 'Chief Estimator'],
    governanceMetadata: {
      relationshipPriority: 90,
      resolverStrategy: 'sharepoint',
    },
  },
  { label: 'Originated from BD Scorecard' } // optional reverse-direction overrides
);
```

Key points:
- `registerBidirectionalPair` creates both forward and reverse entries in a single call
- The reverse entry inherits all properties from the forward definition, with `source`/`target` swapped
- Pass an optional second argument to override specific fields on the reverse entry (commonly `label`)

---

## 3. Designing `resolveRelatedIds` and `buildTargetUrl`

Each relationship definition requires two resolver functions:

### `resolveRelatedIds`

Returns an array of target record IDs given a source record. Keep this function synchronous and module-local:

```tsx
// Simple single-ID resolution
resolveRelatedIds: (scorecard) =>
  scorecard.linkedPursuitId ? [scorecard.linkedPursuitId] : []

// Multi-ID resolution (e.g., a project with multiple constraints)
resolveRelatedIds: (project) =>
  project.constraintIds ?? []
```

### `buildTargetUrl`

Constructs the navigation URL for a target record:

```tsx
buildTargetUrl: (id) => `/estimating/pursuits/${id}`
```

Both functions are called by the `useRelatedItems` hook when building the related-items data set. They never make network calls — all I/O is handled by `RelatedItemsApi.getRelatedItems()`.

---

## 4. Applying Governance Metadata, Role Visibility, and Complexity Behavior

### Governance Metadata

Attach `governanceMetadata` to control sorting, resolution strategy, and AI integration:

```tsx
governanceMetadata: {
  relationshipPriority: 90,        // 0–100; higher = more prominent
  resolverStrategy: 'sharepoint',  // 'sharepoint' | 'graph' | 'ai-suggested' | 'hybrid'
  roleRelevanceMap: {              // optional per-role direction filtering
    'BD Manager': ['originated'],
    'Project Manager': ['has', 'converted-to'],
  },
  aiSuggestionHook: 'my-ai-hook', // optional registered AI hook ID
  dataSource: 'sharepoint',       // optional data source indicator
}
```

### Role Visibility

Use `visibleToRoles` on the relationship definition to restrict which roles can see a relationship group:

```tsx
visibleToRoles: ['BD Manager', 'Chief Estimator']
```

When the current user's role is not in the list, the relationship group is hidden entirely. Omit `visibleToRoles` to make the relationship visible to all roles.

### Complexity Behavior

The panel respects the `@hbc/complexity` dial automatically:
- **Essential:** Panel hidden
- **Standard:** Panel visible with basic relationship groups
- **Expert:** Full panel with AI suggestion group, BIC state indicators, and priority sorting

---

## 5. Embedding `HbcRelatedItemsPanel` and `HbcRelatedItemsTile`

### Detail Page — Full Panel

Add the panel to any record detail page:

```tsx
import { HbcRelatedItemsPanel } from '@hbc/related-items';

function ProjectDetail({ project }) {
  return (
    <div className="detail-layout">
      <main>{/* record content */}</main>
      <aside>
        <HbcRelatedItemsPanel
          sourceRecordType="project"
          sourceRecordId={project.id}
          sourceRecord={project}
          showBicState={true}
        />
      </aside>
    </div>
  );
}
```

### Canvas — Compact Tile

For `@hbc/project-canvas` integration, use the tile variant:

```tsx
import { HbcRelatedItemsTile } from '@hbc/related-items';

function CanvasTile({ project }) {
  return (
    <HbcRelatedItemsTile
      sourceRecordType="project"
      sourceRecordId={project.id}
      sourceRecord={project}
    />
  );
}
```

The tile shows the top 3 priority items in a compact layout with a "View all" action to open the full panel.

---

## 6. Using Testing Fixtures from `@hbc/related-items/testing`

In your module's tests, use the canonical testing sub-path:

```tsx
import {
  createMockRelatedItem,
  createMockRelationshipDefinition,
  createMockSourceRecord,
  mockRelationshipDirections,
  mockRelationshipRegistry,
} from '@hbc/related-items/testing';

describe('MyRelatedItemsFeature', () => {
  it('renders with mock related items', () => {
    const item = createMockRelatedItem({
      recordType: 'estimating-pursuit',
      label: 'Test Pursuit',
    });
    // ... test with mock item
  });

  it('registers mock relationships', () => {
    const definition = createMockRelationshipDefinition({
      sourceRecordType: 'bd-scorecard',
      targetRecordType: 'estimating-pursuit',
    });
    // ... test with mock definition
  });

  it('handles all relationship directions', () => {
    for (const direction of mockRelationshipDirections) {
      const item = createMockRelatedItem({ relationship: direction });
      // ... parameterized test
    }
  });
});
```

---

## Architecture Boundaries

`@hbc/related-items` must **not** import from:
- Any `packages/features/*` module
- Cross-module lookups are routed exclusively via `RelatedItemsApi` (batched backend route)

Peer dependencies: `@hbc/auth`, `@hbc/complexity`, `@hbc/session-state`, `@hbc/smart-empty-state`, `@hbc/versioned-record`.
