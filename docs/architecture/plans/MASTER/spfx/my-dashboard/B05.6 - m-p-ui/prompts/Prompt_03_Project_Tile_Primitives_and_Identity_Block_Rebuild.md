# Prompt — 03 Project Tile Primitives and Identity Block Rebuild

## Objective

Replace the old project row posture with compact portfolio tiles centered on the locked **project name + project number** recognition block, remove visible source/provenance pills, disperse supporting content, and introduce the UI presentation helper that governs display sorting and visible-count behavior.


## Critical instruction — context efficiency

**Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.**

Use active context aggressively. Read only the files required for the current prompt, the tests you will update, exact type definitions needed to compile, and adjacent seams only when prompt truth requires it.


## Authoritative files

Primary edit/create files:

- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.module.css`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx`
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioTile.tsx` — create
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioTile.module.css` — create
- `apps/my-dashboard/src/modules/myProjects/myProjectPortfolioPresentation.ts` — create
- `apps/my-dashboard/src/modules/myProjects/myProjectPortfolioPresentation.test.ts` — create

Reference package files:

- `01_TARGET_STATE_DECISION_LOCK.md`
- `03_PROJECT_ITEM_COMPOSITION_SPEC.md`
- `04_BREAKPOINT_SHELL_FIT_CONTRACT.md`

## Critical instructions

- Do not build the final launch menu in this prompt; use a temporary compact action placeholder only if needed to preserve flow until Prompt 04.
- Do not render visible source pills.
- Do not reopen backend provider sort; implement UI presentation sorting only.
- Do not lose stage, role, name, number, or launch-action data.
- Preserve role label priority from the existing role definitions.

## Required working approach

1. Create `myProjectPortfolioPresentation.ts` with:
   - immutable display sorting by project name → project number → record key;
   - visible-count lookup by responsive mode:
     - phone 3
     - tabletPortrait 4
     - tabletLandscape 4
     - smallLaptop 4
     - standardLaptop 6
     - largeLaptop 6
     - desktop 6
     - ultrawide 6
   - helpers must not mutate source arrays.
2. Create `ProjectPortfolioTile.tsx` and CSS module.
3. Tile anatomy must reflect the locked composition spec:
   - name and number paired;
   - number near-primary;
   - stage supportive;
   - primary role chip + compact overflow treatment;
   - no source/provenance badge.
4. Rewire `MyProjectsHomeCard` to render a responsive tile grid using presentation-sorted items.
5. Update or add tests:
   - source pills absent;
   - name/number render inside tile contract;
   - display sort helper deterministic;
   - visible count helper deterministic;
   - resting tile grid DOM hooks present.
6. Keep enough temporary action slot compatibility so Prompt 04 can replace it cleanly without breaking all launch behavior.

## Specific questions you must answer

1. How is the tile identity hierarchy implemented?
2. How is the project number visually repositioned relative to the name?
3. How did you ensure source pills are no longer rendered?
4. How did you isolate UI display sorting from backend provider ordering?
5. What visible-count behavior is now encoded?

## Deliverables

- Prompt 03 implementation changes.
- Closeout report.
- Commit-ready summary and proposed commit message.

## Required report update

### Prompt-03 Progress — Tile Primitive and Recognition Hierarchy

Include:
- new files created;
- display sorting behavior;
- item anatomy confirmation;
- tests added/updated.

## Validation commands

```bash
pnpm --filter @hbc/spfx-my-dashboard test -- MyProjectsHomeCard
pnpm --filter @hbc/spfx-my-dashboard test -- myProjectPortfolioPresentation
```

If narrower invocation is not supported locally, run the package test command instead.

## Final instruction

Close Prompt 03 only when the old row/posture has been replaced by the locked tile composition and the display-helper contract is tested.
