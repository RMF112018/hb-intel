# Prompt 03 — Accessibility system and interaction clarity pass

## Objective

Turn the current ad hoc accessibility intent into a more systematic, repeatable HB Kudos interaction standard across the public and companion experiences.

## Files in scope

- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx` if present / used
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`

## Problems to correct

### 1. Accessibility treatment is not systematic enough
Focus-visible, reduced-motion, and control-state treatment should be more consistent and intentional.

### 2. Companion controls still feel visually and behaviorally fragmented
Toolbar inputs, toggles, actions, and control groupings should feel clearer and more consistent.

### 3. “Read more” and flyout-body content patterns need stronger accessibility discipline
These patterns need better structure and clearer behavior.

## Required implementation direction

### 1. Systemize focus-visible behavior
Ensure a clearer and more consistent keyboard-focus treatment across public and companion interactive elements.

### 2. Systemize reduced-motion handling
Where motion exists, make sure reduced-motion expectations are handled consistently rather than piecemeal.

### 3. Improve interaction clarity
Refine:
- disabled states
- loading / busy states
- control grouping clarity
- action hierarchy
- input/toolbar readability

### 4. Strengthen content accessibility discipline
Improve:
- excerpt/read-more structure
- flyout content hierarchy
- reading rhythm
- button/link semantics where relevant
- screen-reader clarity where appropriate

## Constraints

- Do not over-animate the homepage.
- Do not reduce surface richness in the name of simplicity.
- Do not perform a massive accessibility-only abstraction if a focused local improvement is enough.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not create accessibility regressions while refactoring style or control rhythm.
- Do not turn this into a broad form-system rewrite.

## Deliverable

Implement the pass and report:
- accessibility-system improvements made
- interaction-clarity improvements made
- any remaining known limitations that should be deferred to later waves
