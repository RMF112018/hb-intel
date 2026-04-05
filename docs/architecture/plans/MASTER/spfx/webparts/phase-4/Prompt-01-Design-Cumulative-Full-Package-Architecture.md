# Prompt 01 — Design Cumulative Full-Package Architecture

## Objective

Design the minimum-correct architecture change required to move `hb-webparts` from the current single-active-proof-case model to a cumulative full-package model that retains validated webparts and restores all remaining homepage webparts into the same `.sppkg`.

This prompt is a design and repo-truth reconciliation step. Do not jump straight into implementation without first identifying the exact build assumptions that currently force replacement instead of accumulation.

## Required context

The first two proof cases successfully established a first-class loader contract for:

- `HbHeroBannerWebPart`
- `PriorityActionsRailWebPart`

Those successful parameters must now be treated as the reference build pattern.

The current repo still filters `hb-webparts` to the IDs in `HB_WEBPARTS_PROOF_CASE_IDS`, which causes previously validated targets to disappear when the active set is replaced.

## Tasks

1. Audit the current `hb-webparts` build path and identify every assumption that still enforces:
   - single active proof-case behavior
   - target replacement instead of cumulative retention
   - reliance on one proof-case entry at a time

2. Determine the minimum correct cumulative model for the package.

3. Explicitly decide whether the correct end state should be:
   - a first-class multi-webpart package with native per-webpart loader identities and no shims, or
   - a transitional cumulative model that retains multiple proven webparts while the remaining webparts are added in a controlled way.

4. Map the exact file changes required to support cumulative inclusion for all webparts in the package.

## Hard requirements

- Do not re-read files that are already in your active context unless needed for verification.
- Do not assume the current single-target proof-case filter is acceptable as the end state.
- Do not propose a solution that simply reactivates the old brittle neutral-manifest / shim path without explicitly proving why it is now safe.
- Do not change any webpart IDs.
- Keep the end goal as one cumulative `hb-webparts.sppkg`.

## Required output

Produce a concise design note that includes:

1. current blocker(s) to cumulative packaging
2. exact recommended cumulative architecture
3. whether previously validated proof-case entries remain, merge, or get replaced
4. exact files to change
5. implementation order
6. risks / regressions to watch
7. acceptance criteria for implementation

If you find that cumulative full-package rollout is not yet safe, explain exactly why and what minimal transitional step is required first.
