# Prompt 05 — P1 Premium stack adoption and interaction upgrade

## Objective

Use the approved premium stack **more materially where relevant** so the HB Kudos Companion feels like a stronger premium SPFx governance surface rather than a manually composed internal tool with limited interaction refinement.

## Governing authority

Treat the following as binding:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Key doctrine implications for this prompt:

- the approved premium stack is expected where relevant
- installing stack elements symbolically without materially using them is non-compliant
- premium SPFx motion and interaction should be refined, host-safe, and restrained
- the result must remain page-canvas-safe and must not fight SharePoint

## Files in scope

Primary targets:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/governance.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- any narrowly scoped helper files required for clean stack adoption

## Problem to solve

The Companion currently benefits from some doctrine-aligned ingredients, but not enough of the approved premium stack is being used in ways that materially improve the rendered operator experience.

The result still feels underpowered relative to the doctrine’s top-of-class SPFx standard.

## Required implementation direction

### 1. Identify relevant stack opportunities
Use only the stack elements that genuinely improve this specific surface.

Likely relevant areas include:

- better icon treatment and consistency
- micro-help / tooltip refinement
- anchored or contextual overlay improvement where useful
- cleaner variant composition
- restrained interaction transitions or motion where useful

### 2. Improve interaction polish without host conflict
Any motion or overlay work must be:

- restrained
- performant
- keyboard-safe
- `prefers-reduced-motion` aware
- host-safe in SharePoint

### 3. Avoid symbolic or performative adoption
Do not add libraries or wrappers that do not materially improve the result.

### 4. Keep the Companion operational
Do not turn the governance workspace into an editorial experiment. The end state should still feel operational first, just more premium, polished, and productized.

## Constraints

- Do not create fake shell behaviors.
- Do not introduce theatrical motion.
- Do not broaden scope into public-homepage hero work.
- Do not replace strong existing primitives unless the replacement is clearly better and doctrine-aligned.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Use the approved stack deliberately, not symbolically.
- Preserve accessibility, role safety, and SharePoint-hosted reliability.

## Deliverable

Implement the premium-stack interaction upgrade and report:

- which stack elements were used materially
- where interaction polish improved
- how the result remains restrained, host-safe, and doctrine-aligned
