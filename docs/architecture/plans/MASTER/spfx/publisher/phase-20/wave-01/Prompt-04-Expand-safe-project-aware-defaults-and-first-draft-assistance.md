# Prompt-04 — Expand safe project-aware defaults and first-draft assistance

## Objective

Reduce repetitive author burden in first-pass authoring by expanding **safe**, project-aware defaults and first-draft assistance without taking editorial control away from the author.

## Why this matters

Repo truth shows that intelligent defaulting already exists, but it is still narrow. That means the product asks the author to perform avoidable setup work even when the system already has enough context to do obvious, low-risk work safely.

Wave 01 should reduce that burden materially.

## Live repo authorities to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/metadataDefaults.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/metadataDefaults.test.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/MetadataPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/HeroPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/ProjectPicker.tsx`
- Prompt 03 output, because project binding quality affects what defaults are safe

## Current deficiency

The current intelligent defaults are useful but too limited to materially change time-to-first-draft.

The code agent must treat this as a product-behavior problem, not just a helper-text problem.

## Safe-defaulting standard

Only add defaults or assists that meet **all** of these conditions:

1. the value is either already implied by current product behavior or directly derivable from trusted project/article context
2. the value is low-risk to prefill when blank
3. the author can override it explicitly
4. the system does not overwrite an author-owned value after the author has meaningfully taken control of that field
5. the behavior remains truthful in save, reload, and project-change scenarios

## Required implementation outcome

1. Audit the first-pass authoring path and identify the values that are currently obvious candidates for safe assistance.
2. Expand `metadataDefaults.ts` and any related opportunistic-on-selection behavior so the Publisher does more low-risk setup work automatically.
3. Keep a clear distinction between:
   - **system-owned while blank / untouched** behavior
   - **author-owned after explicit input** behavior
4. Ensure project-derived values behave correctly when a project is newly selected, changed, cleared, saved, or reloaded.
5. Preserve current Project Spotlight scope and do not introduce speculative “AI writing” behavior.

## Candidate areas to inspect seriously

At minimum, inspect whether the current repo truth supports stronger behavior for:

- project-derived team-heading resolution
- project-derived hero-category resolution
- any other first-pass fields currently explained through placeholder/helper copy but already strongly implied by project/article context
- opportunistic fill on project selection versus save-time-only fill
- preserving system-owned behavior until the author takes control

Do **not** force unsafe editorial choices such as writing copy the system cannot justify from repo truth.

## Implementation posture

- prefer small, explicit, testable rules over magical heuristics
- preserve author override everywhere
- keep save-time and interaction-time behavior consistent
- make ownership transitions clear: blank/system-owned versus explicit/author-owned
- add tests that cover project change and whitespace/empty-value edge cases, not just happy-path fill

## Closure proof requirements

The final implementation must prove all of the following:

- the set of defaults/assists has expanded materially but safely
- author-entered values are not overwritten improperly
- project selection/change behavior is coherent and predictable
- save-time behavior matches the interaction-time behavior the UI implies
- tests cover blank values, whitespace values, project changes, and author override preservation
- no speculative AI-generated editorial copy was introduced

## Prohibited outcomes

- no hidden overwriting of author-owned values
- no “helpful” behavior that changes copy after the author has taken control
- no vague assistance that depends on undocumented heuristics
- no assistant-generated editorial prose masquerading as safe defaulting

## Final instruction to the code agent

Make the first draft easier to start by teaching the product to do more of the obvious, low-risk work itself.
But keep editorial ownership with the author.
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
