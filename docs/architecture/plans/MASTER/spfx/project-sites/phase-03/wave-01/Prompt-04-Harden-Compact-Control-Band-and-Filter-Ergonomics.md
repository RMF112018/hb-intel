# Prompt-04-Harden-Compact-Control-Band-and-Filter-Ergonomics

## Objective

Improve compact/mobile control-band behavior and filter ergonomics so constrained states remain efficient, touch-credible, and less height-expensive.

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- refreshed Project Sites breakpoint contract from Prompt 01

## Exact repo files / seams / symbols to inspect

- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - `compactScopeSelect`
  - `filterPanel`
  - `filterToggleBadge`
  - `activeChipsRow`
  - `chip`
  - `chipRemove`
  - `facetOption`
  - `FacetGroup`
  - `renderControlBar`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx`

## Current gap to close

Compact mode is functional, but it still carries too much desktop-shaped filter/chip behavior. The result is avoidable height pressure and controls that can feel denser than they should on touch-sized states.

## Required implementation outcome

Tighten compact/mobile control behavior and filter ergonomics. The redesigned compact state should:
- keep search, scope, sort, and filter entry reachable
- reduce avoidable height overhead from filter chips and secondary controls
- harden chip/remove/filter affordances for constrained-width and touch use
- preserve truthful filtering state without forcing too much inline furniture all at once

You may use progressive disclosure for active filters or secondary controls if it produces a cleaner compact entry state.

## Proof of closure required

- compact state remains fully task-capable
- active-filter visibility is still truthful, but less height-expensive
- compact affordances are easier to hit and less cluttered
- tests are updated where the DOM contract meaningfully changes

## Constraints

- do not hide active filters so aggressively that users lose state awareness
- do not create hover-dependent access to critical filter meaning
- do not regress keyboard accessibility

## Context retention directive

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Local code agent prompt

```text
Objective:
Improve compact/mobile control-band behavior and filter ergonomics so constrained states remain efficient, touch-credible, and less height-expensive.

Governing Authorities:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- refreshed Project Sites breakpoint contract from Prompt 01

Exact Repo Files / Seams / Symbols to Inspect:
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - `compactScopeSelect`
  - `filterPanel`
  - `filterToggleBadge`
  - `activeChipsRow`
  - `chip`
  - `chipRemove`
  - `facetOption`
  - `FacetGroup`
  - `renderControlBar`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx`

Current Gap:
Compact mode is functional, but it still carries too much desktop-shaped filter/chip behavior. The result is avoidable height pressure and controls that can feel denser than they should on touch-sized states.

Required Outcome:
Tighten compact/mobile control behavior and filter ergonomics. The redesigned compact state should:
- keep search, scope, sort, and filter entry reachable
- reduce avoidable height overhead from filter chips and secondary controls
- harden chip/remove/filter affordances for constrained-width and touch use
- preserve truthful filtering state without forcing too much inline furniture all at once

You may use progressive disclosure for active filters or secondary controls if it produces a cleaner compact entry state.

Proof of Closure:
- compact state remains fully task-capable
- active-filter visibility is still truthful, but less height-expensive
- compact affordances are easier to hit and less cluttered
- tests are updated where the DOM contract meaningfully changes

Constraints:
- do not hide active filters so aggressively that users lose state awareness
- do not create hover-dependent access to critical filter meaning
- do not regress keyboard accessibility

Special Instruction:
Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Execution Notes:
- This prompt is about compact/mobile behavior only.
- Do not blur it into medium/tablet work from Prompt 03.
- Prioritize task clarity and compact scan speed over preserving every current inline element.
```
