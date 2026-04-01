# Prompt 1 — Gap 6 Re-baseline and Target Contract Freeze

## Objective

Re-baseline Gap 6 using the latest environment schema evidence and the clarified target field semantics, then freeze the intended target contract before any implementation or documentation reconciliation proceeds.

## Context

Gap 6 was originally validated against an older live `Projects` schema state. Since then:

- the `Projects` list has changed
- the `projectViewerGroups` list has been introduced
- field semantics have changed materially

You must not assume the old Gap 6 validation still describes the current target state.

## Authoritative files to inspect first

Environment evidence:
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Projects-list-schema.csv`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/projectViewerGroups-list-schema.csv`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/project-setup-sharepoint-schema-environment-gap-validation.md`

Repo contract / implementation truth:
- `backend/functions/src/services/projects-list-contract.ts`
- `backend/functions/src/services/projects-list-mapper.ts`
- relevant request / provisioning services under `backend/functions/src/services/**`
- relevant tests under `backend/functions/src/services/__tests__/**`

Existing summary file to update:
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-Closeout-Summary-and-Execution-Plan.md`
  - If this file does not exist yet in repo, create it using the package summary file as the starting point.

## Locked semantic decisions to apply unless repo truth proves a blocking conflict

- `leadEstimatorUpn` supersedes the old `projectLeadId` concept
- `groupMembers` = standard read/write site members / core project team members
- `groupLeaders` = elevated workflow/project leaders
- `viewerUPNs` = additive read-only exceptions only
- `projectViewerGroups` = department-based default viewer-group policy
- `addOns` uses the real internal name `addOns`
- `additionalTeamMemberUpns` is removed from the intended model because it overlapped with `groupMembers`

## Required tasks

1. Audit the latest `Projects` schema and identify:
   - fields that now match the intended contract
   - fields that still do not match
   - fields whose meaning has changed
   - fields that should no longer be expected by the repo contract

2. Audit the latest `projectViewerGroups` schema and identify:
   - whether it is sufficient for the intended department-default viewer model
   - any remaining type issues or structural issues
   - whether its current shape is acceptable for launch or still needs an explicit residual note

3. Compare the current repo-owned contract against the new intended model and classify each relevant mismatch as:
   - repo contract cleanup
   - mapper / implementation cleanup
   - documentation cleanup
   - still-environment-gated
   - no longer a gap because the target model changed

4. Update:
   - `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-Closeout-Summary-and-Execution-Plan.md`

5. Create or update a dedicated re-baseline memo:
   - `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-Rebaseline-and-Target-Contract-Freeze.md`

## Required output content

The re-baseline memo must include:

1. Executive summary
2. What changed since the original Gap 6 validation
3. Current target field semantics
4. Current environment evidence summary for both lists
5. Repo-contract mismatches that now need code/doc reconciliation
6. Explicit list of original Gap 6 findings that are:
   - still valid
   - superseded by new target semantics
   - partially valid
   - now closed by environment updates
7. A precise implementation order for the remaining Gap 6 repo work

## Acceptance criteria

- The memo explicitly states the new intended meanings of:
  - `groupMembers`
  - `groupLeaders`
  - `viewerUPNs`
  - `leadEstimatorUpn`
  - `addOns`
- The memo explicitly states whether `projectLeadId` and `additionalTeamMemberUpns` should remain in the repo contract
- The execution-plan file is updated to reflect the re-baselined reality
- The output is specific enough that subsequent prompts can execute without redoing the conceptual analysis
