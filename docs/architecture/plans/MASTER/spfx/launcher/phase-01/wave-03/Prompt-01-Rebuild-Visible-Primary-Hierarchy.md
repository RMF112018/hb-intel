# Prompt 01 — Rebuild Visible Primary Hierarchy

    ## Objective

    Make the visible launcher area communicate primary-tool hierarchy clearly instead of presenting a row of mostly equal-weight tiles.

    ## Governing Authorities

    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
    - relevant benchmark material under `docs/reference/spfx-surfaces/benchmark/`

    Treat the doctrine as binding. Where the checklist or scorecard is softer than the doctrine, the doctrine wins.

    ## Exact Repo Files / Seams to Inspect

    - `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherTile.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- any supporting variant files needed to create a stronger hierarchy grammar

    ## Current Gap to Close

    The current launcher priority is encoded in code, but the UI does not strongly express why the visible tools are the visible tools. The result is still too flat and too strip-like.

    ## Required Outcome

    Deliver a more productized visible launcher grammar that creates meaningful distinction between primary destinations and secondary actions while staying compact and host-safe.

    ## Proof of Closure

    - Show the final hierarchy model and how it maps to the visible launcher.
- Capture desktop and tablet screenshots proving the launcher reads as more intentional and less generic.
- Confirm the surface still fits within the governed hosted width without regression.

    ## Constraints

    - Do not turn the launcher into a bloated dashboard.
- Preserve quick launch efficiency.
- Keep the answer compact and operational, not editorially overbuilt.

    ## Execution Discipline

    - Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.
    - Do not make unrelated visual or architectural changes.
    - Do not protect the current implementation merely because it already compiles or already uses shared homepage primitives.
    - If you discover a stronger structural correction within the scoped seams, take it and document exactly why.
