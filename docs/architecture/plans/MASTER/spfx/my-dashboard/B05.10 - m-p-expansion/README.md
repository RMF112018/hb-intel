# My Projects Multi-Platform Launch Expansion — Implementation Package

## Purpose

This package defines the complete implementation path for expanding **My Dashboard → My Projects** from its current SharePoint + Procore launch posture into a **multi-platform assigned-project launch surface** that also supports:

- **Autodesk BuildingConnected**
- **Document Crunch**
- **Cross-source Project Stage continuity**

It is written for execution by a local code agent working in the `hb-intel` repository.

## What this package closes

The implementation must deliver all of the following:

1. **Source-list schema expansion**
   - Add `buildingConnectedUrl` and `documentCrunchUrl` to:
     - `Projects`
     - `Legacy Project Fallback Registry`
   - Add `projectStage` to:
     - `Legacy Project Fallback Registry`
   - Reuse existing Projects `ProjectStage` field through the existing mapped field:
     - domain property: `projectStage`
     - SharePoint internal field: `field_6`

2. **Provisioning and readiness expansion**
   - Extend the My Projects source-list descriptor.
   - Extend provisioning dry-run/apply behavior.
   - Extend the readiness verifier and readiness helper.
   - Update schema/operator docs.

3. **Read-model contract expansion**
   - Expand `MyProjectLinkItem` with:
     - `buildingConnectedAction`
     - `documentCrunchAction`
   - Expand warnings and summary counts.
   - Preserve current SharePoint and Procore behavior.
   - Preserve `dualLaunchReadyCount` as a backward-compatible SharePoint + Procore metric.
   - Add a new all-platform metric rather than repurposing existing fields.

4. **Backend provider expansion**
   - Read the new source-list fields.
   - Resolve project-stage continuity:
     - Projects row: existing `projectStage`
     - Legacy-only row: Registry `projectStage`
     - Merged row: prefer Projects `projectStage`, fallback to Registry `projectStage` only when Projects stage is absent
   - Build BuildingConnected and Document Crunch launch actions.
   - Keep source-of-record behavior:
     - Projects-backed items use Projects link values.
     - Legacy-only items use Registry link values.
     - Merged items do not silently source external-platform links from Registry when Projects values are absent.

5. **Frontend launch UX expansion**
   - The existing per-tile launch menu must show:
     - SharePoint
     - Procore
     - BuildingConnected
     - Document Crunch
   - Update masthead/support copy from dual-platform wording to multi-platform wording.
   - Replace per-platform unavailable hints with a single scalable consolidated hint.

6. **Fixtures, tests, docs, validation**
   - Update fixtures and tests across models, provider, and frontend.
   - Update docs that still describe My Projects as “dual launch.”
   - Produce final validation evidence and commit guidance.

## Package structure

```text
README.md
00_Current_Repo_Truth_Baseline.md
01_Locked_Product_And_Schema_Decisions.md
02_Detailed_Implementation_Plan.md
03_File_Impact_Matrix.md
04_Validation_And_Live_Operator_Runbook.md
05_Acceptance_Criteria.md
PACKAGE_MANIFEST.md

prompts/
  Prompt_01_Repo_Truth_Lock_And_Final_Patch_Plan.md
  Prompt_02_Schema_Provisioning_And_Readiness_Expansion.md
  Prompt_03_Read_Model_Contracts_And_Backend_Provider_Expansion.md
  Prompt_04_My_Projects_Frontend_Multi_Platform_Launch_UX.md
  Prompt_05_Fixtures_Tests_Docs_And_Regression_Hardening.md
  Prompt_06_Final_Integration_Validation_And_Commit_Closeout.md

supporting/
  Field_Contract_Table.md
  Test_Matrix.md
  Git_Commit_Guidance.md
  Agent_Context_Seed.md
```

## Execution order

Use the prompt series in order.

1. Prompt 01 — Reconfirm current repo truth and produce a final patch plan.
2. Prompt 02 — Implement schema/provisioning/readiness changes.
3. Prompt 03 — Implement shared contracts and backend provider changes.
4. Prompt 04 — Implement frontend launch/menu/UI changes.
5. Prompt 05 — Finish fixtures, tests, docs, and regression hardening.
6. Prompt 06 — Run final validation and produce commit closeout.

## Locked implementation posture

Do not leave the following decisions open:

- New SharePoint fields are **Text** fields, not URL fields.
- New internal names are:
  - `buildingConnectedUrl`
  - `documentCrunchUrl`
  - `projectStage` on Registry only
- New Projects `projectStage` field must **not** be created; use existing `field_6`.
- Projects-backed merged items use Projects external links; Registry external links are for legacy-only rows.
- `dualLaunchReadyCount` remains SharePoint + Procore for compatibility.
- Add `multiPlatformReadyCount` for all four launch destinations.
- Add individual ready/unavailable counts for BuildingConnected and Document Crunch.
- Frontend menu order is:
  1. SharePoint
  2. Procore
  3. BuildingConnected
  4. Document Crunch

## Live-tenant sequencing note

This package prepares the code and scripts to provision the added fields. It does **not** assume those fields already exist in SharePoint. The final runbook includes the controlled operator sequence for:

1. read-only dry-run,
2. provisioning `--apply`,
3. readiness verification,
4. hosted My Dashboard validation.

## Relationship to the existing backfill issue

The operator has separately observed that the existing My Projects backfill scripts hang. This package is not the root-cause remediation package for that defect. However:

- the local agent must avoid treating schema readiness as data readiness;
- no implementation here should assume the role-array backfills have already completed;
- final validation should not claim assigned-project rendering is proven unless the tenant has valid assignment data and the existing My Projects backend route returns matching rows.

## Required developer posture

- Work from current local repo truth, not stale prompt packages.
- Do not re-read files that remain in current context or working memory unless exact lines are required or source has changed.
- Preserve fail-closed behavior in provisioning.
- Preserve source-of-record boundaries.
- Maintain current accessibility posture of the tile launch menu and portfolio browser.
- Do not reintroduce dev-only or placeholder copy into production-facing UI.
