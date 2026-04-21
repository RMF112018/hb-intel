# Prompt 03 — Final Hosted Proof Matrix and Closure

    ## Objective

    Close the launcher effort only after packaged and hosted proof demonstrates that the final implementation is stable across the required breakpoint matrix.

    ## Governing Authorities

    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
    - relevant benchmark material under `docs/reference/spfx-surfaces/benchmark/`

    Treat the doctrine as binding. Where the checklist or scorecard is softer than the doctrine, the doctrine wins.

    ## Exact Repo Files / Seams to Inspect

    - launcher runtime DOM markers
- package version marker in `constants.ts`
- hosted SharePoint screenshots across the governed breakpoint matrix
- any evidence docs used by the repo for hosted breakpoint validation

    ## Current Gap to Close

    The launcher has already shown signs of runtime drift relative to source expectations. Closure without hosted proof is not credible.

    ## Required Outcome

    Produce a final closure package proving that the launched package matches source intent across the required display classes.

    ## Proof of Closure

    - Record the deployed launcher version marker.
- Capture hosted screenshots for ultrawide desktop, standard laptop, tablet landscape, tablet portrait, large phone portrait, standard phone portrait, and short-height state.
- Record emitted runtime attributes for device class, overflow mode, handheld mode, visible count, and cap governance.
- State explicitly whether the launcher now meets homepage-grade or flagship-grade acceptance.

    ## Constraints

    - Do not call the work closed without evidence.
- If proof reveals drift, fix the drift before declaring closure.

    ## Execution Discipline

    - Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.
    - Do not make unrelated visual or architectural changes.
    - Do not protect the current implementation merely because it already compiles or already uses shared homepage primitives.
    - If you discover a stronger structural correction within the scoped seams, take it and document exactly why.
