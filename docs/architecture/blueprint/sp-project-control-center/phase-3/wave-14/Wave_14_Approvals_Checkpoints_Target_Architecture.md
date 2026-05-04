# Wave 14 Approvals / Checkpoints Target Architecture

## Authority

Phase 14 / Wave 14 is the PCC-native approval/checkpoint control layer. It owns:

- checkpoint queue semantics;
- route-step semantics;
- decision semantics;
- audit-event semantics;
- decision-history semantics.

## Scope Boundary

This architecture governs control-plane records over source workflows. Source modules retain ownership of underlying workflow records.

System-of-record boundary lock:

- Procore owns Procore-native records.
- Sage owns accounting book-of-record fields.
- SharePoint/Document Control own file/document storage where applicable.
- Phase 14 owns approval/checkpoint governance records and lineage references.

## Control Objects

Phase 14 governance records include:

- Approval request;
- approval policy and policy version;
- route and step records;
- participant/role assignment records;
- decision history records;
- checkpoint evidence-link records;
- stale/supersession status records;
- queue and escalation posture records.

## Canonical States

`draft`, `requested`, `pending-review`, `in-review`, `revision-requested`, `approved`, `rejected-returned`, `deferred`, `waived`, `overridden`, `escalated`, `cancelled`, `superseded`, `expired`, `execution-pending`, `manually-closed`, `archived`

Terminal states:

`approved`, `rejected-returned`, `deferred`, `waived`, `overridden`, `cancelled`, `superseded`, `expired`, `manually-closed`, `archived`

## Decision and Authority Distinctions

- Reviewer: comment/recommend/revision-request posture where policy allows.
- Approver: terminal/non-terminal decision authority by policy and route mode.
- Admin verifier: technical/governance verifier; may produce `execution-pending`, not external execution authority.
- HBI: citation/summarization only, never decision actor.

## Current Action Owner (Ball-In-Court)

Each active request tracks:

- `currentActionOwnerRole`
- `currentActionOwnerPrincipalKey`
- `currentStepId`
- `currentStepMode`
- `currentSlaWindow`

The ball-in-court model drives queue assignment, escalation, and downstream gating.

## Stale and Supersession Governance

- Source version drift marks checkpoint as `stale-source` and blocks terminal decision until revalidation or supersession.
- Supersession creates linked replacement request lineage; old request transitions to `superseded`.
- Policy-version changes do not retroactively mutate active records; in-flight requests remain bound to captured policy version unless superseded.

## Guardrails

- No direct SPFx-to-Procore/Sage/Graph write execution.
- No Procore/Sage/Power Automate writeback.
- No tenant/list/group/security mutation.
- No runtime command execution authorization in this document.
- No TypeScript/runtime model implementation in this prompt.
