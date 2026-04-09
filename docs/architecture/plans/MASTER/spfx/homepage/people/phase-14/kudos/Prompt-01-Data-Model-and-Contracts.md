# Prompt 01 — Data Model and Contracts

## Objective

Implement the explicit state/contract model needed to support the locked HB Kudos workflow, recipient model, permissions, scheduling, prominence, queueing, and audit behavior.

## Required Inputs

- live repo: `https://github.com/RMF112018/hb-intel`
- `apps/hb-webparts/src/webparts/peopleCulture/`
- adjacent homepage/data/contracts/helper seams
- `packages/ui-kit/`
- `docs/reference/ui-kit/`
- `Decision-Lock-Appendix.md`
- `Plan-Summary.md`

## Governing Rules

- Treat repo truth as authoritative.
- Implement the locked decisions exactly unless a hard repo-truth conflict prevents it.
- Do not preserve the current merged People & Culture architecture as the end-state for Kudos.
- Do not re-read files that are still within your current context window or memory unless you need to verify a specific uncertain detail.
- Preserve SPFx packaging discipline and shared import discipline.
- Prefer narrow, controlled edits over speculative rewrites unless a structural change is clearly required by the locked product shape.

## Scope

1. Add or normalize the explicit workflow/status model.
2. Replace weak/inferred state handling with clear contracts.
3. Prepare the data model for the dedicated Kudos product and HR companion workspace.

## Instructions for the Agent

1. Identify all current Kudos-related types, interfaces, normalizers, hooks, and submission sources.
2. Introduce or normalize explicit contract support for:
   - Pending
   - Revision Requested
   - Approved
   - Rejected
   - Withdrawn
   - Approved/Scheduled
   - Removed/Unpublished
   - Flagged for Admin Review
3. Introduce contract support for:
   - shared role model
   - claim owner / reassignment
   - overdue state
   - scheduled publish metadata
   - featured/pinned/standard prominence state
   - pin order
   - admin review flag
   - audit timeline events
   - associated-party visibility distinctions
4. Rework recipient contracts so the final model supports:
   - individual recipients
   - team recipients
   - department recipients
   - project group recipients
   - mixed recipient types in one submission
5. Eliminate dependence on the plain text pseudo-recipient input as the authoritative submission model.
6. Ensure the contract layer can support shared operational filter/preset behavior.
7. Keep the shape strongly typed and aligned with the existing SharePoint list where practical.
8. If the current list schema cannot express a needed state directly, define the app-layer model and clearly document the mapping.

## Deliverables

- updated contracts/types
- updated normalization/helpers/hooks as needed
- clear status/state mapping
- explicit recipient model
- explicit prominence/scheduling model
- explicit work-management and audit model

## Validation

- typecheck all changed files
- verify existing consumers are either updated or clearly marked for follow-on prompt work
- verify no hidden status inference remains where explicit state is required

## Required Report Back

Return:
1. contracts changed
2. status/state model implemented
3. recipient model implemented
4. SharePoint mapping assumptions
5. follow-on files that must be updated next
