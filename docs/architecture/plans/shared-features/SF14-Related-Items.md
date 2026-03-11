<!-- DIFF-SUMMARY: Updated canonical spec; removed prefatory lock prose; corrected ADR path to 0103; retained full locked PH7-SF-14 content -->

# PH7-SF-14: `@hbc/related-items` — Cross-Module Record Relationship Panel

**Priority Tier:** 2 — Application Layer (enhances all record detail pages)  
**Package:** `packages/related-items/`  
**Interview Decision:** Q25 — Option B confirmed (all 8 questions locked on Suggestion B)  
**Mold Breaker Source:** UX-MB §3 (Unified Work Graph); ux-mold-breaker.md Signature Solution #3; con-tech-ux-study §9 (Cross-module context gaps); Operating Principle §7.1 (Role-awareness)

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

The ux-mold-breaker.md Signature Solution #3 (Unified Work Graph) specifies: "Every record in the system knows what it is connected to, and surfaces those connections in a consistent relationship panel." Operating Principle §7.1 (Role-awareness) extends this: the relationship panel shows the connections most relevant to the current user's role (via `relationshipPriority` and `roleRelevanceMap`).

The con-tech UX study §9 and procore-ux-study.md identify cross-module context gaps as a recurring pain point — users must navigate away from their current record to check related items in other modules, then navigate back. `@hbc/related-items` collapses this navigation into a sidebar panel (or canvas tile) on every detail page, with offline PWA resilience, version history, and AI suggestions.

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

Related items are registered declaratively by each module using `RelationshipRegistry.registerBidirectionalPair()`. The registry automatically creates symmetric reverse entries, applies `governanceMetadata` (priority, resolverStrategy, etc.), and versions every pair via `@hbc/versioned-record`.

---

## Interface Contract

```typescript
// packages/related-items/src/types/IRelatedItems.ts

export type RelationshipDirection = 'originated' | 'converted-to' | 'has' | 'references' | 'blocks' | 'is-blocked-by';

export interface IGovernanceMetadata {
  relationshipPriority: number; // 0–100 for dynamic sorting/collapse
  resolverStrategy?: 'sharepoint' | 'graph' | 'ai-suggested' | 'hybrid';
  roleRelevanceMap?: Record<string, RelationshipDirection[]>;
  aiSuggestionHook?: string; // registered hook ID
  dataSource?: 'sharepoint' | 'graph';
}

export interface IRelationshipDefinition {
  sourceRecordType: string;
  targetRecordType: string;
  label: string;
  direction: RelationshipDirection;
  targetModule: string;
  resolveRelatedIds: (sourceRecord: unknown) => string[];
  buildTargetUrl: (targetRecordId: string) => string;
  visibleToRoles?: string[];
  governanceMetadata?: IGovernanceMetadata;
}

export interface IRelatedItem {
  recordType: string;
  recordId: string;
  label: string;
  status?: string;
  href: string;
  bicState?: IBicNextMoveState;
  moduleIcon: string;
  relationship: RelationshipDirection;
  relationshipLabel: string;
  versionChip?: { lastChanged: string; author: string }; // from @hbc/versioned-record
  aiConfidence?: number;
}
```

---

## Package Architecture

```text
packages/related-items/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IRelatedItems.ts
│   │   └── index.ts
│   ├── registry/
│   │   └── RelationshipRegistry.ts       # registerBidirectionalPair + governance
│   ├── api/
│   │   └── RelatedItemsApi.ts            # batched /api/related-items/summaries
│   ├── hooks/
│   │   └── useRelatedItems.ts            # loads, enriches, caches offline
│   ├── governance/
│   │   └── HbcRelatedItemsGovernance.tsx # Admin surface
│   └── components/
│       ├── HbcRelatedItemsPanel.tsx      # role-aware, priority-sorted
│       ├── HbcRelatedItemCard.tsx        # version chip + AI button
│       ├── HbcRelatedItemsTile.tsx       # canvas compact variant
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
  showBicState?: boolean;
}
```

**Visual behavior:**
- Collapsible sidebar panel titled "Related Items"
- Groups sorted and collapsed by `relationshipPriority` and role relevance
- Each group shows label and count
- Items rendered as `HbcRelatedItemCard` with version-history chip (popover via `@hbc/versioned-record`)
- Empty state: role-aware `@hbc/smart-empty-state` with coaching + “Suggest new relationships” button (AI at Expert only)
- AI Suggestions group (Expert complexity only) from registered hooks

### `HbcRelatedItemCard` — Related Item Row

**Visual behavior:**
- Module icon, label, status badge
- BIC state (from `@hbc/bic-next-move`)
- Version-history chip (last changed + author avatar) → inline popover
- Relationship direction chip
- Clickable; entire card navigates

### `HbcRelatedItemsTile` — Canvas Variant

Compact horizontal-scroll or single-accordion view showing only top 3 priority items. “View all” opens full panel in canvas overlay/modal. Inherits all card features and offline caching.

---

## Relationship Registration Pattern

```typescript
// In BD module initialization
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
    governanceMetadata: { relationshipPriority: 90, resolverStrategy: 'sharepoint' }
  },
  { label: 'Originated from BD Scorecard' } // optional overrides
);
```

---

## Integration Points

