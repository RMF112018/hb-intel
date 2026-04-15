# Closure — Resolve milestone legacy-branch contradiction

**Phase:** `docs/architecture/plans/MASTER/spfx/publisher/phase-09`
**Prompt:** `Prompt-06-Resolve-milestone-legacy-branch-contradiction.md`
**Status:** Closed

## Chosen policy: Option B — hard-block milestone publish/republish

The repository has no milestone authoring UI (no controls for `MilestoneLabel` / `MilestoneDateUtc`), no persistence for those fields in `mapArticleRowToListFields`, and no milestone validation profile (the `MILESTONE_REQUIRED` set and its registry entry were deliberately removed per `validationEngine.ts:195–222`). Implementing end-to-end milestone publishing (Option A) is explicitly out of scope for this prompt. Option B is the correct fit: make the runtime behavior agree with the "legacy / read-compatible only" comments.

## Defect

Comments and labels described `milestoneSpotlight` as legacy read-only, but:

- The publish orchestrator had no content-type policy gate — it would enter `buildPublishResolutionContext` for any content type.
- The readiness controller allowed Publish / Republish on milestone drafts (validation and workflow-state were the only gates).
- The author-facing `milestoneLegacyNotice` was worded as a soft recommendation ("Move to an operational content type before publish"), not as a hard-block.

In practice the orchestrator happened to fail at `stage: 'resolution'` because no operational template exists for milestone — but that was incidental behavior, not a typed policy rejection, and the readiness controller still invited the operator to click Publish.

## Resolution

### Orchestrator hard-block (server-side)

`apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts` — added a typed policy rejection at the top of `run()` (before `buildPublishResolutionContext`) for non-preview modes when `article.ArticleContentType === 'milestoneSpotlight'`. Placed before resolution so the failure is a clean `{ ok: false, stage: 'policy', decision: { action: 'blocked', reason: 'legacyContentType' } }` instead of the noisy `'resolution'` failure the template resolver would raise.

Preview mode bypasses the gate so operators can still see the article they are looking at before moving it to an operational content type.

### Republish policy vocabulary

`apps/hb-publisher/src/data/publisherAdapter/republishPolicy.ts` — added `'legacyContentType'` to the `RepublishReason` union so the orchestrator's gate uses the same blocked-reason vocabulary as the rest of the republish policy (archived, withdrawn, articleNotPublished).

### UI readiness gate

`apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts` — added `unsupportedContentTypeMessage` / `unsupportedContentTypeLoaded` (mirroring the existing `unsupportedDestinationMessage` / `unsupportedDestinationLoaded` pair). Both `publishEnabled` and `republishEnabled` now also require `!unsupportedContentTypeLoaded`. The message is sourced from the existing `milestoneLegacyNotice` helper so the blocking copy stays in one place.

### Shell rendering

`apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx` — the canvas header now renders `unsupportedContentTypeMessage` alongside `unsupportedDestinationMessage` in the blocking-notice slot, and the Publish/Republish button tooltips factor `!unsupportedContentTypeLoaded` into their `destinationSupported` argument so the disabled-reason copy still explains why the action is gated.

### Notice copy

`apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/draftHelpers.ts` — tightened `milestoneLegacyNotice` to state explicitly that Publish and Republish are blocked, not merely discouraged:

> "Legacy content-type notice: `milestoneSpotlight` is read-compatible only (no live milestone executor). Publish and Republish are blocked for this content type. Move to an operational content type before publishing."

## Files changed

- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-publisher/src/data/publisherAdapter/republishPolicy.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/draftHelpers.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.test.ts` — new `describe('milestone legacy hard-block')` block with 4 tests (create-blocked, republish-blocked, preview-not-blocked-by-policy, operational-content-types-still-work).
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.test.ts` *(new)* — pins the UI gate (milestone disables Publish / Republish; exposes `unsupportedContentTypeMessage`; operational content types remain enabled).
- `apps/hb-publisher/config/package-solution.json` — version bump `1.0.0.6 → 1.0.0.7`.

## Validation

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 503 passed (+7 new from prior 496), 6 pre-existing `publisherEndToEnd.test.ts` failures unchanged (unrelated).

Proof points against the prompt's requirements:

1. **Policy enforced in code, not comments** — orchestrator returns `{ stage: 'policy', reason: 'legacyContentType' }` and records a publishing-errors row; `useReadinessController` flips `publishEnabled` / `republishEnabled` to `false`.
2. **Milestone cannot drift through live publish** — server-side gate sits before composition, validation, policy decision, page creation, and binding writes. UI gate prevents click. Test coverage pins both.
3. **Operational content types still work** — `monthlySpotlight` / `newsUpdate` / `projectUpdate` / `announcement` paths unchanged. Orchestrator test `does NOT block operational content types` asserts `monthlySpotlight` create still succeeds.
4. **Comments, warnings, runtime agree** — `milestoneLegacyNotice` copy, orchestrator `decision.notes`, canvas blocking notice, and button-disabled tooltip all state that Publish/Republish are blocked for milestone; the runtime actually blocks them.

## Scope held tight

- No change to milestone persistence in `mapArticleRowToListFields`.
- No change to the validation engine or restoration of `MILESTONE_REQUIRED`.
- No change to authoring controls (still no UI for `MilestoneLabel` / `MilestoneDateUtc`).
- No change to the existing Prompt-01 … Prompt-05 closures.

## Follow-on work explicitly deferred

The re-enablement checklist in `validationEngine.ts:210–218` remains the authoritative sequence if milestone ever needs Option A. The steps are:

1. Reintroduce `MILESTONE_REQUIRED` + its entry in `REQUIRED_FIELD_SETS`.
2. Add `MilestoneLabel` / `MilestoneDateUtc` writes in `mapArticleRowToListFields`.
3. Expose authoring controls (Label + Date) in `ArticlePublisher.tsx` / `MetadataPanel.tsx`.
4. Revive the deleted "enforces milestone required fields" validation test.
5. Remove the policy gate in `publishOrchestrator.run()` and the `unsupportedContentTypeMessage` branch in `useReadinessController`.
