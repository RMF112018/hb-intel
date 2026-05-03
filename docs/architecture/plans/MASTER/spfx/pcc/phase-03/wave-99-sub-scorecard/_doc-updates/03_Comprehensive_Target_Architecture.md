# 03 — Comprehensive Target Architecture

Generated: 2026-05-03

## Architecture Statement

The **Subcontractor Scorecard** is a PCC-native subcontractor performance intelligence module hosted under the existing **Subcontractor Performance Center** work center (`subcontractor-performance`). It converts project-specific subcontractor evaluations from workbook/email/manual closeout practices into structured, approved, role-aware, source-lineage-backed records.

The module is not a spreadsheet clone. The existing scorecard workbook is preserved as the v1 source field inventory, scoring seed, and taxonomy source. The target UX is an exception-first, evidence-backed, role-aware performance surface that supports project closeout, warranty, future estimating, procurement/buyout risk control, executive oversight, and HBI grounded summaries.

## Non-Negotiable Boundary

The scorecard is a **decision-support and performance-intelligence record**, not a blacklist, debarment, default, termination, or automatic bidder-exclusion engine. It may recommend future risk controls, but it cannot automatically block a subcontractor from bidding or receiving future work.

## Module Placement

| Item | Closed Target |
|---|---|
| User-facing module | Subcontractor Scorecard |
| Work center | Subcontractor Performance Center |
| Work center id | `subcontractor-performance` |
| Documentation phase | Future workstream / post-MVP architecture |
| Target documentation path | `docs/architecture/blueprint/sp-project-control-center/future-workstreams/subcontractor-scorecard/` |
| Initial runtime posture | Read-model and fixture-first; workflow writes require later explicit gate |
| Initial route family | `subcontractor-performance` with scorecard child read models |
| Current MVP insertion | Do not insert into Phase 3 Waves 8-14 |

## System-of-Record Summary

| Domain | Primary Owner | PCC Role |
|---|---|---|
| Scorecard evaluation record | PCC | Create, maintain, review, approve, publish, archive |
| Score template and scoring logic | PCC | Versioned template governance |
| Reviewer judgment and narrative | PCC | Business record with restricted visibility |
| Procore commitments/submittals/RFIs/punch/observations | Procore | Read-only source context and evidence link |
| Official accounting cost/final value | Sage | Read-only accounting source where integrated |
| Evidence files | SharePoint / HB Document Control | Binary/file owner; PCC stores links only |
| Prequalification/risk context | Compass/Bespoke Metrics | Read-only reference source where integrated |
| HBI summaries | PCC-derived | Human-reviewed output only |

## Source Workbook Scoring Model

| Category | Default Weight | Workbook Source |
|---|---:|---|
| Safety & Compliance | 20% | Scorecard!21:28 |
| Quality of Work | 20% | Scorecard!30:37 |
| Schedule Performance | 20% | Scorecard!39:46 |
| Cost Management | 15% | Scorecard!48:55 |
| Communication & Management | 15% | Scorecard!57:64 |
| Workforce & Labor | 10% | Scorecard!66:72 |

## Source Workbook Criteria

### Safety & Compliance — 20%
| ID | Criterion | Source notes / evidence hint |
|---|---|---|
| SAF-001 | Adherence to site safety plan and OSHA standards | Incidents, near-misses, safety observations |
| SAF-002 | PPE compliance and toolbox-talk participation | Attendance records, field observations |
| SAF-003 | Housekeeping and site cleanliness | Daily clean, lay-down areas, debris removal |
| SAF-004 | Incident/injury rate on this project | TRIR, recordables, first-aid events |
| SAF-005 | Corrective action response to safety issues | Time to close NCRs / safety violations |

### Quality of Work — 20%
| ID | Criterion | Source notes / evidence hint |
|---|---|---|
| QLT-001 | Workmanship quality and craftsmanship | Punch list density, rework required |
| QLT-002 | Compliance with plans, specs & submittals | RFI clarity, revision compliance |
| QLT-003 | First-time inspection pass rate | AHJ / third-party inspection results |
| QLT-004 | Materials and equipment quality | Substitutions, as-specified compliance |
| QLT-005 | Closeout documentation completeness | O&Ms, warranties, as-builts, attic stock |

### Schedule Performance — 20%
| ID | Criterion | Source notes / evidence hint |
|---|---|---|
| SCH-001 | On-time mobilization | Actual vs. planned start date |
| SCH-002 | 3-week look-ahead participation & reliability | % commitments kept on Last Planner / pull plan |
| SCH-003 | Progress relative to baseline schedule | Float consumption, milestone compliance |
| SCH-004 | Recovery effort when behind schedule | Added crew, extended hours, phasing coordination |
| SCH-005 | Coordination with other trades | BIM / pre-construction coordination, conflicts |

