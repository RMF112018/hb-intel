# Prompt 02 — Recompose the first-pass authoring path

## Objective

Reshape the default authoring experience so an author can move from blank draft to credible first draft faster, with less visible structure competing for attention during the first-pass compose flow.

## Why this issue matters

Repo truth already shows several progressive-disclosure improvements.
However, the product still asks the author to process a large amount of structure across:
- the queue rail
- the numbered center canvas
- the readiness rail
- advanced/guidance controls that are already technically available but not always first-pass necessary

Wave 01 does **not** need a vague “guided mode” concept.
It needs a clearer **first-pass compose path** that privileges the fields authors must actually complete first.

## Governing authority / required references

- live local repo mirroring `main` in `RMF112018/hb-intel`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` — only where homepage-derived primitives materially affect the Publisher
- the attached Wave 01 audit package, especially:
  - `00-Audit-Summary.md`
  - `01-Repo-Truth-Implementation-Map.md`
  - `03-UI-UX-Findings-Register.md`
  - `04-Prioritized-Enhancement-Plan.md`

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/MetadataPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/HeroPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/StoryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/TeamPresentationPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/DestinationBindingPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/useActiveSection.ts`
- any section-anchor, finding-anchor, or focus-jump helpers directly coupled to the canvas structure

Before making changes, conduct an exhaustive scrub of the full affected path and any directly coupled seams those files call into.

Do **not** re-read files already in active context unless you need to confirm drift, dependencies, contradictions, or uncertainty after new findings.

## Current-state problem description

The repo already hides a meaningful amount of advanced structure, but the default composition path still spreads attention too broadly.

The author still encounters more immediate structure than the first-pass task truly requires.
The result is an experience that is better than an admin-form baseline, but still more verbose and section-heavy than it should be for repeat editorial use.

## Required implementation outcome

Create a more decisive **first-pass compose path** without damaging governed depth.

The live implementation after this prompt should:

1. privilege the core first-pass sequence
   - project
   - headline
   - summary / subhead
   - body
   - hero image

2. reduce immediate on-screen burden
   - advanced editorial metadata, presentation controls, and governance readouts should not compete with the first-pass compose path unless needed
   - do this through deliberate composition, not merely tighter spacing

3. keep deeper controls available
   - advanced and governance-sensitive controls must remain reachable
   - do **not** strand destination/binding/readiness-sensitive information behind irretrievable UI

4. preserve the existing navigation and validation contract
   - numbered sections, anchors, validation jump targets, and section focus behavior must remain reliable
   - readiness findings must still land the author in the correct place

5. leave the result visibly more guided
   - the finished experience must be meaningfully easier to parse for a first draft
   - a minor cosmetic shuffle is not enough

## Dependencies / cross-surface considerations

- Prompt 03 and Prompt 04 depend on section anchors and validation jump targets remaining stable
- the queue rail, create-new path, save path, and readiness rail must continue to function without state-loss side effects
- if you conditionally hide or defer controls, preserve their state correctly when they are revealed again
- do not solve this by duplicating fields into multiple places

## Validation / proof-of-closure requirements

Prove all of the following:

- an author can reach the first-pass fields with less visible cognitive overhead than before
- advanced metadata and governed controls remain accessible
- readiness findings still map back to the correct section
- queue selection, create-new, save, preview, and publish flows still work
- the result is clearly a stronger first-pass authoring path, not just a spacing-only revision

## Deliverables / closure artifacts

- code changes required for closure
- any narrowly necessary tests or validation updates
- a concise closure note summarizing:
  - what structural changes were made to the first-pass compose path
  - what remained available but demoted
  - what was done to preserve anchor/jump/readiness integrity

## Explicit non-goals

- do not re-architect the entire product shell
- do not introduce a separate mode system unless the implementation truly needs it
- do not make unrelated visual-polish changes that are not necessary to first-pass-flow closure
