# SF16-T06 — `HbcSearchResults` and `HbcSearchFacets`: `@hbc/search`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Decisions Applied:** D-05, D-07
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T05

> **Doc Classification:** Canonical Normative Plan — SF16-T06 full results/facets task; sub-plan of `SF16-Search.md`.

---

## Objective

Define full results experience with pagination, sorting, and facets.

---

## Components

- `HbcSearchResults`: result cards + pagination + sort controls
- `HbcSearchFacets`: module/type/status facets + toggles + date filters

Essential behavior: minimal search only; full facet panel in Standard+.

---

## Verification Commands

```bash
pnpm --filter @hbc/search test -- HbcSearchResults HbcSearchFacets
pnpm --filter @hbc/search build
```
