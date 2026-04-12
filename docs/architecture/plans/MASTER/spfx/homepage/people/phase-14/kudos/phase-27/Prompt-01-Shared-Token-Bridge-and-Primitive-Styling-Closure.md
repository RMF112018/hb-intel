# Prompt-01 — Shared Token Bridge and Primitive Styling Closure

## Objective

Close the finding that the shared Kudos token bridge and shared governance primitive styling seam are still locally authored, doctrine-drifting, and too dependent on repeated inline `kudosCSSVars()` application.

This prompt is about the **shared token / primitive seam only**. It is **not** a public-surface redesign prompt and it is **not** a companion-workflow redesign prompt.

## Active finding only

Only remediate this finding:
- shared token bridge is still locally authored and doctrine-drifting

Do not start redesigning the public hero, the archive UX, the moderation workspace, or the validation suite in this prompt.

## Repo-truth starting footprint

At minimum inspect:

- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/governance.module.css`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`
- any directly related shared theme imports under `@hbc/ui-kit/homepage`
- any directly related CSS modules or helper seams that consume the shared governance primitives

Trace outward only as needed to fully close this specific finding.

## Required work

1. Audit the current shared Kudos token bridge and identify every locally authored color / surface / ink value that should instead derive from governed theme semantics.
2. Reduce the bridge to a disciplined alias layer over governed shared tokens wherever possible.
3. Remove repeated inline `style={kudosCSSVars()}` usage where a stronger root-level or shell-level variable application seam is more appropriate.
4. Ensure shared governance primitives consume a single clean token seam rather than a scattered mixture of local constants, raw literals, and repeated root-style spreading.
5. Keep the `class-variance-authority` / CSS-module variant pattern where it is strong.
6. Document any remaining truly necessary local exceptions and keep them tightly bounded.

## Exhaustive scrub requirement

Perform an exhaustive scrub of the shared seam:
- remove unused token exports,
- remove dead local palette values,
- remove contradictory comments,
- remove stale “temporary” compatibility layers if they no longer serve a live purpose,
- remove repeated inline style application patterns that are no longer needed,
- verify that no adjacent shared primitive still reintroduces the same defect.

## Not acceptable

- Renaming the current local palette without actually reducing doctrine drift
- Leaving raw local colors in place because “they are centralized now”
- Moving the same problem from TS into CSS or vice versa
- Declaring success while multiple shared primitives still depend on repeated inline `kudosCSSVars()` spreading

## Closure standard

Do not declare this finding closed until you provide:
1. the full touched-file list,
2. why each file was in scope,
3. what locally authored token/styling drift was removed,
4. what legitimate local exceptions remain and why,
5. why the shared seam is now stronger and easier to govern.
