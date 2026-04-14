    # Plan-Summary — Wave 3 — Product hardening, doctrine alignment, and maintainability

    ## Wave objective

    Harden the rebuilt Article Publisher for production scale by refactoring the UI seams, aligning styling with doctrine, improving accessibility, and preparing the surface for future destination expansion.

    ## Why this wave matters

    This wave is designed to close a coherent block of Article Publisher remediation work without mixing too many unrelated concerns into one implementation pass.

    ## Sequenced step plan

    | Step | Title | Outcome |
    |---|---|---|
    | 01 | Refactor Article Publisher into product-grade seams | Break the current monolithic `ArticlePublisher.tsx` surface into a maintainable workspace shell, focused modules, and reusable authoring primitives that can evolve safely. |
| 02 | Realign styling architecture with UI doctrine | Replace the current hardcoded styling posture with a doctrine-compliant, token-disciplined, visibly non-generic premium SPFx surface treatment. |
| 03 | Harden accessibility and keyboard flows | Ensure the upgraded authoring surface meets the doctrine’s accessibility bar with visible focus states, keyboard-safe flows, and resilient authoring behavior across states. |
| 04 | Prepare for future destination expansion | Ensure the rebuilt Article Publisher can expand beyond first-sprint Project Spotlight support without exposing raw system complexity back to authors. |

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
    - `Prompt-01-refactor-article-publisher-into-product-grade-seams.md`
- `Prompt-02-realign-styling-with-ui-doctrine.md`
- `Prompt-03-harden-accessibility-and-keyboard-flows.md`
- `Prompt-04-prepare-for-future-destination-expansion.md`
