# Prompt 02 — HB Webparts Clean Rebuild and Package Replacement

## Objective
After the Tool Launcher internal-name remediation is implemented, perform a **full clean rebuild** of the `hb-webparts` SharePoint package using the repo's authoritative packaging flow, then replace the existing `hb-webparts.sppkg` artifact with the clean rebuilt package.

## Scope
This prompt assumes Prompt 01 has already been completed.

This is a packaging and validation task focused on the `hb-webparts` domain only.

## Repo Truth Inputs
Use repo truth from the live repo. The authoritative packaging path is expected to include:
- `tools/build-spfx-package.ts`
- `apps/hb-webparts/`
- the `hb-webparts` domain packaging flow used by the repo

Do not re-read files that are already in your current context or memory unless needed to resolve uncertainty.

## Build Requirements
Use the repo's authoritative packaging flow for the `hb-webparts` domain.

The build must be a **clean** build.

### Required clean-build behavior
Before packaging, remove stale outputs relevant to the domain/package flow, including any repo-truth temp/build/package outputs that could allow stale assets to survive.

At minimum, ensure the packaging flow does not reuse stale:
- `dist`
- `temp`
- `lib`
- `sharepoint`
- `release`
- shell asset copies
- prior generated `hb-webparts.sppkg`

Use the authoritative script path rather than inventing an ad hoc package routine.

## Required packaging target
Build the `hb-webparts` domain package only.

Use the repo-truth domain-targeted build invocation for:
- `hb-webparts`

## Package replacement requirement
After a successful clean rebuild:
- replace the existing `hb-webparts.sppkg` artifact with the newly built package
- do not leave multiple ambiguous candidate artifacts in the expected output location
- make sure the final package path is clear and unambiguous

## Required Validation
Perform narrow validation after the build.

### Validate the rebuilt artifact
Confirm that the resulting `hb-webparts.sppkg`:
- exists in the expected output location
- was produced by the clean rebuild just performed
- contains current packaged assets rather than stale leftovers

### Validate the Tool Launcher wiring indirectly
Inspect the rebuilt package enough to confirm that:
- the `hb-webparts` package was regenerated
- the package includes the Tool Launcher surface as part of the cumulative `hb-webparts` domain package
- there is no obvious stale-package failure in the rebuilt output

You do not need to perform a broad forensic audit again. Keep this narrow and practical.

## Constraints
- Do not change unrelated code while rebuilding.
- Do not broaden this into a multi-domain packaging exercise.
- Do not alter manifest IDs.
- Do not change packaging architecture unless a narrow fix is absolutely required to complete the clean rebuild.
- Do not leave temporary debug instrumentation in shipped code.

## Acceptance Criteria
The task is complete only if all of the following are true:

1. The `hb-webparts` domain package was rebuilt from a clean state.
2. The resulting `hb-webparts.sppkg` replaced the prior artifact.
3. The final output path is clearly reported.
4. The completion notes identify the exact build command used.
5. The completion notes identify any warnings or residual risks.

## Required Deliverables
Provide:
- the exact clean-build command used
- the exact final path to the rebuilt `hb-webparts.sppkg`
- a short statement confirming the prior artifact was replaced
- a concise validation summary
