# Prompt 04 — Shared Kudos UI seams and variant hardening

## Objective

Strengthen the shared local HB Kudos UI seams so the public and companion surfaces are supported by a more disciplined local product layer instead of repeated one-off patterns.

## Files in scope

- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`

You may add narrowly scoped local files for:
- shared local variants
- shared local surface shells
- shared row/action/section helpers
- local alias tokens if still needed

## Problems to correct

### 1. `KUDOS_GOV_TOKENS` is not yet strong enough
If it remains, it must behave like a disciplined alias layer, not a raw palette.

### 2. Variant logic remains weak
Rows, actions, chips, sections, and related states should be formalized through real variant systems rather than repeated local styling decisions.

### 3. Public and companion family resemblance should improve
They do not need identical composition.
They should clearly share a stronger local product language.

## Required implementation direction

### 1. Strengthen local shared seams
Make shared local Kudos UI seams do more of the real work and reduce repeated local implementation choices.

### 2. Formalize variants
Use the Wave 1-approved stack and posture consistently.
Where variants already exist implicitly, make them explicit.

### 3. Improve consistency without flattening differences
The public and companion surfaces can remain purpose-specific.
They should feel more clearly like one product family.

## Constraints

- Do not promote local-only patterns into global ui-kit unless reuse beyond Kudos is clearly justified.
- Do not broadly redesign layout here unless needed to support stronger shared seams.
- Do not regress Wave 1 doctrine compliance.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not leave repeated one-off patterns behind if a stable shared local seam clearly makes sense.
- Do not over-centralize to the point that local intent becomes opaque.

## Deliverable

Implement the hardening and report:
- which local shared seams became stronger
- which variants were formalized
- how public and companion now align more clearly as one product family
