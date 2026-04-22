# Prompt 01 — Reclassify Safety Shell Semantics And Homepage Placement

## Objective
Re-govern `safety-field-excellence` as an operational homepage surface rather than a newsroom-adjacent supporting occupant, and update the default flagship preset accordingly.

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
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/presetLibrary.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- any shell validation or preset diagnostics files touched by the change

## Current gap to close
`occupantRegistry.ts` currently classifies Safety with `prominenceCeiling: 'supporting'`, `firstLaneEligible: false`, and allows `communications-newsroom`. The default preset then places Safety in row 2 as a minor secondary occupant beside Company Pulse. That directly undercuts the intended operational/safety role.

## Required implementation outcome
Implement a corrected shell posture. At minimum:
- remove newsroom semantics unless there is an explicit and defensible reason to keep them
- raise Safety’s shell prominence to match an operationally serious surface
- stop defaulting Safety to the row-2 newsroom passenger slot
- choose and implement a better flagship default: either a true operational first-lane pairing with Project Portfolio Spotlight or a full-width operational band immediately before communications
- preserve shell governance discipline and diagnostics

## Proof of closure required
- show the before/after occupant descriptor for Safety
- show the before/after default preset band composition
- prove the new preset remains canonical under shell validation
- explain why the new placement better satisfies the homepage overlay’s first-lane and shell-fit doctrine

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
