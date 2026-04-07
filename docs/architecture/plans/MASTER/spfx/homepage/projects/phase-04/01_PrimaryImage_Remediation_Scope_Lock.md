# Prompt 01 — PrimaryImage Remediation Scope Lock

## Objective

Lock the remediation scope to the **actual root-cause path** for the Project / Portfolio Spotlight image-loading failure.

The intent of this prompt is to prevent drift before code changes begin.

## Context

The forensic audit found the most likely failure path to be:

- `PrimaryImage` is coming from the SharePoint list in a shape that is **not always a browser-ready URL**
- a reserved SharePoint image attachment token / thumbnail-related value is being allowed to survive the mapping path
- that unresolved value becomes `image.src`
- the browser request fails
- the Spotlight component falls back to its placeholder state

This prompt is **not** for implementing the final fix yet. It is for locking the work area, confirming the target files, and explicitly prohibiting unrelated changes.

## Repo-Truth Target Surface

Prioritize these files and only expand outward if required:

- `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts`
- `apps/hb-webparts/src/homepage/data/useProjectSpotlightData.ts`
- `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/components/ProjectPortfolioSpotlight.tsx`

Also validate any immediate helper used by the Spotlight list mapping path.

## Hard Constraints

- Do **not** widen into UI polish.
- Do **not** change layout, colors, typography, spacing, hover behavior, or card composition.
- Do **not** redesign list schema unless you prove it is impossible to correct in code.
- Do **not** re-read files that are already in your active context window; use current context first and only open additional files when needed to complete the task safely and correctly.
- Do **not** touch unrelated homepage webparts.
- Do **not** touch shell-extension composition.
- Do **not** perform speculative refactors.

## Required Actions

1. Confirm the exact file where raw SharePoint `PrimaryImage` data is first interpreted.
2. Confirm the exact file where the final Spotlight `image.src` value is produced.
3. Confirm whether the same image path is used by:
   - featured image
   - supporting rail thumbnails
4. Confirm whether the component fallback behavior is already acceptable and should remain intact.
5. Produce a short implementation note that names:
   - the primary fix file
   - any secondary fix file
   - any verification file

## Deliverable

Produce a short implementation note with these sections:

- `Confirmed Scope`
- `Files to Change`
- `Files to Leave Alone`
- `Why the Fix Belongs in the Data/Resolver Layer`
- `Risk if Scope Expands`

## Validation Gate

Do not proceed to the next prompt until you can state clearly:

- where the unresolved `PrimaryImage` value first becomes trusted
- where it becomes `image.src`
- why the fix should happen before UI rendering
