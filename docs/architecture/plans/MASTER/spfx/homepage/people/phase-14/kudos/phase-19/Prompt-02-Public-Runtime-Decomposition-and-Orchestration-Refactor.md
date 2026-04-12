# Prompt 02 — Public runtime decomposition and orchestration refactor

## Objective

Refactor the public HB Kudos runtime so `HbKudos.tsx` is no longer an over-responsible orchestration file and the public surface becomes more clearly productized and maintainable.

## Files in scope

Primary targets:
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx` if present / used

You may add narrowly scoped local files for:
- public data orchestration hooks
- recipient photo hydration helpers
- public controller hooks
- host-safe layout helpers
- public flyout / feed / article coordination helpers

## Problems to correct

### 1. `HbKudos.tsx` owns too many concerns
Reduce the number of responsibilities held directly in the top-level runtime.

### 2. Public composition is not systemically premium
The surface already has visual ambition.
Wave 2 should make the public surface feel more clearly like a productized recognition system rather than a hand-shaped orchestration file with strong styling.

### 3. Public controller concerns should be easier to reason about
Composer, feed panel, article reader, archive behavior, celebrate action, and photo hydration should not all pile into the same top-level file without clearer boundaries.

## Required implementation direction

### 1. Thin the top-level runtime
Refactor `HbKudos.tsx` into a thinner orchestrator that mostly:
- assembles derived data
- wires event handlers
- renders product-level composition

### 2. Extract focused local seams
Create focused local hooks/helpers/components where clear boundaries exist.
Examples are acceptable if they genuinely clarify the runtime.

### 3. Preserve existing behavior
Do not regress:
- public visibility filtering
- archive behavior
- composer behavior
- feed panel behavior
- article reader behavior
- celebrate mutation
- recipient photo hydration
- hosted assistant safe-zone intent

### 4. Improve productization
The public surface should read more clearly as a system-owned recognition surface.
Do this through cleaner orchestration and clearer structure, not through broad visual redesign.

## Constraints

- This is not the broad wave for archive/feed/composer experience harmonization.
- Do not redesign the workflow model.
- Do not remove working SharePoint host-safe behavior unless you replace it with a clearer equivalent.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not create meaningless wrapper files.
- Do not spread logic into too many tiny files if that harms readability.
- Improve structure, not fragmentation.

## Deliverable

Implement the refactor and report:
- the final public runtime component/hook breakdown
- what responsibilities left `HbKudos.tsx`
- any behavior preserved intentionally
- any narrowly scoped behavior change made on purpose
