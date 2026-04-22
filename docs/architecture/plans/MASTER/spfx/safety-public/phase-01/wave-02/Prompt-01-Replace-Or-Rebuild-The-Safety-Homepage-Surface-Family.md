# Prompt 01 — Replace Or Rebuild The Safety Homepage Surface Family

## Objective
Replace or fundamentally re-found the current `HbcOperationalSurface` approach for homepage Safety use so the rendered result no longer reads as a white elevated card with an inner featured card and signal list.

## Governing authority
Governing authorities:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/00-Plan-Summary.md`

Critical repo seams:
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx`
- `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts`
- `apps/hb-webparts/src/homepage/helpers/authoringGovernance.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/presetLibrary.ts`
- `packages/ui-kit/src/HbcOperationalSurface/index.tsx`
- `packages/ui-kit/src/HbcOperationalSurface/operational-surface.module.css`


## Exact seams to inspect
- `packages/ui-kit/src/HbcOperationalSurface/index.tsx`
- `packages/ui-kit/src/HbcOperationalSurface/operational-surface.module.css`
- `packages/ui-kit/src/HbcOperationalSurface/HbcOperationalSurface.stories.tsx`
- any new `@hbc/ui-kit/homepage` safety-specific surface files you introduce

## Current gap to close
The current surface is directionally better than stock enterprise UI, but it is still a card-oriented grammar. The `safetyHomepage` modifier tightens spacing without changing the core product identity.

## Required implementation outcome
Deliver a surface that feels like a flagship safety / field-intelligence homepage module. That may mean:
- introducing a new safety-specific homepage surface family, or
- radically restructuring `HbcOperationalSurface` for Safety use
The result should support:
- top-line safety posture / summary
- stronger primary signal emphasis
- clearer bounded secondary signal treatment
- decisive action posture
- explicit compact/minimal mode behavior
- premium but restrained motion
- better token discipline than the current hardcoded-heavy CSS

## Proof of closure required
- provide story coverage for standard, compact, minimal, one-signal, and degraded/error-adjacent states
- show why the new surface is no longer just a premium card stack
- show reduced-motion handling remains intact
- show focus-visible and keyboard affordances where interactive elements exist

## Change boundaries
- Do not change unrelated homepage surfaces, hero logic, launcher behavior, or non-safety shared primitives unless required by the objective and explicitly justified in the closure note.
- Keep the sequence closure-oriented.
- Do not preserve weak implementation just because it already compiles.
- Do not re-read files that are already in active context unless needed to confirm drift, resolve dependencies, or verify uncertainty after changes.

## Delivery note
Return:
1. a concise repo-truth summary of what changed
2. the exact files changed
3. why the result now satisfies the objective
4. any follow-on risks or deferred items that are genuinely out of scope


## Checklist / scorecard closure gate
Use the attached **Homepage UI/UX Audit Checklist** and **Homepage UI/UX Audit Scorecard** while executing this prompt.

At the end of the task, include:
- the checklist categories materially improved by this work
- any checklist categories still below acceptable threshold in the touched scope
- a concise scorecard impact note (for example: “improves homepage integration quality from failing/poor toward adequate/strong”)
- any remaining hard-stop risks that prevent overall closure

Do not claim closure merely because the code compiles or the local preview looks better.
