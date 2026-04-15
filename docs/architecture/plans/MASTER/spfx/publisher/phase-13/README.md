# Publisher UI Remediation — Wave 02 (Enhanced Repo-Truth Package)

This package is the **execution-grade closure package** for **Wave 02** of the HB Intel Article Publisher UI remediation.

It replaces the attached Wave 02 package after a narrowed repo-truth audit against the live `main` branch.

## Wave 02 objective

Close the remaining workflow-acceleration, guidance, editorial-authoring, accessibility, and narrative-drift issues that still materially affect author trust, author speed, product polish, and closure confidence after the Wave 01 shell rebuild.

This wave is **not** a broad re-audit of the whole publisher app. It is a targeted closure wave focused on the specific seams that still remain under-finished or under-proven in the live repo.

## Source-of-truth posture

Implementation truth is the live `main` branch of:

- `https://github.com/RMF112018/hb-intel`

This package was calibrated against the current Article Publisher implementation in:

- `apps/hb-publisher/src/webparts/articlePublisher/`
- `apps/hb-publisher/src/data/publisherAdapter/`
- `docs/reference/ui-kit/doctrine/`
- targeted supporting backend/docs seams where they materially affect Wave 02 closure

## Execution order

Run the prompts in numeric order.

1. `Prompt-01-Close-author-facing-label-governance.md`
2. `Prompt-02-Close-shared-selector-semantics-and-control-accessibility.md`
3. `Prompt-03-Deepen-project-binding-and-lookup-truthfulness.md`
4. `Prompt-04-Finish-story-editor-editorial-grade-closure.md`
5. `Prompt-05-Reduce-visible-metadata-burden-with-progressive-disclosure.md`
6. `Prompt-06-Cross-surface-keyboard-host-fit-and-breakpoint-closure.md`
7. `Prompt-07-Clean-up-naming-host-context-and-rebranding-drift.md`

## Why the package changed

The attached Wave 02 package was directionally correct, but it was still too broad and too forgiving in several places.

Most importantly:

- some prompts described issue families rather than the **actual current repo-truth defects**
- at least one issue area that now deserves its own closure unit — **shared selector/control accessibility semantics** — was buried inside generalized accessibility language
- some prompts omitted newly relevant live seams, especially `HeroPanel.tsx`, `ChooserGroup.tsx`, manifest/release-manifest drift seams, and backend list-contract authority for project lookup
- several prompts were too weak on proof-of-closure requirements and regression prevention
- some work that is already partially implemented in code needed to be rewritten from “build the capability” into “finish the remaining closure gaps”

## Global working rules for every prompt

1. Work in the live local HB Intel repo and treat the current `main` branch as implementation truth.
2. Exhaustively scrub the full affected seam before making changes.
3. Verify that referenced files, exports, symbols, comments, and CSS classes have not drifted before editing.
4. Do **not** re-read files that are still in active context unless needed to confirm drift, dependencies, uncertainty, or regression risk after changes.
5. Preserve existing correct behavior; only change what is required for closure.
6. Do not make unrelated code changes.
7. Do not defer meaningful work that belongs inside this wave.
8. Add or update targeted tests where the prompt requires them.
9. Produce the named closure artifact before moving to the next prompt.
10. Prove closure, not just code compilation.

## Success standard

Wave 02 is complete only if the Article Publisher:

- feels more trustworthy and more intentional in repeated daily use
- removes unnecessary author burden on the primary path
- no longer leaks raw or ambiguous implementation language to authors
- has credible keyboard/accessibility semantics on the controls authors use most
- provides a stronger, more editorial-quality story-writing experience
- behaves cleanly inside SharePoint host constraints and at supported breakpoints
- carries current, non-misleading product narrative and host-context language
