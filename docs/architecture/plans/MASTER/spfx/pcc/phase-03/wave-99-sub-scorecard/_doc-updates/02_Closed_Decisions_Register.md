# 02 — Closed Decisions Register

Generated: 2026-05-03

No decisions are intentionally left open in this package. If a future agent finds repo truth that conflicts with this package, the agent must stop and request an explicit architecture supersession rather than inventing a new decision.

| ID | Closed Decision |
|---|---|
| SC-DEC-001 | Module is a PCC-native Subcontractor Scorecard, hosted under the existing `subcontractor-performance` work center, not a spreadsheet launcher and not a Procore/Compass/Sage replacement. |
| SC-DEC-002 | Initial documentation placement is `docs/architecture/blueprint/sp-project-control-center/future-workstreams/subcontractor-scorecard/`; do not insert this into Phase 3 Waves 8-14 or alter current MVP sequencing. |
| SC-DEC-003 | Future runtime implementation begins read-model/fixture-first and read-only; workflow write routes require a later explicit mutation gate. |
| SC-DEC-004 | Primary record is `SubcontractorScorecardProjectInstance`. Versioned scoring template is `SubcontractorScorecardTemplate`. |
| SC-DEC-005 | PCC owns scorecard workflow state, reviewer judgment, scoring outputs, recommendation, publication state, audit events, source-lineage classification, and derived analytics. |
| SC-DEC-006 | Procore owns Procore-native commitments, submittals, RFIs, punch/deficiency items, observations/inspections where generated in Procore, companies, and Procore URLs. |
| SC-DEC-007 | Sage owns accounting truth for official cost/final value where integrated; Procore operational financial context must be labeled as operational. |
| SC-DEC-008 | Compass/Bespoke Metrics remains a prequalification/risk source when integrated; PCC does not mutate or replace it. |
| SC-DEC-009 | SharePoint/HB Document Control owns evidence/document binaries. Scorecards store evidence links and source lineage only. |
| SC-DEC-010 | Workbook category weights are frozen for v1: Safety 20%, Quality 20%, Schedule 20%, Cost 15%, Communication 15%, Workforce 10%. |
| SC-DEC-011 | Factor scoring uses 1-5 integers only. Category score is average of applicable factor scores. Overall score is weighted average of applicable category scores. |
| SC-DEC-012 | N/A is allowed only with required justification and evidence/context note; N/A categories/factors are excluded from denominator and applicable weights are redistributed. |
| SC-DEC-013 | Safety & Compliance cannot be marked N/A unless Project Executive override exists with reason and evidence. |
| SC-DEC-014 | Future work recommendation replaces binary rebid language; allowed values are `recommended`, `recommended-with-conditions`, `use-with-risk-controls`, `requires-executive-procurement-review`, `not-recommended-for-similar-scope`, `insufficient-data`. |
| SC-DEC-015 | Scorecard is a decision-support record only. It cannot automatically disqualify, blacklist, debar, default, terminate, or block a subcontractor. |
| SC-DEC-016 | Draft and returned scorecards are visible only to PM, Superintendent, PX, assigned reviewers, and explicitly authorized project leadership. Estimating/procurement consume approved/published summaries only. |
| SC-DEC-017 | Published portfolio rollups include approved/published scorecards only; drafts, disputed records, evidence-review-required records, and insufficient-data records are excluded. |
| SC-DEC-018 | Approved scorecards cannot be edited in place. Corrections create a revision and supersede the prior approved version after reapproval. |
| SC-DEC-019 | Scorecard completion may become a closeout readiness gate, but it cannot block project closeout by itself without PM/PX override workflow. |
| SC-DEC-020 | HBI may summarize, draft narrative, identify source gaps, and suggest risk-control language; HBI cannot score, approve, publish, exclude, or reveal restricted comments autonomously. |
| SC-DEC-021 | All external integrations remain backend-mediated. Direct SPFx-to-Procore, direct SPFx-to-Sage, Compass mutation, external writeback, and full mirror behavior are prohibited. |
| SC-DEC-022 | Audit history is business-grade and must record score, status, reviewer, evidence-link, publication, correction, and HBI-human-acceptance events. |
| SC-DEC-023 | No open implementation decisions remain in this target architecture package. Future agents must implement these decisions unless a new approved architecture decision supersedes them. |
