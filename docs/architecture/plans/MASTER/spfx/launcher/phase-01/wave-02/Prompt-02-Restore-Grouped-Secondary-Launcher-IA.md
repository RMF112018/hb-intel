# Prompt 02 — Restore Grouped Secondary Launcher IA

    ## Objective

    Use the grouping metadata already preserved in the launcher models to make overflow substantially easier to scan and trust.

    ## Governing Authorities

    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
    - relevant benchmark material under `docs/reference/spfx-surfaces/benchmark/`

    Treat the doctrine as binding. Where the checklist or scorecard is softer than the doctrine, the doctrine wins.

    ## Exact Repo Files / Seams to Inspect

    - `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- any launcher overflow view models or helper seams needed to render grouped sections

    ## Current Gap to Close

    The overflow surface currently flattens all tools into one `Company Tools` category even though group metadata exists. That weakens scanability and makes the all-tools experience feel brute-force instead of productized.

    ## Required Outcome

    Deliver grouped secondary-launch IA inside overflow. Preserve a coherent company-tools identity, but stop rendering every tool as one undifferentiated block.

    ## Proof of Closure

    - Show the final grouping logic and the upstream metadata fields it uses.
- Capture desktop and phone overflow screenshots proving that grouped scanning is materially better.
- Confirm tools are still launchable and keyboard reachable.
- Confirm there is no regression in handheld all-tools access.

    ## Constraints

    - Do not create fake shell chrome.
- Do not introduce arbitrary groups that are not grounded in real launcher metadata.
- Keep the copy tight and utility-focused.

    ## Execution Discipline

    - Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.
    - Do not make unrelated visual or architectural changes.
    - Do not protect the current implementation merely because it already compiles or already uses shared homepage primitives.
    - If you discover a stronger structural correction within the scoped seams, take it and document exactly why.
