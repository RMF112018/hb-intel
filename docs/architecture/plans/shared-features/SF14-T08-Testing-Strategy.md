# SF14-T08 — Testing Strategy: `@hbc/related-items`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Decisions Applied:** D-06, D-07, D-10
**Estimated Effort:** 0.35 sprint-weeks
**Depends On:** T01–T07

> **Doc Classification:** Canonical Normative Plan — SF14-T08 testing strategy task; sub-plan of `SF14-Related-Items.md`.

---

## Objective

Define fixtures and tests for relationship registry, API resolution, grouping logic, and panel/card rendering.

---

## Testing Sub-Path

- `createMockRelationshipDefinition`
- `createMockRelatedItem`
- `createMockSourceRecord`
- `mockRelationshipDirections`

---

## Required Coverage

- registry duplicate and retrieval behavior
- API resolution and role filtering behavior
- grouping logic by direction
- panel/card rendering and navigation behavior
- complexity visibility behavior (Essential vs Standard/Expert)
- storybook states for multi-group and empty-state panel

---

## Verification Commands

```bash
pnpm --filter @hbc/related-items test --coverage
pnpm --filter @hbc/related-items storybook
pnpm exec playwright test --grep "related-items"
```
