# Prompt-02-Rework-History-Disclosure-and-Supporting-Rail-Subordination.md

## Objective

Keep past spotlights useful without letting them compete with the featured project or regrow the vertical footprint of the surface.

## Non-negotiable rules

- Use the live `main` branch as repo truth.
- Do not preserve a weak visual or interaction pattern just because it already exists.
- Do not broaden scope beyond the files and seams named below unless a dependency proves unavoidable.
- Do not re-read files that are still within your active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.
- Preserve the thin-webpart ownership boundary: data / normalization local, presentation shared unless the prompt explicitly says otherwise.
- Provide proof of closure: touched-file list, before/after explanation, test or story updates, and hosted/runtime evidence where requested.
- Do not stop at “compiles.” Close the runtime behavior.


## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/homepage-webpart-benchmark.md`

## Files / seams to inspect first

- `packages/ui-kit/src/HbcProjectSpotlightSurface/HistoryDisclosure.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/SupportingRail.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/layout-mode.ts`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`

## Current gap to close

The current history pattern is accessible and explicit, but still too visually heavy when expanded. In practice it can feel like a second large application under the featured story.

## Required implementation outcome

- the featured project must remain unquestionably primary
- the history rail must feel lighter, tighter, and more clearly subordinate
- desktop wide/medium behavior may be changed if the current open-by-default posture hurts first-view value
- preserve explicit disclosure and keyboard safety
- keep the rail useful, but stop spending so much height and visual emphasis on it

You may choose a new default-open policy, a preview pattern, or a materially lighter expanded presentation. Pick the best answer based on hosted behavior, not the easiest code diff.

## Proof of closure required

Provide:

1. before/after screenshots with history closed and history open
2. a concise explanation of the new subordinate hierarchy
3. confirmation that the featured project remains primary at first paint
