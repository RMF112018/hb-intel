# Prompt 03 — Replace pseudo-iconography and harden toolbar / avatar / micro-interactions

## Objective

Remove pseudo-iconography and low-ambition interaction treatment from the Publisher’s most visible editorial surfaces, and replace them with a governed icon, avatar, and interaction model that materially improves polish, accessibility, and author trust.

## Why this issue matters

The Publisher still leaks utility-grade interaction language through Unicode stars, arrow glyphs, typographic quote buttons, and initials-only identity treatment in surfaces where authors most need confidence. These are small details individually, but together they strongly shape whether the product feels premium or provisional.

## Current repo-truth problem state

The live repo still includes pseudo-icon patterns and under-finished interaction affordances in key Wave 01 surfaces, including:

- featured toggles
- reorder controls
- story editor toolbar controls
- team/media visual managers
- preview identity treatment

The editor itself already exists and is valuable. The issue is not the existence of a body editor; it is that the surrounding interaction language still falls short.

## Intended future state

The Publisher should have:

- a real, governed icon strategy for the audited surfaces
- clearly labeled icon-only controls
- stronger hover, focus, and pressed states
- a story-editor toolbar that feels like an editorial tool, not a row of text shortcuts
- better avatar treatment where photos exist, with clean degradation where they do not
- interaction cues that are premium without becoming flashy

## Governing authority / required reference docs

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` only if you intentionally reuse premium-stack expectations from homepage doctrine
- `apps/hb-publisher/package.json`

## Exact repo files and seams to inspect

- `apps/hb-publisher/package.json`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/TeamPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/TeamMemberComposer.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/GalleryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/editorToolbar.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/ArticlePreview.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/`

## Required implementation outcome

- Replace pseudo-icons in the audited surfaces with a real icon strategy.
- Choose the lightest correct dependency approach for the Publisher; do not add stack dependencies casually.
- Ensure every icon-only control has a strong accessible name and clear pressed/active semantics where applicable.
- Improve micro-interaction polish for feature, reorder, toolbar, and edit/remove actions.
- Strengthen toolbar behavior so it is keyboard-credible and not merely visually upgraded.
- Improve avatar treatment where reliable photo or richer identity treatment is already available; degrade cleanly where it is not.
- Preserve existing editor, team, and media logic unless a bounded UI seam requires change.

## Validation / proof-of-closure requirements

Prove all of the following:

- pseudo-icons were removed from the audited surfaces
- icon-only controls remain accessible and well-labeled
- toolbar interaction was exercised with keyboard navigation and visible focus treatment
- featured toggle and reorder controls feel materially more intentional than before
- avatar treatment is improved without breaking fallback behavior
- any new dependency added to support iconography or interaction quality is actually used and justified

## Deliverables / closure notes to create

Create:

- `docs/architecture/reviews/publisher/wave-01-iconography-toolbar-avatar-closure.md`

Include:

- the icon strategy chosen
- the controls scrubbed
- any dependency decisions
- keyboard/accessibility checks performed


## Required working method

Before you edit anything:

1. Scrub the full affected seam.
2. Verify that referenced files, exports, symbols, and CSS classes have not drifted.
3. Do **not** re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
4. Identify exactly what must be preserved.
5. Identify exactly what must be removed, consolidated, or rewritten.
6. Prove closure before you move to the next prompt.

## Explicit instruction not to make unrelated changes

Do not make unrelated code changes. Keep the work tightly bounded to the seams identified in this prompt unless an adjacent change is strictly required for closure.

