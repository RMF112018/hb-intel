# Prompt 02 — Close shared selector semantics and control accessibility

## Objective

Repair the remaining control-level accessibility and keyboard-semantic gaps in the shared selector primitives that now sit underneath multiple Article Publisher authoring surfaces.

## Why this issue matters

The live repo already shows clear accessibility intent. The story editor toolbar, for example, implements a real toolbar pattern with roving tabindex. But that same closure quality is not yet present across every shared selector/control seam.

Most importantly, the current `ChooserGroup.tsx` renders radio-like choices using `role="radio"` inside a `radiogroup`, but it does not implement the keyboard behavior expected of a real radio group. That means the UI currently looks accessible while still falling short at the interaction-contract level.

This is not cosmetic. These shared controls sit in the primary authoring path. If their semantics are under-finished, the whole product feels under-finished.

## Current repo-truth problem state

The narrowed audit found that:

- `ChooserGroup.tsx` uses `role="radiogroup"` and `role="radio"`, but lacks the expected radio-group keyboard model and focus management.
- the chooser chips do not currently provide a full arrow-key / checked-state interaction contract expected of ARIA radio groups outside a toolbar.
- selector ergonomics in the authoring panels depend on these shared controls, so this is a cross-surface issue even though the primitive is small.
- the attached Wave 02 package mentioned accessibility broadly, but did not isolate this concrete shared-control closure unit.

## Intended future state

The shared selector primitives used by the Article Publisher should have control-level semantics that are credible on their own, not merely visually plausible.

Where the control is modeled as a radio group, it should behave like one.

## Governing authority / required reference docs

- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/ChooserGroup.tsx`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- WAI-ARIA APG radio-group guidance
- this package’s `Validation-Strategy.md`

## Exact repo files and seams to inspect

At minimum inspect:

- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/ChooserGroup.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- all authoring panels that consume `ChooserGroup`, including at minimum:
  - `authoringPanels/MetadataPanel.tsx`
  - `authoringPanels/HeroPanel.tsx`
  - `authoringPanels/TeamPresentationPanel.tsx`
- any current or newly added tests that cover chooser behavior

## Required implementation outcome

- Close `ChooserGroup` so its interaction model matches the semantics it claims.
- Implement a coherent radio-group keyboard model for non-toolbar usage.
- Ensure focus lands predictably when entering the group.
- Ensure arrow-key navigation is handled correctly for the chosen implementation pattern.
- Ensure the checked item, focus item, and visual active state remain coherent.
- Preserve the current visual product language unless a small visual/focus treatment change is required to make interaction state clear.
- Add targeted tests that prove the control behaves as intended.

You may use either a roving-tabindex model or another justified, standards-aligned implementation, but the final control must behave credibly and consistently.

## Validation / proof-of-closure requirements

Prove all of the following:

- tab entry and exit behavior is coherent
- the currently selected option is discoverable by keyboard users
- arrow-key behavior works correctly for the chosen radio-group interaction model
- checked-state and focus-state do not drift apart confusingly
- visible focus treatment remains clear on chooser chips
- consuming authoring panels do not regress after the primitive change
- targeted tests were added for the control-level behavior

## Deliverables / closure notes to create

Create:

- `docs/architecture/reviews/publisher/wave-02-shared-selector-semantics-closure.md`

Document:

- the prior semantic gap
- the chosen keyboard/focus model
- which consuming surfaces were regression-checked
- what tests now prove the primitive’s behavior

## Required working method

Before you edit anything:

1. Scrub the primitive and its consumers.
2. Verify drift in symbol names, CSS classes, and import sites.
3. Do **not** re-read files still in active context unless needed to confirm drift or regression risk.
4. Preserve already-correct product language and styling where possible.
5. Prove the control-level contract before moving on.

## Explicit instruction not to make unrelated changes

Do not broaden this into a giant global accessibility pass. This prompt is for the shared selector/control primitive and its immediate consumers only.
