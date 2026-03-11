# @hbc/related-items

Cross-module record relationship panel for HB Intel — Unified Work Graph (Mold Breaker Signature Solution #3).

## Overview

`@hbc/related-items` provides a declarative relationship model that connects records across module boundaries. Construction project records (BD Scorecards, Estimating Pursuits, Project Records, Turnover Meetings, Constraints, Permit Log entries) are linked via bidirectional relationship definitions registered by each module. The relationship panel surfaces these connections in a priority-sorted, role-aware sidebar or compact canvas tile.

## Quick Start

```tsx
import { HbcRelatedItemsPanel } from '@hbc/related-items';

function ProjectDetail({ project }: { project: IProject }) {
  return (
    <HbcRelatedItemsPanel
      sourceRecordType="project"
      sourceRecordId={project.id}
      sourceRecord={project}
      showBicState
    />
  );
}
```

## Registration Pattern

Modules register bidirectional relationships declaratively. The registry creates symmetric reverse entries automatically:

```typescript
import { RelationshipRegistry } from '@hbc/related-items';

RelationshipRegistry.registerBidirectionalPair(
  {
    sourceRecordType: 'bd-scorecard',
    targetRecordType: 'estimating-pursuit',
    label: 'Originated Pursuit',
    direction: 'originated',
    targetModule: 'estimating',
    resolveRelatedIds: (scorecard) => scorecard.linkedPursuitId ? [scorecard.linkedPursuitId] : [],
    buildTargetUrl: (id) => `/estimating/pursuits/${id}`,
    visibleToRoles: ['BD Manager', 'Chief Estimator'],
    governanceMetadata: { relationshipPriority: 90, resolverStrategy: 'sharepoint' },
  },
  { label: 'Originated from BD Scorecard' },
);
```

## Batched API

`RelatedItemsApi.getRelatedItems()` provides a batched `/api/related-items/summaries` endpoint with BIC enrichment and hybrid routing (SharePoint or Graph). In SPFx mode, requests route through Azure Functions.

## Role Visibility & Complexity

- **Essential complexity:** Related items hidden (reduces cognitive load for new users)
- **Standard complexity:** Visible panel with priority-sorted groups and role filtering
- **Expert complexity:** Full panel with BIC state, AI suggestions, version chips, and governance metadata

Administrators can configure `governanceMetadata` (priority, visibility, resolver strategy) via the `HbcRelatedItemsGovernance` surface.

## Exports

| Entry Point | Description |
|-------------|-------------|
| `@hbc/related-items` | Full package: types, constants, registry, API, hooks, governance, components |
| `@hbc/related-items/testing` | Test factories: `createMockRelatedItem`, `createMockRelationshipDefinition`, `mockRelationshipRegistry` |

## Architecture Boundaries

- **No runtime dependencies** (scaffold phase)
- **Peer dependencies:** `react`, `react-dom` (^18.3.0)
- **SPFx compatibility:** Components use inline styles only (D-07); no external CSS imports
- **Bundle boundary:** `sideEffects: false` enables tree-shaking for consuming packages
- **ESLint boundary rules:** Enforced via `@hbc/eslint-plugin-hbc`

## Related Documentation

- [SF14 Master Plan](../../docs/architecture/plans/shared-features/SF14-Related-Items.md)
- [SF14-T09 Testing & Deployment](../../docs/architecture/plans/shared-features/SF14-T09-Testing-and-Deployment.md)
- [ADR-0103 — Related Items Unified Work Graph](../../docs/architecture/adr/ADR-0103-related-items-unified-work-graph.md) (target)
- [Feature Decision — PH7-SF-14](../../docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md)
