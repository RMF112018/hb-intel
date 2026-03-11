## Research Summary
Integration design maps Azure index/filter contracts to tenant-safe API composition ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/search/search-indexer-overview)), backend gateway aggregation for hybrid SharePoint/Graph mediation ([Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation)), and construction-domain NL retrieval practices emphasizing contextual linking ([Automation in Construction, 2023](https://www.sciencedirect.com/science/article/abs/pii/S0926580523003278)).

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

- BIC fields indexed/filterable (`isBlocked`, `isOverdue`, `responsiblePartyUserId`) with scoring profiles
- related-items deep-link patterns in search result cards (`relatedItemsDeepLink`)
- project-canvas deep-link and project scoping patterns (`canvasDeepLink`)
- module `ISearchableModule` registration examples (BD, Estimating, Project Hub, Admin)
- versioned saved-search governance and audit flow integration

---

## Integration Matrix

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | BIC dimensions and scoring-profile alignment |
| `@hbc/complexity` | Standard/Expert feature gates for parser, provenance, governance |
| `@hbc/related-items` | `relatedItemsDeepLink` from result cards |
| `@hbc/project-canvas` | project scope + `canvasDeepLink` routing |
| `@hbc/versioned-record` | saved-search version history and governance audit |
| `@hbc/notification-intelligence` | background sync and alerting hooks |
| `@hbc/auth` | tenant-boundary parser/governance visibility |

---

## Verification Commands

```bash
rg -n "ISearchableModule|SearchQueryParser|canvasDeepLink|relatedItemsDeepLink" packages
pnpm turbo run check-types --filter packages/business-development...
```
