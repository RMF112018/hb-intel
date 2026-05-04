# 03 — Enhanced Target Architecture

## Architecture Statement

The PCC Preconstruction Continuity Layer preserves upstream pursuit, Go / No-Go, estimating, and kickoff context across the full project lifecycle. Under the implemented unified lifecycle architecture, it is not a standalone workspace and not a department-specific application. It is a governed carry-forward layer that feeds the lifecycle spine, Project Memory, Project Readiness, source-lineage traceability, role/stage lenses, HBI grounding, lessons learned, and future-reference knowledge.

The architecture has two implementation families:

1. **Go / No-Go Carry-Forward** — source-owned BD / Pursuit decision record, projected into PCC after GO as an immutable, role-aware, source-lineage-backed carry-forward snapshot.
2. **Estimating Kickoff** — later-phase PCC-native Project Readiness / Preconstruction workflow module that converts source workbook content into structured deliverables, responsibilities, due dates, evidence links, kickoff/handoff readiness signals, and project-memory records.

PCC owns curated projections, source lineage, evidence-link classification, readiness/priority signals, Project Memory records, traceability edges, HBI eligibility metadata, and role-aware display rules. PCC does not become the source of truth for every upstream source record and does not introduce runtime integration or external writeback in this documentation pass.

## Unified Lifecycle Placement

| Unified Lifecycle Layer | Preconstruction Continuity Contribution |
|---|---|
| Lifecycle Spine | pursuit decision events, GO carry-forward event, estimating kickoff scheduled/active/completed events, handoff-accepted event |
| Project Memory | decision rationale, assumptions, win strategy, high-risk notes, executive override context, kickoff summary, handoff summary |
| Role/Stage/Task Lenses | estimator/precon/PX/PM/executive/future-reference views over the same source-lineage records |
| Traceability | pursuit decision → estimate assumption → kickoff deliverable → readiness blocker → operations outcome → lesson learned |
| Readiness | kickoff readiness, handoff readiness, missing evidence, overdue deliverables, owner gaps, assumption validation |
| Priority Actions | candidate signals only for missing/overdue/blocked/handoff/evidence issues |
| HBI Grounding | citation-eligible project context with refusal/qualification for insufficient or restricted evidence |
| Company Knowledge Reuse | future estimating/pursuit references from closed projects where permission and reuse posture allow |
| Warranty/Closeout Context | downstream access to original assumptions, exclusions, bid strategy, and handoff commitments when needed for warranty or closeout review |

## Recommended PCC Display Areas

1. **Project Home** — pursuit context summary, kickoff status card, handoff-readiness summary, and HBI context availability.
2. **Project Readiness** — Preconstruction / Pursuit Readiness region and later Estimating Kickoff workflow module region.
3. **Priority Actions** — candidate signals for missing source evidence, overdue kickoff deliverables, unassigned owners, handoff gaps, and assumption validation.
4. **Approvals / Checkpoints** — future checkpoint seams for GO carry-forward acceptance, kickoff completion, and handoff acceptance.
5. **Document Control** — source file and evidence-link ownership; no evidence-binary ownership in this module.
6. **Executive Oversight** — governed read-only pursuit, strategy, override, and assumption drill-in.
7. **Responsibility Matrix** — receives persistent responsibilities only after kickoff outputs become operational responsibilities.
8. **Lessons Learned / Post-Bid Autopsy** — receives assumptions-vs-outcome, bid/estimate lessons, coverage/strategy outcomes, and future-reference signals.
9. **HBI / Ask-HBI** — project-scoped, citation-grounded explanations only; no source-of-truth claim.

## Go / No-Go Target UX

- Project Home card: GO decision date, committee score, score band, why-we-pursued summary, win strategy, differentiators, strategic-fit note, executive override indicator, source-lineage chip.
- Executive Oversight view: full score/rationale/override/score-delta summary with governed drill-in and role-based redaction.
- Project Readiness region: handoff package present/missing, kickoff-needed signal, high-risk assumptions, source evidence posture.
- Project Memory panel: accepted carry-forward decision summary, assumptions, strategy, and downstream validation notes.
- Traceability panel: GO decision → pursuit assumptions → kickoff obligations → downstream readiness/handoff items.
- Document Control: source scorecard PDF/workbook and supporting pursuit documents as evidence links only.

## Estimating Kickoff Target UX

- Preconstruction Kickoff Command Center.
- Kickoff Record Detail.
- Deliverables and Assignments Table.
- Key Dates / Bid Calendar panel.
- Proposal / Marketing / IDS / Estimating / Financial / Schedule / Logistics deliverable panels.
- Handoff Readiness panel.
- Assumption Validation panel.
- Evidence and Source Lineage panel.
- Project Memory contribution panel.
- Traceability Edge preview panel.
- Audit History panel.

## Required Record Families

- `PccPreconstructionContinuitySummary`
- `PccPursuitDecisionCarryForward`
- `PccPursuitContextSnapshot`
- `PccEstimatingKickoffRecord`
- `PccEstimatingKickoffDeliverable`
- `PccPreconstructionReadinessSignal`
- `PccPreconstructionPriorityActionCandidate`
- `PccPreconstructionSourceLineage`
- `PccPreconstructionVisibilityClassification`
- `PccPreconstructionProjectMemoryContribution`
- `PccPreconstructionTraceabilityEdge`
- `PccPreconstructionHbiEvidenceDescriptor`
- `PccPreconstructionAuditEvent`
- `PccPreconstructionDegradedState`

## Deferred Capabilities

- full BD module implementation;
- full CRM/Unanet integration;
- automated Go / No-Go workflow runtime;
- automatic project setup or provisioning;
- automatic SharePoint site creation;
- Procore/Sage/CRM/Autodesk/BuildingConnected writeback;
- Microsoft Graph / SharePoint REST / PnP runtime operations;
- Power Automate runtime approvals;
- bid-management marketplace or bid leveling clone;
- formal staffing commitment engine;
- legal/accounting/profit guarantee calculations;
- production integrations;
- live HBI/vector/search runtime beyond existing approved preview posture.

## Success Criteria

A project user should be able to determine, subject to their role and permissions:

- why HB pursued the project;
- what the committee believed about win probability, margin, staffing, schedule, client, and strategy;
- whether an executive override occurred;
- what assumptions need downstream validation;
- whether Estimating Kickoff occurred;
- what pursuit/estimating/proposal deliverables remain open;
- who owns the next preconstruction handoff action;
- what evidence supports each carry-forward claim;
- what sensitive information is suppressed due to role visibility;
- what lifecycle events, Project Memory records, and traceability edges were created from preconstruction context;
- whether HBI can answer a question from cited evidence or must refuse.
