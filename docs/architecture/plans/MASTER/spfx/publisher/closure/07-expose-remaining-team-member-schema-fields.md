# Prompt-07 Closure: Expose Remaining Team-Member Schema Fields

## Chosen implementation
The team-member authoring surface now exposes the remaining schema-backed fields that were already supported by contracts/mappers/writers/runtime:
- `BioSnippet`
- `ContactLink`
- `GroupKey`
- `ParentMemberId`

No child-schema expansion was needed; this prompt closes the UI seam.

## Before / After
Before:
1. TeamPanel allowed editing title/display/principal/role/company/department/featured only.
2. `BioSnippet`, `ContactLink`, `GroupKey`, and `ParentMemberId` were persisted by mappers/writers but not authorable in UI.

After:
1. TeamPanel includes bounded controls for all four missing fields.
2. `PersonPrincipal` edit behavior remains unchanged: principal changes clear `PersonPrincipalId` for re-resolution on save.
3. Existing writer/mapper and Team Viewer adapter paths continue to carry these values end-to-end.

## Changed surfaces
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - TeamPanel adds `GroupKey`, `ParentMemberId`, `BioSnippet`, `ContactLink` inputs.
  - Extracted `applyTeamMemberPrincipalChange` helper for principal-id reset semantics.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx`
  - Added direct regression test for principal change behavior preserving authored optional fields.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherChildRelationships.test.ts`
  - Added optional-field round-trip proof through team-member write/read shapes.

## Proof mapping
1. Missing child fields round-trip through authoring -> write -> read:
   - `publisherChildRelationships.test.ts` optional-field round-trip test.
2. Team Viewer adapter reflects authored values:
   - `teamViewerAdapter.test.ts` continues to assert `GroupKey -> groupKey`, `BioSnippet -> bio`, `ContactLink -> profileUrl`.
3. PersonPrincipal resolution not regressed:
   - `ArticlePublisher.test.tsx` principal-change helper test + existing `publisherWriters.test.ts` ensureUser resolution suite.
