# Prompt — 04 Project Launch Menu and Action Affordance Implementation

## Objective

Replace persistent dual action controls with the locked per-project **Open** menu using premium anchored overlay behavior, truthful available/unavailable semantics, keyboard closure, and accessible focus restoration.


## Critical instruction — context efficiency

**Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.**

Use active context aggressively. Read only the files required for the current prompt, the tests you will update, exact type definitions needed to compile, and adjacent seams only when prompt truth requires it.


## Authoritative files

Primary edit/create files:

- `apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.tsx` — create
- `apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.module.css` — create
- `apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.test.tsx` — create
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioTile.tsx`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/package.json` if premium dependencies are not already package-accessible
- workspace lockfile if dependency installation requires it

Reference package files:

- `01_TARGET_STATE_DECISION_LOCK.md`
- `05_ACCESSIBILITY_AND_INTERACTION_SPEC.md`
- `07_DEPENDENCY_AND_FILE_OWNERSHIP_MAP.md`

## Critical instructions

- The final resting tile must render one explicit `Open` trigger, not persistent SharePoint/Procore buttons.
- Use `@floating-ui/react` for anchored positioning.
- Add and materially use the required dependencies if absent from `apps/my-dashboard/package.json`.
- Available actions remain real anchors with `target="_blank"` and `rel="noopener noreferrer"`.
- Unavailable actions must not be fake links.
- Only one menu may be open at a time where shared card/browser state manages concurrency.
- Do not build the full portfolio browser yet; that lands in Prompt 05.

## Required working approach

1. Implement `ProjectLaunchMenu`.
2. Trigger contract:
   - visible `Open` label;
   - accessible project-specific label;
   - `aria-haspopup="menu"`;
   - `aria-expanded`.
3. Menu content:
   - SharePoint action label from existing row action model;
   - Procore action from existing row action model;
   - disabled/non-link unavailable items with accessible explanation.
4. Keyboard contract:
   - Enter/Space open;
   - Escape close and focus returns;
   - sensible arrow-key movement if implemented through local menu logic;
   - outside click close.
5. Rewire `ProjectPortfolioTile` to use menu.
6. Add tests for:
   - trigger semantics;
   - available links;
   - unavailable non-link states;
   - Escape close/focus restoration;
   - DOM hooks.

## Specific questions you must answer

1. How are existing SharePoint Site/Folder action labels preserved?
2. How is unavailable-action honesty preserved?
3. How is focus restoration implemented?
4. Which premium dependencies were added or reused?
5. How is the final tile freed from persistent dual-button action rails?

## Deliverables

- Prompt 04 implementation changes.
- Closeout report.
- Commit-ready summary and proposed commit message.

## Required report update

### Prompt-04 Progress — Launch Menu Closure

Include:
- new menu component files;
- dependencies added/reused;
- available/unavailable action behavior;
- keyboard/focus behavior;
- validation results.

## Validation commands

```bash
pnpm --filter @hbc/spfx-my-dashboard test -- ProjectLaunchMenu
pnpm --filter @hbc/spfx-my-dashboard test -- MyProjectsHomeCard
pnpm --filter @hbc/spfx-my-dashboard check-types
```

If narrower test targeting is unsupported, run the package-wide test command.

## Final instruction

Close Prompt 04 only when the `Open` menu replaces the persistent dual-button rail and the menu behavior is tested.
