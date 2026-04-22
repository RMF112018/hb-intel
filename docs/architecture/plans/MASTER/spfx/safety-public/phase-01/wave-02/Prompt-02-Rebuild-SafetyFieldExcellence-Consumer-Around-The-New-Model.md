# Prompt 02 — Rebuild SafetyFieldExcellence Consumer Around The New Model

## Objective
Update `SafetyFieldExcellence.tsx` so it maps the new contract into the rebuilt safety homepage surface with a stronger operational hierarchy, better CTA strategy, and explicit state handling.

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
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx`
- `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts`
- `apps/hb-webparts/src/homepage/helpers/authoringGovernance.ts`
- any new homepage data/state helpers you add

## Current gap to close
The current consumer is too thin for the new target because the underlying model is too shallow and the rendered result lacks true “what matters now” hierarchy and runtime maturity.

## Required implementation outcome
Rebuild the consumer so it:
- maps the new safety homepage model cleanly
- renders stronger loading / empty / invalid / runtime-error distinctions
- exposes section-level CTA or action strategy when appropriate
- distinguishes stale content from valid fresh content more credibly
- keeps non-visual responsibilities clear and does not push shell logic into the consumer

## Proof of closure required
- show the final consumer responsibilities in bullet form
- show the state matrix for loading / empty / invalid / runtime error / valid
- show that the consumer no longer relies on the old shallow event-type-only assumptions
- prove the result still stays disciplined and is not a monolithic component

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
