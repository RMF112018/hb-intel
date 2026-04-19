# Prompt-08 — Restore Label Clarity, Truncation Handling, and Accessibility

## Objective

Keep the launcher compact while ensuring labels remain understandable, focus remains strong, and dense states do not hide meaning.

## Governing authority

Treat the following as controlling implementation authority for this prompt:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/reference/spfx-surfaces/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

The doctrine and benchmark materials are binding. Do not preserve a weak launcher decision merely because it compiles, currently renders, or resembles a prior package recommendation.

## Inspect these exact seams

- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherChip.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `packages/ui-kit/src/HbcHomepageLauncher/types.ts` if additional assistive metadata is needed

## Current problem to solve

The current launcher uses one-line ellipsis heavily. That preserves density but can reduce clarity for longer tool names and creates a weak closure posture if no rescue behavior exists for truncated states. Focus and target rigor also need to remain explicit in a denser redesign.

## Required implementation work

1. Preserve visible text labels next to icons in the primary launcher and overflow items.
2. Add credible rescue behavior for truncated labels where the final design needs it, using the lightest successful mechanism justified by the surface family.
3. Preserve or improve visible keyboard focus treatment.
4. Validate compact target sizes / spacing against credible accessibility expectations.
5. Ensure no critical meaning depends only on hover.
6. Keep sentence-case, brief, action-clear labeling discipline where labels are authored or surfaced.

## Required future state

The launcher should remain dense and fast, but it should no longer rely on silent truncation as its only answer to long labels. Keyboard users and touch users should retain clear affordances.

## Proof of closure required

- truncated states have a clear rescue strategy where needed
- focus treatment remains visibly strong
- compact states still meet credible target-size/spacing expectations
- no hover-only critical meaning is introduced

## Prohibitions

- Do not solve truncation by making the launcher bloated.
- Do not hide labels and rely on icons alone.
- Do not weaken focus states in the name of polish.

## Working rule

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
