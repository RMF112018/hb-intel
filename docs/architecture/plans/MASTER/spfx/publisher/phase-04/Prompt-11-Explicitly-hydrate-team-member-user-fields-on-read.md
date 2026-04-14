# Explicitly hydrate team-member user fields on read
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
- `P2-4` from the publisher backend audit findings register

Inspect first:
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRowMappers.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

Objective:
Make team-member read hydration deterministic for the SharePoint user field.

Issue to close:
Repository reads do not explicitly `$select/$expand` the `PersonPrincipal` user field even though the mapper depends on getting a useful user-field shape.

Required outcomes:
- Repository read behavior explicitly hydrates the user field in a known shape.
- Mapper logic matches the actual read contract.

Required work:
1. Add explicit user-field select/expand behavior for the team-member read path.
2. Normalize the returned shape in one place.
3. Remove guesswork/fallback behavior that exists only because the read shape is under-specified.
4. Add targeted proof that existing team-member rows load cleanly into edit/preview flows.

Acceptance standard:
- Team-member edit mode does not depend on accidental SharePoint response shape.
- The reader and mapper speak a shared explicit contract.

Required closure proof:
- Identify the exact code path that was broken before the fix.
- Show the exact seam that now enforces the intended behavior.
- Note any tests added/updated.
- Call out any intentionally deferred follow-up work, but only if the named issue is fully closed.
