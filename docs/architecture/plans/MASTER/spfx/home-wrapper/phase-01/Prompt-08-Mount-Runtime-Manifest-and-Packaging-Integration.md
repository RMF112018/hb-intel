# Prompt Title

Prompt 08 — Mount, Runtime, Manifest, and Packaging Integration for HB Homepage

## Objective

Wire `hb-homepage` into the real `hb-webparts` runtime and packaging pipeline so it becomes a packaged, mounted, verifiable SPFx component without regressing existing packaged webparts.

## Why this prompt exists now

This is the most under-specified part of the original package. In this repo, packaging is not “add a manifest and run a build.” The live pipeline already has:

- Vite app bundles
- an SPFx shell project
- content-hashed bundles
- manifest handling
- multi-manifest shell-entry behavior
- `.sppkg` verification logic

A shallow packaging prompt is not safe here.

## Current repo truth

You must work from the current live implementation in:

- `apps/hb-webparts/src/mount.tsx`
- `tools/build-spfx-package.ts`

and respect:

- current GUID mapping patterns
- current shell-entry/runtime contract expectations
- manifest adjacency rules
- current no-regression behavior for existing webparts
- current packaging verification posture

## Intended future state

At completion of this prompt:

- `hb-homepage` is registered in runtime dispatch
- `hb-homepage` has correct manifest adjacency and identity
- `build-spfx-package.ts` includes it safely in the `hb-webparts` solution
- package generation proves the new component is present and correctly linked
- existing homepage/public webpart packaging is not broken by the addition

## Research-informed technical considerations

Honor the host reality and SPFx constraints already locked:

- if the manifest is full-width-capable, package and hosted proof must reflect that
- do not confuse workbench proof with hosted proof
- do not casually alter the repo’s custom React/Vite/SPFx shell strategy

## Required implementation scope

Implement the mount/runtime/package integration and create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-04/08-Mount-Runtime-Manifest-and-Packaging-Integration.md`

Implementation work must include:

1. register and render `hb-homepage` through the real runtime seam
2. confirm manifest ID, alias, and adjacency are correct
3. update packaging inputs as required
4. confirm the component is included in the resulting `hb-webparts` package
5. preserve existing packaged component integrity

The closure note must include:

- exact files changed
- runtime GUID mapping proof
- manifest proof
- packaging changes made
- build/package proof summary
- exact remaining boundary for hosted validation only

## Explicit non-scope

- Do not reopen earlier architecture decisions unless a real blocker is found
- Do not make unrelated packaging “cleanup” changes
- Do not break standalone existing homepage public webparts
- Do not claim hosted closure yet

## Required verification / burden of proof

You must prove:

- `mount.tsx` dispatch is correct
- manifest linkage is correct
- the package includes the new component
- no stale/legacy mapping was introduced
- existing package behavior remains intact

## Required output artifact(s)

- `08-Mount-Runtime-Manifest-and-Packaging-Integration.md`

## Completion standard

This prompt is complete only when `hb-homepage` is a real packaged `hb-webparts` component with verified runtime and package linkage.
