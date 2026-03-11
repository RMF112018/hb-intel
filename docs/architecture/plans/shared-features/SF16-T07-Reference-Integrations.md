# SF16-T07 — Reference Integrations: `@hbc/search`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Decisions Applied:** D-07, D-09
**Estimated Effort:** 0.55 sprint-weeks
**Depends On:** T06

> **Doc Classification:** Canonical Normative Plan — SF16-T07 integration reference task; sub-plan of `SF16-Search.md`.

---

## Objective

Document required cross-package integrations and indexing contracts.

---

## Required References

- BIC fields indexed/filterable (`isBlocked`, `isOverdue`, `responsiblePartyUserId`)
- related-items deep-link patterns in search result cards
- notification-intelligence “assigned-to-me” search alignment
- module `ISearchableRecord` registration examples (BD, Estimating, Project Hub, Admin)

---

## Verification Commands

```bash
rg -n "ISearchableRecord|SearchIndexer|useSearch" packages
pnpm turbo run check-types --filter packages/business-development...
```
