# SF20-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** D-06 through D-09
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF20-T07 integration task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Document boundary-safe integration contracts across shared features and module surfaces.

---

## Integration Contracts

- `@hbc/workflow-handoff`
  - provides handoff snapshot source for heritage data
- `@hbc/versioned-record`
  - intelligence revisions and approved snapshots versioned for auditability
- `@hbc/acknowledgment`
  - approval action flow uses single-party acknowledgment pattern
- `@hbc/notification-intelligence`
  - pending approval -> immediate approver alert; approve/reject -> contributor watch notification
- `@hbc/sharepoint-docs`
  - supporting document attachments referenced by entry metadata
- `@hbc/search`
  - approved entries only indexed
- `@hbc/project-canvas`
  - BD heritage tile renders latest approved strategic intelligence summary
- `@hbc/complexity`
  - controls surface depth across all three tiers
- SF19 / SF22 via `@hbc/score-benchmark`
  - strategic intelligence contexts feed score benchmark primitive recompute inputs
  - score-benchmark gap/outcome signals feed post-bid loop enrichment and heritage evidence weighting

---

## Boundary Rules

- no direct app-route imports into package runtime
- approval authority always resolved through admin policy API
- pending/rejected entries never emitted to search index pipeline
- cross-feature integration with SF19 occurs through `@hbc/score-benchmark` public interfaces only

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- integrations
rg -n "from 'apps/" packages/features/business-development/src packages/score-benchmark/src
```
