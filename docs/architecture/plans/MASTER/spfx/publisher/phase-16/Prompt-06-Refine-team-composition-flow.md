# Prompt 06 — Refine team composition flow

## Objective

Make teammate composition faster, clearer, and lower-friction without disturbing the already-good directory-driven foundation.

## Why this issue matters

Repo truth shows the team flow is already one of the stronger parts of the product:
- picker-based teammate lookup is live
- the flyout pattern is already in place
- featured and sort-order invariants already exist

That means the remaining Wave 01 work is **refinement**, not replacement.
The prompt must focus on the remaining micro-friction that still slows authors down or makes team composition feel heavier than it should.

## Governing authority / required references

- live local repo mirroring `main` in `RMF112018/hb-intel`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- the attached Wave 01 audit package, especially:
  - `00-Audit-Summary.md`
  - `01-Repo-Truth-Implementation-Map.md`
  - `03-UI-UX-Findings-Register.md`
  - `04-Prioritized-Enhancement-Plan.md`

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/TeamPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/TeamMemberComposer.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/hydrateTeamMember.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/teamInvariants.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/TeammateAvatar.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/TeamPresentationPanel.tsx`
- any directly coupled tests for team-panel interactions or team invariants

Before making changes, conduct an exhaustive scrub of the full affected path and any directly coupled seams those files call into.

Do **not** re-read files already in active context unless you need to confirm drift, dependencies, contradictions, or uncertainty after new findings.

## Current-state problem description

The team flow is already materially improved.
The remaining opportunities are in:
- reducing micro-friction in add/edit flows
- making featured-state semantics more obvious
- making reorder and roster structure easier to read quickly
- sharpening empty-state and guidance language
- making the overall team section feel faster to complete

## Required implementation outcome

Refine the current team workflow rather than replacing it.

At minimum:

1. preserve the directory-driven flyout model
   - keep `HbcPeoplePicker`
   - keep the flyout-based add/edit path unless a directly coupled refinement requires a small structural adjustment

2. improve the clarity of roster structure
   - featured teammate / article-card lead semantics
   - roster ordering
   - edit/reorder affordances

3. reduce avoidable friction in the composer
   - reduce unnecessary author uncertainty when selecting a person, editing captions, or deciding whether to feature the teammate

4. improve team guidance language
   - empty states
   - helper text
   - edit and featured-state narration

5. preserve invariants
   - mutually exclusive featured state
   - stable sort-order behavior
   - current persistence expectations

## Dependencies / cross-surface considerations

- the preview surface depends on team composition output remaining structurally stable
- team presentation settings and team roster composition must stay coherent together
- do not widen scope into a broader people-directory refactor
- do not change persistence contracts unless required for honest closure and fully implemented now

## Validation / proof-of-closure requirements

Prove all of the following:

- teammate add/edit still works cleanly
- featured-state behavior remains correct
- reorder behavior remains correct
- the flow is easier to understand and complete than before
- no unrelated lifecycle, preview, or publish logic is altered

## Deliverables / closure artifacts

- code changes required for closure
- any narrowly necessary tests or validation updates for team-panel behavior
- a concise closure note summarizing:
  - what friction was removed
  - what invariants were preserved
  - what improved for authors in the live flow

## Explicit non-goals

- do not replace the existing people-picker pattern with a new person-selection architecture
- do not mix media-specific work into this prompt except where a directly shared helper truly requires it
- do not make unrelated styling-only edits
