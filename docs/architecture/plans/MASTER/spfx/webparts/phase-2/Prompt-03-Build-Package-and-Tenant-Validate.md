# Prompt-03 — Build, Inspect, and Tenant-Validate the Proof Case

## Objective

Build the refactored proof-case package, inspect the emitted `.sppkg`, deploy it, and validate that `HbHeroBannerWebPart` now loads in SharePoint without the prior `require` failure.

## Required operating rules

- Do not re-read files that are already in your active context or memory. Only open additional files when required to verify a dependency, inspect a touched surface, or resolve uncertainty.
- Separate package validation from tenant validation.
- Distinguish loader errors from render errors.
- Do not treat generic console noise as equal to loader failures.
- Do not call the proof case successful unless the tenant runtime evidence confirms it.

## Required validation flow

### A. Local package inspection
Inspect the built `.sppkg` directly and verify:

- the hero manifest exists
- the hero manifest ID is correct
- `entryModuleId` is coherent without a shim alias
- `scriptResources` does not depend on a generated shim file
- no synthetic `shell-entry-*.js` exists for the proof case
- the bundle URL and global name match the refactored implementation

### B. Tenant deployment
Deploy the updated `.sppkg` to the App Catalog and validate the hero proof case in a real tenant page.

### C. Runtime evidence collection
Collect and evaluate:

- page render result
- browser console logs
- SharePoint technical-details output if any
- network evidence if loader failure persists
- whether the prior error is gone:
  - `Could not load 39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0 in require`

### D. Cache sanity check
If the local `.sppkg` inspection is clean but the tenant still shows old behavior, explicitly test and document whether the remaining issue is a tenant/service-worker/cache artifact versus a packaging defect.

## Required output

Produce a proof-case validation report with these sections:

- Build result
- Package inspection result
- Tenant deployment result
- Runtime result
- Remaining defects, if any
- Clear go / no-go on the proof case

## Acceptance criteria

This prompt is complete only when one of the following is true:

### Success condition
`HbHeroBannerWebPart` renders successfully in SharePoint and the prior `require` failure is gone.

### Failure condition
If it still fails, the report must isolate the next blocker with evidence and clearly state whether that blocker is:
- still loader-contract related
- bundle-evaluation related
- tenant cache related
- UI/runtime related after successful load
