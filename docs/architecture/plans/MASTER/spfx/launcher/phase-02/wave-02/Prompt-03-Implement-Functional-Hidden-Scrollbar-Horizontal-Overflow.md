# Prompt 03 — Implement Functional Hidden-Scrollbar Horizontal Overflow

## Objective

Where drawer content overflows horizontally, implement real swipe / horizontal scroll behavior that works across mouse, touch, and keyboard use while keeping the scrollbar out of view.

## Governing authority

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

## Inspect exactly these seams

- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Gap to close

The user requirement is explicit:
- horizontal scrolling/swiping must function when tiles overflow
- the scrollbar must not be visible

The current active drawer path does not close that requirement cleanly.

## Required outcome

- use a real overflow viewport where horizontal overflow is required
- scrolling works with touch swipe and standard mouse/trackpad input
- keyboard users can still reach and use overflow content safely
- visible scrollbar is hidden
- provide an alternate affordance that more content exists (edge fade, peeking tile, equivalent non-scrollbar cue)

## Proof of closure

Provide:
1. exact files changed
2. interaction notes for mouse, touch, and keyboard
3. screenshot proof showing no visible scrollbar
4. runtime proof that overflow content remains reachable

## Prohibited

- no fake overflow hints without actual functional scroll
- no visible scrollbar left in the final state
- no hover-only overflow cue
