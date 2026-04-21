# Prompt 02 — Tighten Desktop and Tablet Productization

    ## Objective

    Turn the launcher from a polished tile strip into a convincing flagship utility surface on desktop and tablet.

    ## Governing Authorities

    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
    - relevant benchmark material under `docs/reference/spfx-surfaces/benchmark/`

    Treat the doctrine as binding. Where the checklist or scorecard is softer than the doctrine, the doctrine wins.

    ## Exact Repo Files / Seams to Inspect

    - `packages/ui-kit/src/HbcHomepageLauncher/*`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.module.css`
- any benchmark-aligned homepage launcher primitives introduced inside governed homepage seams

    ## Current Gap to Close

    Even after the current improvements, the desktop/tablet launcher still reads as a styled strip more than a flagship launch surface.

    ## Required Outcome

    Deliver a visibly more intentional desktop/tablet launcher surface without violating host-fit or compactness requirements.

    ## Proof of Closure

    - Capture before/after hosted screenshots at standard laptop, tablet landscape, and ultrawide widths.
- Explain exactly what changed in the surface grammar and why it is better.
- Confirm no regression in performance, focus behavior, or overflow access.

    ## Constraints

    - Do not mimic shell chrome.
- Do not broaden into unrelated hero or lane redesign unless the launcher cannot be corrected without it.
- Preserve maintainable variant structure.

    ## Execution Discipline

    - Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.
    - Do not make unrelated visual or architectural changes.
    - Do not protect the current implementation merely because it already compiles or already uses shared homepage primitives.
    - If you discover a stronger structural correction within the scoped seams, take it and document exactly why.
