# Prompt 03 — Model-grade homepage surface standard and reference-quality closure

## Objective

Raise HB Kudos from a strong implementation to a **model-grade homepage surface** that can serve as a reference for future homepage work.

## Files in scope

Primary targets:
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx` if present / used
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`

## Problems to correct

### 1. The implementation is strong, but the final quality bar is higher
Wave 4 should ensure the surface is not merely “working” or “visually good.”
It should be reference-quality:
- coherent
- governed
- maintainable
- polished
- professional
- suitable to model future homepage surfaces

### 2. Final small quality gaps may remain
If narrow, clearly justified gaps still prevent HB Kudos from being a model-grade surface, close them here.

## Required implementation direction

### 1. Apply a reference-surface quality bar
Review the final HB Kudos implementation against the question:
“Would this be acceptable as the model surface other homepage webparts should learn from?”

If the answer is not yet fully yes, close the remaining narrow gaps.

### 2. Keep this focused
Do not reopen broad prior-wave work.
This is a final standards-and-closure pass, not a new redesign.

### 3. Preserve role identity
The public and companion surfaces should both meet a high standard while remaining clearly purpose-specific.

## Constraints

- Do not re-architect the product again.
- Do not add new features simply to make the surface feel “bigger.”
- Do not destabilize runtime behavior while chasing perfection.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not make cosmetic-only changes with no reference-quality value.
- Do not weaken maintainability in the name of final polish.

## Deliverable

Implement any remaining narrow improvements needed to meet the model-grade bar and report:
- what final gaps were closed
- why those changes were necessary to call the surface reference-quality
- what makes HB Kudos acceptable as a model homepage surface after this pass
