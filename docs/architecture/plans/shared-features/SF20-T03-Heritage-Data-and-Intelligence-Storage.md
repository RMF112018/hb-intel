# SF20-T03 - Heritage Data and Intelligence Storage

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** D-02 through D-06, D-09
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF20-T03 data/storage task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define heritage data sourcing, intelligence entry persistence, and approval queue API/storage contracts.

---

## Heritage Data Source Contract

- heritage records resolve from workflow-handoff snapshot at handoff moment
- linked scorecard version reference is immutable in heritage context
- heritage panel consumers receive read-only projection model

---

## Intelligence Storage Contract

- entry records include contributor, approval status, version metadata, and project context
- attachments optionally reference sharepoint-docs artifacts
- rejected entries preserve rejection reason and support revision-based resubmission

---

## Approval Queue API Contract

`IntelligenceApprovalApi` methods:

- `listPending(projectId?)`
- `approve(action)`
- `reject(action)`
- `resubmit(entryId, body)`

Approval authority resolution:

- approver set resolved via SF17 admin policy API by intelligence context

---

## Search Indexing Contract

- approved entries only are emitted to indexing pipeline
- pending/rejected entries are excluded from searchable corpus

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- storage
pnpm --filter @hbc/features-business-development test -- api
```
