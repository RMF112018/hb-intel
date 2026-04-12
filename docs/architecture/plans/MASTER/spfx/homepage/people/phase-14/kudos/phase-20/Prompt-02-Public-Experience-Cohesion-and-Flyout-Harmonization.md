# Prompt 02 — Public experience cohesion and flyout harmonization

## Objective

Make the public HB Kudos experience feel more clearly like one product surface and harmonize the related flyout/body language across archive, “view all”, article reading, and composer-adjacent surfaces.

## Files in scope

Primary targets:
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx` if present / used

You may add narrowly scoped local helpers/components if they materially improve cohesion and clarity.

## Problems to correct

### 1. The public experience is still compositionally fragmented
The masthead/featured area, archive zone, feed panel, article reader, and composer-adjacent panel language should feel more unified.

### 2. Flyout bodies are not yet harmonized enough
The current shared shell is good, but the internal content grammar still needs stronger consistency:
- heading rhythm
- metadata treatment
- section spacing
- body width and reading rhythm
- action placement

### 3. “Read more” and related entry points need clearer content behavior
These entry points should feel more coherent and more readable without changing the core runtime behavior.

## Required implementation direction

### 1. Strengthen public experience continuity
Improve the relationship between:
- featured card
- recent list
- archive
- view-all/feed panel
- article reader
- composer shell relationship where relevant

### 2. Harmonize flyout and body grammar
Create a clearer family resemblance across these surfaces.
Do not make them identical.
Do make them feel system-owned and intentionally related.

### 3. Improve content readability
Refine:
- body width
- metadata rhythm
- section headings
- truncation/read-more behavior
- scan order

### 4. Preserve behavior
Do not regress:
- archive expand/collapse/search
- feed panel behavior
- article reader behavior
- composer launch behavior
- public recognition flow semantics

## Constraints

- This is not a broad redesign of the public workflow model.
- Do not reopen Wave 2 decomposition unless a narrow supporting change is required.
- Do not flatten the public surface into a generic content card stack.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not make visual changes with no structural UX value.
- Do not reduce affordance clarity.

## Deliverable

Implement the harmonization and report:
- what public-surface relationships were tightened
- what flyout/body grammar became more consistent
- any narrow supporting structural change made to support that cohesion
