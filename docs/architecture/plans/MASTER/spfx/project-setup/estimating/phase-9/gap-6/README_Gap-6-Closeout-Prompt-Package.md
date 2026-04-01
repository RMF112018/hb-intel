# Gap 6 Closeout Prompt Package — Project Setup SharePoint Schema / Contract Reconciliation

## Objective

This package instructs the local code agent to comprehensively close **Gap 6** for the Project Setup / Estimating solution using the **latest live-environment schema evidence** and the clarified target field semantics.

Gap 6 began as a SharePoint schema/environment mismatch. Since then, the environment and the intended contract have both changed. The prompts in this package are ordered to:

1. Re-baseline Gap 6 against the latest schema exports and clarified semantics
2. Reconcile the repo-owned `Projects` contract to the actual intended field model
3. Add / align the repo-owned contract and adapters for the new `projectViewerGroups` list
4. Reconcile docs, runbooks, reviews, and evidence so the repo truth is honest
5. Finish with a final closure audit that states what is closed and what, if anything, still remains environment-gated

## Authoritative inputs

The local code agent must treat these as authoritative for this effort:

- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Projects-list-schema.csv`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/projectViewerGroups-list-schema.csv`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/project-setup-sharepoint-schema-environment-gap-validation.md`

The agent must also use live repo truth, especially:

- `backend/functions/src/services/projects-list-contract.ts`
- `backend/functions/src/services/projects-list-mapper.ts`
- `backend/functions/src/services/**`
- Any Project Setup provisioning / request lifecycle services that read or write `Projects`
- Relevant tests under `backend/functions/src/services/__tests__/**`
- Relevant docs under:
  - `docs/architecture/reviews/**`
  - `docs/architecture/plans/MASTER/spfx/project-setup/estimating/**`

## Locked semantic decisions

The prompts assume these decisions are now the intended model unless repo truth proves a conflict that must be surfaced explicitly:

- `leadEstimatorUpn` supersedes the old `projectLeadId` concept
- `groupMembers` = standard read/write site members / core project team members
- `groupLeaders` = elevated workflow/project leaders, not a generic site-membership catchall
- `viewerUPNs` = **project-level additive read-only exceptions only**
- Department-based default read-only audiences come from the new `projectViewerGroups` list
- `addOns` remains a retained field and now uses the actual SharePoint internal name `addOns`
- `additionalTeamMemberUpns` has been removed because it overlapped with `groupMembers`

## Prompt order

Run the prompts in this exact order:

1. `Prompt-1-Gap-6-Rebaseline-and-Target-Contract-Freeze.md`
2. `Prompt-2-Gap-6-Projects-Contract-Mapper-and-Tests-Reconciliation.md`
3. `Prompt-3-Gap-6-projectViewerGroups-Contract-Adapter-and-Usage-Alignment.md`
4. `Prompt-4-Gap-6-Documentation-Runbook-and-Review-Reconciliation.md`
5. `Prompt-5-Gap-6-Final-Closure-Audit-and-Evidence-Pack.md`

## Expected deliverables across the full package

By the end of the full sequence, the repo should contain:

- An updated Gap 6 summary / execution-plan file
- Reconciled `Projects` list contract, mapper, tests, and documentation
- A repo-owned contract / adapter path for `projectViewerGroups`
- Updated documentation explaining:
  - final field semantics
  - what changed from the original 43-field model
  - what is closed
  - what, if anything, remains environment-gated
- A final closure audit with explicit evidence and no ambiguity

## Working rules for the local code agent

- Treat live repo truth as authoritative
- Treat the two schema CSVs above as the authoritative environment evidence for this Gap 6 effort
- Do not assume older reports are still fully current; reconcile them
- Do not re-read files that are already in your active context or memory unless needed to verify a contradiction or capture exact evidence
- Make changes in repo-owned code and docs only
- If a remaining environment action is still required, document it precisely rather than pretending the repo alone closed it
- Keep the final reporting honest and explicit

## Package summary file

This package includes a dedicated summary / action-plan file:

- `Gap-6-Closeout-Summary-and-Execution-Plan.md`

That file should be updated by Prompt 1 and then referenced / refined by later prompts as needed.
