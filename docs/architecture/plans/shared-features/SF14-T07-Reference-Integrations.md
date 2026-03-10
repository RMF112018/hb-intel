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

- BD scorecard → Estimating pursuit (`originated`)
- Estimating pursuit → BD scorecard (`originated`)
- Estimating pursuit → Project (`converted-to`)
- Project → Estimating pursuit (`originated` / reverse link)
- Project canvas tile embedding: `RelatedItemsTile`

---

## Verification Commands

```bash
rg -n "RelationshipRegistry\.register" packages
pnpm turbo run check-types --filter packages/business-development...
pnpm turbo run check-types --filter packages/estimating...
pnpm turbo run check-types --filter packages/project-hub...
```
