# Prompt 01 — Refine the editorial workspace shell and cross-region cohesion

## Objective

Finish the Publisher shell so the rendered experience no longer reads as a technically competent set of adjacent admin cards. The result must read as **one authored editorial workspace** that still respects the SharePoint host and preserves the queue / canvas / readiness architecture already present in the repo.

## Why this issue matters

The live repo already contains a real shell, but the product still visually communicates “utility workbench” before it communicates “editorial authoring product.” That weakens trust, makes the app feel more operational than intentional, and undercuts adoption even when the underlying features are working.

## Current repo-truth problem state

The current implementation already has:

- a left queue rail
- a center authoring canvas
- a right readiness rail
- a section index
- sectioned authoring panels
- preview and readiness living as distinct seams

However, the visual composition still leans on thin-border cards, conventional enterprise spacing, muted hierarchy, and a cross-region relationship that feels assembled rather than authored.

This prompt is **not** a from-scratch shell build. It is a closure prompt for the shell that now exists.

## Intended future state

The Publisher should present as:

- one coherent editorial workspace
- stronger hierarchy between rail, canvas, and readiness
- better cross-region visual rhythm
- clearer editorial focus in the center canvas
- better integration between section index, section headers, preview, and readiness
- responsive behavior that degrades with intention rather than simply stacking generic panels

## Governing authority / required reference docs

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` only where homepage-derived primitives are intentionally reused
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/` only where those docs still match live repo truth

## Exact repo files and seams to inspect

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/workspace/QueueRail.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/DraftQueue.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/`
- `apps/hb-publisher/src/webparts/articlePublisher/readinessSurface/`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/`

## Required implementation outcome

- Preserve the existing three-region architecture; do not collapse it into a fake app shell.
- Strengthen the authored relationship between the three regions so they no longer feel like separate white cards placed beside each other.
- Improve hierarchy, spacing rhythm, section transitions, and region emphasis without mimicking SharePoint chrome.
- Reassess breakpoints so medium-width and narrow-width states remain premium and readable, not merely “technically stacked.”
- Preserve the current queue/search/completeness capabilities in the left rail.
- Preserve the current readiness/action capabilities in the right rail.
- Preserve section IDs and meaningful navigation affordances where they support fast authoring.
- Remove or reduce any shell-level visual choices that keep the workspace trapped in a timid enterprise-card posture.

## Validation / proof-of-closure requirements

Prove all of the following:

- the shell still supports:
  - no selected draft
  - selected draft
  - validation blockers
  - warnings
  - healthy publish-ready state
- the left, center, and right regions now read as one product surface rather than three generic cards
- medium-width and narrow-width breakpoints were exercised intentionally
- no SharePoint-shell mimicry or fake global chrome was introduced
- the queue rail and readiness rail retained their current capabilities
- any moved or renamed classes/components are reflected cleanly in the affected CSS and tests

## Deliverables / closure notes to create

Create:

- `docs/architecture/reviews/publisher/wave-01-shell-cohesion-closure.md`

Include:

- what shell structure was preserved
- what visual/compositional weaknesses were corrected
- breakpoint behavior exercised
- why the result is materially more editorial and less admin-like


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

