# Prompt 06 — Audit, Evidence, Config, and Standards Contract Model

## Objective

Define the contract model that makes admin actions reconstructable, explainable, and traceable to the standards/configuration state that governed them.

## Context efficiency rule

Do **not** re-read already-loaded files unless you need to verify a direct dependency or naming collision.

## Required repo-truth context

Use:
- the run model
- the checkpoint model
- the action catalog
- the current admin-intelligence README and any existing alert/probe/audit-related docs as needed
- the end-state plan’s hybrid source-of-truth requirement

## Scope of work

Define contract models for:
- audit records
- evidence records / evidence references
- config snapshot references
- standards version references
- run-to-config traceability
- operator attribution
- reason / rationale capture
- post-run validation summary references

Clarify what belongs in:
- run record,
- checkpoint record,
- audit record,
- evidence reference,
- config / standards snapshot reference.

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-2/admin-control-plane-audit-evidence-and-config-contracts.md`

Create or update shared types in:

- `packages/models/src/admin-control-plane/`

At minimum define:
- audit record interface
- evidence reference interface
- config snapshot reference interface
- standards reference interface
- rationale / reason capture DTOs
- post-run validation summary reference DTOs

Export them through `@hbc/models`.

## Implementation requirements

- Preserve the hybrid standards/configuration model:
  - code-defined defaults,
  - governed live-admin-maintained overrides where appropriate,
  - versioning and auditability.
- Keep references normalized and linkable rather than embedding large mutable payloads directly in every run contract.
- Make it possible for later phases to show operators “what standard/config state governed this run.”

## Documentation requirements

The contract doc must include:
- record-type separation table,
- traceability rules,
- retention / linkage considerations at the contract level,
- examples for provisioning, repair, and standards-application scenarios.

## Validation requirements

- Verify consistency with previously authored DTOs.
- Run targeted type checks for changed exports.
- Confirm the model does not force a storage implementation in this phase.

## Acceptance / completion conditions

This prompt is complete when:
- the repo has one coherent audit/evidence/config contract model,
- the shared references compile,
- and the contract set supports future traceability without premature storage design lock-in.

## No-go boundaries

- Do not implement actual persistence stores.
- Do not build UI browsing surfaces for audit history.
