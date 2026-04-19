# Prompt-10 — Optional Provenance and Support Diagnostics Hardening

## Objective

Optionally add restrained provenance/support diagnostics for the migration period only if repo truth after core closure still justifies it.

## Why this issue exists

The card/root surface may still benefit from a little more provenance visibility after closure, but this is not required for correct launch behavior and must not be allowed to distract from required-now work.

## Current repo-truth condition

Current provenance signals are minimal. The earlier package correctly treated extra diagnostics as optional, but it did not tightly constrain when or how to do them.

## Required future state

Any added provenance/support signal must remain disciplined, factual, and non-cluttering. It must not turn the user surface into an admin console.

## Files and code paths to inspect

- `packages/spfx/src/webparts/projectSites/types.ts`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`

## Implementation requirements

- Treat this prompt as optional.
- Only act if a real post-closure support gap remains.
- Prefer subtle, factual indicators over verbose diagnostic content.
- Do not add a noisy badge system or support-only clutter to the primary workflow.

## Validation and proof-of-closure requirements

- Optional provenance additions improve supportability without changing closure correctness.
- The user surface remains compact and operational.

## Deliverables / closure artifacts

- Only the minimal justified provenance/support adjustments
- Skip entirely if repo truth does not justify the extra surface

## Constraints

- Work against the live local repo.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes.
- Do not add a new runtime dependency unless repo truth proves it is required. None is expected to be required for this lane.
- Preserve the existing package/runtime ownership model unless repo truth proves a required seam move.
