# Prompt 04 — Harden the Wrapper-Owned Actions Region Containment Contract

## Objective
Bind the wrapper-owned priority-actions region to the same shared outer fit contract as the shell below it while preserving wrapper ownership and keeping the embedded rail outside shell semantics.

## Why this work exists
The wrapper-owned actions region is conceptually correct today. It sits above the shell and keeps the rail out of shell occupant semantics.

What remains weak is the containment contract.

The actions region currently reads as a top strip with its own padding behavior, but its shared-fit relationship to the shell is still too implicit. That makes the page feel stacked in the right order without yet being governed as one disciplined host-fit composition.

## Governing authority
Use:
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- any shared fit seam introduced in Prompts 01–03

## Current weakness in nuanced terms
This is not a shell-ownership problem and not a rail-data problem.
It is a boundary-governance problem.

The wrapper should stay wrapper-owned.
The shell should stay shell-owned.
But both should participate in one page-canvas contract strongly enough that hosted alignment drift is no longer plausible.

## Intended future state
After this prompt is complete:
- the actions strip is clearly inside the same outer fit contract as the shell
- wrapper ownership remains explicit
- the rail remains an embedded React surface and not a shell occupant
- visual distinction between top strip and shell body may remain where deliberate

## What must change
1. Make the actions region consume the same outer fit contract.
2. Preserve wrapper-owned band key, audience, and featured-action threading.
3. Preserve the shell boundary.
4. Touch `PriorityActionsRail.tsx` only if a minimal boundary-aware adjustment is required for fit proof.

## Done means
Done means the code agent can show:
- the actions region is wrapper-owned,
- the rail is still non-shell,
- and the rendered top strip and shell now align inside one shared page-canvas contract.

## Prohibitions
- Do not absorb the rail into shell preset/band semantics.
- Do not redesign the rail product surface unless required for minimal containment correctness.
- Do not widen shell ownership to solve wrapper problems.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Proof of closure
Provide:
1. explanation of the new actions-region containment contract
2. explanation of how wrapper ownership is preserved
3. explanation of how shell ownership is preserved
4. hosted visual evidence of improved alignment
