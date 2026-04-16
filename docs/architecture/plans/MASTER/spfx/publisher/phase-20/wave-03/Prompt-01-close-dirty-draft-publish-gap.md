# Prompt 01 — Close the dirty-draft publish gap

## Objective

Close the repo-truth defect in which the authoring shell already knows the working copy is dirty, and already offers a save-first preview bridge, but still leaves **Publish** and **Republish** executable even though the actual publish path resolves from the last saved repository state by `ArticleId`.

This defect is still open in `main`.
It is now a narrower defect than the prior package described, because some mitigation has already landed.
Do not ignore that partial mitigation.
Finish the closure.

## Why this matters technically

The current shell creates a false-forward trust problem:

- the visible canvas reflects in-memory React state
- preview composition and publish orchestration resolve from saved backend state
- the rail still exposes Publish / Republish as normal primary actions
- the user can reasonably believe the system will ship what is on screen
- the backend can still ship the older saved draft instead

That is a backend correctness defect, not merely a UI copy defect.

## Governing repo surfaces

At minimum use and keep aligned:

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/usePreviewController.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishResolutionContext.ts`
- `apps/hb-publisher/src/data/publisherAdapter/preview/previewBuilder.ts`
- any tests covering publish/readiness/action gating

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current repo-truth reality you must preserve while fixing

The live repo already contains meaningful partial mitigation:

- `ArticlePublisher.tsx` computes `isDirty` against a clean baseline
- the preview surface already receives `isDirty`
- the secondary preview action already changes to `Save and refresh preview` when dirty
- `handleSaveAndRefreshPreview` already persists first and then rebuilds preview from saved state
- `useReadinessController.ts` already centralizes publish / republish enablement
- `useDraftLifecycle.ts` still calls `orchestrator.run(...)` directly for publish/republish without a save-first handshake

Do not regress the good parts.
Finish the missing part.

## Exact defect to close

Repo truth today still allows this path:

1. author edits the local working copy
2. `isDirty === true`
3. preview can be refreshed truthfully only through save-first flow
4. Publish or Republish remains enabled if lifecycle/readiness conditions otherwise pass
5. `handlePublishAction` calls the orchestrator against saved repo state
6. the system can publish stale persisted content rather than the current on-screen draft

## Required end state

Implement a **single truthful publish contract** across shell, readiness, and lifecycle behavior.

Allowed closure patterns:

### Option A — hard fail-closed on dirty state
- Publish and Republish are disabled while dirty
- the disabled reason must explicitly state that publish uses the saved draft and the user must save first
- the next-action cue, preview messaging, and primary rail buttons must all agree

### Option B — explicit save-then-publish handshake
- Publish and Republish remain user-visible but are not allowed to invoke the orchestrator against stale state
- the action path itself must persist the working copy, refresh any state needed for truthful publish intent, and only then call the orchestrator
- this path must be deterministic and must fail closed if save does not fully produce the state publish depends on

Preferred posture: **Option A unless repo-truth constraints prove Option B is cleaner and still fully truthful.**

## Non-negotiable rules

- do not leave a path where publish appears to act on the visible working copy while actually shipping the last saved copy
- do not fix this only with labels, banners, or next-action hints
- do not leave the primary buttons and the actual lifecycle handler out of sync
- do not create a special hidden code path that can still trigger stale publish from the ordinary authoring surface
- do not weaken existing preview truthfulness to make publish “look” consistent

## Implementation guidance

You will likely need to touch all of these areas together:

### Shell action wiring
Align:
- primary Publish button
- primary Republish button
- secondary preview/save-and-refresh action
- next-action cue copy and CTA
- disabled reasons

### Readiness derivation
Extend `useReadinessController.ts` so publish/republish gating can reason about dirty-state truth, not only workflow state, binding presence, preview validation, and environment health.

### Lifecycle handler contract
Do not let `handlePublishAction` remain a blind pass-through to `orchestrator.run(...)` for dirty drafts.
Either block before that point or route through an explicit save-first handshake.

### Tests
You need new or updated tests around:
- readiness enablement when dirty
- shell button behavior when dirty
- publish lifecycle handler refusing stale-state publish
- clean-draft behavior remaining intact
- preview action remaining truthful and non-regressive

## Validation requirements

Prove closure with tests covering at minimum:

1. dirty + approved + otherwise healthy draft does **not** leave Publish executable as a stale-state path
2. dirty + published + bound + otherwise healthy draft does **not** leave Republish executable as a stale-state path
3. clean + approved draft still publishes normally
4. clean + published + bound draft still republishs normally
5. preview messaging and CTA remain consistent with saved-state truth
6. the chosen behavior is reflected consistently in shell action state, lifecycle path, and tests

## Closure notes required

Write concise closure notes that state:

- which closure pattern was chosen and why
- exactly where dirty-state gating now lives
- how the lifecycle handler was made truthful
- which tests prove stale publish is no longer reachable
