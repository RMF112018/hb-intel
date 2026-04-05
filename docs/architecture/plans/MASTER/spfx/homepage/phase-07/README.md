# Phase 07 Prompt Package — Packaging, Bundle Discipline, and Runtime Hardening

This package defines the next implementation phase after Phase 06 closeout.

## Why Phase 07 is next

Phase 06 completed the homepage ownership, freshness, authoring, and admin-governance layer. Its closure note explicitly defers **packaging and performance hardening** to **Phase 07**, with **accessibility audit and QA** reserved for **Phase 08**.

Accordingly, this package focuses on:

- build and packaging truth
- entrypoint and loader integrity
- bundle budget governance
- tree-shaking and import-scope enforcement
- release and runtime integrity validation

## Package contents

- `Phase-07-Implementation-Summary.md`
- `Phase-07-01-Entrypoint-and-Bundle-Validation.md`
- `Phase-07-02-SPFx-Bundle-Budget-and-Tree-Shaking-Hardening.md`
- `Phase-07-03-Release-Checklist-and-Runtime-Integrity.md`
- `Phase-07-Risk-Exposure.md`
- `Phase-07-Standards-and-Best-Practices.md`

## Phase intent

Phase 07 should not reopen completed Lane A, Lane B, or Lane C product/governance decisions except where required to:

- verify packaging alignment
- prevent loader-contract regressions
- control bundle growth
- strengthen deployment/runtime confidence

## Out of scope for this phase

- homepage property panes
- homepage async data integration
- workflow automation
- accessibility audit and QA beyond packaging/runtime-safe checks
- new Lane B feature expansion unless required by hardening
- Lane C governance rewrites

## Expected outputs from local code-agent execution

- hard repo-truth audit of packaging/build/runtime seams
- corrected or confirmed entrypoint and emitted asset truth
- explicit bundle budget and regression thresholds
- release checklist and runtime integrity docs
- completion notes with verification evidence
