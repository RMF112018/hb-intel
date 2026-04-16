# Prompt 05 — Close UI-kit entry-point and import-discipline drift

## Objective

Resolve the contradiction between the Publisher’s local guidance and its actual UI-kit import behavior so the app has one truthful, governable entry-point posture.

## Why this issue matters

Repo truth currently shows a mismatch between policy and implementation:

- local guidance says app source should avoid root `@hbc/ui-kit` imports and prefer approved subpath entries
- live source still contains root-package imports in multiple places
- once Wave 02 foundation and control work land, leaving this contradiction open would make the final state harder to govern and reason about

A local code agent should not have to guess whether the policy is real.

## Governing authority / required references

- live repo implementation under `apps/hb-publisher/`
- `apps/hb-publisher/vite.config.ts`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- the actual exports available from `@hbc/ui-kit` and approved subpath entries

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/vite.config.ts`
- `apps/hb-publisher/src/mount.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/TeamPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/TeamMemberComposer.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/TeammateAvatar.tsx`
- `apps/hb-publisher/src/data/useSharePointPeopleSearch.ts`
- `apps/hb-publisher/src/data/useRecipientPhotoHydration.ts`
- every other `apps/hb-publisher` source file importing from `@hbc/ui-kit` or one of its subpaths

Run a full import scrub under `apps/hb-publisher` before deciding the closure path.

## Current-state problem description

The current prompt package listed only a subset of the relevant files, which risks partial closure.
The real issue is app-wide:

- some imports already use approved subpaths such as `@hbc/ui-kit/homepage`
- some imports still come from the root package
- the final policy decision is not fully encoded in the codebase

## Required implementation outcome

Close the contradiction completely.

Default expected outcome:
- move imports to approved subpath entries wherever the subpath export exists and is the intended posture
- keep root-package imports only where repo truth proves they are intentionally necessary and the local guidance is updated accordingly

Do **not** preserve a half-closed state where the repo still says one thing and does another.

You must leave the Publisher in one of these end states:

### Preferred
The source matches the “subpath-first” policy and the policy wording remains in place.

### Acceptable only if proven necessary
Some root imports remain for explicit reasons, and the local guidance is rewritten so it accurately reflects that allowed posture.

## Dependencies / cross-surface considerations

This prompt should happen after the major surface decisions are closed so you are scrubbing the real final import graph.

Be careful not to break:

- build alias resolution
- type-only imports
- tree-shaking assumptions
- subpath package availability
- shared UI-kit runtime behavior that the Publisher depends on

If repo truth shows that an export needed by the Publisher does not exist on an approved subpath, document that explicitly in the closure note.

## Validation / proof-of-closure requirements

Prove all of the following:

- import guidance and actual imports now agree
- the entire app was scrubbed, not just the originally listed files
- build / typecheck health remains intact
- the final import posture is cleaner and easier to govern than before

Also include in the closure note:

- the final allowed UI-kit import posture for `apps/hb-publisher`
- whether any root imports remain and why
- any export-gap or package-surface issues uncovered during the scrub

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
