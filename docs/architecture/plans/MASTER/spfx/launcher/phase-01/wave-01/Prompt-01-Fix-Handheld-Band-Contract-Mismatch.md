# Prompt 01 — Fix Handheld Band Contract Mismatch

    ## Objective

    Correct the homepage launcher band's handheld runtime/CSS contract so the phone launcher receives the intended shelf-suppression and spacing behavior.

    ## Governing Authorities

    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
    - `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
    - relevant benchmark material under `docs/reference/spfx-surfaces/benchmark/`

    Treat the doctrine as binding. Where the checklist or scorecard is softer than the doctrine, the doctrine wins.

    ## Exact Repo Files / Seams to Inspect

    - `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.module.css`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- any immediately adjacent tests or CSS selectors that enforce the runtime contract

    ## Current Gap to Close

    The current CSS targets `phone-portrait` / `phone-landscape` on the band shell, but the runtime launcher band emits `phone`. That mismatch means handheld shelf suppression is not actually applying in the ordinary phone runtime. The resulting mobile band remains more padded and visually taller than intended.

    ## Required Outcome

    Deliver a corrected handheld contract where the actual emitted runtime device-class values and the band-shell CSS selectors match exactly. The phone launcher must no longer inherit desktop/tablet shelf posture accidentally.

    ## Proof of Closure

    - Show the exact before/after selector or runtime attribute mismatch you fixed.
- Provide the final emitted handheld data-attribute values and the matching CSS selectors.
- Capture hosted screenshots proving the phone launcher no longer carries unintended shelf padding/material.
- Confirm no desktop or tablet launcher regression was introduced.

    ## Constraints

    - Do not redesign overflow IA in this prompt.
- Do not change desktop/tablet overflow posture in this prompt.
- Keep the change bounded to handheld band contract correctness and its direct visual consequences.

    ## Execution Discipline

    - Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.
    - Do not make unrelated visual or architectural changes.
    - Do not protect the current implementation merely because it already compiles or already uses shared homepage primitives.
    - If you discover a stronger structural correction within the scoped seams, take it and document exactly why.
