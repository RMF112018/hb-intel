<!-- DIFF-SUMMARY: Expanded coverage targets for bidirectional registry symmetry, batched API behavior, priority sorting, version chip/popover, AI group gating, and offline fallback -->

# SF14-T08 — Testing Strategy: `@hbc/related-items`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Decisions Applied:** D-06, D-07, D-10
**Estimated Effort:** 0.35 sprint-weeks
**Depends On:** T01–T07

> **Doc Classification:** Canonical Normative Plan — SF14-T08 testing strategy task; sub-plan of `SF14-Related-Items.md`.

---

## Objective

Define fixtures and tests for bidirectional registry behavior, batched API resolution, priority/role grouping logic, panel/card/tile rendering, AI suggestion behavior, and offline fallback.

---

## Testing Sub-Path

- `createMockRelationshipDefinition`
- `createMockRelatedItem`
- `createMockSourceRecord`
- `mockRelationshipDirections`

---

## Required Coverage

- registry bidirectional pair creation, reverse overrides, and duplicate handling
- governance metadata priority sorting and role-relevance collapse behavior
- API batching/chunking, resolverStrategy routing, and retry-safe partial failures
- version-chip rendering and popover behavior in panel/card
- smart-empty-state role variants and Expert-only AI suggestion group gating
- offline fallback behavior via `@hbc/session-state` + `@hbc/sharepoint-docs`
- complexity visibility behavior (Essential vs Standard/Expert)
- storybook states for multi-group, AI group, tile top-3 + overlay, and empty state

---

## Verification Commands

```bash
pnpm --filter @hbc/related-items test --coverage
pnpm --filter @hbc/related-items storybook
pnpm exec playwright test --grep "related-items"
```
