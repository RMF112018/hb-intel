# Prompt-01 — Establish Merged Record Identity and Contract

## Objective

Establish an explicit merged-source record contract for `project-sites` that can safely represent project-only, merged, and synthetic legacy-only entries without relying on a single-source numeric-id assumption.

## Why this issue exists

The current `IProjectSiteEntry` contract grew out of a Projects-list browser. It has fallback-aware fields, but it still assumes a single numeric `id` and overloads `siteUrl` as the resolved launch target. That is not a durable identity model for multi-source records.

## Current repo-truth condition

`types.ts` exposes a flat UI record with numeric `id`, `primarySiteUrl`, `legacyFallbackFolderUrl`, `launchTargetKind`, and resolved `siteUrl`. `ProjectSitesRoot.tsx` keys rendered cards with `entry.id`. That contract is too weak for synthetic legacy-only rows and merged duplicate suppression.

## Required future state

The normalized record contract must expose a stable merged record identity suitable for rendering, duplicate suppression, and testing. It must cleanly distinguish source identity from resolved launch target, and it must avoid forcing meaning into overloaded fields.

## Files and code paths to inspect

- `packages/spfx/src/webparts/projectSites/types.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
- `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`
- `packages/spfx/src/webparts/projectSites/projectSitesFilter.ts`

## Implementation requirements

- Add an explicit stable merged record key / identity field.
- Preserve compatibility with the current card/filter UI where reasonable, but do not preserve weak identity semantics merely for familiarity.
- Separate “canonical primary site field” from “resolved launch target” semantics if the current field meanings are overloaded.
- Add explicit source classification fields as justified by repo truth.
- Ensure the resulting contract can represent:
  - project-only
  - merged
  - legacy-only synthetic
- Audit all call sites that currently assume `id` is the only stable identity.

## Validation and proof-of-closure requirements

- The UI no longer depends on a single-source numeric id for React list keys.
- The type surface can represent all three record classes without ambiguity.
- The contract makes source identity and launch-target resolution explicit enough that downstream seams do not need to infer them heuristically.

## Deliverables / closure artifacts

- Updated type contract
- Any required refactors to rendering keys or helper signatures
- Brief closure note in the commit/body/comments if repo practice requires it

## Constraints

- Work against the live local repo.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes.
- Do not add a new runtime dependency unless repo truth proves it is required. None is expected to be required for this lane.
- Preserve the existing package/runtime ownership model unless repo truth proves a required seam move.
