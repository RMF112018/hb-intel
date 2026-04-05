# Phase 07 — Packaging, Bundle Discipline, and Runtime Hardening

## Objective

Phase 07 hardens the SharePoint homepage ecosystem now that:

- Lane A homepage product is complete and governed
- Lane B shell-extension product is complete and governed
- Lane C navigation/branding/authoring governance is complete

The next risk is no longer product definition. It is **packaging integrity, bundle growth, emitted-asset truth, release confidence, and runtime regression prevention**.

## Why this phase follows Phase 06

Phase 06 closure explicitly deferred:

1. packaging and performance hardening — **Phase 07**
2. accessibility audit and QA — **Phase 08**

This package therefore targets the first deferred item and leaves the second for the next phase.

## Scope

### In scope
- `apps/hb-webparts`
- `apps/hb-shell-extension`
- shared build/packaging seams that affect SharePoint deployment
- emitted JS/CSS asset truth
- entrypoint/loader contract validation
- bundle size governance
- release and runtime integrity checklists
- documentation updates needed to freeze packaging truth

### Out of scope
- homepage property-pane UI
- async data integration
- governance workflow automation
- new navigation governance rules
- full accessibility certification
- tenant-specific deployment operations beyond the reusable release package

## Recommended execution order

1. `Phase-07-01-Entrypoint-and-Bundle-Validation.md`
2. `Phase-07-02-SPFx-Bundle-Budget-and-Tree-Shaking-Hardening.md`
3. `Phase-07-03-Release-Checklist-and-Runtime-Integrity.md`

## Expected deliverables

- packaging-truth audit docs
- bundle budget baseline
- emitted asset inventory
- loader/entrypoint regression protections
- runtime integrity checklist
- release checklist
- completion notes and verification evidence
