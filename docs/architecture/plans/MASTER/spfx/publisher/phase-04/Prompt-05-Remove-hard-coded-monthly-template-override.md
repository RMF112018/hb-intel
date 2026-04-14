# Remove the hard-coded monthly template override
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
- `P1-2` from the publisher backend audit findings register

Inspect first:
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/templateResolver.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishResolutionContext.ts`

Objective:
Stop new-article creation from bypassing the template resolver with a hard-coded monthly template key.

Issue to close:
New article creation seeds `TemplateKey='ps-inprogress-monthly-v1'`, and the resolver treats non-empty `TemplateKey` as an override. That makes the monthly template effectively hard-coded for new rows.

Required outcomes:
- New article creation does not silently bypass template selection.
- The template-selection strategy is explicit and consistent.

Required work:
1. Remove the hard-coded monthly override from the new-article path.
2. Decide the current-sprint template-selection behavior:
   - blank template key and resolver-driven selection, or
   - explicit controlled template selection UI.
3. Ensure resolution behavior for new content is deterministic and understandable.
4. Update comments/status text/tests so the runtime behavior is accurately described.

Acceptance standard:
- New rows are not forced into the monthly template by hidden default override.
- Template registry behavior is real, not performative.

Required closure proof:
- Identify the exact code path that was broken before the fix.
- Show the exact seam that now enforces the intended behavior.
- Note any tests added/updated.
- Call out any intentionally deferred follow-up work, but only if the named issue is fully closed.
