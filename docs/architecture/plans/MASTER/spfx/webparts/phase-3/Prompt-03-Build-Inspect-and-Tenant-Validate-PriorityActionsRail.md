# Prompt 03 — Build, Inspect, and Tenant-Validate `PriorityActionsRailWebPart`

## Objective

Build the hb-webparts package for the active `PriorityActionsRailWebPart` proof case, inspect the emitted `.sppkg`, and define the exact tenant-validation evidence required before calling the migration successful.

This prompt must prove package truth before anyone relies on runtime conclusions.

---

## Context

The target proof case is now:

- `PriorityActionsRailWebPart`
- `b3f07190-79cf-437d-a1d6-ecbf3f77e616`

The acceptance standard is the same as the hero proof case:

- package uploads successfully
- webpart renders in tenant
- no `require()`-style loader failure for the target webpart
- no neutral shell manifest in the emitted package
- no shim asset emitted or requested

---

## Scope

Primary outputs:

- rebuilt `dist/sppkg/hb-webparts.sppkg`
- package inspection note
- tenant-validation checklist
- manual operator steps and evidence list

---

## Hard constraints

Do **not** reinterpret local build success as final success.

Do **not** treat unrelated console noise from other SharePoint webparts as proof-case failure unless it references:
- `b3f07190-79cf-437d-a1d6-ecbf3f77e616`
- `hb-webparts-app`
- `shell-web-part`
- the active proof-case assets

Do not re-read files that are already in your active context unless needed for verification.

---

## Build steps

1. Remove stale local dist output for hb-webparts if needed.
2. Run the authoritative package build for the domain:
   - `npx tsx tools/build-spfx-package.ts --domain hb-webparts`
3. Confirm the build completes successfully.

---

## Package inspection requirements

Inspect the rebuilt `.sppkg` and verify all of the following:

### A. Manifest identity
- `id = b3f07190-79cf-437d-a1d6-ecbf3f77e616`
- `alias = PriorityActionsRailWebPart`

### B. Loader contract
- `loaderConfig.entryModuleId = b3f07190-79cf-437d-a1d6-ecbf3f77e616_1.0.0`
- `scriptResources[entryModuleId]` points directly to the compiled shell asset
- no shim mapping exists

### C. Package structure
- no neutral shell manifest is present
- no `shell-entry-*` files are emitted
- the proof-case Vite bundle is present
- the compiled shell loader asset is present

### D. Bundle isolation
Confirm the proof-case entry bundle is built from the isolated PriorityActionsRail entry, not the full dispatcher entry.

---

## Manual tenant validation steps

After package inspection passes, provide operator instructions to:

1. upload the rebuilt `hb-webparts.sppkg` to the App Catalog
2. trust the app if prompted
3. add `Priority Actions Rail` to a SharePoint page
4. collect runtime evidence

### Runtime evidence to collect

- page render succeeds
- no `Could not load b3f07190-79cf-437d-a1d6-ecbf3f77e616_1.0.0 in require`
- no SharePoint technical-details crash shell for the target webpart
- network shows:
  - compiled shell asset = 200
  - hb-webparts proof-case bundle = 200
  - no `shell-entry-*` request
- console filtering on:
  - `b3f07190`
  - `hb-webparts-app`
  - `shell-web-part`
  shows no target-specific loader failure

### Cache sanity check

If tenant behavior appears stale:

- unregister `spserviceworker.js`
- hard refresh
- confirm App Catalog version matches the rebuilt package
- confirm the CDN is not serving an older shell asset

---

## Deliverable

Provide a concise completion note with:

1. build result
2. package inspection result
3. exact loader chain for the target webpart
4. manual tenant-deployment steps
5. runtime evidence required
6. go / no-go conclusion for tenant validation
