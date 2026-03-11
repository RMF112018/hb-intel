# SF20 - BD Heritage Panel & Living Strategic Intelligence (`@hbc/features-business-development`)

**Plan Version:** 1.0
**Date:** 2026-03-11
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Priority Tier:** 2 - Application Layer (BD and cross-module differentiator)
**Estimated Effort:** 5-6 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0109-bd-heritage-living-strategic-intelligence.md`

> **Doc Classification:** Canonical Normative Plan - SF20 implementation master plan for BD Heritage Panel and Living Strategic Intelligence; governs SF20-T01 through SF20-T09.

---

## Purpose

SF20 preserves BD-to-delivery institutional context and enables governed, continuously enriched strategic intelligence that remains visible and actionable across Business Development, Estimating, and Project Hub.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Package alignment | Implement in `@hbc/features-business-development`; no standalone heritage package |
| D-02 | Heritage data source | Heritage panel reads handoff snapshot + versioned scorecard context |
| D-03 | Mutation policy | Heritage panel is read-only in cross-module delivery surfaces |
| D-04 | Intelligence lifecycle | `submit -> pending-approval -> approved/rejected` with resubmission on rejection |
| D-05 | Contributor permissions | Any user with project permissions can submit intelligence entries |
| D-06 | Approval authority | Approvers resolved via SF17 Admin-configured approval authority rules |
| D-07 | Complexity behavior | Essential collapsed/minimal; Standard visible heritage + approved feed; Expert full feed + approval history |
| D-08 | Cross-module surfaces | BD, Estimating, Project Hub, and Project Canvas tile consume shared heritage/intelligence contracts |
| D-09 | Search indexing policy | Only approved intelligence entries are indexed/searchable |
| D-10 | Testing sub-path | `@hbc/features-business-development/testing` exports canonical heritage/intelligence fixtures |

---

## Package Directory Structure

```text
packages/features/business-development/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/
|  |- index.ts
|  |- heritage-intelligence/
|  |  |- types/
|  |  |  |- IBdHeritageData.ts
|  |  |  |- IStrategicIntelligenceEntry.ts
|  |  |  |- index.ts
|  |  |- api/
|  |  |  |- BdHeritageApi.ts
|  |  |  |- StrategicIntelligenceApi.ts
|  |  |  |- IntelligenceApprovalApi.ts
|  |  |  |- index.ts
|  |  |- hooks/
|  |  |  |- useBdHeritage.ts
|  |  |  |- useStrategicIntelligence.ts
|  |  |  |- useIntelligenceApprovalQueue.ts
|  |  |  |- index.ts
|  |  |- components/
|  |  |  |- BdHeritagePanel.tsx
|  |  |  |- StrategicIntelligenceFeed.tsx
|  |  |  |- IntelligenceEntryForm.tsx
|  |  |  |- IntelligenceApprovalQueue.tsx
|  |  |  |- index.ts
|  |  |- index.ts
|  |- testing/
|     |- index.ts
|     |- createMockBdHeritageData.ts
|     |- createMockStrategicIntelligenceEntry.ts
|     |- createMockIntelligenceApprovalItem.ts
|     |- mockStrategicIntelligenceStates.ts
|  |- __tests__/
|     |- setup.ts
|     |- useBdHeritage.test.ts
|     |- useStrategicIntelligence.test.ts
|     |- useIntelligenceApprovalQueue.test.ts
|     |- BdHeritagePanel.test.tsx
|     |- StrategicIntelligenceFeed.test.tsx
|     |- IntelligenceEntryForm.test.tsx
|     |- IntelligenceApprovalQueue.test.tsx
```

---

## Definition of Done

- [ ] heritage and intelligence contracts are fully documented
- [ ] approval workflow contracts and queue semantics are documented
- [ ] read-only heritage constraints are documented
- [ ] cross-module surface contracts are documented
- [ ] search indexing rule (approved-only) is documented
- [ ] testing fixture sub-path is documented
- [ ] SF20-T09 includes SF11-grade documentation/deployment requirements
- [ ] `current-state-map.md` includes SF20 + ADR-0109 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF20-T01-Package-Scaffold.md` | package scaffold + README requirement |
| `SF20-T02-TypeScript-Contracts.md` | heritage/intelligence types and constants |
| `SF20-T03-Heritage-Data-and-Intelligence-Storage.md` | data sourcing, persistence, approval queue APIs |
| `SF20-T04-Hooks-and-State-Model.md` | useBdHeritage/useStrategicIntelligence/useIntelligenceApprovalQueue |
| `SF20-T05-BdHeritagePanel-and-StrategicIntelligenceFeed.md` | read-only panel + approved feed UI contracts |
| `SF20-T06-IntelligenceEntryForm-and-ApprovalQueue.md` | submit/review/reject/approve interaction contracts |
| `SF20-T07-Reference-Integrations.md` | cross-package integration boundaries |
| `SF20-T08-Testing-Strategy.md` | fixtures, matrix, storybook, e2e strategy |
| `SF20-T09-Testing-and-Deployment.md` | closure checklist, ADR/docs/index/state-map updates |
