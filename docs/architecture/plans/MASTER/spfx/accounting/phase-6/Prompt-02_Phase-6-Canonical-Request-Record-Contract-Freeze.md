# Prompt-02 — Phase 6: Canonical Request-Record Contract Freeze

## Objective

Based on the Phase 6 audit findings, author and implement the authoritative canonical Project Setup request-record contract so the repo has one clear persistence model.

## Required work

1. Define the canonical Project Setup request-record contract covering:
   - persisted system-key semantics
   - human/business identifier semantics
   - workflow state fields
   - submission/review fields
   - clarification fields
   - completion fields
   - provisioning linkage fields
   - optional metadata fields

2. Be explicit about identifier semantics:
   - whether `requestId` and `projectId` are currently aliased by contract
   - whether they are intentionally distinct
   - whether Phase 6 is only documenting current aliasing
   - or whether Phase 6 is deliberately implementing a separation/migration

3. Update or author the authoritative reference documentation describing:
   - which fields are required by contract
   - which fields are optional
   - field purpose
   - field source-of-truth
   - whether the field is user-entered, system-assigned, derived, or compatibility-only

4. Reconcile any conflicts between:
   - current repo implementation
   - current repo docs
   - prior plan docs
   - current-state docs
   - stale code comments inside mapper / contract / repository modules

5. Save the contract reference to an appropriate authoritative path under:
   - `docs/reference/`
   - and update any linked review/current-state docs as needed

## Required output

Produce:
- the canonical request-record contract document
- any necessary code comments / type clarifications
- a short change summary appended to:
  - `docs/architecture/reviews/project-setup-phase-6-data-contract-and-schema-audit.md`

## Hard requirements

- Freeze the contract based on repo truth first, then improve clarity.
- Do not redesign unrelated workflow behavior.
- Be explicit about system key vs business key semantics.
- Do not silently invent a clean `requestId` / `projectId` separation if the repo still aliases them.
- If you choose to separate them, treat it as a deliberate migration with compatibility consequences that must be documented.

## Acceptance criteria

- the repo has one authoritative request-record contract
- identifier semantics are explicit rather than implied
- required vs optional fields are explicit
- downstream prompts can rely on the contract without key ambiguity
