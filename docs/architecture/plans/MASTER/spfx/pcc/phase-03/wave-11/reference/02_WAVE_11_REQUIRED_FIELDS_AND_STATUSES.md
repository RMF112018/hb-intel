# 02 — Wave 11 Required Fields and Statuses

## Core Template Fields

- `templateItemId`
- `templateVersion`
- `templateStatus`: `draft | approved | retired`
- `effectiveDateUtc`
- `retiredDateUtc`
- `sourceWorkbookType`
- `sourceFile`
- `sourceSheet`
- `sourceRow`
- `sourceSection`
- `sourceTask`
- `sourceAssignments`
- `normalizedAssignments`
- `requiresUserReview`
- `mappingNotes`
- `sourceSnapshotMetadata`

## Project Instance Fields

- `projectId`
- `responsibilityItemId`
- `templateItemId`
- `templateVersion`
- `title`
- `description`
- `domain`
- `criticality`
- `lifecycleGate`
- `status`
- `accountableOwner`
- `responsibleOwners`
- `supportingOwners`
- `consultedOwners`
- `informedOwners`
- `currentActionOwner`
- `dueDateUtc`
- `escalationStatus`
- `workflowSteps`
- `handoffHistory`
- `exceptions`
- `evidenceLinks`
- `decisionRights`
- `contractPartyMapping`
- `auditEvents`

## RACI and Extended Assignment Semantics

- RACI: `Responsible`, `Accountable`, `Consulted`, `Informed`
- Extended assignment semantics: `Support`, `Review`, `Sign-Off`, `Watcher`, `Current Action Owner`, `Decider`, `Driver`, `Contributor`
- Source workbook marks: `X`, `Support`, `Review`, `Sign-Off`
- Workbook marks must not be blindly converted into final RACI without explicit policy.

## Contract-Party Mapping

- `Owner`
- `Architect`
- `Engineer`
- `Consultant`
- `Contractor`
- `Subcontractor`
- `Authority Having Jurisdiction`
- `Other`

Hard rule: contract-party `C = Contractor` is never RACI `C = Consulted`.

## Exception Types

- `missing-accountable-owner`
- `missing-responsible-owner`
- `missing-current-action-owner`
- `role-vacant`
- `person-inactive`
- `overdue-current-action`
- `handoff-required`
- `conflicting-assignments`
- `unresolved-contract-party-mapping`
- `owner-contract-source-ambiguous`
- `missing-required-evidence-reference`
- `decision-rights-gap`
- `template-source-review-required`

## Health Score Inputs

- unresolved critical exceptions
- missing accountable/current-action owners
- overdue current actions
- pending required evidence references
- unresolved decision-rights gaps
- unresolved owner-contract ambiguity
- inactive/vacant role assignments
- source-health warnings

## Required Counts

- `109` workbook-derived task-row context
- `98` strict marked assignment rows
- `82` PM task rows
- `27` Field marked rows
- `0` owner-contract active default obligations
