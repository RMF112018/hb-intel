# Prompt-03 — Simplify Single-Manifest Shell Entry Generation

## Objective
Eliminate unnecessary loader-asset duplication in the standalone Publisher package and make the single-manifest path easier to reason about.

## Governing authority / required reference docs
- live repo truth in `main`
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `tools/spfx-shell/gulpfile.js`
- current attached package-truth observation that `shell-entry-...js` and `shell-web-part_...js` are byte-identical in the emitted Publisher package

## Exact repo files and code paths to inspect
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.manifest.json`
- `tools/spfx-shell/release/manifests/` generation path
- `tools/spfx-shell/assets/`
- `temp/deploy/` copy logic as produced by the packaging script

## Exact issue to close
The current packaging path always generates a per-webpart `shell-entry-...js`, even when the domain has only one target manifest. In the emitted Publisher package this produces a redundant duplicate asset.

## Required implementation outcome
- refactor the packaging flow so single-manifest domains do not emit redundant duplicate shell assets unless truly required by SPFx runtime semantics
- keep multi-manifest behavior for `hb-webparts` intact
- make the implementation understandable and explicit instead of relying on incidental duplication

## Validation / proof-of-closure requirements
- rebuild Publisher packaging and prove the resulting package contains only the loader assets actually required
- prove the packaged manifest’s `entryModuleId` and script resource path remain correct
- prove SharePoint loader expectations are still met for the single-manifest Publisher package
- if you determine duplication must remain, document exactly why, backed by runtime evidence, and prove the duplication is intentional rather than accidental

## Deliverables or closure docs to create
- code change
- short proof note describing before/after asset inventory and rationale

## Explicit guardrails
- conduct an exhaustive scrub of the single-manifest and multi-manifest shell-entry paths before editing
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
- do not make unrelated code changes
- do not regress the `hb-webparts` multi-manifest packaging path
