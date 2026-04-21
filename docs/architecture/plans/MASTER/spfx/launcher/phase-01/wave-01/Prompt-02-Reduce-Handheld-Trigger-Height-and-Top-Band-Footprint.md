# Prompt 02 — Reduce Handheld Trigger Height and Top-Band Footprint

    ## Objective

    Make the handheld launcher materially shorter and faster without reducing clarity or tappability.

    ## Governing Authorities

    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
    - relevant benchmark material under `docs/reference/spfx-surfaces/benchmark/`

    Treat the doctrine as binding. Where the checklist or scorecard is softer than the doctrine, the doctrine wins.

    ## Exact Repo Files / Seams to Inspect

    - `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- any launcher constants that govern handheld trigger sizing

    ## Current Gap to Close

    The current phone `HB Toolbox` / `More tools` launcher is too tall and too visually dominant. The surrounding band spacing also wastes first-screen vertical real estate.

    ## Required Outcome

    Deliver a handheld launcher that still reads clearly as the overflow entry, but occupies materially less vertical space. The result should feel like a fast-action seam, not a large hero-adjacent slab.

    ## Proof of Closure

    - Provide exact before/after trigger height, padding, and spacing values.
- Confirm touch targets remain compliant and finger-safe.
- Capture hosted phone screenshots showing more of the first shell lane visible on first load.
- Confirm the trigger still opens the full all-tools experience correctly.

    ## Constraints

    - Do not collapse the launcher into an unclear text link.
- Do not reduce accessibility or target size below a credible handheld standard.
- Keep desktop and tablet visual changes out of scope except for shared constants that must stay coherent.

    ## Execution Discipline

    - Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.
    - Do not make unrelated visual or architectural changes.
    - Do not protect the current implementation merely because it already compiles or already uses shared homepage primitives.
    - If you discover a stronger structural correction within the scoped seams, take it and document exactly why.