### Cost Management — 15%
| ID | Criterion | Source notes / evidence hint |
|---|---|---|
| CST-001 | Budget adherence (no unwarranted overruns) | Change order volume vs. scope growth |
| CST-002 | Change order pricing accuracy & timeliness | Days to submit COs, fair pricing |
| CST-003 | Back-charge exposure created | Back-charges assessed by GC |
| CST-004 | Material procurement & financial stability | No stoppages due to unpaid suppliers |
| CST-005 | Billing accuracy and schedule of values quality | Overbilling, retainage disputes |

### Communication & Management — 15%
| ID | Criterion | Source notes / evidence hint |
|---|---|---|
| COM-001 | Responsiveness to RFIs, emails, and calls | Avg response time, dropped items |
| COM-002 | Quality of superintendent / foreman leadership | Decision authority, problem ownership |
| COM-003 | Submittals: accuracy, completeness, timeliness | Resubmittal rate, lead times met |
| COM-004 | Participation in OAC and coordination meetings | Attendance, action item closure |
| COM-005 | Issue escalation and conflict resolution | Transparent communication vs. avoidance |

### Workforce & Labor — 10%
| ID | Criterion | Source notes / evidence hint |
|---|---|---|
| LAB-001 | Adequate and consistent crew staffing | Planned vs. actual headcount |
| LAB-002 | Workforce skill level and supervision ratio | Journeyman/apprentice mix, field leadership |
| LAB-003 | Compliance with labor requirements (certified payroll, etc.) | MBE/DBE, prevailing wage, union rules if applicable |
| LAB-004 | Subcontractor to sub-tier management | Sub-tier oversight, insurance, payments |


## Core User Journeys

1. **Project Manager creates or reviews scorecard** after meaningful subcontractor performance data exists.
2. **Superintendent completes field-performance input** for safety, quality, schedule, workforce, and coordination categories.
3. **PM finalizes score and narrative** with source evidence, N/A justifications, and future-work recommendation.
4. **PX reviews and approves** or returns for revision.
5. **Approved scorecard becomes restricted official record**.
6. **Published internal summary becomes visible** to approved estimating/procurement/executive roles.
7. **Portfolio rollups update** using approved/published records only.
8. **Future buyout/estimating users consume signals** as context, not automatic exclusion.

## Primary Screens

1. **Subcontractor Performance Dashboard** — action queues, low-score alerts, approval queue, portfolio signals.
2. **Project Scorecard Register** — project-specific list of subcontractor scorecards by trade/scope/status.
3. **Scorecard Detail Drawer** — summary, category scoring, evidence, comments, recommendation, review history, publication.
4. **Vendor Portfolio Profile** — approved cross-project history, trade/project-type trends, recurring strengths/issues, risk controls.
5. **Executive/Procurement View** — approved rollups only; no draft comments or sensitive financial/prequalification details by default.

## Detail Drawer Panels

1. Summary
2. Project / Subcontractor / Scope
3. Source System Context
4. Category Scores
5. Evidence Links
6. N/A Justifications
7. Future Work Recommendation
8. Risk Control Plan
9. Review / Approval
10. Publication Visibility
11. HBI Assistance
12. Audit History

## Scoring Algorithm

1. Factor scores are integers 1-5.
2. Each category score is the arithmetic average of applicable factor scores.
3. If a factor is N/A, it is excluded from the category denominator and requires justification.
4. If every factor in a category is N/A, the category is excluded from the overall denominator and requires PX override.
5. Safety & Compliance cannot be fully N/A without PX override.
6. Overall score is: `SUM(categoryScore * categoryWeight) / SUM(applicableCategoryWeights)`.
7. Display score is rounded to one decimal; stored calculation score is rounded to four decimals.
8. Rating band uses stored calculation score.
9. Evidence confidence does not alter the numeric score in v1; it affects review/publish blockers and rollup confidence.
10. Draft scores do not contribute to analytics.

## Rating Bands

| Band | Range | Meaning |
|---|---:|---|
| Exceptional | 4.50-5.00 | Strong candidate for future similar work; still requires project-specific risk review. |
| Above Average | 3.50-4.49 | Generally strong performer with limited controls or monitoring. |
| Satisfactory | 2.50-3.49 | Acceptable performance; normal procurement and project controls apply. |
| Below Average | 1.50-2.49 | Use caution; future award requires PM/PX/procurement review and defined controls. |
| Unsatisfactory | 1.00-1.49 | Not recommended for similar scope without executive/procurement review and documented risk-control plan. |
| Insufficient Data | n/a | Not enough reliable evidence to publish a score. |

## Future Work Recommendation Values

- `recommended`
- `recommended-with-conditions`
- `use-with-risk-controls`
- `requires-executive-procurement-review`
- `not-recommended-for-similar-scope`
- `insufficient-data`

## State Model

The authoritative state machine is `reference/subcontractor_scorecard_state_machine.json`.

Primary states:

