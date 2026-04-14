# Enforce true in-place republish targeting
You are working in the live local HB Intel repo.

Repo root:
`/Users/bobbyfetting/hb-intel`

Critical operating instruction:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Branch / implementation authority:
- the live repo working tree based on `main`

Primary schema authority:
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

Primary audit basis for this remediation set:
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- the current `Article Publisher` source under `apps/hb-webparts/src/webparts/articlePublisher/`
- the current publisher adapter stack under `apps/hb-webparts/src/homepage/data/publisherAdapter/`

Execution posture:
- This is a bounded remediation task, not a broad redesign.
- Close the named issue completely.
- Preserve tenant-aligned `HB Article*` terminology and list bindings.
- Do not make unrelated refactors.
- Do not weaken existing tenant-alignment work.
- Update comments/tests/docs only where needed to keep repo truth aligned with implementation.
- When a fix depends on another already-numbered prompt in this package, honor the package order and do not paper over the dependency.

Required working style:
- Inspect the exact files named in this prompt first.
- Trace the full code path end to end before changing code.
- After changes, scrub adjacent code for drift so the named issue is actually closed.
- Add or update targeted tests where the repo has a reasonable test seam.
- In your final response, provide:
  1. what changed,
  2. why the issue is now closed,
  3. any remaining risks or follow-up dependencies.

Issue reference:
- `P0-2` from the publisher backend audit findings register

Inspect first:
- `apps/hb-webparts/src/homepage/data/publisherAdapter/republishPolicy.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCreationService.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageShellService.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCompositor.ts`

Objective:
Make `inPlaceUpdate` mean a real same-page update, not a best-effort filename lookup.

Issue to close:
The policy layer says in-place republish preserves `PageId` and `PageUrl`, but the page creation/update layer currently resolves the target page by filename/page name instead of binding identity. That means slug/page-name drift can break the guarantee.

Required outcomes:
- When republish action is `inPlaceUpdate`, the existing bound page identity is the authoritative target.
- Slug/page-name drift is handled intentionally, not accidentally.
- Policy comments, orchestrator behavior, and page-creation logic all agree.

Required work:
1. Define the canonical targeting rule for `inPlaceUpdate`.
2. Rework the page update path so it targets the already-bound destination page identity, preferably by `PageId`.
3. Decide what happens when the article slug/page name changes:
   - explicit rename in place, or
   - explicit regeneration path,
   but not silent filename-based rebinding.
4. Reconcile republish policy, orchestrator usage, and page-creation service behavior so they describe and enforce the same contract.
5. Add targeted proof that:
   - a normal republish preserves `PageId` and `PageUrl`,
   - slug/page-name drift does not silently create or bind to a different page.

Acceptance standard:
- `inPlaceUpdate` cannot mutate an arbitrary page selected only by filename.
- The code no longer overstates guarantees it does not enforce.
- Republish identity behavior is deterministic and auditable.

Required closure proof:
- Identify the exact code path that was broken before the fix.
- Show the exact seam that now enforces the intended behavior.
- Note any tests added/updated.
- Call out any intentionally deferred follow-up work, but only if the named issue is fully closed.
