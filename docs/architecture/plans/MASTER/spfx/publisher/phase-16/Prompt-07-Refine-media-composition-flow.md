# Prompt 07 — Refine media composition flow

## Objective

Make image composition feel faster, clearer, and more confidence-building while preserving the current gallery/featured/alt-text governance model.

## Why this issue matters

Repo truth shows the media flow is already substantially improved:
- image grid is live
- composer flyout is live
- alt-text guidance is live
- featured-gallery invariants are live

The remaining Wave 01 work is about reducing the remaining author drag in a flow that is already functionally capable.

## Governing authority / required references

- live local repo mirroring `main` in `RMF112018/hb-intel`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- the attached Wave 01 audit package, especially:
  - `00-Audit-Summary.md`
  - `01-Repo-Truth-Implementation-Map.md`
  - `03-UI-UX-Findings-Register.md`
  - `04-Prioritized-Enhancement-Plan.md`

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/GalleryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/MediaComposer.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/buildMediaRow.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/mediaInvariants.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/altTextGuidance.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/SecondaryImagePanel.tsx`
- any directly coupled tests for media composition, alt-text gating, or gallery invariants

Before making changes, conduct an exhaustive scrub of the full affected path and any directly coupled seams those files call into.

Do **not** re-read files already in active context unless you need to confirm drift, dependencies, contradictions, or uncertainty after new findings.

## Current-state problem description

The media flow is already better than a row-editor baseline.
The remaining friction is in:
- how clearly the flow explains gallery vs supporting roles
- how confidently the author can understand featured-image behavior
- how readable the readiness and guidance language feels
- how many small decisions still feel heavier than they should

## Required implementation outcome

Refine the current media workflow rather than replacing it.

At minimum:

1. preserve the current structural model
   - grid/list of existing media
   - flyout composer
   - featured-gallery invariant
   - alt-text requirement and guidance

2. improve author clarity around image roles
   - gallery vs supporting
   - featured / card-thumbnail behavior
   - any directly coupled relationship to secondary image or hero-image surfaces that affects author understanding

3. improve composer confidence
   - source selection
   - preview/load-error handling
   - alt-text and caption coaching
   - guidance language that helps the author complete the flow faster

4. preserve structural and accessibility safeguards
   - no regression in alt-text gating
   - no regression in featured and sort-order invariants
   - no regression in keyboard or button behavior

## Dependencies / cross-surface considerations

- preview rendering depends on gallery/media output remaining structurally stable
- if there is shared guidance language between gallery and secondary-image paths, keep it truthful and coordinated
- do not widen scope into a broad asset-library platform refactor
- do not weaken current alt-text safeguards to make the flow feel “faster”

## Validation / proof-of-closure requirements

Prove all of the following:

- media add/edit still works cleanly
- featured-image behavior remains correct
- reorder behavior remains correct
- alt-text gating and guidance remain correct
- the author can understand and complete the media flow with less friction than before

## Deliverables / closure artifacts

- code changes required for closure
- any narrowly necessary tests or validation updates for media-panel behavior
- a concise closure note summarizing:
  - what friction was removed
  - what guidance improved
  - what invariants and accessibility safeguards were preserved

## Explicit non-goals

- do not replace the existing gallery/composer architecture
- do not widen scope into unrelated hero-image redesign work except where directly coupled guidance requires alignment
- do not make unrelated styling-only edits
