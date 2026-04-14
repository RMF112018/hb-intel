# Reconcile regeneration and binding lineage
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
- `P0-3` from the publisher backend audit findings register

Inspect first:
- `apps/hb-webparts/src/homepage/data/publisherAdapter/republishPolicy.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageBindingWriter.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`

Objective:
Make regeneration behavior and destination-binding behavior internally consistent.

Issue to close:
The code/comments describe regeneration as creating a new page and superseding a prior binding, but the actual binding writer upserts one row by `ArticleId`. The implementation currently has no durable prior-binding preservation path.

Required outcomes:
- The repo must adopt one coherent model and implement/document it consistently:
  1. one-row authoritative binding state, or
  2. lineage-preserving binding registry with explicit supersession.
- Regeneration behavior must align with that model.
- Comments/tests/docs must stop implying a different model than the one the code actually enforces.

Required work:
1. Choose and implement the intended binding model.
2. If the intended model is one-row authoritative state:
   - remove supersession/archive language,
   - make regeneration semantics explicit in the one-row contract.
3. If the intended model is lineage-preserving:
   - stop upserting solely by `ArticleId`,
   - preserve prior binding rows and mark supersession explicitly.
4. Update the republish policy/orchestrator comments and any status messaging to match the chosen model.
5. Add targeted closure proof showing how a regeneration is represented before vs after the fix.

Acceptance standard:
- There is no mismatch between binding model comments and binding persistence behavior.
- A regeneration event has an unambiguous durable representation.
- Operators can tell what page is canonical after regeneration.

Required closure proof:
- Identify the exact code path that was broken before the fix.
- Show the exact seam that now enforces the intended behavior.
- Note any tests added/updated.
- Call out any intentionally deferred follow-up work, but only if the named issue is fully closed.
