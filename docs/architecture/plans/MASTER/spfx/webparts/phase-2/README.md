# HB Webparts Proof-Case Remediation Prompt Package

This package is a narrow remediation sequence for replacing the current post-bundle shim loader model with a first-class SPFx loader contract, using `HbHeroBannerWebPart` as the proof case.

## Package objective

Prove that the `hb-webparts` runtime can load and render a real SharePoint webpart **without**:

- post-bundle manifest cloning
- generated AMD shim entry modules
- neutral shell manifest IDs
- `entryModuleId` rewrites after `gulp bundle`
- script-resource alias tricks that only exist to satisfy SharePoint `require`

## What this package is intended to do

The prompts in this package instruct a local code agent to:

1. narrow the proof case to `HbHeroBannerWebPart`
2. eliminate the current shim-based loader path for that proof case
3. produce a package whose loader contract is emitted naturally by the SPFx build
4. validate the `.sppkg` and tenant runtime behavior
5. leave a clean rollout pattern for the remaining `hb-webparts`

## What this package is intentionally not trying to do

This package is **not** intended to:

- fix every homepage webpart in one pass
- refactor the full homepage composition architecture
- resolve secondary console noise unless it blocks the proof case
- redesign `@hbc/ui-kit`
- broaden into unrelated SharePoint shell issues

## Recommended execution order

1. `Prompt-01-Proof-Case-Scope-and-Design.md`
2. `Prompt-02-Implement-First-Class-Loader-Contract.md`
3. `Prompt-03-Build-Package-and-Tenant-Validate.md`
4. `Prompt-04-Capture-Rollout-Pattern-for-Remaining-Webparts.md`

## Hard focus

The code agent should treat the following as the primary defect:

> `hb-webparts` currently depends on a post-bundle shim-based module-registration model instead of a first-class SPFx-emitted loader contract.

The proof case is successful only when `HbHeroBannerWebPart` loads in SharePoint without the current shim path.

## Critical files and paths

- `tools/build-spfx-package.ts`
- `tools/spfx-shell/gulpfile.js`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/hb-webparts/vite.config.ts`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbHeroBanner/HbHeroBannerWebPart.manifest.json`
- `apps/hb-webparts/config/package-solution.json`

## Operator note

Every prompt below includes a standing instruction:

> Do not re-read files that are already in your active context or memory. Only open additional files when required to verify a dependency, inspect a touched surface, or resolve uncertainty.

That instruction is intentional and should remain in place.
