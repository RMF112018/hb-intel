# Prompt-03-Recompose-Medium-Tablet-Control-Band

## Objective

Turn Project Sites medium/tablet behavior into a clearly intentional operating layout instead of a mostly stacked overflow state.

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- refreshed Project Sites breakpoint contract from Prompt 01

## Exact repo files / seams / symbols to inspect

- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - `renderControlBar`
  - `controlBar`
  - `controlBarMedium`
  - `searchSlot`
  - `searchSlotStacked`
  - `controlCluster`
  - `controlClusterStacked`
  - `sortSelect`
  - scope-control branching logic
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx`

## Current gap to close

Medium mode currently inherits too much stacked behavior from the compact safety path. That keeps the UI functional, but it does not create a tablet/transitional layout that feels deliberate, premium, and scan-efficient.

## Required implementation outcome

Recompose the medium/tablet control band so it has a clear structure of its own. Search should remain primary, but scope, sort, filters, and reset behavior need a layout that reads as designed for medium space, not merely wrapped into it.

You may reorganize clusters, line breaks, or ordering as needed, as long as the result is:
- clearly distinct from compact
- cleaner than the current medium state
- still host-safe and keyboard-safe

Prefer structural layout changes over micro-spacing tweaks.

## Proof of closure required

- medium mode is visibly distinct from compact
- the control band feels tablet/transitional rather than compressed
- tests cover medium-specific behavior or branching in a meaningful way
- no primary control becomes harder to discover or reach

## Constraints

- do not regress compact usability while improving medium
- do not add decorative controls or fake shell chrome
- do not solve this only by increasing width values or adding empty space

## Context retention directive

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Local code agent prompt

```text
Objective:
Turn Project Sites medium/tablet behavior into a clearly intentional operating layout instead of a mostly stacked overflow state.

Governing Authorities:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- refreshed Project Sites breakpoint contract from Prompt 01

Exact Repo Files / Seams / Symbols to Inspect:
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - `renderControlBar`
  - `controlBar`
  - `controlBarMedium`
  - `searchSlot`
  - `searchSlotStacked`
  - `controlCluster`
  - `controlClusterStacked`
  - `sortSelect`
  - scope-control branching logic
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx`

Current Gap:
Medium mode currently inherits too much stacked behavior from the compact safety path. That keeps the UI functional, but it does not create a tablet/transitional layout that feels deliberate, premium, and scan-efficient.

Required Outcome:
Recompose the medium/tablet control band so it has a clear structure of its own. Search should remain primary, but scope, sort, filters, and reset behavior need a layout that reads as designed for medium space, not merely wrapped into it.

You may reorganize clusters, line breaks, or ordering as needed, as long as the result is:
- clearly distinct from compact
- cleaner than the current medium state
- still host-safe and keyboard-safe

Prefer structural layout changes over micro-spacing tweaks.

Proof of Closure:
- medium mode is visibly distinct from compact
- the control band feels tablet/transitional rather than compressed
- tests cover medium-specific behavior or branching in a meaningful way
- no primary control becomes harder to discover or reach

Constraints:
- do not regress compact usability while improving medium
- do not add decorative controls or fake shell chrome
- do not solve this only by increasing width values or adding empty space

Special Instruction:
Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Execution Notes:
- The current culprit is not just spacing; it is the composition model.
- Keep search as the first-class control.
- Be explicit in your final summary about what makes medium materially different after your changes.
```
