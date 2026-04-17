# Prompt-03-Replace-Coarse-Launch-State-Inference.md

## Objective
Replace the current coarse Project Sites card-state inference with an explicit launch-state model that users can trust.

## Governing authorities
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- current Project Sites source under `packages/spfx/src/webparts/projectSites/`
- the future-state audit findings for Project Sites

## Inspect these exact repo seams
- `packages/spfx/src/webparts/projectSites/types.ts`
- `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- related Project Sites tests

## Current future-state gap to close
Right now the card state is inferred too simplistically:
- no `siteUrl` => provisioning
- live site + stage `active` or `pursuit` => active
- everything else => archived / other

That can misclassify valid live projects and can also label data defects as provisioning.

## Required implementation outcome
Introduce an explicit launch-state model and drive the surface from it. At minimum:

1. Define a typed Project Sites launch-state contract.
2. Derive launch state from a deliberate ruleset, not a two-value stage shortcut.
3. Distinguish at least:
   - live / launch-ready
   - provisioning / not yet launchable
   - archived or inactive
   - attention-needed / data issue
4. Update card visuals, affordances, and labels to match the new model.
5. Preserve the premium productive tone; do not regress into generic status cards.
6. Make the “why” legible to users when a record is not launchable.

## Closure proof required
- show the new launch-state type and derivation logic
- show updated card behavior for every state
- add or update tests covering representative record combinations
- demonstrate that state meaning is now more trustworthy than the previous heuristic

## Guardrails
- do not add decorative complexity without user value
- do not bury the primary launch action
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
