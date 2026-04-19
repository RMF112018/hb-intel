# Prompt 06 — Update Repo-Truth Seams and Reference Composition

## Objective

Update all repo-truth seams so runtime, architecture comments, and reference composition all tell the same flagship homepage story after hero cutover.

## Why this matters

This repo uses comments, contracts, and reference compositions as real governance seams. If those remain stale after runtime changes, future work will be based on false architecture truth.

## Exact repo seams to inspect

- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/entryStack/entryStackOrchestration.ts`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`
- any tightly related comments/docs that would become false after cutover
- hero/homepage manifests only if a real repo-truth mismatch remains after runtime changes

## Current implementation problem

The live repo currently documents the old flagship truth in multiple places. Leaving those seams stale after cutover would produce immediate architecture drift.

## Required implementation outcome

Update the repo so all flagship truth seams clearly state:

- `HbHomepage` owns the flagship entry stack,
- hero and launcher are wrapper-owned flagship regions,
- shell remains post-entry only,
- standalone hero reuse remains available for non-flagship/article scenarios,
- and the reference composition either reflects the new flagship truth or is explicitly labeled as a non-production reference path.

## Specific constraints / guardrails

- Do **not** force manifest edits unless runtime truth actually requires them.
- Do **not** leave contradictory comments behind.
- Do **not** weaken the wrapper/shell ownership contract.
- Preserve article-mode hero reuse and the reusable hero surface.

## Proof of closure

Closure requires all of the following:

1. Runtime comments and contracts no longer describe the flagship hero as a separate authored stage above `HbHomepage`.
2. `entryStackOrchestration.ts` matches the new flagship composition truth.
3. `ReferenceHomepageComposition.tsx` no longer misleads reviewers about flagship composition.
4. Wrapper and shell ownership language is sharper after the cutover, not blurrier.
5. Any manifest changes are minimal and justified by actual truth alignment needs.

## Explicit prohibition on unrelated changes

Do not:
- widen this into broad doc cleanup,
- refactor unrelated modules,
- or use this prompt to redesign homepage visuals instead of correcting repo truth.

## Local code-agent operating instruction

Do **not** re-read files that are already in your active context unless you need to verify drift, dependencies, uncertainty, or the impact of your changes after implementation.

## Required output from the local code agent

Return:

1. files changed,
2. exact structural changes made,
3. why those changes satisfy this prompt,
4. any risks or follow-up observations,
5. and concrete proof of closure against the criteria above.
