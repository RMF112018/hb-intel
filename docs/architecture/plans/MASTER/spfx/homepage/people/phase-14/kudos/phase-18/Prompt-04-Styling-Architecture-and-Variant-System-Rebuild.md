# Prompt 04 — Styling architecture and variant-system rebuild

## Objective

Correct the biggest Wave 1 liability: the HB Kudos styling architecture.

Refactor the UI layer so it is no longer dominated by giant injected `<style>` blocks, giant inline style objects, and ad hoc per-component styling decisions.

## Files in scope

- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- any narrowly scoped new local files needed for classes, variants, or shared surface primitives

## Required implementation direction

### 1. Reduce giant injected style blocks
Where style blocks currently carry most of the public-surface and archive styling logic, replace that dominant posture with a more maintainable styling approach.

### 2. Reduce giant inline-style object dominance
Move repeated surface treatments out of giant inline objects.
Use:
- classes
- shared local helpers
- variant systems
- composable surface primitives

### 3. Formalize variants
Use `class-variance-authority` and `clsx` materially for real repeated variant patterns, such as:
- public masthead controls
- featured card states
- recent rows
- archive rows / controls
- governance action controls
- queue rows
- flyout content sections

### 4. Preserve the authored visual standard
Do not remove:
- stronger hierarchy
- richer materiality
- premium surface feel
- presentation-lane identity

This is a rebuild of the styling posture, not a simplification pass.

## Constraints

- Do not perform broad workflow or state logic rewrites.
- Do not convert everything to a totally generic component library look.
- Do not over-engineer a massive abstraction layer that slows future work.
- Be disciplined and purposeful.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not leave half of the styling system in old inline form and half in new class/variant form without a clear boundary.
- Do not weaken hover, focus, and micro-interaction quality in the process.

## Deliverable

Implement the styling rebuild and report:
- which large style concentrations were removed or reduced
- which new variant systems were introduced
- what surface primitives / local styling seams now govern the repeated patterns
