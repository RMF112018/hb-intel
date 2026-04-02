# Prompt-06 — Evidence Storage, Retention, and Export Boundaries

## Objective

Implement and document the evidence-handling boundaries for Phase 4, especially:
- what evidence is stored inline,
- what evidence must be offloaded or referenced,
- how retention class metadata is represented,
- and what export/retrieval boundary exists for operator review.

## Important execution rules

- Do **not** re-read files already in context unless needed.
- Follow the evidence doctrine from the Phase 4 baseline.
- Keep enforcement proportional to current repo maturity.
- Prioritize explicit boundaries over speculative enterprise-scale features.

## Inputs

Use:
- Phase 4 baseline docs
- the generalized stores and retrieval APIs already created
- any helper utilities introduced for evidence-manifest handling

## Required implementation work

### A. Evidence boundary implementation
Implement the evidence handling approach defined in the baseline, including:
- inline evidence eligibility
- oversized evidence handling path
- manifest/reference fields
- safe serialization / normalization

If the chosen path requires a Blob reference model, implement only the minimal helper/support necessary for a repo-safe Phase 4 landing.
Do not create a massive storage subsystem unless the repo already clearly supports it.

### B. Retention metadata
Represent retention / disposition metadata in the run/audit/evidence model even if full policy enforcement is partly deferred.
At minimum, runs and evidence should carry enough metadata to support later enforcement.

### C. Retrieval / export safeguards
Define or implement the minimum safe boundary for:
- evidence retrieval,
- export readiness,
- redaction or omission of unsafe payload content where needed.

## Required tests

Add targeted tests for:
- inline vs oversized evidence decision behavior
- evidence manifest serialization
- any offload/reference helper behavior
- retrieval-safe shaping of evidence payloads

## Required documentation updates

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-4/admin-spfx-phase-4-evidence-and-retention-boundaries.md`

It must cover:
- authoritative evidence strategy,
- inline vs offloaded thresholds / rules,
- retention metadata model,
- export/retrieval boundary,
- deferred policy-enforcement items.

## Validation

Run the smallest justified checks and tests for touched files.

## Completion condition

Stop when evidence handling boundaries are implemented and documented clearly enough for later phases to rely on them.
