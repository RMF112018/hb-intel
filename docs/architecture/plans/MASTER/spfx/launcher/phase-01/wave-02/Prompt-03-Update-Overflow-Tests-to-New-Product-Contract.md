# Prompt 03 — Update Overflow Tests to New Product Contract

    ## Objective

    Update the launcher test suite so it protects the stronger overflow product contract rather than the current weaker one.

    ## Governing Authorities

    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
    - relevant benchmark material under `docs/reference/spfx-surfaces/benchmark/`

    Treat the doctrine as binding. Where the checklist or scorecard is softer than the doctrine, the doctrine wins.

    ## Exact Repo Files / Seams to Inspect

    - `apps/hb-webparts/src/homepage/__tests__/priorityActionsPresentation.test.ts`
- `apps/hb-webparts/src/homepage/__tests__/priorityActionsLauncherAdapter.test.ts`
- any new tests required for grouped overflow or display-class-specific overflow behavior

    ## Current Gap to Close

    The current tests reinforce universal sheet overflow and other decisions that are now holding the launcher back.

    ## Required Outcome

    Deliver a test suite that protects the intended redesigned overflow posture, grouped secondary IA, and hosted-mode markers.

    ## Proof of Closure

    - Show which old assertions were intentionally retired and why.
- Add new assertions for grouped overflow and device-class overflow posture.
- Confirm the test suite passes cleanly after the redesign.

    ## Constraints

    - Do not weaken test rigor just to make the suite pass.
- Keep test updates tightly aligned to the new contract.

    ## Execution Discipline

    - Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.
    - Do not make unrelated visual or architectural changes.
    - Do not protect the current implementation merely because it already compiles or already uses shared homepage primitives.
    - If you discover a stronger structural correction within the scoped seams, take it and document exactly why.
