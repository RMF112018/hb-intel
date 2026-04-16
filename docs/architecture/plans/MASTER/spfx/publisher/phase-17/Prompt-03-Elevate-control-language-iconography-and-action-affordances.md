# Prompt 03 — Elevate control language, iconography, and action affordances

## Objective

Close the visible control-system gap in the Publisher so the app reads as a premium editorial product rather than a competent internal workflow surface.

This prompt is the main visual/control-family closure unit for Wave 02.

## Why this issue matters

Repo truth shows that the Publisher now has better structure, but several visible controls still read as conservative or transitional:

- button treatments are still relatively ordinary
- chip and field treatments are governed but not yet top-of-class
- action affordances still include textual symbol prefixes and residual pseudo-icon language
- queue and composition actions are not yet fully unified as one premium family
- some disclosure affordances still rely on CSS-generated triangle cues instead of a deliberate icon system

Wave 02 is supposed to close that gap, not merely acknowledge it.

## Governing authority / required references

- live repo implementation under `apps/hb-publisher/`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` — only where relevant
- WCAG / APG guidance for focus visibility, non-text contrast, toolbar controls, tooltip discoverability, and status messaging
- the premium-stack foundation established in Prompt 01

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/PublisherButton.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/EditorialChip.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/Field.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/DisclosureSection.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/editorToolbar.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/TeamPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/workspace/QueueRail.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- any CSS modules or helper seams directly coupled to those controls

## Current-state problem description

Repo truth currently shows several concrete residual issues:

- `QueueRail.tsx` still uses a textual “+ New draft” CTA
- `TeamPanel.tsx` still uses a textual “+ Add teammate” CTA
- disclosure and details treatments still include pseudo-chevron / triangle-style cues in CSS
- shared control primitives exist, but they do not yet establish a strong editorial family across primary, secondary, destructive, icon-only, status, and disclosure actions
- toolbar iconography is functional, but the broader surface does not yet speak one coherent icon language

## Required implementation outcome

Elevate the Publisher’s control and action language into a clearly premium family.

At minimum:

1. retire remaining pseudo-icon and text-symbol affordances where a real icon system is the correct answer
2. strengthen `PublisherButton` and any companion action primitive so primary / secondary / danger / icon-only affordances feel like one system
3. bring queue actions, team/media actions, and supporting control surfaces into the same visual family
4. refine disclosure and micro-help affordances so they feel intentional rather than transitional
5. keep toolbar, chip, field, and status language coherent with the rest of the app

The result should:

- scan faster
- feel more editorial than administrative
- keep stronger focus visibility
- preserve or improve contrast
- remain host-safe for SPFx
- avoid decorative excess

## Dependencies / cross-surface considerations

This prompt depends on Prompt 01 and should follow Prompt 02 if overlay rebuild affected shared action affordances.

Do not create competing icon languages.
Choose one deliberate posture and carry it consistently across:

- queue CTA and rail actions
- team/media action buttons
- icon-only controls
- disclosures / expandable summaries
- any contextual micro-help introduced in Prompt 02

Do not regress keyboard access or screen-reader naming in the name of polish.

## Validation / proof-of-closure requirements

Prove all of the following:

- key controls now read as one premium family rather than a set of adjacent one-offs
- pseudo-icon remnants that belonged to transitional UI have been retired where appropriate
- queue, team, media, and editor-supporting actions are visually more coherent
- icon-only controls have accessible labels and, where needed, supporting tooltip text
- focus indicators and control boundaries remain visibly strong enough to satisfy WCAG contrast expectations

Also record before/after closure evidence for:

- queue CTA treatment
- team/media action treatment
- disclosure treatment
- one representative icon-only control family

## Deliverables / closure artifacts

Produce all code, tests, and documentation updates required for full closure of this prompt.
Also produce a concise closure note that records:

- what changed
- what was validated
- what directly-coupled issues had to be closed to finish honestly
- any remaining assumptions that are still materially relevant

## Non-negotiable change-control rule

Do **not** make unrelated changes.
Do **not** widen scope beyond what is necessary for honest closure of this prompt.
If you touch a directly-coupled seam, explain why it was necessary.
Do **not** move on until you can prove closure.
