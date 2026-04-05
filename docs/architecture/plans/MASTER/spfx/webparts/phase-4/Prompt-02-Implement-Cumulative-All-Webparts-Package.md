# Prompt 02 — Implement Cumulative All-Webparts Package

## Objective

Implement the cumulative full-package model for `hb-webparts` so the package retains the validated proof cases and restores all remaining homepage webparts into the same `.sppkg`.

At this stage, the package should address **all webparts in the package**, not just a new single target.

## Target webparts

The cumulative package should include:

- `46bfde64-f0cb-4f62-9f6b-a466f8fadc1f`
- `39762a4d-c7fd-44a6-a11e-4f8de9f5778d`
- `b3f07190-79cf-437d-a1d6-ecbf3f77e616`
- `cb7060f5-b852-4600-b912-a5f6f7221ce2`
- `0b53f651-fd92-4f7f-a9da-f7797017f5eb`
- `e8fa8a84-a48a-41d2-85a6-b7c7df70aeca`
- `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4`
- `8370ab0c-b6df-4db0-82f1-24b54750f508`
- `89ca5ff3-21f4-4b23-a953-4b7306ea1029`
- `11d72b36-a92f-4e2d-9918-75df2cb0d11e`

## Implementation goals

1. Stop excluding previously validated webparts.
2. Stop treating proof cases as mutually exclusive.
3. Preserve the successful build parameters captured by the first two proof cases.
4. Package all intended webparts in the same `.sppkg`.
5. Keep the loader contract coherent and inspectable.

## Implementation instructions

- Update the build orchestration to support cumulative inclusion instead of target replacement.
- Generalize or refactor proof-case entry routing as needed so the package can address all webparts now that the successful parameters are known.
- If separate proof-case entries remain useful internally, that is acceptable, but the emitted package must restore all intended webparts.
- If a reworked multi-webpart build path is required, implement it explicitly and make the loader behavior observable and verifiable.
- Bump the `hb-webparts` package version appropriately.

## Hard constraints

- Do not re-read files that are already in your active context unless needed for verification.
- Do not silently fall back to the original broken architecture.
- Do not change `ShellWebPart.ts` unless necessary and justified.
- Do not change source manifests unless required and justified.
- Do not remove the hero banner or priority actions rail from the cumulative package.
- Do not ship an implementation that cannot be inspected at the manifest / asset / loader-contract level.

## Required validation

Run and capture:

- typecheck
- lint
- build
- package build
- package inspection

At the end of implementation, provide a completion note with:

1. files changed
2. architecture selected
3. whether full-package cumulative inclusion is now active
4. version bump
5. build/package results
6. known remaining risks
