# Resolve team-member user-field closure
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
- `P0-1` from the publisher backend audit findings register

Inspect first:
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRowMappers.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherListDescriptors.ts`

Objective:
Close the team-member save/edit seam so `HB Article Team Members.PersonPrincipal` is handled as a real SharePoint User field end to end.

Issue to close:
The tenant schema requires `PersonPrincipal` as a User field, but the authoring surface currently carries a string principal and the writer emits `PersonPrincipalId` without a proven ensure-user resolution step. The seam is not closed end to end.

Required outcomes:
- Saving a team member must resolve and persist a valid SharePoint user id for `PersonPrincipal`.
- Reading team members must reliably hydrate the user field.
- Edit -> save -> reload must round-trip cleanly.
- The code must make the transport-vs-tenant distinction explicit:
  - tenant field name = `PersonPrincipal`
  - REST payload alias used for write = `PersonPrincipalId`

Required work:
1. Add a real principal-resolution seam before team-member save.
2. Make the writer fail clearly when a required resolved user id is missing instead of silently sending `null`.
3. Explicitly `$select/$expand` the user field on read and normalize the returned shape in the mapper.
4. Keep descriptors tenant-truthful; transport-only aliases belong in the writer layer, not descriptor authority.
5. Update the authoring surface so create/edit flows preserve both displayable identity and resolved id as needed.
6. Add targeted proof that an existing row can be read, edited, saved, and reloaded without losing the user association.

Acceptance standard:
- No team-member save path relies on a raw email/login string alone.
- No required `PersonPrincipal` user field can be written as unresolved `null`.
- Read-path hydration is explicit and deterministic.
- Comments/types/tests do not imply a weaker contract than the tenant schema.

Required closure proof:
- Identify the exact code path that was broken before the fix.
- Show the exact seam that now enforces the intended behavior.
- Note any tests added/updated.
- Call out any intentionally deferred follow-up work, but only if the named issue is fully closed.
