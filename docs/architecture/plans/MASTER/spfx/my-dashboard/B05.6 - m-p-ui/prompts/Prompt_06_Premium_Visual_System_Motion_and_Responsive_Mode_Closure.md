# Prompt — 06 Premium Visual System, Motion, and Responsive Mode Closure

## Objective

Apply the premium visual and responsive closeout pass: refine card/tile/menu/browser materiality, implement deliberate motion where specified, complete breakpoint posture, and upgrade loading/empty/degraded state presentation without changing their underlying truth.


## Critical instruction — context efficiency

**Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.**

Use active context aggressively. Read only the files required for the current prompt, the tests you will update, exact type definitions needed to compile, and adjacent seams only when prompt truth requires it.


## Authoritative files

Primary edit files:

- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.module.css`
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioTile.module.css`
- `apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.module.css`
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioBrowser.module.css`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioTile.tsx`
- `apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.tsx`
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioBrowser.tsx`

Reference package files:

- `03_PROJECT_ITEM_COMPOSITION_SPEC.md`
- `04_BREAKPOINT_SHELL_FIT_CONTRACT.md`
- `05_ACCESSIBILITY_AND_INTERACTION_SPEC.md`
- `06_TEST_VALIDATION_AND_EVIDENCE_MATRIX.md`

## Critical instructions

- Do not reintroduce generic nested-card clutter.
- Do not reintroduce metrics, source pills, launch heading, or persistent button rails.
- Motion must be restrained and `prefers-reduced-motion` aware.
- Use `motion` materially where specified; do not add motion for its own sake.
- Use premium iconography where it improves clarity, not as filler.
- Upgrade loading/empty/degraded visuals, but keep truthful semantics and copy unless a narrow clarity fix is necessary.

## Required working approach

1. Refine tile visual rhythm:
   - stronger identity block;
   - balanced lower metadata/action distribution;
   - compact but credible spacing;
   - premium hover/focus response.
2. Refine card-level composition:
   - no dead scaffolding;
   - clearer header-to-grid rhythm;
   - refined degraded-state notice.
3. Refine launch menu:
   - polished elevation, border/materiality, separator rhythm if used;
   - stable edge positioning;
   - clear disabled option treatment.
4. Refine portfolio browser:
   - drawer/sheet posture;
   - governed scroll area;
   - clear search/header/body separation;
   - strong close affordance.
5. Motion:
   - tile press/hover refinement if appropriate;
   - menu and browser entry/exit transitions;
   - reduced-motion fallback.
6. Verify breakpoint behavior against the contract file.
7. Preserve home-surface span posture and overall page composition.

## Specific questions you must answer

1. What visual treatment establishes flagship quality without creating clutter?
2. How did you preserve strong recognition-first tile hierarchy?
3. How do desktop and handheld states differ?
4. Which motion behaviors were implemented?
5. How is reduced-motion handled?

## Deliverables

- Prompt 06 implementation changes.
- Closeout report.
- Commit-ready summary and proposed commit message.

## Required report update

### Prompt-06 Progress — Premium Visual and Responsive Closure

Include:
- materiality/polish improvements;
- motion added;
- breakpoint behaviors verified;
- state-presentation refinements;
- exact files changed.

## Validation commands

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

## Final instruction

Close Prompt 06 only when the module visually reads as a premium portfolio launcher across its target responsive modes.
