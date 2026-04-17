# Prompt-01-Implement-Breakpoint-Contract-and-Compact-Modes.md

## Objective
Bring Project Sites into compliance with the updated breakpoint doctrine by defining and implementing explicit compact, medium, and wide behavior for the surface.

## Governing authorities
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` for breakpoint rigor only where relevant
- the Project Sites future-state audit findings

## Inspect these exact repo seams
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
- any shared primitives materially affecting control-bar layout, especially segmented controls and search
- Project Sites docs that should carry the breakpoint contract

## Current future-state gap to close
The surface wraps and scales, but it does not yet define:
- narrowest stable mode
- compact / medium / wide behavior
- short-height behavior
- container-aware control-bar decisions
- what should stack, collapse, or suppress under constraint

## Required implementation outcome
1. Write a real breakpoint contract for Project Sites.
2. Implement compact-mode behavior for the control bar and scope controls.
3. Ensure constrained states are task-first, not just compressed.
4. Preserve launch clarity and avoid horizontal-scroll dependence for primary actions.
5. Update tests and docs to match the new contract.

## Closure proof required
- include the final breakpoint contract artifact
- show how compact / medium / wide behavior is implemented
- prove primary interactions remain reachable under constraint
- update tests and validation notes

## Guardrails
- do not use raw viewport width alone when a container-aware solution is warranted
- do not keep multi-row control clutter just because it technically renders
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
