# Prompt 02 — Iconography compliance and premium-stack adoption

## Objective

Remove all non-compliant Unicode / pseudo-icon usage from homepage-facing HB Kudos UI and replace it with a governed icon system, while beginning material adoption of the approved homepage premium stack where it is clearly relevant.

## Files in scope

At minimum:
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- any narrowly scoped local helper / wrapper files you create for icon discipline

## Required implementation direction

### 1. Remove all non-compliant icon usage
Replace Unicode / pseudo-icon patterns such as:
- trophy glyphs
- spark / star glyphs
- thumbs-up glyphs
- chevrons
- arrows
- any similar text-based icon substitutes in homepage-facing Kudos UI

### 2. Use a real icon system
Preferred implementation:
- `lucide-react`

Create a thin local Kudos icon seam if needed so icon usage is consistent and not scattered.

### 3. Begin real premium-stack usage
Where icon, class-composition, and surface variants clearly need it, materially adopt:
- `lucide-react`
- `clsx`
- `class-variance-authority`

Use `motion` only where it improves micro-interactions in a restrained, host-safe way.
Do not add it everywhere.
Do not animate for decoration.

### 4. Preserve interaction meaning
Do not simply swap visuals.
Preserve:
- CTA meaning
- semantic button behavior
- accessible naming
- current user understanding of the interface

## Constraints

- This prompt is not the full styling-architecture refactor, but it should not leave icon usage half-converted.
- Do not redesign workflow logic.
- Do not restructure the full product just to replace icons.
- Do not reintroduce icons as decorative clutter.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not regress focus behavior or keyboard usability.
- Do not leave mixed icon systems behind unless a temporary bridging seam is explicitly required and clearly documented.

## Deliverable

Implement the changes and report:
- every file changed
- every pseudo-icon pattern removed
- the exact icon seam / pattern now used
- where the approved premium stack is now materially in use
