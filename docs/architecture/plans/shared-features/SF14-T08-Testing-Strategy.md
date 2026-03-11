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

<!-- IMPLEMENTATION PROGRESS & NOTES
SF14-T08 completed: 2026-03-11

Testing utilities created:
- testing/createMockSourceRecord.ts — generic source record factory
- testing/mockRelationshipDirections.ts — all 6 directions + reverse-pair mapping

Coverage exclusions removed:
- src/api/** (real implementation since T03)
- src/registry/** (real implementation since T03)
- src/hooks/** (real implementation since T04)

Gap tests added (40 new tests across 6 files):
- RelationshipRegistry.test.ts: +8 (tiebreaker, NaN priority, validation edges, getAll, empty fields)
- RelatedItemsApi.test.ts: +16 (array normalization, unexpected shape, role exclusion, resolver throw, invalid summaries, empty label, AI hook failure/skip/defaults, dedup, no-role, same-priority sort, recordId tiebreaker, non-string IDs)
- useRelatedItems.test.ts: +3 (non-Error mapErrorMessage, loadDraft throw, recordId tiebreaker)
- HbcRelatedItemsPanel.test.tsx: +3 (resolve load-error, resolve first-use/truly-empty, priority dedup skip, expert AI filter)
- HbcRelatedItemCard.test.tsx: +2 (remaining direction labels, icon fallback, invalid date)
- HbcRelatedItemsTile.test.tsx: +3 (icon fallback, Unknown role, auth role passthrough)

Storybook created:
- .storybook/main.ts + preview.ts (follows @hbc/session-state pattern)
- src/components/__stories__/HbcRelatedItemsPanel.stories.tsx (8 stories)
- src/components/__stories__/HbcRelatedItemsTile.stories.tsx (6 stories)

Final metrics: 103 tests, 96.03% branches, 99.51% stmts, 100% funcs, 100% lines (components)
All 4 gates pass: check-types ✓ | build ✓ | lint ✓ | test ✓
-->
