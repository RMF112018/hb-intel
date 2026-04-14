    # Wave 1 — Remove the highest-friction authoring burdens — README

    ## Package purpose

    This package contains the executable prompt set for **Wave 1 — Remove the highest-friction authoring burdens** in the Article Publisher remediation program.

    Each prompt is intentionally scoped to **one step** in the wave so a local code agent can:
    - work one problem at a time
    - scrub the touched seam thoroughly
    - validate closure before the next step begins
    - avoid mixing unrelated work into the same implementation pass

    ## Governing authority

    The prompts in this package treat the following as binding authority:

    - docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
- docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md

    The prompts also assume repo-truth implementation work is taking place in the live local HB Intel repo and that the current `main` branch is authoritative for implementation state.

    ## Operating rules for every prompt

    - You are working in the live local HB Intel repo.
- Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Treat repo truth on the live local `main` branch as authoritative for implementation state.
- Treat the following doctrine as binding authority for this work: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md` and, where relevant to premium surface posture, `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`.
- Do not make unrelated refactors.
- Do not silently preserve weak interaction patterns simply because they already compile.
- When a change touches UI behavior, preserve authoring safety for partial-configuration and edit-mode conditions.
- When you finish a prompt, create a closure note in the same wave folder documenting what changed, what was validated, and any residual risk.

    ## Prompt execution order

    - 1. Prompt-01-replace-manual-project-fields-with-project-picker.md
- 2. Prompt-02-introduce-friendly-author-facing-label-aliases.md
- 3. Prompt-03-remove-author-facing-slug-management.md
- 4. Prompt-04-rebuild-team-authoring-around-people-picker-flyout.md
- 5. Prompt-05-set-smart-default-team-heading.md

    ## Required closure behavior

    After each prompt:
    - create a closure note in the same wave folder
    - document files changed, validation run, and residual risk
    - do not move to the next prompt until the current step is actually closed

    ## Packaging intent

    This package is designed for a **fresh local code-agent task** per prompt, unless you deliberately keep the same session open and the agent still has the necessary context in memory.

    ## Notes

    - The prompts are written to minimize re-read churn and unnecessary refactoring.
    - They assume strong doctrine compliance is part of closure, not a later cleanup item.
    - They are intentionally strict about not leaving partial drift behind inside touched scope.
