# Prompt 02 — Accessibility And Interaction Safety Closure

## Objective
Validate the rebuilt Safety experience against keyboard, focus, touch, and reduced-motion expectations required by the homepage overlay and WCAG-aligned practices.

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
- rebuilt safety surface component(s)
- any CTA/action subcomponents involved
- story/harness routes used for testing
- focus-visible and reduced-motion seams

## Current gap to close
The doctrine is explicit that homepage surfaces must have visible keyboard focus indicators, reduced-motion support, and no hover-only access to primary meaning. The rebuild needs proof, not assumptions.

## Required implementation outcome
Validate and correct as needed:
- keyboard reachability and focus order
- visible focus styling
- touch-safe targets in compact states
- no primary meaning hidden behind hover
- `prefers-reduced-motion` behavior for interaction-triggered motion
- accessible names/labels for interactive UI where needed

## Proof of closure required
- provide a concise accessibility verification matrix
- explicitly call out any fixes made
- verify reduced-motion behavior with the repo’s real motion implementation rather than just asserting it
- verify the compact/minimal states remain fully usable

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
