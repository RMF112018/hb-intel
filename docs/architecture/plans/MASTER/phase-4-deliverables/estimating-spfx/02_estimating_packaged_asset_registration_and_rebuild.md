# Prompt 02 — Resolve packaged asset declaration/publishing seam and rebuild the app

## Objective

You are continuing from Prompt 01 in the HB Intel repo.

Resolve the likely secondary packaging defect in the Estimating SPFx deployment path, then rebuild the Estimating package so the web part can be uploaded and render successfully on a SharePoint site.

The issue to resolve is that `estimating-app.js` appears to exist in the `.sppkg`, but the package structure suggests it may be treated as a zip-injected extra asset rather than a fully declared/published client-side asset in the authoritative SPFx packaging flow.

## Critical constraints

- Estimating is **web part only**.
- Do **not** implement `SharePointFullPage`.
- Preserve the shell-web-part approach unless the current packaging logic makes that impossible.
- Do **not** re-read files that are still within your current context or memory unless needed to verify a contradiction, inspect exact code, or capture evidence.

## Known evidence you should start from

Use this as already-established context:

1. The uploaded `.sppkg` contains:
   - `ClientSideAssets/shell-web-part_*.js`
   - `ClientSideAssets/estimating-app.js`
2. The current package relationship structure appears to formally reference the shell bundle but not clearly declare/publish `estimating-app.js` through the same authoritative asset flow.
3. The current packaging orchestration uses:
   - `tools/build-spfx-package.ts`
   - `tools/spfx-shell/*`
4. The repo currently follows a shell-loader model where the shell bundle is the SPFx entry and `estimating-app.js` is the secondary application payload.

## Required work

### 1. Inspect the current packaging path

Inspect only the files required to understand the current packaging flow:

- `tools/build-spfx-package.ts`
- `tools/spfx-shell/gulpfile.js` if present
- `tools/spfx-shell/config/*` as needed
- `tools/spfx-shell/src/webparts/shell/*`
- any packaging helper directly invoked by the build flow
- `apps/estimating/vite.config.ts`
- `apps/estimating/src/mount.tsx`

Determine exactly how `estimating-app.js` currently gets into the `.sppkg`.

### 2. Classify the current seam precisely

State clearly whether `estimating-app.js` is currently:

- properly included through the authoritative SPFx package/deploy asset flow,
- partially included but not formally declared/published the same way as the shell asset,
- or merely injected into the archive in a way that is structurally present but operationally fragile.

You must answer that directly.

### 3. Fix the packaging path

Implement the minimum correct change required so `estimating-app.js` is handled as a proper deployable client-side asset in the package flow.

Your fix must ensure all of the following:

- `estimating-app.js` is present in the final `.sppkg`
- the runtime URL SharePoint will resolve for it is valid
- the asset is included via a packaging path that is structurally defensible and repeatable
- the build/rebuild flow is deterministic
- the Estimating package can be rebuilt without manual zip surgery after the official packaging step

If the current build script still relies on “build, then inject into zip,” either:

- replace that with a safer compliant packaging path, or
- harden it enough that the resulting `.sppkg` contains the asset in the exact location and relationship structure SharePoint requires

Choose the narrowest fix that gets this deployment working correctly.

### 4. Rebuild the Estimating package

Rebuild the app and produce a fresh `.sppkg` for Estimating.

At minimum, run whatever sequence is now authoritative for this repo, and confirm:

- Estimating Vite bundle rebuilt
- shell package rebuilt
- final `.sppkg` produced

### 5. Inspect the rebuilt `.sppkg`

Open the rebuilt `.sppkg` and explicitly verify:

- `ClientSideAssets/estimating-app.js` exists
- the shell SPFx bundle exists
- the package structure is internally coherent for the shell + secondary asset pattern
- no stale or duplicate Estimating asset names remain that could confuse deployment

## Required deliverables

1. Code changes
2. Build-script/package-flow changes
3. Exact rebuild command sequence used
4. A concise packaging diagnosis explaining the previous defect and the new packaging behavior
5. The path to the rebuilt `.sppkg`
6. A short evidence section listing the relevant package contents after rebuild

## Acceptance criteria

Do not close this prompt until all are true:

- the Estimating package rebuild completes successfully
- the resulting `.sppkg` contains `estimating-app.js`
- the packaging path for `estimating-app.js` is no longer ambiguous or ad hoc
- the runtime shell can resolve the asset from the expected SharePoint client-side asset path
- no host-model drift has been introduced

## Output format

Return:

1. `Objective achieved`
2. `Files changed`
3. `Previous packaging defect`
4. `Implemented packaging fix`
5. `Rebuild results`
6. `Package inspection evidence`
7. `Remaining risks`