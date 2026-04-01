# Gap 6 Closeout Summary and Execution Plan

## Purpose

This file is the authoritative summary and execution-plan anchor for closing Gap 6: the SharePoint schema / environment gap for Project Setup, as revised by the latest schema evidence and clarified field semantics.

## Original gap

Gap 6 originally identified a mismatch between the repo-owned `Projects` contract and the live SharePoint environment, especially for JSON-array fields stored as `Text (255)` instead of `MultiLineText`, along with several missing fields.

## What has changed since the original validation

The environment and intended contract have changed materially:

- The live `Projects` list now includes `viewerUPNs` and `addOns`
- Several previously at-risk JSON-array fields on `Projects` have been migrated to `Note`
- The business semantics have been clarified:
  - `leadEstimatorUpn` supersedes the old `projectLeadId` concept
  - `viewerUPNs` now means additive **read-only** exceptions only
  - `groupMembers` remains the standard read/write members field
  - `additionalTeamMemberUpns` has been removed because it overlapped with `groupMembers`
- A new `projectViewerGroups` list now exists to drive department-based default viewer-group policy

## Current target architecture for Gap 6 closure

### Projects list
Retained key semantics:
- `groupMembers` = standard read/write members / core project team members
- `groupLeaders` = elevated workflow/project leaders
- `viewerUPNs` = project-level additive read-only exceptions only
- `addOns` = retained JSON-array field using the actual internal name `addOns`
- `leadEstimatorUpn` = authoritative replacement for the old `projectLeadId` concept

### projectViewerGroups list
Purpose:
- authoritative default viewer-group policy by department

Target semantic shape:
- department key
- JSON array of default viewer-group IDs
- human-readable group names / labels
- active flag
- review timestamp
- notes

### Effective viewer model
Effective read-only membership should be computed as:

`department default viewer groups + project-level viewerUPNs exceptions`

## Closure strategy

1. Re-baseline the gap against the latest environment evidence
2. Reconcile the repo-owned `Projects` contract, mapper, validation, tests, and docs to the new intended field model
3. Add / align a repo-owned contract and adapter layer for `projectViewerGroups`
4. Reconcile all affected docs / reports / runbooks
5. Produce a final closure audit that states exactly what is closed and what, if anything, remains environment-gated

## Explicit questions this closeout must answer

- Which originally reported Gap 6 findings are now fully closed?
- Which original fields must be removed from the repo contract because the target model changed?
- Does the repo now align with the latest `Projects` list schema?
- Does the repo now align with the latest `projectViewerGroups` schema?
- Are any remaining environment actions still required?
- Can Gap 6 be honestly marked closed after repo reconciliation, or only substantially closed with specific residuals?

## Final output expectation

This file should be updated during Prompt 1 and used as the reference point for later documentation reconciliation and final closure.
