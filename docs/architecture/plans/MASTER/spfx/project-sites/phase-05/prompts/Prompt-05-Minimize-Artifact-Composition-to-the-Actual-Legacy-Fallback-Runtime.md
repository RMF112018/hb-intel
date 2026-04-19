# Prompt 05 — Minimize Artifact Composition to the Actual Legacy Fallback Runtime

## Objective

Reshape the deploy artifact so it contains only the runtime graph required by the authoritative legacy fallback host selected in Prompt 03.

## Current defect

The current packaging script still validates the broad shared host entrypoint and asserts unrelated workspace packages in the staged artifact. The artifact is operationally improved but still broader than the actual objective.

## Why it matters

Broad artifacts expand deployment blast radius, hide coupling, and make it harder to prove that the legacy fallback lane can stand on its own runtime requirements.

## Repo seams in scope

- `backend/functions/package.json` or any package manifest chosen for the narrowed host
- `scripts/package-functions-artifact.ts`
- the authoritative host entrypoint chosen in Prompt 03
- any supporting build config required by that entrypoint
- workflow references to the artifact if the artifact name or assumptions change

## Required future state

The package script stages a deterministic deploy artifact whose assertions match the actual legacy fallback host runtime graph and no longer treat unrelated workspace packages as mandatory unless the chosen host truly imports them.

## Required changes

1. Recompute the runtime graph from the authoritative host entrypoint, not from the old shared host assumptions.
2. Update artifact assertions so they reflect the actual required entrypoint, functions, and dependencies.
3. Remove unrelated runtime-package assertions if they are no longer required by direct imports.
4. Preserve root-level Functions runtime expectations (`host.json`, runtime package metadata, importable compiled entrypoint).
5. Keep the artifact deterministic and inspectable.

## Must not change

Do not perform unrelated monorepo dependency cleanup. Keep the work bounded to the artifact and runtime graph needed for the selected legacy fallback host.

## Closure proof required

Return:
- before/after staged artifact inventories,
- before/after runtime dependency comparison,
- files changed,
- proof that the staged entrypoint still imports cleanly,
- and a short explanation of what remained required versus what was removed.

## Required deliverables

- updated package manifest and/or packaging script
- any minimal supporting build changes
- inventory comparison output
- closure note describing the final artifact shape

## Local operating instruction

Do **not** re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, uncertainty, or post-change impact.
