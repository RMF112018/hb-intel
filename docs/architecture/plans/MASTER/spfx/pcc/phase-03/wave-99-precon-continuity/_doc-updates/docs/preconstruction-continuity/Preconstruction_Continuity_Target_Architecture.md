# Preconstruction Continuity Target Architecture

## Purpose

Preconstruction Continuity preserves the reason HB pursued a project, the assumptions made before award, the estimating/kickoff commitments created before operations, and the evidence required to carry that context through the full PCC lifecycle.

This architecture aligns with the implemented unified lifecycle layer. It treats preconstruction continuity as a contributor to:

- lifecycle events;
- Project Memory;
- Project Readiness;
- traceability edges;
- source-lineage records;
- HBI evidence;
- role/stage/task lenses;
- future-reference knowledge.

It is not a standalone departmental workspace.

## Controlling Doctrine

Preconstruction Continuity is governed by:

```text
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/
```

Required contract alignment:

- bounded context and ownership map;
- route taxonomy and forbidden routes;
- record state machines;
- field-level data dictionary;
- permission/redaction resolution;
- HBI citation/refusal contract;
- source-system integration contracts;
- audit-event model;
- error/degraded state matrix;
- module onboarding template;
- validation/test gates;
- live-integration readiness gates.

## Architecture Statement

Preconstruction Continuity is a unified lifecycle carry-forward layer that preserves pursuit, estimating, kickoff, assumptions, evidence, and handoff context as permission-filtered Project Memory, lifecycle events, readiness signals, traceability edges, and future-reference knowledge without creating a separate departmental workspace or replacing source systems.

## Scope

### In Scope

- Go / No-Go carry-forward after GO decision.
- Estimating Kickoff target architecture.
- Source-template field mapping.
- Project Memory contribution rules.
- Traceability edge rules.
- Role/stage visibility.
- HBI evidence/refusal posture.
- Priority Action candidate posture.
- Readiness and handoff signals.
- Documentation-only reference JSONs.

### Out of Scope

- runtime implementation;
- shell routes;
- backend routes;
- SPFx components;
- model package changes;
- live CRM/Unanet/Procore/Sage/Autodesk/BuildingConnected/Graph integrations;
- SharePoint REST/PnP operations;
- source workbook mutation;
- staffing commitments;
- legal/accounting/profit guarantees;
- production rollout.

## Unified Lifecycle Contributions

| Contribution | Description |
|---|---|
| Lifecycle events | GO decision projected, estimating kickoff scheduled/active/completed, handoff readiness, handoff accepted |
| Project Memory | pursuit rationale, win strategy, assumptions, executive override, kickoff summary, handoff summary |
| Readiness signals | kickoff needed, owner missing, deliverable overdue, evidence missing, assumption validation pending |
| Traceability edges | decision → assumption → estimate/kickoff deliverable → operations readiness → outcome/lesson |
| HBI evidence | citation-eligible summary records if permission and source-lineage requirements are met |
| Future-reference knowledge | closed-project comparable context after redaction/reuse gates |
| Audit events | sensitive record viewed, redaction applied, citation opened, source link launched, HBI query/refusal |

## Bounded Context

| Context | Owns | Reads | Never Owns |
|---|---|---|---|
| Source BD / Pursuit | source Go / No-Go workflow and original scorecard | project opportunity context | PCC display rules |
| PCC Preconstruction Continuity | carry-forward snapshot, memory contribution, traceability candidates, readiness signals | source templates and approved source records | original source decision |
| PCC Estimating Kickoff | future PCC-native kickoff workflow state | source workbook mapping and evidence | HR/staffing commitment authority |
| Document Control | evidence binary binding | evidence metadata and source links | preconstruction workflow decisions |
| HBI | grounded/refused response objects | eligible evidence only | source-of-truth decisions |

## User Experience Placement

Preconstruction Continuity should appear through existing PCC surfaces:

- Project Home summary cards;
- Project Readiness regions;
- Project Memory panels;
- Related Records / Traceability panels;
- Priority Actions candidate rail;
- Document Control evidence links;
- Executive Oversight drill-in;
- future Lessons Learned / Post-Bid Autopsy;
- Ask-HBI project-scoped grounded preview, when authorized.

No standalone shell route is approved in this documentation package.

## Success Criteria

A qualified user should understand:

- why HB pursued the project;
- what assumptions were made before award;
- what deliverables were required at kickoff;
- what evidence supports the carry-forward context;
- what risks/constraints/handoffs are unresolved;
- what sensitive information is withheld;
- how the preconstruction context traces into operations and future lessons.
