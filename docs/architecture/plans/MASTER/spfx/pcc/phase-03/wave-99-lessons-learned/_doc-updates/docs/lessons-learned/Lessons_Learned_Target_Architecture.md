# Lessons Learned Target Architecture

## Architecture Statement

The **Lessons Learned Center** is a PCC-native lifecycle knowledge and continuous-improvement module. It captures project knowledge continuously, validates it through governed review, controls sensitive visibility, and routes approved lessons back into estimating, preconstruction, procurement, scheduling, project readiness, operations, quality, warranty, closeout, executive oversight, and HBI-assisted workflows.

The module is not an Excel replacement, document library, closeout-only form, or detached knowledge base. It is a structured project-control system that turns project experience into reusable, governed company intelligence.

## Closed Scope Decision

Documentation scope is approved now. Runtime implementation is not approved by this package.

- Current status: future PCC workstream / Later work center.
- Documentation target path: `docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/`.
- Runtime build: deferred until a later implementation prompt explicitly authorizes TypeScript models, backend routes, SPFx surfaces, or write workflows.

## System-of-Record Model

PCC owns the Lessons Learned record and derived governance/intelligence fields.

PCC-owned:

- lesson record;
- title, narrative, category, subcategory, phase, impact, root cause, recommendation;
- source-lineage interpretation;
- sensitivity classification;
- redaction classification;
- review status;
- publication status;
- HBI summary and suggestion artifacts;
- improvement actions;
- reuse/application history;
- audit events and version snapshots.

Source-owned:

- Procore owns Procore-native RFIs, submittals, punch items, observations, commitments, daily logs, and quality/safety records.
- Sage owns accounting/job-cost truth.
- SharePoint/HB Central owns evidence files and document binaries.
- PCC stores references and source lineage, not duplicate source-system records.

## Primary Domain Objects

1. `PccLessonLearnedRecord`
2. `PccLessonContent`
3. `PccLessonImpactProfile`
4. `PccLessonEvidenceReference`
5. `PccSourceLineageReference`
6. `PccLessonReviewState`
7. `PccLessonRedactionProfile`
8. `PccLessonReuseProfile`
9. `PccLessonImprovementAction`
10. `PccLessonHbiSuggestion`
11. `PccLessonAuditEvent`
12. `PccLessonVersionSnapshot`

## Required Lifecycle States

Use these states exactly:

1. `draft`
2. `needs-enrichment`
3. `submitted-for-review`
4. `under-review`
5. `approved-project-record`
6. `published-company-lesson`
7. `converted-to-best-practice`
8. `superseded`
9. `suppressed`
10. `archived-no-action`

## Required Screens

1. Lessons Command Center
2. Lesson Capture Studio
3. Lesson Review Board
4. Knowledge Library
5. Improvement Actions
6. Lesson Detail Drawer
7. Evidence and Source Lineage Panel
8. Redacted Lesson Preview
9. HBI Suggestion Panel
10. Metrics / Program Health Panel

## Command Center Cards

- Capture Health
- Open Lesson Candidates
- Drafts Needing Completion
- Submitted / Under Review
- Approved Project Lessons
- Published Company Lessons
- Best-Practice Candidates
- Sensitive / Restricted Lessons
- Improvement Actions Open
- Improvement Actions Overdue
- Top Categories
- Repeat Root Causes
- Reuse / Applied Lessons

## Detail Drawer Panels

1. Summary
2. Situation / Impact / Root Cause / Response / Recommendation
3. Classification and Applicability
4. Evidence and Source Lineage
5. Review and Approval
6. Sensitivity and Redaction
7. HBI Suggestions
8. Related Records
9. Related Lessons
10. Improvement Actions
11. Reuse History
12. Audit History

## Capture Rules

A lesson may be captured manually from:

- Lessons Learned Center;
- Project Home;
- Closeout;
- Project Readiness;
- Buyout / Procurement;
- Constraint Log;
- Permit & Inspection Control Center;
- Responsibility Matrix;
- Subcontractor Performance;
- Quality / Warranty;
- Scheduler;
- meeting/action-item workflows;
- HBI Assistant.

A lesson candidate may be suggested when patterns occur:

- repeated inspection failures;
- RFI cluster;
- significant change event;
- missed milestone or recovery event;
- buyout exposure;
- subcontractor performance issue;
- warranty claim pattern;
- owner decision delay;
- design coordination failure;
- safety event or near miss;
- successful practice worth repeating.

## Required Categories

Use these categories exactly as seed taxonomy:

- `pre-construction`
- `estimating-and-bid`
- `procurement`
- `schedule`
- `cost-and-budget`
- `safety`
- `quality`
- `subcontractors`
- `design-and-rfis`
- `owner-client`
- `technology-bim`
- `workforce-labor`
- `commissioning`
- `closeout-turnover`
- `warranty-post-occupancy`
- `risk-claims`
- `project-controls`
- `other`

