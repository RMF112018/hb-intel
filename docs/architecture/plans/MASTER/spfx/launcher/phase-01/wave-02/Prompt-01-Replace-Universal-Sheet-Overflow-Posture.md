# Prompt 01 — Replace Universal Sheet Overflow Posture

    ## Objective

    Stop enforcing the same modal bottom-sheet overflow posture across all display classes and rebuild overflow to fit the device context.

    ## Governing Authorities

    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
    - relevant benchmark material under `docs/reference/spfx-surfaces/benchmark/`

    Treat the doctrine as binding. Where the checklist or scorecard is softer than the doctrine, the doctrine wins.

    ## Exact Repo Files / Seams to Inspect

    - `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/types.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- any variant or constant files required to support the new contract

    ## Current Gap to Close

    The current implementation hard-locks a sheet for overflow everywhere. That is acceptable for phone, but too blunt and too modal for desktop and much of tablet.

    ## Required Outcome

    Deliver a display-class-appropriate overflow model. Phone may keep a sheet. Wider classes should use a lighter-weight, more integrated secondary-launch surface when justified by actual slot width.

    ## Proof of Closure

    - Define the new overflow-mode contract by display class.
- Show the exact runtime markers emitted for each overflow mode.
- Capture proof at desktop, tablet, and phone widths.
- Confirm focus handling, dismissal, and keyboard safety remain correct.

    ## Constraints

    - Do not broaden into a full homepage shell rewrite.
- Preserve the current launcher's host-safe overlay behavior.
- Keep the redesign centered on secondary-launch UX, not unrelated aesthetic experiments.

    ## Execution Discipline

    - Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.
    - Do not make unrelated visual or architectural changes.
    - Do not protect the current implementation merely because it already compiles or already uses shared homepage primitives.
    - If you discover a stronger structural correction within the scoped seams, take it and document exactly why.
