# HB Intel — SPFx Shared UI/UX Conformance Prompt Package

This package is designed for a local code agent to execute a full repo-truth-driven SPFx UI/UX conformance program across the HB Intel SharePoint app suite.

## Package intent

The prompts are sequenced to:

1. establish repo truth before implementation
2. freeze shared-resource ownership boundaries
3. harden the shared SPFx shell and app-composition model
4. standardize layouts, command surfaces, and interactive patterns
5. roll conformance through the source apps that generate the SharePoint packages
6. update doctrine in `docs/reference/ui-kit/`
7. close with verification, acceptance evidence, and package rebuild validation

## Locked decisions carried into this package

- Do **not** create a parallel design system outside `@hbc/ui-kit`.
- Treat `@hbc/shell` as the canonical owner of shell orchestration and host-boundary behavior unless repo-truth evidence proves a narrower adjustment is required.
- Treat `@hbc/ui-kit` as the canonical owner of reusable visual primitives, layouts, and governed interaction patterns unless repo-truth evidence proves otherwise.
- Treat `@hbc/app-shell` as a facade whose continued role must be validated against current dependency boundaries rather than assumed.
- Preserve legitimate domain workflow specialization while eliminating unjustified visual and interaction drift.
- Be honest about SPFx host constraints; do not force false equivalence with PWA surfaces.
- Prefer updating existing authoritative docs and ADR-aligned references over creating duplicate guidance.
- Tell the agent not to re-read files that are still in its current context or memory.

## Recommended execution order

- Read `00-Implementation-Summary.md`
- Read `01-Findings-Summary.md`
- Execute `Prompt-01-*` through `Prompt-15-*` in order
- Use `Prompt-15-*` as the final closure and signoff gate

## Expected outputs from the code agent

- audited conformance inventory
- shared-resource ownership map
- hardened SPFx shell/app composition
- standardized shared layout and interaction families
- conformed source applications for SharePoint package generation
- updated doctrine and guidance in `docs/reference/ui-kit/`
- verification evidence and rebuild validation for target `.sppkg` outputs
