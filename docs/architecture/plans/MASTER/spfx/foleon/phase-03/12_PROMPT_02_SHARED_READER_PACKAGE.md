# Prompt 02 — Shared Foleon Reader Package for Three Lanes

## Objective

Create/update the shared package `@hbc/foleon-reader` so it exports reusable reader support for all three lanes:

- Project Spotlight
- Company Pulse
- Leadership Message

## Global rules

- Work in `/Users/bobbyfetting/hb-intel` on `main`.
- Use live repo truth. Do not rely on summaries without checking current files.
- Do not re-read files still in current context unless verifying a specific contradiction or line.
- Do not touch unrelated `.gitignore`, Safety files, backend files outside Foleon scope, or untracked phase docs.
- Do not hardcode tenant GUIDs.
- Do not mutate tenant lists unless the prompt explicitly authorizes tenant provisioning.
- Do not reintroduce public person-field `$select` or `$expand`.
- Do not mount `window.__hbIntel_foleon` inside the homepage.
- Do not weaken reader gate, origin allowlist, preview URL blocking, or runtime proof redaction.
- Use Node 18 where SPFx tooling requires it.


## Required public exports

```ts
FoleonEmbeddedReaderLane
ProjectSpotlightReader
CompanyPulseReader
LeadershipMessageReader
createEmbeddedFoleonRuntimeContract
FoleonReaderModuleConfig
FoleonReaderResolution
```

## Boundary rules

The package must not import from:

```text
apps/hb-intel-foleon/src/*
```

The package must not own:

- SPFx property-pane code;
- global mount/unmount;
- runtime proof globals;
- tenant IDs;
- homepage shell governance.

## Multi-instance proof

Add tests proving three embedded lanes can render simultaneously without:

- `window.__hbIntel_foleon`;
- module-level React root;
- singleton DOM container.

## Behavior preservation

Standalone Foleon behavior and homepage behavior must remain unchanged in this wave.

## Validation

Run shared package and affected Foleon tests.

## Commit

```text
hb-intel-foleon: extract shared three-lane reader package
```
