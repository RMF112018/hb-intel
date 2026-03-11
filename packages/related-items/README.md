# @hbc/related-items

Cross-module record relationship panel for HB Intel's Unified Work Graph.

## Overview

`@hbc/related-items` provides a declarative relationship registry, batched API fetcher, and role-aware UI components — enabling any HB Intel module to surface cross-module record connections in a consistent panel or canvas tile (D-01, D-04, D-05).

Modules register bidirectional relationship pairs via `RelationshipRegistry.registerBidirectionalPair()`. The `useRelatedItems` hook orchestrates registry lookup, API fetch, grouping, priority sorting, and role filtering. Two components render the results: `HbcRelatedItemsPanel` for detail pages and `HbcRelatedItemsTile` for canvas integration.

## Quick Start

```tsx
import { RelationshipRegistry, HbcRelatedItemsPanel } from '@hbc/related-items';

// 1. Register relationships during module initialization
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
    governanceMetadata: { relationshipPriority: 90, resolverStrategy: 'sharepoint' },
  },
  { label: 'Originated from BD Scorecard' }
);

// 2. Embed the panel on a detail page
function ProjectDetail({ project }) {
  return (
    <HbcRelatedItemsPanel
      sourceRecordType="project"
      sourceRecordId={project.id}
      sourceRecord={project}
      showBicState={true}
    />
  );
}
```

## Registry + Batched API + Panel/Tile Behavior

- **Registry:** `registerBidirectionalPair()` creates forward and reverse entries in a single call, with automatic governance metadata inheritance (D-01, D-09)
- **Batched API:** `RelatedItemsApi.getRelatedItems()` fetches summaries via a batched backend route with BIC enrichment and role/governance filtering (D-04)
- **Panel:** `HbcRelatedItemsPanel` renders grouped relationship sections with priority sorting, version chips via `@hbc/versioned-record`, and role-aware `@hbc/smart-empty-state` (D-05, D-06)
- **Tile:** `HbcRelatedItemsTile` shows top 3 priority items in a compact canvas layout with "View all" overlay (D-08)

## Role Visibility and Complexity

- **Role visibility:** `visibleToRoles` on each relationship definition gates group visibility per user role (D-06)
- **Complexity dial** (`@hbc/complexity`):
  - Essential: panel hidden
  - Standard: panel visible with basic groups
  - Expert: full panel with AI suggestion group, BIC indicators, and priority sorting (D-07)

## Exports

| Entry Point | Contents |
|-------------|----------|
| `@hbc/related-items` | Types, constants, registry, API, hooks, components, governance stub, reference integrations |
| `@hbc/related-items/testing` | `createMockRelatedItem`, `createMockRelationshipDefinition`, `createMockSourceRecord`, `mockRelationshipDirections`, `mockRelationshipRegistry` |

See the [full API reference](../../docs/reference/related-items/api.md) for complete export tables.

## Architecture Boundaries

- **No feature imports** — `@hbc/related-items` must not import from `packages/features/*`; cross-module lookups route exclusively via `RelatedItemsApi`.
- **No direct SharePoint/Graph calls** — all resolution is handled by module-local `resolveRelatedIds` functions and the batched backend route.
- **Workspace dependencies** — `@hbc/auth`, `@hbc/complexity`, `@hbc/session-state`, `@hbc/smart-empty-state`, `@hbc/versioned-record`.
- **Peer dependencies** — `react`, `react-dom`.
- **SPFx compatibility** — components use inline styles only; no external CSS imports.
- **Bundle boundary** — `sideEffects: false` enables tree-shaking for consuming packages.
- **ESLint boundary rules** — enforced via `@hbc/eslint-plugin-hbc`.

## Related

- [SF14 Master Plan](../../docs/architecture/plans/shared-features/SF14-Related-Items.md)
- [SF14-T09 — Testing and Deployment](../../docs/architecture/plans/shared-features/SF14-T09-Testing-and-Deployment.md)
- [ADR-0103 — Related Items Unified Work Graph](../../docs/architecture/adr/0103-related-items-unified-work-graph.md)
- [Adoption Guide](../../docs/how-to/developer/related-items-adoption-guide.md)
- [API Reference](../../docs/reference/related-items/api.md)
- [Feature Decision — PH7-SF-14](../../docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md)
