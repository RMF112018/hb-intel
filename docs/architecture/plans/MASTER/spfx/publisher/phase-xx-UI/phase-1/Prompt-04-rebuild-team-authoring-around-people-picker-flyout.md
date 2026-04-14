    # Prompt 04 — Rebuild Team authoring around a people-picker flyout

    ## Objective

    Execute **Wave 1 — Remove the highest-friction authoring burdens / Step 04** for the Article Publisher remediation program.

    Step goal:
    Replace blank manual team-member rows with a premium flyout that uses governed people selection, hydrates person data, and mirrors the interaction quality of the Kudos composer pattern.

    ## Critical operating instruction

    Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

    ## Mandatory authority

    Treat the following as binding authority and do not proceed in a way that violates them:

    - docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
- docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md

    Also treat the current live local repo on `main` as implementation truth, especially these seams where relevant:

    - apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx
- apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css
- apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json
- apps/hb-webparts/src/webparts/articlePublisher/runtimeContract.ts
- apps/hb-webparts/src/mount.tsx
- apps/hb-webparts/src/homepage/data/publisherAdapter/index.ts
- apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts
- apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts
- apps/hb-webparts/src/homepage/data/publisherAdapter/publisherListDescriptors.ts
- apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts

    Additional step-specific focus files and folders:
    - apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx
- packages/ui-kit/src/HbcPeoplePicker/index.tsx
- docs/reference/ui-kit/HbcPeoplePicker.md
- apps/hb-webparts/src/webparts/hbKudos/KudosComposerPanel.tsx
- apps/hb-webparts/src/homepage/data/publisherAdapter/teamViewerAdapter.ts

    ## Delivery posture

    - This is a **targeted remediation task**, not a broad redesign beyond this step’s scope.
    - Make the smallest complete change set that closes the step properly.
    - Do not leave partial UX drift behind if it is directly inside the touched seam.
    - Do not preserve a weak legacy behavior when this prompt explicitly requires replacing it.
    - Do not regress publish orchestration, validation, preview, page binding, or list schema alignment while executing this step.

    ## Required work

    1. Conduct a repo-truth impact scan for this step’s focus area.
    2. Implement the remediation fully, including any necessary UI, adapter, contract, helper, or validation updates inside scope.
    3. Scrub touched seams for drift so the issue is **actually closed**, not just cosmetically improved.
    4. Run the most appropriate validation available in repo context.
    5. Produce a closure note in the wave folder summarizing:
       - files changed
       - implementation summary
       - validation performed
       - hosted/deployment follow-up needed, if any
       - residual risk, if any

    ## Step deliverables

    - Flyout interaction model for `Add team member`.
- Integration with governed person search/picker behavior.
- Hydrated person identity with selective editorial overrides such as role and featured status.

    ## Acceptance criteria

    - Team-member creation no longer starts from a blank manual row.
- Authors can add a team member with a small number of guided actions.
- Stored person identity is cleaner and more consistent than the current manual-entry model.

    ## Required validation

    At minimum, do the following as applicable to this step:

    - Typecheck / lint / test only what is needed to validate the touched seam
    - Verify no obvious doctrine regression was introduced
    - Verify no author-facing naming drift or raw-system-value drift was introduced inside touched scope
    - Verify touched UI states still behave reasonably for empty / loading / partial / error conditions

    ## Output requirements

    When complete, provide:
    1. concise implementation summary
    2. exact files changed
    3. validation run and results
    4. closure note path
    5. any remaining follow-up needed before the next prompt

    ## Guardrails

    - Do not broaden scope into later waves unless necessary to prevent direct breakage.
    - Do not invent new tenant schema fields unless the existing architecture explicitly requires them.
    - Do not degrade the current publish lifecycle, workflow-history, or binding logic to make UI work easier.
    - Do not leave TODO-only placeholders where a complete implementation is reasonably achievable in this step.