## Required Impact Magnitudes

Use these workbook-seeded impact magnitudes exactly:

- `minor`
- `moderate`
- `significant`
- `critical`

Impact magnitude is separate from impact type. A lesson may have cost, schedule, safety, quality, client, warranty, claims, workforce, or reputational impact.

## Permissions and Redaction

The module uses field/action-level RBAC with redaction.

Default rule: if the user lacks permission for a sensitive field, the API returns a redacted shape with reason codes and safe summary fields. The UI must never infer hidden content from counts or labels.

Sensitive classes:

- `standard`
- `internal`
- `vendor-sensitive`
- `personnel-sensitive`
- `client-sensitive`
- `legal-claims`
- `safety-sensitive`
- `financial-dispute`
- `warranty-defect`

## Required HBI Guardrails

HBI may:

- suggest title, category, phase, tags, and target modules;
- identify missing required fields;
- summarize draft lessons;
- suggest neutral publishable language;
- suggest related evidence and related lessons;
- draft improvement actions;
- flag sensitivity concerns;
- explain why a lesson may be useful in another PCC module.

HBI may not:

- approve, publish, suppress, or supersede lessons;
- expose restricted content to unauthorized users;
- make vendor blacklist, employment, legal, claims, delay, compensability, or warranty-liability determinations;
- overwrite facts without traceability;
- act without source references and auditability.

## Search and Retrieval

Search must support:

- full-text search across approved visible content;
- filters by project, category, phase, market sector, delivery method, trade, impact magnitude, sensitivity, status, source system, applicability, tags, and related module;
- role-sensitive redaction;
- relevance ranking by category, project type, market sector, trade, phase, impact, and applicability;
- related-lesson matching;
- duplicate candidate detection;
- saved views in later implementation.

## API / Read-Model Endpoints

Future read-only endpoints:

- `GET /api/pcc/projects/{projectId}/lessons-learned/summary`
- `GET /api/pcc/projects/{projectId}/lessons-learned/candidates`
- `GET /api/pcc/projects/{projectId}/lessons-learned/records`
- `GET /api/pcc/projects/{projectId}/lessons-learned/review-queue`
- `GET /api/pcc/projects/{projectId}/lessons-learned/knowledge-links`
- `GET /api/pcc/projects/{projectId}/lessons-learned/improvement-actions`
- `GET /api/pcc/projects/{projectId}/lessons-learned/metrics`

Future write-side endpoints, not enabled in documentation scope:

- `POST /api/pcc/projects/{projectId}/lessons-learned/records`
- `PATCH /api/pcc/projects/{projectId}/lessons-learned/records/{lessonId}`
- `POST /api/pcc/projects/{projectId}/lessons-learned/records/{lessonId}/submit`
- `POST /api/pcc/projects/{projectId}/lessons-learned/records/{lessonId}/request-revision`
- `POST /api/pcc/projects/{projectId}/lessons-learned/records/{lessonId}/approve-project-record`
- `POST /api/pcc/projects/{projectId}/lessons-learned/records/{lessonId}/publish-company-lesson`
- `POST /api/pcc/projects/{projectId}/lessons-learned/records/{lessonId}/suppress`
- `POST /api/pcc/projects/{projectId}/lessons-learned/records/{lessonId}/supersede`
- `POST /api/pcc/projects/{projectId}/lessons-learned/records/{lessonId}/convert-to-best-practice`
- `POST /api/pcc/projects/{projectId}/lessons-learned/records/{lessonId}/create-improvement-action`

## Empty, Degraded, and Error States

The UI must explicitly handle:

- no lessons exist;
- lessons exist but all are drafts;
- user lacks permission;
- content redacted;
- evidence links unavailable;
- source systems unavailable;
- HBI unavailable;
- fixture mode active;
- API partial data warning;
- review queue empty;
- search returns no results;
- duplicate candidates detected;
- broken source lineage.

## Metrics

Required metrics:

- total lessons;
- draft lessons;
- submitted lessons;
- approved project lessons;
- published company lessons;
- critical/significant lessons;
- sensitive lessons;
- average review duration;
- improvement actions open;
- improvement actions overdue;
- improvement action closure rate;
- reuse count;
- applied-to-project count;
- repeat root cause count;
- lessons by category;
- lessons by phase;
- lessons by impact;
- lessons by market sector.

## Test and Acceptance Criteria

Future implementation must include:

- enum tests;
- validation tests;
- state-transition tests;
- permission tests;
- redaction tests;
- source-lineage tests;
- fixture integrity tests;
- read-model envelope tests;
- route tests;
- UI empty/degraded/error state tests;
- HBI mock contract tests;
- search/filter tests;
- accessibility smoke tests;
- no external writeback tests;
- no direct SPFx-to-source-system tests.
