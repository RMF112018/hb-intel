# Prompt-02 — Generalize Package-Truth Proof to `hb-publisher`

## Objective
Extend the repo’s strongest package-truth verification logic so the standalone Publisher package gets semantic verification, not just archive-shape checks.

## Governing authority / required reference docs
- live repo truth in `main`
- `tools/build-spfx-package.ts`
- `apps/hb-publisher/src/mount.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `apps/hb-publisher/src/webparts/articlePublisher/runtimeContract.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- Microsoft Learn documentation on SPFx manifests, package-solution, and feature/package upgrade/version behavior

## Exact repo files and code paths to inspect
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/hb-publisher/src/mount.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `apps/hb-publisher/src/webparts/articlePublisher/runtimeContract.ts`
- any existing package-truth proof JSON outputs under `dist/sppkg/`

## Exact issue to close
The current code has deep package-truth proof and shim/manifest verification for `hb-webparts`, but the active standalone Publisher package only gets shallow structural validation.

## Required implementation outcome
- generalize the package-truth verification path so it works for `hb-publisher`
- verify at minimum:
  - packaged app asset freshness
  - source-manifest vs packaged-manifest semantic alignment
  - entry-module id correctness
  - script resource path correctness
  - runtime global / shell loader linkage assumptions relevant to Publisher
- emit an explicit Publisher package-truth proof artifact

## Validation / proof-of-closure requirements
- produce a machine-readable proof artifact for Publisher
- show that the proof fails when a semantic mismatch is introduced and passes when corrected
- prove the packaged Publisher manifest still preserves the stable GUID and expected alias/host metadata
- prove the shell/runtime linkage used by Publisher is the one actually described by the proof artifact

## Deliverables or closure docs to create
- Publisher package-truth proof output
- a concise closure note describing the proof checks

## Explicit guardrails
- conduct an exhaustive scrub of the affected packaging and proof code paths before editing
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
- do not make unrelated code changes
- do not weaken the existing `hb-webparts` proof path while generalizing it
