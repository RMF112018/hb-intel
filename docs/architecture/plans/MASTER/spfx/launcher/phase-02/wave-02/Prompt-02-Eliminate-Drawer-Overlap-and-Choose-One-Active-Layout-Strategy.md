# Prompt 02 — Eliminate Drawer Overlap and Choose One Active Layout Strategy

## Objective

Resolve the current drawer spacing/overlap problem by selecting one active layout model and implementing it fully. Do not leave dormant competing strategies in the active surface.

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

The active drawer uses grouped sections, but the hosted result still shows clipping/overlap behavior and a visibly broken rail. The CSS also contains dormant rail/scroll classes that are not cleanly aligned with the active JSX.

## Required outcome

- choose one active drawer content strategy
- eliminate overlap and clipping entirely
- remove or retire stale conflicting drawer layout paths if they are no longer used
- preserve grouped sectioning only if it materially helps the launcher

## Proof of closure

Provide:
1. exact files changed
2. explanation of the chosen active drawer layout model
3. screenshots proving no overlap at desktop and tablet
4. note on which stale paths were removed or intentionally retained

## Prohibited

- no half-implemented dual strategy
- no leaving broken dormant paths in place “for later”
