# Prompt 06 — Align Manifest Seams and Minor Drift Hardening

## Objective
Clean up minor repo-truth drift that is not the direct glitch cause but undermines runtime and packaging confidence.

## Governing Authorities / Relevant Docs
- `apps/project-sites/src/webparts/projectSites/ProjectSitesWebPart.manifest.json`
- `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.manifest.json`
- any packaging source-of-truth docs actually used by the current build path

## Critical Operating Instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Exact Drift to Close
- duplicated manifest seams are not aligned on all relevant host-fit fields
- historical review docs should not be treated as proof when current repo truth differs

## Required Implementation Outcome
1. Identify the actual authoritative manifest seam used by the current packaging flow.
2. Align duplicate manifest copies or eliminate unnecessary divergence.
3. Ensure the final repo truth is unambiguous for future maintenance.
4. Update any nearby documentation only where necessary to prevent future confusion.

## Validation / Proof of Closure Requirements
Provide proof for:
- authoritative manifest path
- alignment of duplicated manifest fields
- successful build/package validation if this seam affects packaging

## Explicit Non-Goals
- no feature changes
- no UI redesign
- no unrelated documentation sweep
