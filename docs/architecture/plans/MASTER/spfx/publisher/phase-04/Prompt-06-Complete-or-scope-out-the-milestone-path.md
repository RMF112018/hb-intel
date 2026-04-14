# Complete or scope out the milestone path
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
- `P1-3` from the publisher backend audit findings register

Inspect first:
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`

Objective:
Resolve the incomplete milestone article path.

Issue to close:
Validation requires milestone-specific fields, but the authoring UI does not expose them and the writer does not persist them. That makes milestone support incomplete.

Required outcomes:
- Either milestone articles are fully supported end to end, or milestone support is explicitly removed from the current sprint scope.
- Validation, UI, contracts, and persistence all agree.

Required work:
1. Decide whether milestone articles are in scope now.
2. If yes:
   - add milestone authoring controls,
   - persist milestone fields,
   - ensure preview/publish validation can succeed.
3. If no:
   - remove milestone-specific validation/template exposure from the active sprint path,
   - keep comments/docs truthful.
4. Add targeted proof that the chosen scope is actually executable.

Acceptance standard:
- No required milestone field exists only in validation logic.
- No advertised milestone path is left half-implemented.

Required closure proof:
- Identify the exact code path that was broken before the fix.
- Show the exact seam that now enforces the intended behavior.
- Note any tests added/updated.
- Call out any intentionally deferred follow-up work, but only if the named issue is fully closed.
