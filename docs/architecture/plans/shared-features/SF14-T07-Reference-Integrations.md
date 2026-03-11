<!-- DIFF-SUMMARY: Replaced minimal references with locked integration matrix including activity timeline, versioned-record, tile overlay, and offline/PWA integrations -->

# SF14-T07 — Reference Integrations: `@hbc/related-items`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Decisions Applied:** D-08, D-09
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T06

> **Doc Classification:** Canonical Normative Plan — SF14-T07 integration reference task; sub-plan of `SF14-Related-Items.md`.

---

## Objective

Document canonical bidirectional relationship registrations and required package integrations.

---

## Required References

- BD scorecard ↔ Estimating pursuit via `registerBidirectionalPair()` (`originated` + reverse label override)
- Estimating pursuit ↔ Project via `registerBidirectionalPair()` (`converted-to` + reverse)
- Project canvas tile embedding: `HbcRelatedItemsTile` (top-3 compact + overlay)
- governance changes emitted to `@hbc/activity-timeline`

---

## Integration Matrix

| Package | Required integration |
|---|---|
| `@hbc/bic-next-move` | BIC enrichment surfaced in cards and summaries |
| `@hbc/project-canvas` | `HbcRelatedItemsTile` compact top-3 and full panel overlay |
| `@hbc/complexity` | Essential hidden; Standard visible; Expert adds AI/BIC details |
| `@hbc/search` | deep-links to related records |
| `@hbc/versioned-record` | version-history chip and immutable governance history |
| `@hbc/activity-timeline` | governance admin actions emitted as timeline events |
| `@hbc/session-state` + `@hbc/sharepoint-docs` | offline/PWA summary cache strategy |
| `@hbc/ai-assist` (future) | registered suggestion hooks and Suggest CTA |

---

## Verification Commands

```bash
rg -n "registerBidirectionalPair|registerAISuggestionHook" packages
pnpm turbo run check-types --filter packages/business-development...
pnpm turbo run check-types --filter packages/estimating...
pnpm turbo run check-types --filter packages/project-hub...
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF14-T07 completed: 2026-03-11
Files created:
  - src/reference/types.ts (IBdScorecardRecord, IEstimatingPursuitRecord, IProjectRecord)
  - src/reference/mockSourceRecords.ts (2 scorecards, 3 pursuits, 2 projects)
  - src/reference/referenceRegistrations.ts (BD↔Estimating, Estimating↔Project)
  - src/reference/referenceAISuggestionHook.ts (bd-pursuit-ai-suggest hook)
  - src/reference/activityTimelineAdapter.ts (emitGovernanceEvent no-op adapter)
  - src/reference/index.ts (barrel)
  - src/reference/__tests__/referenceRegistrations.test.ts (11 cases)
  - src/reference/__tests__/activityTimelineAdapter.test.ts (3 cases)
  - src/reference/__tests__/referenceIntegration.test.ts (7 cases)
  - src/components/HbcRelatedItemsTile.test.tsx (9 cases)
  - .eslintrc.cjs (missing config added)
Files modified:
  - src/components/HbcRelatedItemsTile.tsx (stub → real tile with top-3 + View all)
  - src/index.ts (reference exports added)
  - vitest.config.ts (coverage: src/components removed, src/reference added)
Gates: check-types ✓ | build ✓ | lint ✓ (0 errors) | test ✓ (63 passed, 30 new)
Next: SF14-T08
-->
