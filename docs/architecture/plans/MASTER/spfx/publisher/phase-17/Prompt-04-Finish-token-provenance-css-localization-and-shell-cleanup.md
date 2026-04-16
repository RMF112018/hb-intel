# Prompt 04 — Finish token provenance, CSS localization, and shell cleanup

## Objective

Close the styling-debt portion of Wave 02 by narrowing the responsibility of the broad shell CSS, localizing component-owned rules where appropriate, and hardening Publisher token provenance so future premium iteration is safer and less regression-prone.

## Why this issue matters

Repo truth shows the Publisher already has a better component split than earlier phases, but styling responsibility is still broader than it should be:

- `article-publisher.module.css` still owns a large mix of workspace, rail, readiness, field, picker, disclosure, and utility rules
- the CSS boundary between shell layout and component-owned presentation is still blurrier than ideal
- `sharedChrome/tokens.module.css` is acting as a manual CSS mirror of theme values, which is acceptable only if the provenance contract is explicit and clean
- later premium work will stay fragile if styling ownership is not narrowed now

Wave 02 is the right place to clean this up because the visual/control surfaces should be stabilizing here.

## Governing authority / required references

- live repo implementation under `apps/hb-publisher/`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Publisher-local shared chrome and CSS module ownership rules established by repo truth
- React composition / local reasoning best practices where they materially help maintainability

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/tokens.module.css`
- CSS modules under:
  - `sharedChrome/`
  - `storyBodyEditor/`
  - `teamComposer/`
  - `mediaComposer/`
  - `previewSurface/`
  - `readinessSurface/`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/Field.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/DisclosureSection.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/AssetLibraryBrowser.tsx`

## Current-state problem description

Repo truth indicates that a meaningful amount of component-level styling still lives in the broad shell module, especially around:

- field / input primitives
- disclosure primitives
- picker-related visuals
- readiness / rail micro-surfaces
- nested utility classes

That makes future change riskier than necessary.
At the same time, token usage is generally disciplined, but the provenance story around the mirrored CSS custom-property layer should be made more explicit and less ad hoc.

## Required implementation outcome

Narrow the shell CSS and leave styling responsibility more intentional.

At minimum:

1. distinguish true shell/layout rules from component-owned rules
2. move component-level surface rules closer to their owning components where doing so materially improves maintainability
3. preserve one coherent token entry seam for Publisher styling
4. eliminate styling duplication or “temporary” style ownership that survived earlier phases
5. ensure newly rebuilt overlay/control surfaces from Prompts 02–03 land in the right CSS ownership layer

Do **not** cargo-cult split everything into tiny files.
The goal is not maximal fragmentation.
The goal is cleaner ownership and lower regression risk.

## Dependencies / cross-surface considerations

This prompt should happen after the major control and overlay redesign decisions are closed so you are cleaning the final seam, not cleaning while architecture is still shifting.

Be careful with:

- scroll / sticky rail behavior
- canvas width and responsive breakpoints
- project-picker and asset-browser open-state styling
- preview/readiness surfaces
- focus ring consistency
- token naming drift

If you change token names or aliases, scrub the full affected seam.

## Validation / proof-of-closure requirements

Prove all of the following:

- `article-publisher.module.css` is narrower or more intentional than before
- component-owned styling is easier to locate and reason about
- token discipline is preserved or improved
- no responsive, sticky, or focus-state regressions were introduced
- the final styling ownership model is easier for the next engineer to extend safely

Also produce a short map of:

- what remains in shell CSS and why
- what moved to local CSS modules and why
- the final token provenance contract for Publisher CSS

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
