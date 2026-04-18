# Prompt-05-Introduce-Card-Density-Variants

## Objective

Introduce explicit card-density variants so Project Site cards change information strategy by layout mode instead of only changing footer posture.

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- refreshed Project Sites breakpoint contract from Prompt 01
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`

## Exact repo files / seams / symbols to inspect

- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
  - `layoutMode`
  - `isCompactLayout`
  - `metadataItems`
  - `identityRow`
  - `identityChip`
  - `accessConfidence`
  - `statusMessage`
  - `metaList`
  - `footerCompact`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - any card invocation changes required to pass richer layout/density state
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.test.tsx`

## Current gap to close

The current card system is still mostly desktop-dense in compact states. The card can wrap and stack more safely, but it does not yet shift its information strategy enough to improve compact scan speed and vertical efficiency.

## Required implementation outcome

Create explicit density variants for Project Site cards. The exact naming is up to you, but the implementation must make it clear what happens in wider, medium, and compact conditions.

Compact treatment should be allowed to:
- reduce always-on metadata
- abbreviate or defer lower-priority furniture
- preserve launch-state truthfulness and primary action clarity
- keep the card visually disciplined rather than merely taller and narrower

Medium treatment may also need a partial density reduction relative to wide if that produces a cleaner overall system.

## Proof of closure required

- card density changes by design and is visible in code structure
- compact cards scan faster and are materially shorter where content previously stayed always-on
- launch-state meaning, primary action, and critical identity remain clear
- tests cover density differences, not just compact footer posture

## Constraints

- do not remove truthful launch-state messaging entirely
- do not hide the primary action in launchable states
- do not make compact cards visually cryptic in the name of density

## Context retention directive

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Local code agent prompt

```text
Objective:
Introduce explicit card-density variants so Project Site cards change information strategy by layout mode instead of only changing footer posture.

Governing Authorities:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- refreshed Project Sites breakpoint contract from Prompt 01
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`

Exact Repo Files / Seams / Symbols to Inspect:
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
  - `layoutMode`
  - `isCompactLayout`
  - `metadataItems`
  - `identityRow`
  - `identityChip`
  - `accessConfidence`
  - `statusMessage`
  - `metaList`
  - `footerCompact`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - any card invocation changes required to pass richer layout/density state
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.test.tsx`

Current Gap:
The current card system is still mostly desktop-dense in compact states. The card can wrap and stack more safely, but it does not yet shift its information strategy enough to improve compact scan speed and vertical efficiency.

Required Outcome:
Create explicit density variants for Project Site cards. The exact naming is up to you, but the implementation must make it clear what happens in wider, medium, and compact conditions.

Compact treatment should be allowed to:
- reduce always-on metadata
- abbreviate or defer lower-priority furniture
- preserve launch-state truthfulness and primary action clarity
- keep the card visually disciplined rather than merely taller and narrower

Medium treatment may also need a partial density reduction relative to wide if that produces a cleaner overall system.

Proof of Closure:
- card density changes by design and is visible in code structure
- compact cards scan faster and are materially shorter where content previously stayed always-on
- launch-state meaning, primary action, and critical identity remain clear
- tests cover density differences, not just compact footer posture

Constraints:
- do not remove truthful launch-state messaging entirely
- do not hide the primary action in launchable states
- do not make compact cards visually cryptic in the name of density

Special Instruction:
Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Execution Notes:
- A good result here will usually require real branching of content policy, not only className changes.
- Be explicit in your final summary about what content stays always visible and what becomes conditional by density mode.
```
