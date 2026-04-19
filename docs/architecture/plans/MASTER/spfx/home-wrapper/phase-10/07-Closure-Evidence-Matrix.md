# Closure Evidence Matrix

## Required runtime truths

| Area | Required proof |
|---|---|
| Flagship composition | `HbHomepageEntryStack` renders hero, launcher/actions, then shell in that order |
| Single-hero cutover | Hosted flagship page shows exactly one flagship hero path |
| Wrapper ownership | Hero and launcher are wrapper-owned; shell remains post-entry only |
| Shared entry-state truth | Hero, launcher, and shell expose aligned entry-state / short-height markers |
| Responsive behavior | Hero de-escalates correctly at required display classes |
| Overflow discipline | No ordinary horizontal overflow in the composed entry stack |
| First-lane continuity | First shell lane still begins on first view |
| Repo-truth alignment | `mount.tsx`, `entryStackOrchestration.ts`, contract comments, and reference composition do not contradict runtime |

## Required display/state validation set

Validate all of the following:

- 1920×1080
- 1512×982
- 1366×1024
- 430×992
- 390×844
- short-height constrained state (< 500px effective height where applicable)

## Minimum runtime markers to expose or verify

- wrapper root marker
- hero region marker
- launcher region marker
- shell region marker
- entry-state id
- entry-state reason
- short-height boolean
- any hero mode / hero layout mode marker
- duplicate-hero guard or detection marker if implemented

## Minimum tests/assertions to add or update

- entry-stack ordering assertion
- hero shared-entry-state consumption assertion
- constrained-state hero mode assertion
- no duplicate flagship hero path assertion if runtime suppression/detection exists
- no-overflow / boundary assertion where practical
- preserved first-lane-first-view assertion where practical

## Minimum hosted proof

1. Screenshot at desktop/laptop state.
2. Screenshot at narrow mobile state.
3. DevTools view proving one hero root only.
4. DevTools view proving region order and entry-state markers.
5. Hosted note confirming whether the standalone hero webpart was removed from the flagship page authoring surface.
