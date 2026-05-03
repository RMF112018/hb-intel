# 04 — Developer Implementation Contracts

Generated: 2026-05-03

## Non-Negotiable Contracts

1. Primary object is `SubcontractorScorecardProjectInstance`.
2. Template object is `SubcontractorScorecardTemplate`.
3. Every workbook field survives as a traceable field, calculated field, evidence field, or source-mapping field.
4. PCC owns scorecard workflow state, reviewer judgment, score outputs, recommendations, publication, audit events, source-lineage classification, and derived analytics.
5. Procore, Sage, SharePoint/HB Document Control, and Compass retain ownership of native source records.
6. External values require source lineage.
7. No Procore/Sage/Compass write-back exists.
8. No automatic vendor exclusion, blacklist, default, debarment, or legal conclusion exists.
9. Score calculation follows `reference/subcontractor_scorecard_module_data_contract.json` and `reference/scorecard_validation_rules.json`.
10. State transitions follow `reference/subcontractor_scorecard_state_machine.json`.
11. Field mutability follows `reference/field_mutability_matrix.json`.
12. Role/action authority follows `reference/permission_matrix.json`.
13. Published rollups use approved/published scorecards only.
14. HBI cannot score, approve, publish, or expose restricted data.
15. All source-lineage and evidence records are reference-only; evidence binaries remain in HB Document Control / SharePoint / source systems.

## Required Future Read Models

```ts
SubcontractorPerformanceDashboardReadModel
ProjectSubcontractorScorecardRegisterReadModel
SubcontractorScorecardDetailReadModel
VendorPortfolioProfileReadModel
SubcontractorPerformanceExecutiveSummaryReadModel
SubcontractorScorecardPriorityActionCandidate
SubcontractorScorecardSourceLineage
```

## Future API Route Contract

Read-only first implementation:

```text
GET /api/pcc/projects/{projectId}/subcontractor-performance/dashboard
GET /api/pcc/projects/{projectId}/subcontractor-scorecards
GET /api/pcc/projects/{projectId}/subcontractor-scorecards/{scorecardId}
GET /api/pcc/projects/{projectId}/subcontractor-performance/vendor/{vendorId}
GET /api/pcc/projects/{projectId}/subcontractor-performance/executive-summary
```

Write routes are future-gated and prohibited until explicitly authorized:

```text
POST /api/pcc/projects/{projectId}/subcontractor-scorecards
PATCH /api/pcc/projects/{projectId}/subcontractor-scorecards/{scorecardId}
POST /api/pcc/projects/{projectId}/subcontractor-scorecards/{scorecardId}/submit
POST /api/pcc/projects/{projectId}/subcontractor-scorecards/{scorecardId}/approve
POST /api/pcc/projects/{projectId}/subcontractor-scorecards/{scorecardId}/return
POST /api/pcc/projects/{projectId}/subcontractor-scorecards/{scorecardId}/publish
POST /api/pcc/projects/{projectId}/subcontractor-scorecards/{scorecardId}/dispute
POST /api/pcc/projects/{projectId}/subcontractor-scorecards/{scorecardId}/correct
```

## Required Reference JSONs

- `reference/subcontractor_scorecard_module_data_contract.json`
- `reference/subcontractor_scorecard_state_machine.json`
- `reference/field_mutability_matrix.json`
- `reference/scorecard_validation_rules.json`
- `reference/scorecard_exception_reason_codes.json`
- `reference/fixture_scenarios.json`
- `reference/procore_vendor_performance_data_mapping_reference.json`
- `reference/scorecard_workbook_field_mapping.json`
- `reference/analytics_definitions.json`
- `reference/permission_matrix.json`
- `reference/source_research_urls.json`

## Required Future Tests

- Type contract tests.
- Score algorithm tests.
- N/A redistribution tests.
- Rating-band tests.
- State-transition tests.
- Field-mutability tests.
- Role/visibility tests.
- Validation/blocking tests.
- Source-lineage tests.
- Publication-tier tests.
- Portfolio analytics inclusion/exclusion tests.
- HBI guardrail tests.
- Fixture scenario render tests.
- No external writeback tests.
- No direct SPFx-to-Procore/Sage/Compass tests.
- Accessibility tests for forms, focus, keyboard, target size, reduced motion, and drawer/tab order.
- Responsive layout tests.