| Package                  | Integration |
|--------------------------|-------------|
| `@hbc/bic-next-move`     | Live BIC enrichment in batched API + card indicators |
| `@hbc/project-canvas`    | `HbcRelatedItemsTile` (compact top-3 + overlay) |
| `@hbc/complexity`        | Essential: hidden; Standard: visible; Expert: BIC + AI suggestions + full priority sorting |
| `@hbc/search`            | Automatic deep-links from search results |
| `@hbc/versioned-record`  | Version chips + immutable governance history |
| `@hbc/activity-timeline` | Every governance change emitted |
| `@hbc/session-state` + `@hbc/sharepoint-docs` | Offline caching of summaries for PWA resilience |
| `@hbc/ai-assist` (future) | Registered suggestion hooks + “Suggest” button |

---

## SPFx Constraints

- `HbcRelatedItemsPanel` renders as collapsible section (never true sidebar)
- Batched API routes through Azure Functions
- Registry initialized at Application Customizer level
- Full offline caching works in PWA standalone mode

---

## Priority & ROI

**Priority:** P1 — Foundational for Unified Work Graph; eliminates navigation tax on every detail page  
**Estimated build effort:** 4–5 sprint-weeks (includes governance surface, batched API, offline caching, canvas tile)  
**ROI:** Collapses multi-tab navigation; makes BD-to-Project chain visible at every stage; zero incremental cost per module; PWA-ready from day one

---

## Definition of Done

- [ ] `IRelationshipDefinition`, `IGovernanceMetadata`, and `IRelatedItem` contracts defined
- [ ] `RelationshipRegistry.registerBidirectionalPair()` + `registerAISuggestionHook()` available
- [ ] Batched `RelatedItemsApi.getRelatedItems()` endpoint with BIC enrichment and hybrid routing
- [ ] `useRelatedItems` hook with offline caching via `@hbc/session-state`
- [ ] `HbcRelatedItemsPanel` with priority-based sorting, role-aware collapse, version chips, smart empty state
- [ ] `HbcRelatedItemCard` with version popover and AI suggest button
- [ ] `HbcRelatedItemsTile` for `@hbc/project-canvas` (top-3 compact view)
- [ ] Dedicated Admin governance surface (editable priority/visibility, archiving, Preview as Role, activity-timeline emission)
- [ ] BD, Estimating, and Project Hub relationships registered bidirectionally
- [ ] Full integration with `@hbc/bic-next-move`, `@hbc/complexity`, `@hbc/versioned-record`, `@hbc/activity-timeline`, `@hbc/search`
- [ ] Offline PWA resilience verified
- [ ] Unit tests on registry, API batching, and priority logic
- [ ] Storybook: all variants, governance surface, AI group, canvas tile

---

## ADR Reference

Create `docs/architecture/adr/0103-related-items-unified-work-graph.md` documenting the bidirectional registration pattern, pluggable `resolverStrategy`, priority-based progressive disclosure, batched API, governance surface, offline caching strategy, and decision to keep module-local `resolveRelatedIds` while adding hybrid/graph/AI extensibility.

---

<!-- IMPLEMENTATION PROGRESS & NOTES
SF14-T01 (Package Scaffold) completed: 2026-03-11
Package: @hbc/related-items scaffold with dual exports, coverage gates, README
SF14-T02 (TypeScript Contracts) completed: 2026-03-11
Contracts locked for RelationshipDirection, IGovernanceMetadata, IRelationshipDefinition, and IRelatedItem
SF14-T03 (Registry and API) completed: 2026-03-11
Implemented bidirectional registry, AI suggestion hook registry, deterministic retrieval, batched summary API, role/governance filtering, and registry/API tests
SF14-T04 (Hooks) completed: 2026-03-11
Implemented useRelatedItems orchestration hook with deterministic sorting/grouping, role-aware API passthrough, AI suggestion derivation, and @hbc/session-state stale-safe cache fallback
SF14-T05 (HbcRelatedItemsPanel) completed: 2026-03-11
Implemented complexity-aware grouped panel rendering, deterministic governance ordering, role-aware smart-empty-state handling, expert AI group/CTA, and panel/card component tests
SF14-T06 (HbcRelatedItemCard) completed: 2026-03-11
Hardened card-level deterministic rendering for direction/relationship context, metadata/version display, AI indicator behavior, and partial-data fallbacks with T06-aligned tests
SF14-T07 (Reference Integrations) completed: 2026-03-11
Implemented reference layer: mock source records (2 scorecards, 3 pursuits, 2 projects), BD↔Estimating and Estimating↔Project bidirectional pair registrations, AI suggestion hook (bd-pursuit-ai-suggest), activity-timeline governance adapter, and real HbcRelatedItemsTile (top-3 compact cards + View all). 30 new tests (11 registration, 7 integration, 3 adapter, 9 tile).
SF14-T08 (Testing Strategy) completed: 2026-03-11
Created testing utilities (createMockSourceRecord, mockRelationshipDirections). Removed scaffold-era coverage exclusions for api/registry/hooks. Added 40 targeted gap tests across registry (8), API (16), hooks (3), panel (3), card (2), tile (3). Coverage: 96.03% branches, 99.51% stmts, 100% funcs. Created Storybook config + 14 stories (8 panel, 6 tile). 103 total tests pass. All 4 gates green.
SF14-T09 (Testing and Deployment) completed: 2026-03-11
ADR-0103 authored. Developer adoption guide, API reference, and README conformance completed.
docs/README.md ADR index updated. current-state-map.md §2 updated (SF14 → Historical Foundational).
All mechanical gates pass. SF14 complete.
Task index update: T01 ✅ | T02 ✅ | T03 ✅ | T04 ✅ | T05 ✅ | T06 ✅ | T07 ✅ | T08 ✅ | T09 ✅
SF14 COMPLETE
-->
