# Prompt 01 — Canonicalize `hb-publisher` Shell Packaging Shape

You are working in the live `main` branch of `RMF112018/hb-intel`.

Do not re-read files that are already in your active context or memory. Only open additional files when required to complete implementation safely.

## Objective

Implement a targeted packaging correction for `hb-publisher` so its final `.sppkg` preserves the canonical compiled SPFx shell asset shape used by `hb-webparts`, instead of relying on the current shell-entry-only identity path.

The specific issue to address is this:

- `hb-publisher.sppkg` currently packages:
  - `hb-publisher-app-*.js`
  - `shell-entry-<webpartId>-<hash>.js`
  - CSS
- but it does **not** preserve the canonical compiled `shell-web-part_*.js` asset in the final package
- `hb-webparts.sppkg` does preserve the canonical compiled `shell-web-part_*.js` asset
- SharePoint may be tolerating upload of `hb-publisher.sppkg` while treating it differently in catalog enablement/state because the package shape is less conventional than the working `hb-webparts.sppkg`

The end state is:

- `hb-publisher.sppkg` must contain **both**:
  - the canonical compiled `ClientSideAssets/shell-web-part_*.js`
  - the publisher-specific `ClientSideAssets/shell-entry-<webpartId>-<hash>.js`
- the packaged publisher manifest must continue pointing its `entryModuleId` script resource to the correct `shell-entry-*.js`
- no regression is allowed in runtime mounting, manifest linkage, or package-truth proofs

## Files to inspect and modify as needed

Primary:
- `tools/build-spfx-package.ts`

Only if required by the implementation:
- `tools/spfx-shell/gulpfile.js`
- `tools/spfx-shell/config/config.json`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.manifest.json`
- `apps/hb-publisher/config/package-solution.json`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`

Reference comparison only:
- `apps/hb-webparts/config/package-solution.json`

## Required implementation changes

1. In `tools/build-spfx-package.ts`, remove the current identity-case behavior that effectively renames the compiled shell asset into the `shell-entry-*.js` slot for single-manifest domains such as `hb-publisher`.

2. Update the shell-copy generation logic so that:
   - the original compiled `shell-web-part_*.js` asset remains intact in `release/assets`
   - a separate `shell-entry-<webpartId>-<hash>.js` file is emitted for publisher manifest linkage
   - the `shell-entry` file still contains the correct AMD `define("<entryModuleId>")` identity for the publisher web part

3. Ensure the packaging flow copies **both** assets into the final deployment/package path:
   - canonical compiled shell asset
   - shell-entry shim asset

4. Do not change:
   - publisher solution ID
   - publisher feature ID
   - publisher web part ID
   - publisher alias/title

   unless a file absolutely forces a non-functional metadata sync. Functional IDs must remain stable.

5. Do not weaken or bypass existing proof logic just to make packaging pass. Fix the packaging behavior itself.

6. Do not destabilize `hb-webparts` multi-manifest packaging. Keep the correction tightly scoped to the single-manifest path unless a shared fix is clearly correct and safe.

## Acceptance criteria

The rebuilt `dist/sppkg/hb-publisher.sppkg` must contain all of the following:
- `ClientSideAssets/hb-publisher-app-*.js`
- `ClientSideAssets/shell-web-part_*.js`
- `ClientSideAssets/shell-entry-1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10-*.js`
- the companion CSS asset if emitted

The packaged publisher manifest must still:
- be `componentType: WebPart`
- target `supportedHosts: ["SharePointWebPart"]`
- remain `hiddenFromToolbox: false`
- resolve its `entryModuleId` to the `shell-entry-*.js` path, not the canonical shell asset path

## Required output

Return:
1. a concise implementation summary
2. exact files changed
3. a short explanation of why the old identity-rename behavior was wrong for this package shape
4. a package inventory excerpt proving both shell assets now exist
