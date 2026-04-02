# Prompt-02 — Canonical Run, Audit, and Evidence Baseline

## Objective

Create the canonical Phase 4 architecture and contract baseline for:

- generalized admin run history,
- generalized admin audit events,
- evidence metadata / manifests,
- and evidence-handling boundaries.

This prompt defines the model and doctrine that the implementation prompts must follow.

## Important execution rules

- Do **not** re-read files already in active context unless necessary.
- Use the Phase 4 repo-truth audit as the immediate evidence base.
- Do not restart Phase 2 domain modeling from scratch.
- Keep the baseline tightly scoped to durable history, auditability, and evidence.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-4/admin-spfx-phase-4-repo-truth-audit.md`
- `docs/architecture/reviews/phase-4-provisioning-status-and-saga-audit.md`
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md`

## Create

1. `docs/architecture/plans/MASTER/spfx/admin/phase-4/admin-spfx-phase-4-run-audit-evidence-baseline.md`
2. `docs/architecture/plans/MASTER/spfx/admin/phase-4/admin-spfx-phase-4-persistence-boundary-matrix.md`

## Required baseline content

The baseline doc must define at minimum:

### A. Canonical concepts
- admin run
- admin run status / lifecycle
- audit event
- checkpoint event
- operator action attribution
- config / standards version attribution
- evidence item
- evidence manifest
- evidence retention class
- inline evidence vs offloaded evidence

### B. Required durable capture dimensions
Every generalized admin run should be designed to capture, where relevant:
- run identity
- correlation / parent correlation
- run type / action type
- domain
- risk level / execution mode
- operator identity
- initiation source
- timestamps
- checkpoint history
- config / standards snapshot reference
- output summary
- failure summary
- linked evidence references

### C. Required audit-event classes
Define at minimum the event-class taxonomy for:
- run launched
- checkpoint entered
- checkpoint approved / rejected
- step / stage advanced
- run retried
- run repaired
- run completed
- run failed
- administrative override / force transition
- export / evidence retrieval (if applicable)

### D. Storage doctrine
Define which kinds of data belong in:
- generalized run store
- generalized audit store
- evidence metadata store
- oversized evidence storage target
- compatibility sinks (for example, existing SharePoint audit list writes)

### E. Retention and redaction doctrine
State how retention classes and redaction boundaries should be represented now, even if some enforcement is deferred.

## Required matrix content

The persistence boundary matrix must include rows for:
- canonical run record
- append-only audit event
- checkpoint record
- signalR event
- compatibility status projection
- compatibility SharePoint audit write
- evidence manifest
- oversized raw evidence
- operator-facing retrieval payload
- export payload

Columns must include:
- concern
- authoritative store
- compatibility store(s)
- why it belongs there
- what must not own it
- current repo anchor
- Phase 4 action

## Design constraints that must be explicit

- Do not break existing provisioning status reads while introducing the generalized spine.
- Do not make SharePoint the authoritative audit backbone for generalized admin history.
- Do not assume all evidence fits safely in Azure Table entity payloads.
- Do not force a full orchestration rewrite to land Phase 4.
- Preserve attribution and reviewability for single-admin high-risk actions.

## Validation

Before finishing:
- ensure the baseline uses current repo truth, not imagined future infrastructure,
- ensure the boundary matrix is concrete enough to implement from,
- ensure the docs are explicit about authoritative vs compatibility stores.

## Completion condition

Stop after both docs are complete and cross-linked.
