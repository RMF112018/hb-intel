# Prompt 00 — Authority and Scope Lock

## Objective

Audit the live repo, reconcile the current merged People & Culture implementation against the locked product decisions, and establish the exact implementation target state before changing runtime behavior.

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

1. Confirm the current HB Kudos / People & Culture file ownership model.
2. Confirm which current files are transitional, deprecated, or unsuitable as final architecture.
3. Freeze the target end-state structure for:
   - People & Culture webpart
   - HB Kudos webpart
   - HR approval companion webpart
4. Produce the exact file move/create/update/delete plan required before or during implementation.

## Instructions for the Agent

1. Inspect the current People & Culture and Kudos-related source paths.
2. Document which existing components remain viable and which are transitional only.
3. Explicitly confirm that:
   - People & Culture remains the communication surface
   - HB Kudos becomes the recognition product surface
   - the HR approval companion becomes a separate moderation/governance surface
4. Create an implementation map that names:
   - webpart entry points
   - manifest implications
   - shared contract/helper seams
   - new or expanded runtime/data hooks
   - any required UI-kit extension points
5. Record any repo-truth conflict between the locked decisions and the live implementation.
6. Do not start broad runtime rewrites in this prompt unless a tiny enabling change is required to unblock later phases.

## Deliverables

- written architecture decision note in the execution report
- exact file map for create/update/delete/move work
- confirmation of the final product-surface split
- list of blockers or repo-truth conflicts, if any

## Validation

- verify the proposed target structure is internally consistent
- verify no unnecessary packaging changes were made
- verify no runtime behavior was silently altered beyond minimal enabling edits

## Required Report Back

Return:
1. architecture conclusion
2. file ownership map
3. repo-truth conflicts
4. enabling edits made, if any
5. readiness to proceed to Prompt 01
