# Prompt-01 — Enforce Publisher Fresh Build and Packaging Freshness

## Objective
Upgrade the `hb-publisher` packaging path so it receives the same class of hard freshness protection that the repo currently gives `hb-webparts`.

## Governing authority / required reference docs
- live repo truth in `main`
- `tools/build-spfx-package.ts`
- `apps/hb-publisher/vite.config.ts`
- `apps/hb-publisher/config/package-solution.json`
- `tools/spfx-shell/gulpfile.js`
- current emitted `hb-publisher.sppkg` expectations established by the audit package
- Microsoft Learn documentation on SPFx package generation and feature/package versioning

## Exact repo files and code paths to inspect
- `tools/build-spfx-package.ts`
- `apps/hb-publisher/package.json`
- `apps/hb-publisher/vite.config.ts`
- `tools/spfx-shell/gulpfile.js`
- any Publisher-specific proof output path under `dist/sppkg/`

## Exact issue to close
`hb-publisher` is currently packaged through the shared shell, but the orchestrator only hard-enforces fresh dist cleanup/rebuild for `hb-webparts`. That means the actual target package under audit can package from stale app output if `apps/hb-publisher/dist/` already exists.

## Required implementation outcome
- refactor freshness enforcement so `hb-publisher` receives the same hard dist cleanup + rebuild gate before packaging
- capture Publisher freshness evidence in the same run that generates the package
- verify the packaged Publisher app bundle hash against the just-built source bundle hash
- keep the implementation domain-aware and maintainable; do not copy-paste a one-off hack

## Validation / proof-of-closure requirements
- prove the script now hard-cleans stale Publisher dist output before packaging
- prove a Publisher build regenerates a fresh hashed app bundle
- prove the packaged asset hash matches the fresh source build hash
- write/update a proof artifact in `dist/sppkg/` or another explicit output location that records:
  - packaging run identifier
  - source bundle name and hash
  - packaged bundle name and hash
  - pass/fail freshness result

## Deliverables or closure docs to create
- code changes only where needed
- a short closure note documenting the new freshness path and proof output

## Explicit guardrails
- conduct an exhaustive scrub of the affected packaging code path before editing
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
- do not make unrelated code changes
- do not change Publisher product behavior outside packaging closure
