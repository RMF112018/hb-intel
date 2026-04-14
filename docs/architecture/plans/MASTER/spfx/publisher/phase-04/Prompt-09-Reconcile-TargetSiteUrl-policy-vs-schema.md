# Reconcile TargetSiteUrl policy versus schema
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
- `P2-2` from the publisher backend audit findings register

Inspect first:
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

Objective:
Resolve the current policy/schema drift around `HB Articles.TargetSiteUrl`.

Issue to close:
The tenant schema makes `TargetSiteUrl` optional, but the app effectively treats it as required for current-sprint publishing.

Required outcomes:
- The repo explicitly adopts one model:
  - app-level invariant requiring `TargetSiteUrl`, or
  - derived destination URL so the author does not carry it manually.
- Validation, UI, and publish logic all agree.

Required work:
1. Decide whether `TargetSiteUrl` is a real author-authored field in this sprint.
2. If yes, document and enforce it cleanly as an app-level invariant.
3. If no, derive it from destination/template/config and remove unnecessary author burden.
4. Update validation, defaults, and comments to the chosen model.

Acceptance standard:
- There is no undocumented policy/schema mismatch on `TargetSiteUrl`.
- Operators are not blocked by hidden invariants.

Required closure proof:
- Identify the exact code path that was broken before the fix.
- Show the exact seam that now enforces the intended behavior.
- Note any tests added/updated.
- Call out any intentionally deferred follow-up work, but only if the named issue is fully closed.
