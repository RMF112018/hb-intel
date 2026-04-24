# Prompt 01 — Reconcile Foleon Repo Truth

## Objective

Determine exactly why the claimed `hb-intel-foleon` implementation and commit `b1e27a3c` are not discoverable on `main`, then correct the source-of-truth condition before any implementation work continues.

## Governing Authorities

- Repo truth on `main`
- The Foleon audit package gap register, especially FOL-GAP-001
- Existing HB Intel packaging governance in `tools/build-spfx-package.ts`

## Files / Seams to Inspect

- Git history and local branches
- `apps/`
- `docs/architecture/plans/MASTER/spfx/foleon/`
- `tools/build-spfx-package.ts`
- root `package.json`
- `pnpm-workspace.yaml`

## Current Gap

The audit could not find `apps/hb-intel-foleon`, the claimed manifest GUID, Foleon symbols, or commit `b1e27a3c` on `main`.

## Required Outcome

- Identify whether the implementation exists on an unpushed local branch, stale local commit, wrong remote, or not at all.
- If it exists, land it on `main` through the normal repo process.
- If it does not exist, document that fact and create the implementation from Wave 01 Prompt 02.

## Proof of Closure

- Full commit SHA visible in GitHub.
- `git ls-tree` or equivalent proof that `apps/hb-intel-foleon` exists on `main`.
- Code search proof for `FoleonWebPart`, `FoleonOriginPolicy`, and manifest GUID `2160edb3-675e-4451-92bb-8345f9d1c71e`.
- A concise closure report explaining the source-of-truth discrepancy.

## Non-Negotiable Instructions for the Local Code Agent

- Use the live repo's `main` branch as the source of truth unless the prompt explicitly tells you to investigate an unmerged branch/commit.
- Do not protect weak patterns because the UI renders, the package builds, or prior summaries said the MVP landed.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes outside the stated Foleon scope.
- Provide proof of closure with exact commands, files changed, and artifacts generated.
- If repo truth contradicts this prompt, stop and report the contradiction clearly before changing code.
