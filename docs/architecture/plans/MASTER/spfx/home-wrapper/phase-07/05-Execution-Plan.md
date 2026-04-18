# 05 — Execution Plan

## Sequence overview

This package uses five prompts because the prior three-prompt package did not cover cutover and hard closure strongly enough.

## Prompt 01 — Wrapper runtime
Create the wrapper-owned entry-stack runtime and CSS region.

## Prompt 02 — Wrapper contract and config extraction
Add the wrapper-facing rail seam without polluting shell semantics.

## Prompt 03 — Semantics, comments, docs, and reference reconciliation
Update repo statements that would become stale after wrapper embedding.

## Prompt 04 — Homepage page-canvas cutover / proof
Prove or complete the actual flagship homepage page-canvas cutover so the embedded rail is the authoritative action layer.

## Prompt 05 — Tests, diagnostics, visual proof, and hard closure
Finish only when order, semantics, page state, and responsive comfort are proved.

## Why this sequence is safest

### It isolates ownership first
Prompt 01 makes runtime ownership real before contract cleanup and proof work.

### It isolates semantics second
Prompt 02 ensures the rail’s wrapper seam is introduced intentionally rather than smuggled in through shell types.

### It reconciles doctrine before closure
Prompt 03 prevents stale architecture language from lingering after the runtime changes.

### It treats tenant/page reality as first-class work
Prompt 04 addresses the biggest missing piece in the attached package.

### It makes proof a real deliverable
Prompt 05 prevents closure on “looks good locally”.

## High-risk failure modes this sequence prevents

- shell-occupant migration by convenience
- config leakage into shell slices
- duplicate action layers on the homepage
- stale comments/docs that contradict runtime truth
- incomplete cutover hidden behind local component rendering
- weak closure with no automated or repeatable proof

## Commands / validation expectations by stage

### After Prompt 01
- local tests for wrapper render order if created in same wave
- lint/typecheck for touched package(s)

### After Prompt 02
- typecheck must still pass
- wrapper config extraction verified against no-site and site-backed modes
- active audience propagation verified

### After Prompt 03
- grep / diff review of stale phrases and contract comments
- no contradictory ownership language left behind in touched seams

### After Prompt 04
- executable proof path for homepage page-canvas inspection
- executable proof or implementation for page-canvas cutover
- idempotent or clearly bounded tenant-connected commands documented

### After Prompt 05
- all touched tests green
- visual proof captured
- concise closure report written
- residual risks only if truly outside scope and explicitly justified
