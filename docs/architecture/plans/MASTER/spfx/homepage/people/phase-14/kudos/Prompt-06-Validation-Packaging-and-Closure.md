# Prompt 06 — Validation, Packaging, and Closure

## Objective

Validate the full HB Kudos + HR companion implementation, reconcile remaining gaps, and rebuild/package the final SharePoint artifact.

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

1. End-to-end state-machine validation
2. Permission validation
3. Packaging validation
4. Closure report

## Instructions for the Agent

1. Validate the full workflow/state machine end to end:
   - submit
   - approve
   - approve+flag
   - revision requested
   - reject
   - reopen rejected
   - withdraw
   - remove/unpublish
   - restore
   - schedule
   - scheduled go-live
   - missed prominence fallback
2. Validate visibility rules for:
   - public user
   - submitter
   - recipient
   - HR reviewer
   - Kudos admin
3. Validate claim/reassign behavior and queue ordering.
4. Validate overdue reminders and shared presets.
5. Validate detail-panel content by audience/role.
6. Validate celebrate toggle and lifecycle count persistence.
7. Rebuild/package the final `hb-webparts.sppkg`.
8. Prove the final package contains the latest source changes and correct manifest registrations.
9. Produce a closure report naming:
   - completed work
   - validation evidence
   - remaining defects/gaps
   - package outcome

## Deliverables

- final validated runtime
- final package build
- proof of package freshness
- final closure report

## Validation

- compile/typecheck/lint as repo permits
- validate critical user flows
- validate authorization paths
- validate package generation and contents
- validate no forbidden behaviors were introduced contrary to the decision register

## Required Report Back

Return:
1. final changed-file summary
2. validation matrix
3. package build result
4. proof the package is fresh/current
5. remaining issues, if any
6. final closure recommendation
