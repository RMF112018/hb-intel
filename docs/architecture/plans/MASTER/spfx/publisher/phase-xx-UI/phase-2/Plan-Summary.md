    # Plan-Summary — Wave 2 — Upgrade the core editorial experience

    ## Wave objective

    Turn the current operational authoring surface into a materially better editorial product by upgrading writing, layout, preview, readiness, and media UX.

    ## Why this wave matters

    This wave is designed to close a coherent block of Article Publisher remediation work without mixing too many unrelated concerns into one implementation pass.

    ## Sequenced step plan

    | Step | Title | Outcome |
    |---|---|---|
    | 01 | Replace body textarea with a real rich-text editor | Replace the current `Body (HTML accepted)` textarea with a governed rich-text authoring experience that supports practical editorial formatting without exposing authors to raw HTML-oriented workflows. |
| 02 | Recompose the authoring workspace into a premium editorial layout | Replace the current admin-form workspace posture with a stronger editorial composition that uses the page canvas confidently, improves hierarchy, and feels productized rather than merely operational. |
| 03 | Convert validation into a publish-readiness system | Turn the strong underlying validation engine into an operator-friendly readiness experience with grouped blockers, warnings, guidance, and field-jump affordances. |
| 04 | Build a visual author-confidence preview | Preserve the existing structural preview/decisioning engine, but add a more visual preview experience so authors can understand what they are about to publish. |
| 05 | Improve media authoring experience | Reduce media-management friction by improving asset selection, verification, sequencing, and accessibility guidance. |

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
    - `Prompt-01-replace-body-textarea-with-rich-text-editor.md`
- `Prompt-02-recompose-the-authoring-workspace.md`
- `Prompt-03-convert-validation-into-publish-readiness.md`
- `Prompt-04-build-a-visual-author-confidence-preview.md`
- `Prompt-05-improve-media-authoring-experience.md`
