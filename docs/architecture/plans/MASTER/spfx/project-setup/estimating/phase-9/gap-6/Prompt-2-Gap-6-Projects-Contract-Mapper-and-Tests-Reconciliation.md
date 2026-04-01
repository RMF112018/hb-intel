# Prompt 2 — Gap 6 Projects Contract, Mapper, and Tests Reconciliation

## Objective

Reconcile the repo-owned `Projects` contract, mapper, validation, and tests to the re-baselined Gap 6 target model.

## Context

The original repo-owned `Projects` contract reflected an older field model. The latest clarified model is narrower and semantically cleaner.

Key expected changes:
- retire the old `projectLeadId` concept in favor of `leadEstimatorUpn`
- remove `additionalTeamMemberUpns`
- keep `groupMembers` as the standard read/write member field
- keep `viewerUPNs` as additive read-only exceptions only
- align `addOns` to the real SharePoint internal name `addOns`

## Files to inspect first

- `backend/functions/src/services/projects-list-contract.ts`
- `backend/functions/src/services/projects-list-mapper.ts`
- any `Projects` repository / service files that directly read or write these fields
- relevant models under `packages/models/**` and/or Project Setup shared models
- relevant validation logic under backend request / provisioning services
- tests under `backend/functions/src/services/__tests__/**`
- Prompt 1 outputs:
  - `Gap-6-Closeout-Summary-and-Execution-Plan.md`
  - `Gap-6-Rebaseline-and-Target-Contract-Freeze.md`

## Required tasks

1. Reconcile the repo-owned field map to the intended target model.
   At minimum:
   - remove `projectLeadId` if it still exists as a distinct retained domain field
   - remove `additionalTeamMemberUpns`
   - confirm `viewerUPNs` remains retained
   - confirm `addOns` maps to `addOns` rather than a legacy internal-name assumption if repo truth still uses `field_19`
   - confirm `groupMembers` and `groupLeaders` remain retained with the clarified semantics

2. Reconcile mapper behavior.
   - ensure read/write logic matches the current retained field model
   - ensure removed fields are no longer serialized, parsed, or expected
   - ensure docs/comments do not describe `viewerUPNs` as full effective viewers
   - ensure docs/comments do not imply `groupMembers` and `additionalTeamMemberUpns` coexist

3. Reconcile validation rules.
   - remove validation expectations for fields no longer retained
   - ensure any required-field logic remains correct for the new model

4. Reconcile tests.
   - update or remove stale tests tied to:
     - `projectLeadId`
     - `additionalTeamMemberUpns`
     - legacy `field_19` assumptions if any
   - add or update tests proving:
     - `viewerUPNs` round-trips as a retained json-array field
     - `groupMembers` remains the retained read/write member field
     - `addOns` round-trips using the actual retained SharePoint field mapping
     - removed fields are no longer part of the contract

5. Update documentation inline where appropriate:
   - comments in contract / mapper files
   - any README or field-map explanation touched by these changes

## Deliverables

Code / test updates in repo-owned implementation, plus a dedicated reconciliation note:

- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-Projects-Contract-Reconciliation.md`

## Required report content

The reconciliation note must include:
1. What changed in the repo contract
2. Which fields were removed and why
3. Which fields were retained and with what final semantics
4. Test evidence added or updated
5. Any remaining environment residuals that repo changes cannot close

## Acceptance criteria

- `projectLeadId` is no longer treated as a separately retained contract field if repo truth supports the semantic replacement
- `additionalTeamMemberUpns` is no longer retained anywhere that matters to the `Projects` contract
- `viewerUPNs`, `groupMembers`, `groupLeaders`, and `addOns` are documented with the final intended semantics
- Tests pass and prove the retained field behavior
- No stale contract/documentation language remains in the touched files
