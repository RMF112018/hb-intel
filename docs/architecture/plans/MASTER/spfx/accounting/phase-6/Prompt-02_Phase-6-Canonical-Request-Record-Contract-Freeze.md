# Prompt-02 — Phase 6: Canonical Request-Record Contract Freeze

## Objective

Based on the Phase 6 audit findings, author and implement the authoritative canonical Project Setup request-record contract so the repo has one clear persistence model.

## Required work

1. Define the canonical Project Setup request-record contract covering:
   - immutable identifiers
   - human/business identifiers
   - workflow state fields
   - submission/review fields
   - clarification fields
   - completion fields
   - provisioning linkage fields
   - optional metadata fields

2. Update or author the authoritative reference documentation describing:
   - which fields are required by contract
   - which fields are optional
   - field purpose
   - field source-of-truth
   - whether the field is user-entered, system-assigned, or derived

3. Reconcile any conflicts between:
   - current repo implementation
   - current repo docs
   - prior plan docs
   - current-state docs

4. Save the contract reference to an appropriate authoritative path under:
   - `docs/reference/`
   - and update any linked review/current-state docs as needed

## Required output

Produce:
- the canonical request-record contract document
- any necessary code comments / type clarifications
- a short change summary appended to:
  - `docs/architecture/reviews/project-setup-phase-6-data-contract-and-schema-audit.md`

## Rules

- Freeze the contract based on repo truth first, then improve clarity.
- Do not redesign unrelated workflow behavior.
- Be explicit about system key vs business key semantics.
- Preserve backward compatibility unless the repo evidence justifies a hard break.
