# Prompt 01 — Promote a Split-Safe People & Culture Public Surface into the Governed Homepage Family

## Objective

Remove the current inline-style, local-surface drift in `PeopleCulturePublicSurface.tsx` by creating a split-safe shared homepage family for the non-recognition People & Culture public lane.

## Governing authority

Binding:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Benchmark context:
- `docs/architecture/plans/MASTER/spfx/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

## Exact seams to inspect

- `apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublic.tsx`
- `apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublicSurface.tsx`
- any adjacent public People & Culture helper or adapter files
- `packages/ui-kit/src/homepage.ts`
- any new shared surface files you add under `packages/ui-kit/src/`

## Current future-state gap to close

The current public People & Culture runtime deliberately avoided `@hbc/ui-kit/homepage` to prevent re-coupling with Kudos. That split-runtime intention is valid.

The problem is the result:
- extensive inline styling
- raw values
- local width rules
- weaker repeatability and governance

The split should remain. The presentation drift should not.

## Required implementation outcome

1. Create a new split-safe shared homepage surface family for the non-recognition People & Culture public lane.
2. Preserve the hard separation from HB Kudos and any merged-shape legacy coupling.
3. Move the durable premium presentation grammar out of the local inline-style component.
4. Keep the consumer thin:
   - config resolution
   - normalization
   - audience logic
   - media resolution orchestration where appropriate
   - then delegate rendering into the shared governed surface
5. Remove or dramatically reduce raw inline style usage in the local public runtime.

## Proof of closure

Show:
- new shared surface files
- local consumer before vs after responsibilities
- how the split boundary remains hard
- which raw inline style regimes were eliminated
- why the resulting surface is more benchmarkable and more repeatable

## Constraints

- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not collapse public People & Culture back into HB Kudos.
- Do not lose the public lane’s distinct persona.