- `not-started`
- `draft`
- `needs-superintendent-input`
- `needs-pm-review`
- `evidence-review-required`
- `ready-for-px-review`
- `returned-for-revision`
- `approved-restricted`
- `published-internal`
- `under-correction`
- `disputed`
- `superseded`
- `archived`

## Publication Model

| Publication Tier | Audience | Content |
|---|---|---|
| Draft | PM, Superintendent, PX, assigned reviewers | Full working record |
| Review | PX and assigned reviewers | Full record plus evidence and return actions |
| Approved Restricted | Project leadership | Full approved record, restricted narrative |
| Published Internal | Estimating, procurement, executives | Approved summary, score, recommendation, risk controls |
| Executive Rollup | Executives | Aggregated trend and drill-in subject to permission |
| HBI Grounding | Permission-scoped | Approved/published facts only |

## Validation and Blocking Rules

Block submit to PX review if:

- required project/subcontractor metadata is missing;
- required category or factor score is missing;
- N/A lacks justification;
- Safety category is N/A without PX override;
- overall narrative is blank;
- future work recommendation is blank;
- evidence confidence is low on a severe negative rating;
- Superintendent input is missing where required;
- source-lineage summary is missing.

Block approval if:

- status is not `ready-for-px-review`;
- unresolved evidence-review-required flag exists;
- required PM/Superintendent sections are incomplete;
- restricted/sensitive comments are not visibility-classified;
- score changed after final PM review without re-submit.

Block publication if:

- PX approval is missing;
- scorecard is returned, disputed, under correction, or evidence-review-required;
- publication tier is missing;
- approved summary is blank;
- restricted raw comments are marked for broad publication;
- source-lineage minimum is not met.

## Role / Visibility Model

The authoritative role/action contract is `reference/permission_matrix.json`.

Closed default:

- PM creates and edits project scorecards.
- Superintendent edits field-input sections and comments.
- PX approves, returns, publishes, and authorizes corrections.
- Estimating and procurement see published summaries only.
- Executive oversight sees published summaries and approved rollups.
- PCC Admin/IT sees technical metadata only by default, not unrestricted business commentary.
- HBI sees only data the current viewer is authorized to see.

## Source-Lineage Model

Every source-backed scorecard claim must classify evidence as one of:

- `source-fact`
- `supporting-context`
- `reviewer-judgment`
- `derived-signal`

Every source link must record source system, object type, object id if available, URL/deep link if allowed, source owner, captured/synced timestamp, confidence, and visibility class.

## Analytics Rules

The authoritative analytics definitions are `reference/analytics_definitions.json`.

Closed v1 rules:

- Portfolio averages include approved/published scorecards only.
- No contract-value weighting in v1.
- Disputed, draft, returned, insufficient-data, and evidence-review-required records are excluded from averages.
- Vendor trend requires at least two approved/published scorecards.
- High-risk performer requires at least one published scorecard below 2.50 or two consecutive category scores below 2.50 in same category.
- Preferred performer requires at least two published scorecards at or above 4.50 with no unresolved severe negative category.

## HBI Guardrails

HBI may:

- identify missing fields or evidence;
- draft category comments;
- summarize approved scorecards;
- propose risk-control wording;
- compare approved/published scorecards;
- flag source-lineage gaps.

HBI must not:

- assign final scores;
- approve, return, publish, archive, dispute, or supersede records;
- generate automatic blacklist/exclusion/default language;
- reveal restricted draft comments;
- fabricate source facts;
- summarize unapproved records for unauthorized users.

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

## Required Component Inventory

```text
PccSubcontractorPerformanceSurface
├── SubcontractorPerformanceDashboard
├── ProjectScorecardRegister
├── ScorecardStatusRail
├── ScorecardDetailDrawer
├── ScoreCategoryCard
├── ScoreFactorInput
├── WeightedScoreSummaryCard
├── EvidenceDrawer
├── SourceLineageBadge
├── FutureWorkRecommendationPanel
├── RiskControlPlanPanel
├── ReviewTimeline
├── ApprovalActionBar
├── PublicationVisibilityPanel
├── VendorPortfolioProfile
└── SubcontractorPerformanceInsightsPanel
```

## Deferred Capabilities

- Runtime source-code implementation.
- Backend write routes.
- SPFx write-enabled workflow UI.
- Procore/Sage/Compass runtime integration.
- External writeback.
- Automated bid-list exclusion.
- Vendor-facing portal or response workflow.
- Legal/default/debarment workflows.
- Contract-risk determinations.
- Production deployment.

## Success Criteria

A developer implementing this feature in a later wave should be able to determine:

- where the module lives;
- which records are PCC-owned;
- which source facts stay in Procore/Sage/Compass/SharePoint;
- exactly how scoring is calculated;
- which roles can see/edit/approve/publish which fields;
- when state transitions are allowed;
- which validations block submit/approval/publication;
- what read-model routes are required;
- what fixture scenarios are mandatory;
- how analytics are calculated;
- how HBI is constrained;
- how to test the module without live external integrations.
