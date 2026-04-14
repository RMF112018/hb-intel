# Prompt 07 — Expose remaining team-member schema fields

## Objective
Expand the team-member authoring surface so the UI can actually author the schema-backed child fields the runtime already knows how to consume.

## Governing authority / required reference docs
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/teamViewerAdapter.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`

## Files and code paths to inspect
- `ArticlePublisher.tsx`
  - `TeamPanel`
- `publisherContracts.ts`
- `publisherRowMappers.ts`
- `publisherWriters.ts`
- `teamViewerAdapter.ts`
- any Team Viewer tests/harnesses

## Exact defect to close
The team-member child schema/runtime supports fields like:
- `BioSnippet`
- `ContactLink`
- `GroupKey`
- `ParentMemberId`

but the live authoring surface does not expose them.

## Required implementation outcome
Extend the team-member editor so authors can create and edit the missing schema-backed fields. Preserve the existing SharePoint User resolution path for `PersonPrincipal`.

Where hierarchy/grouping fields have UX implications, keep the UI bounded and practical rather than over-designed.

## Validation / proof of closure requirements
- prove the missing child fields round-trip through authoring -> write -> read
- prove Team Viewer adapter output reflects authored values
- add/update tests for child-row round-tripping
- verify no regression to `PersonPrincipal` resolution

## Deliverables / closure docs to create
Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/07-expose-remaining-team-member-schema-fields.md`

## Explicit boundaries
- Do not bundle master-row article field expansion here
- Do not refactor unrelated Team Viewer code
- Do not widen destination/workflow scope here

## Operating instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
