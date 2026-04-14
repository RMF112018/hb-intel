    # Plan-Summary — Wave 0 — Stabilize hosted truth and eliminate visible drift

    ## Wave objective

    Close hosted/runtime drift first so the live Article Publisher matches repo-truth main, stops surfacing legacy list 404s, and restores operator trust before deeper UX changes.

    ## Why this wave matters

    This wave is designed to close a coherent block of Article Publisher remediation work without mixing too many unrelated concerns into one implementation pass.

    ## Sequenced step plan

    | Step | Title | Outcome |
    |---|---|---|
    | 01 | Close hosted list and runtime drift | Reconcile the deployed Article Publisher runtime with the current tenant-aligned `HB Article*` list descriptors and eliminate all hosted `Project Spotlight Post*` read failures. |
| 02 | Close visible naming and branding drift | Remove legacy naming from the live authoring surface so the product consistently presents itself as Article Publisher while preserving the legacy GUID lineage only in technical runtime contract history. |
| 03 | Perform Wave 0 hosted validation and package proof | Validate the remediated build in the hosted SharePoint environment, prove parity with repo truth, and capture closure evidence before Wave 1 begins. |

    ## Governing doctrine

    - docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
- docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md

    ## Repo-truth anchor seams

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
- apps/hb-webparts/src/homepage/data/publisherAdapter/preview/previewBuilder.ts
- apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts
- apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts
- apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCompositor.ts
- apps/hb-webparts/src/homepage/data/publisherAdapter/teamViewerAdapter.ts
- packages/ui-kit/src/HbcPeoplePicker/index.tsx
- docs/reference/ui-kit/HbcPeoplePicker.md
- apps/hb-webparts/src/webparts/hbKudos/KudosComposerPanel.tsx

    ## Completion standard for the wave

    The wave is complete only when:
    - every prompt in this package has been executed in order
    - each prompt has a closure note
    - the touched seam is validated
    - no direct doctrine regressions were introduced
    - no unresolved drift remains inside the scope of the touched step

    ## Recommended execution posture

    - Run one prompt at a time.
    - Validate each step before moving to the next.
    - Do not broaden scope into later waves unless necessary to prevent breakage.
    - Preserve the underlying publish/preview/binding architecture while improving the product surface.

    ## Package contents

    - `Plan-Summary.md`
    - `README.md`
    - `Prompt-01-close-hosted-list-runtime-drift.md`
- `Prompt-02-close-visible-naming-and-branding-drift.md`
- `Prompt-03-perform-wave-0-hosted-validation.md`
