# Prompt 02 — Redefine Safety Information Architecture And Contracts

## Objective
Replace the current shallow event-type content contract with a stronger safety homepage model that can express an enterprise safety posture, current priorities, and follow-on action clarity.

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
- `apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts`
- `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts`
- `apps/hb-webparts/src/homepage/helpers/authoringGovernance.ts`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceWebPart.manifest.json`
- compare with `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx` for maturity reference only

## Current gap to close
Safety currently supports only title, summary, eventType, indicator, freshness, CTA, and ordering. That is not enough to tell a decisive “what matters now” safety story or support a richer homepage product surface.

## Required implementation outcome
Design and implement a stronger contract. It should support, at minimum:
- top-line summary or roll-up status
- primary spotlight item
- bounded secondary signals or grouped sections
- stronger urgency/context metadata (for example region/site/project/scope/owner)
- section-level CTA strategy
- compact/minimal mode compatibility
Update normalization and governance messaging accordingly. Keep the contract disciplined; do not bloat it with fields that have no clear homepage use.

## Proof of closure required
- show the old and new TypeScript contract shapes
- explain why each new field exists
- show how normalization now produces a stronger homepage view-model
- update default manifest data so the packaged fallback demonstrates the new grammar rather than the old two-item toy model

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
