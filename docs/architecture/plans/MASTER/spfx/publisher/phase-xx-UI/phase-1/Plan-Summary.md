    # Plan-Summary — Wave 1 — Remove the highest-friction authoring burdens

    ## Wave objective

    Remove the biggest adoption blockers in the authoring flow: manual project identity, raw author-facing system values, author-facing slug management, and manual team-member entry.

    ## Why this wave matters

    This wave is designed to close a coherent block of Article Publisher remediation work without mixing too many unrelated concerns into one implementation pass.

    ## Sequenced step plan

    | Step | Title | Outcome |
    |---|---|---|
    | 01 | Replace manual project fields with an authoritative project picker | Replace the manual `Project ID` and `Project name` inputs with a searchable project selector backed by the HBCentral `Projects` list, then hydrate authoritative project context automatically. |
| 02 | Introduce friendly author-facing label aliases | Stop exposing raw canonical enum values and replace them with governed friendly labels everywhere authors interact with metadata, workflow, and content selectors. |
| 03 | Remove author-facing slug management | Make slug/page identity system-governed by default so normal authors do not need to understand or edit a URL-safe slug. |
| 04 | Rebuild Team authoring around a people-picker flyout | Replace blank manual team-member rows with a premium flyout that uses governed people selection, hydrates person data, and mirrors the interaction quality of the Kudos composer pattern. |
| 05 | Set smart default team heading | Auto-fill the team section heading as `The Team at {project name}` after project selection while keeping it editable when needed. |

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
    - `Prompt-01-replace-manual-project-fields-with-project-picker.md`
- `Prompt-02-introduce-friendly-author-facing-label-aliases.md`
- `Prompt-03-remove-author-facing-slug-management.md`
- `Prompt-04-rebuild-team-authoring-around-people-picker-flyout.md`
- `Prompt-05-set-smart-default-team-heading.md`
