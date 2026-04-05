# Prompt 02 — Build, Inspect, and Prove Full Package

## Objective

Build the cumulative `hb-webparts` package, inspect the emitted `.sppkg`, and prove that the package now contains the full homepage webpart set with coherent loader/package metadata.

This prompt is about **package truth**.

## Required build steps

1. Clean prior output as needed.
2. Run the `hb-webparts` package build.
3. Collect the emitted `.sppkg`.
4. Inspect the `.sppkg` directly.

## Required package inspection checks

You must verify at minimum:

### A. Inclusion
- all intended homepage webparts are present in the package
- previously validated webparts are still present
- no accidental regression back to replacement behavior occurred

### B. Manifest identity
For each packaged webpart, verify:
- manifest ID
- alias
- entryModuleId
- scriptResources mapping

### C. Asset structure
Verify the package contains the required:
- shell asset(s)
- Vite bundle asset
- webpart XML/manifest payloads
- any required alias/shim assets for the selected cumulative architecture

### D. Versioning
Verify:
- AppManifest version is valid 4-part SharePoint format
- no invalid zero-padded version string exists anywhere relevant

### E. Non-regression
Verify the package still includes:
- `HbHeroBannerWebPart`
- `PriorityActionsRailWebPart`

## Required output

Produce a completion note that includes:

1. build result table
2. packaged webpart matrix for **all webparts**
3. asset list summary
4. loader/entry mapping summary
5. go / no-go statement for tenant deployment

## Hard constraints

- Do not stop after proving only hero + rail.
- Do not treat “package built” as sufficient.
- Do not skip direct package inspection.
- If anything is missing from the full webpart set, fail the prompt and explain exactly what is missing.
