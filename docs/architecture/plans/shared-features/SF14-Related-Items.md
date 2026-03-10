# SF14 — `@hbc/related-items`: Cross-Module Record Relationship Panel

**Plan Version:** 1.0
**Date:** 2026-03-10
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Priority Tier:** 2 — Application Layer (record-detail context primitive)
**Estimated Effort:** 3–4 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0103-related-items-unified-work-graph.md`

> **Doc Classification:** Canonical Normative Plan — SF14 implementation master plan for `@hbc/related-items`; governs SF14-T01 through SF14-T09.

---

## Purpose

`@hbc/related-items` provides a consistent relationship panel so records can surface cross-module context (origin, conversion, dependencies, and related artifacts) without forcing multi-tab navigation.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Relationship registry | `RelationshipRegistry.register()` is canonical integration entrypoint |
| D-02 | Direction model | `originated`, `converted-to`, `has`, `references`, `blocks`, `is-blocked-by` |
| D-03 | Resolution strategy | Module-local `resolveRelatedIds(sourceRecord)` functions |
| D-04 | Persistence/API model | Related-item summaries fetched via backend `RelatedItemsApi` |
| D-05 | Rendering model | Panel grouped by relationship direction with item cards |
| D-06 | Visibility model | Role-filtered relationships via `visibleToRoles` |
| D-07 | Complexity behavior | Essential: panel hidden; Standard: panel visible; Expert: includes BIC state details |
| D-08 | Canvas integration | `RelatedItemsTile` embeds panel in project canvas |
| D-09 | Bidirectional baseline | BD↔Estimating↔Project Hub relationships must be registered both directions |
| D-10 | Testing sub-path | `@hbc/related-items/testing` exports canonical relationship fixtures |

---

## Package Directory Structure

```text
packages/related-items/
├── package.json
├── README.md
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IRelatedItems.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── relationshipDefaults.ts
│   │   └── index.ts
│   ├── registry/
│   │   ├── RelationshipRegistry.ts
│   │   └── index.ts
│   ├── api/
│   │   ├── RelatedItemsApi.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useRelatedItems.ts
│   │   └── index.ts
│   └── components/
│       ├── HbcRelatedItemsPanel.tsx
│       ├── HbcRelatedItemCard.tsx
│       └── index.ts
├── testing/
│   ├── index.ts
│   ├── createMockRelationshipDefinition.ts
│   ├── createMockRelatedItem.ts
│   ├── createMockSourceRecord.ts
│   └── mockRelationshipDirections.ts
└── src/__tests__/
    ├── setup.ts
    ├── RelationshipRegistry.test.ts
    ├── RelatedItemsApi.test.ts
    ├── useRelatedItems.test.ts
    ├── HbcRelatedItemsPanel.test.tsx
    └── HbcRelatedItemCard.test.tsx
```

---

## Integration Points

| Package | Integration Detail |
|---|---|
| `@hbc/bic-next-move` | optional BIC state display on related-item cards |
| `@hbc/project-canvas` | `RelatedItemsTile` panel embedding |
| `@hbc/complexity` | panel visibility/detail behavior by tier |
| `@hbc/search` | deep-links to records with panel context |

---

## Definition of Done

- [ ] relationship contracts and registry exported
- [ ] related-items API + hook implemented
- [ ] panel/card components implement grouped relationship rendering
- [ ] bidirectional relationship references documented for BD/Estimating/Project Hub
- [ ] complexity and canvas integration behavior documented
- [ ] testing sub-path fixtures exported
- [ ] SF11-grade T09 documentation/deployment requirements included
- [ ] `current-state-map.md` updated with SF14 and ADR-0103 entries

---

## Task File Index

| File | Contents |
|---|---|
| `SF14-T01-Package-Scaffold.md` | package scaffold + README requirement |
| `SF14-T02-TypeScript-Contracts.md` | relationship contracts + constants |
| `SF14-T03-Registry-and-API.md` | relationship registry + API behavior |
| `SF14-T04-Hooks.md` | related-items hook and grouping model |
| `SF14-T05-HbcRelatedItemsPanel.md` | panel renderer behavior |
| `SF14-T06-HbcRelatedItemCard.md` | card behavior and interaction |
| `SF14-T07-Reference-Integrations.md` | BD/Estimating/Project Hub bidirectional references |
| `SF14-T08-Testing-Strategy.md` | testing fixtures + test matrix |
| `SF14-T09-Testing-and-Deployment.md` | checklist, ADR/docs/index/state-map updates |
