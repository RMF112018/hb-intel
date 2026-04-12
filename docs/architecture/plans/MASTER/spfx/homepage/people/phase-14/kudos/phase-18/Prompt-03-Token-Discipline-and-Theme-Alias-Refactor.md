# Prompt 03 — Token discipline and theme-alias refactor

## Objective

Correct the weak token posture in HB Kudos so the UI no longer behaves as though it owns an independent raw palette and spacing system.

## Files in scope

Primary targets:
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`

## Problems to correct

### 1. Raw palette sprawl
The current implementation uses too many local:
- hex values
- rgba values
- hardcoded px spacing values
- one-off surface color definitions

### 2. Local token registry is not sufficiently governed
If `KUDOS_GOV_TOKENS` remains, it must become a disciplined alias layer derived from shared theme semantics rather than acting as a standalone palette.

### 3. Public and companion surfaces should feel related
They do not need identical styling, but their color/material/spacing language should clearly come from the same product family.

## Required implementation direction

### 1. Move toward theme-derived aliases
Refactor the current local token posture so it is meaningfully derived from shared theme semantics.
A thin local alias layer is acceptable and expected.
A raw palette as the primary design source is not.

### 2. Reduce hardcoded spacing sprawl
Where repeated spacing values are part of the surface grammar, consolidate them.
You do not need to create an over-engineered spacing framework.
You do need to stop letting repeated magic values dominate the source.

### 3. Preserve premium presentation-lane character
Do not make the surface sterile.
Keep the richer, authored feel while grounding it in a governed token posture.

## Constraints

- Do not broadly redesign layout in this prompt unless required to support token cleanup.
- Do not perform the full styling-architecture rebuild here; focus on the token foundation.
- Do not touch unrelated People & Culture surfaces.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not leave partially migrated token usage with no clear direction.
- Do not remove necessary local aliases if they materially help maintainability.

## Deliverable

Implement the refactor and report:
- what raw token sprawl was removed
- what local alias structure now exists
- how that alias structure now relates to shared theme semantics
