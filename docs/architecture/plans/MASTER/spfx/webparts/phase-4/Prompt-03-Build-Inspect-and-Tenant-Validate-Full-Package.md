# Prompt 03 — Build, Inspect, and Tenant-Validate Full Package

## Objective

Build the cumulative `hb-webparts` package, inspect the emitted `.sppkg`, and prepare the exact tenant-validation steps needed to prove that the full package works without regressing the loader behavior already proven by the first two webparts.

## Required checks

### Package composition

Confirm the package contains all intended homepage webparts and does not exclude:

- `HbHeroBannerWebPart`
- `PriorityActionsRailWebPart`

Also confirm the remaining homepage webparts are restored into the package.

### Loader contract

Inspect the emitted package and determine:

- how many manifests are present
- which shell assets are present
- which bundle assets are present
- what each `entryModuleId` resolves to
- whether any shim assets exist
- whether any neutral-manifest indirection remains
- whether the loader chain is internally coherent

### Regression checks

Explicitly verify that the cumulative package does not recreate the original defect pattern:

- `Could not load {webpartId}_1.0.0 in require`
- missing scriptResources mapping
- stale or synthetic shim indirection that breaks SharePoint module resolution
- disappearance of previously validated webparts from the package

## Manual tenant validation plan

Prepare the exact runtime checks for the operator:

1. upload the rebuilt `.sppkg`
2. verify toolbox presence for the included homepage webparts
3. verify existing hero banner still renders
4. verify existing priority actions rail still renders
5. verify newly restored webparts can be added and render
6. verify no old `require()` failure resurfaces
7. verify no unexpected `shell-entry-*` requests if the new architecture is supposed to be shim-free

## Hard constraints

- Do not re-read files that are already in your active context unless needed for verification.
- Do not declare runtime success without distinguishing local package truth from manual tenant validation.
- If the cumulative package requires a transitional shim layer, say so explicitly and document it clearly.
- If the cumulative package is fully first-class and shim-free, prove that with inspection evidence.

## Required output

Produce a completion note with:

1. build results
2. package inspection results
3. manifest/component inventory
4. loader-contract assessment
5. regression assessment
6. manual tenant-validation checklist
7. go / no-go recommendation
