# Prompt 03 — Hosted Handheld Proof and Closure

    ## Objective

    Prove that the handheld launcher behavior now matches the intended source contract in the hosted SharePoint result.

    ## Governing Authorities

    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
    - relevant benchmark material under `docs/reference/spfx-surfaces/benchmark/`

    Treat the doctrine as binding. Where the checklist or scorecard is softer than the doctrine, the doctrine wins.

    ## Exact Repo Files / Seams to Inspect

    - packaged launcher version markers in the homepage launcher root
- hosted DOM attributes emitted by `HbHomepageLauncherBand.tsx` and `HbcHomepageLauncher.tsx`
- screenshot capture workflow for phone portrait, large phone portrait, and short-height constrained states

    ## Current Gap to Close

    The screenshot set has shown conflicting handheld launcher outcomes. Acceptance is not credible until the hosted result is proven stable and aligned to the current source tree.

    ## Required Outcome

    Produce hosted proof showing one stable handheld launcher posture consistent with the new Wave 01 corrections.

    ## Proof of Closure

    - Record the deployed launcher version marker from the DOM.
- Record the emitted handheld mode, device class, and cap-governance markers.
- Capture hosted screenshots for at least: 375–390 wide phone portrait, 430 wide phone portrait, and one short-height state.
- State explicitly whether the hosted result matches current source intent.

    ## Constraints

    - Do not perform unrelated refactors.
- This prompt is proof-oriented; only fix drift if proof reveals it is required.

    ## Execution Discipline

    - Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.
    - Do not make unrelated visual or architectural changes.
    - Do not protect the current implementation merely because it already compiles or already uses shared homepage primitives.
    - If you discover a stronger structural correction within the scoped seams, take it and document exactly why.
