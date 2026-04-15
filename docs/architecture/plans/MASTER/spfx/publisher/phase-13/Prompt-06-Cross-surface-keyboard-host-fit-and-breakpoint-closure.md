# Prompt 06 — Cross-surface keyboard, host-fit, and breakpoint closure

## Objective

Run the final whole-surface closure pass on keyboard behavior, focus treatment, host-fit, and breakpoint safety after the earlier Wave 02 control and metadata prompts have landed.

## Why this issue matters

By this point in the sequence, the local seams should already be stronger. This prompt exists to make sure the Article Publisher now behaves as one coherent SharePoint-hosted product rather than as a set of individually improved components.

The live repo already shows strong direction in its three-column shell, sticky section index, sticky readiness rail, queue keyboard affordances, and editorial-product styling. But those strengths still need a final cross-surface closure pass once the local fixes are complete.

## Current repo-truth problem state

The narrowed audit found that the attached package described this as a broad generic pass, which is too vague.

The actual repo-truth closure work now needs to verify interaction and host-fit cohesion across concrete seams such as:

- section index navigation
n- queue keyboard flow
- project picker popup and selected-value transitions
- chooser groups after their semantic repair
- story editor focus and toolbar flow
- team and media management controls
- icon-only buttons and destructive actions
- readiness rail sticky behavior and lower-breakpoint compression
- narrow layout stacking and scroll behavior inside SharePoint host constraints

## Intended future state

After this prompt, the Article Publisher should feel like one coherent product:

- focus moves predictably
- sticky or compressed layouts do not trap or hide important controls
- keyboard users can move through the authoring experience without confusing dead ends
- SharePoint host constraints are respected without the app collapsing into awkward or clipped behavior

## Governing authority / required reference docs

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- this package’s `Validation-Strategy.md`

## Exact repo files and seams to inspect

At minimum inspect:

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/`
- `apps/hb-publisher/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/ChooserGroup.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/`
- `apps/hb-publisher/src/webparts/articlePublisher/readinessSurface/`
- any icon-only controls or sticky-layout seams that affect keyboard or host-fit behavior

## Required implementation outcome

- Validate and close the remaining cross-surface keyboard gaps.
- Ensure visible focus remains clear on all materially interactive controls.
- Fix any surviving sticky-layout or breakpoint issues that hide controls, create awkward double scrolling, or reduce task clarity.
- Preserve the current shell’s strong section-based product structure unless a narrow adjustment is needed for closure.
- Keep the product host-aware; do not introduce fake shell duplication or PWA-style chrome that fights SharePoint.

## Validation / proof-of-closure requirements

Perform and document at minimum:

- desktop keyboard path through queue → canvas → readiness rail
- section index behavior
- narrow-width / compressed-width layout checks
- sticky readiness rail checks at the current desktop and collapsed-to-bottom-panel breakpoints
- icon-only control focus/announcement checks
- destructive action focus and confirmation/return-flow checks where applicable
- no clipped or unreachable controls at supported breakpoints

If you add or update tests, ensure they are targeted and credible. If some checks are best documented as manual verification due to host/layout nature, record them precisely in the closure report.

## Deliverables / closure notes to create

Create:

- `docs/architecture/reviews/publisher/wave-02-cross-surface-a11y-host-fit-closure.md`

Document:

- what whole-surface keyboard issues were found
- which breakpoint or sticky issues were fixed
- what manual host-fit checks were performed
- what tests were added or updated

## Required working method

Before you edit anything:

1. Scrub the cross-surface interaction model, not just one component.
2. Verify drift in shell structure and breakpoint CSS.
3. Do **not** re-read files still in active context unless needed to confirm drift or regression risk.
4. Preserve the section-based authoring model and host-aware SPFx posture.
5. Prove closure before moving on.

## Explicit instruction not to make unrelated changes

Do not broaden this into a redesign wave. This is a final cross-surface closure pass for keyboard, focus, host-fit, and breakpoint safety.
