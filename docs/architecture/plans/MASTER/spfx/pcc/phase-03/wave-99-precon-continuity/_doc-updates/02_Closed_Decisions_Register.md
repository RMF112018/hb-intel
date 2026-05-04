# 02 — Closed Decisions Register

## Status

These decisions are closed for this documentation-update package. Do not leave them open in the generated repo docs.

## Unified Lifecycle Alignment Decisions

| ID | Decision | Required Implementation Meaning |
|---|---|---|
| PC-001 | Preconstruction Continuity is a lifecycle continuity layer. | It contributes lifecycle events, Project Memory, traceability edges, readiness signals, priority-action candidates, HBI evidence, and future-reference knowledge. |
| PC-002 | Preconstruction Continuity is not a standalone shell route. | No `preconstruction-continuity`, `go-no-go`, or `estimating-kickoff` shell route may be proposed unless future route taxonomy authorizes it. |
| PC-003 | Go / No-Go is source-owned upstream. | PCC owns only read-only carry-forward projection after GO, plus source lineage, classification, and display rules. |
| PC-004 | Go / No-Go source decisions are immutable after final decision. | PCC projection may be superseded only by a newer source-backed projection, never manually overwritten. |
| PC-005 | Estimating Kickoff remains later-phase. | Document it as a future Project Readiness / Preconstruction workflow module, not a current MVP route. |
| PC-006 | Estimating Kickoff assignments are workflow commitments. | They are not HR/staffing commitments and cannot be treated as staffing allocation authority. |
| PC-007 | Source templates are field inventory and seed taxonomy. | They are not target UX, not source-system replacement, and not a workbook clone mandate. |
| PC-008 | All source-derived values require source lineage. | Every carry-forward fact, assignment, date, score, comment, assumption, and evidence link must trace to source. |
| PC-009 | Sensitive pursuit content is permission-filtered. | Executive notes, margin strategy, client sensitivity, BD rationale, and committee comments require classification and redaction rules. |
| PC-010 | HBI must follow the unified lifecycle HBI citation/refusal contract. | No uncited answers, no source-of-truth claims, no restricted summarization, and refusal when evidence is insufficient. |
| PC-011 | Preconstruction continuity records create traceability edges. | Edges must connect pursuit decision → assumptions → estimate/kickoff deliverables → readiness/handoff → operations outcomes → lessons/future reference. |
| PC-012 | Priority Actions are candidate signals only. | They do not execute external changes, staffing actions, approvals, or source-system mutations. |
| PC-013 | Document Control owns evidence binary binding. | Preconstruction continuity records store evidence links/classifications only. |
| PC-014 | Live integrations are future-gated. | No CRM/Unanet, Procore, Sage, Autodesk, BuildingConnected, Graph, Power Automate, SharePoint REST/PnP runtime in this docs package. |
| PC-015 | Project Memory is curated, not a second source of truth. | Memory summaries reference source lineage and may be superseded but cannot override source records. |

## Required Governance Sentence

Use this sentence in the target architecture and governing-doc alignment where appropriate:

```text
Preconstruction Continuity is a unified lifecycle carry-forward layer that preserves pursuit, estimating, kickoff, assumptions, evidence, and handoff context as permission-filtered Project Memory, lifecycle events, readiness signals, traceability edges, and future-reference knowledge without creating a separate departmental workspace or replacing source systems.
```

## Required Relationship to Existing Module Register

- `estimating-kickoff` should remain later-phase unless repo truth has already changed.
- If `estimating-kickoff` is registered, docs must preserve later-phase posture and avoid enabling runtime work.
- Go / No-Go should not be added as a new MVP workflow module in this documentation pass.
