# README — People & Culture Kudos Composer Prompt Package

## Purpose

This package instructs a code agent to add a **premium SharePoint-backed Kudos Composer flyout** to the People & Culture webpart in the live `hb-intel` repository.

The objective is not to bolt on a generic modal.

The objective is to create a **first-class recognition composer** that feels native to the current People & Culture signature surface, writes to the live SharePoint Kudos list on `HBCentral`, and preserves the repo’s preferred separation between rendering, hook state, and data-source logic.

## Repo-specific grounding

This package is written against the current repo truth of:

- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts`
- `apps/hb-webparts/src/homepage/helpers/communicationsConfig.ts`
- `apps/hb-webparts/src/homepage/data/spContext.ts`
- `apps/hb-webparts/src/homepage/data/useProjectSpotlightData.ts`
- `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts`
- `tools/build-spfx-package.ts`

## Working rules for the code agent

- Work from live repo truth.
- Do **not** re-read files that are already in your active context or memory unless needed to verify drift.
- Keep the implementation tightly scoped to the People & Culture composer, the minimum adjacent files required for integration, and the necessary SharePoint write seam.
- Do **not** downgrade the current `PeopleCultureMerged` UI into generic enterprise form styling.
- Do **not** replace the existing premium surface with a stock Fluent experience.
- Do **not** invent a parallel Kudos data model when the repo already has a usable `KudosEntry` contract.
- Do **not** hard-code direct publishing behavior that bypasses moderation.
- Do **not** bury SharePoint create-item calls directly inside `PeopleCultureMerged.tsx`.
- Do **not** leave the work unbuilt.

## Recommended execution order

1. `P01_Repo_Truth_Product_and_UX_Directive.md`
2. `P02_Composer_Component_Architecture_and_State_Model.md`
3. `P03_SharePoint_Submission_Source_and_Field_Mapping.md`
4. `P04_Webpart_Wiring_Interaction_and_UI_Implementation.md`
5. `P05_Runtime_Validation_Build_and_Packaging.md`

## Intended result

At completion, the repo should have:

- a unified **Give Kudos** composer flyout
- elegant desktop + mobile behavior
- a real SharePoint-backed create-item path for Kudos submissions
- moderated-state defaults
- polished success/error states
- updated `hb-webparts.sppkg` output

## Expected deliverables from the code agent

When finished, the agent should report:

1. concise summary of the implementation
2. list of changed files
3. resolved SharePoint write mapping for Kudos submission
4. fallback / no-context behavior
5. screenshots or description of the composer states
6. build/package status and exact command used
