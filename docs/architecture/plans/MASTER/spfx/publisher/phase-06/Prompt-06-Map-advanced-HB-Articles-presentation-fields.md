# Prompt 06 — Map advanced HB Articles presentation fields

## Objective
Bring the master article mapping and authoring surface into alignment with the schema-backed presentation fields the current code still ignores.

## Governing authority / required reference docs
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherListDescriptors.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRowMappers.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/teamViewerAdapter.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`

## Files and code paths to inspect
- all files listed above
- any relevant page-composition files
- any tests asserting article contract shape

## Exact defect to close
The live app omits multiple schema-backed article presentation fields and UI affordances, including:
- template override authoring path
- advanced Team Viewer article settings
- secondary-image article fields

## Required implementation outcome
Audit the tenant schema and current page composition path, then implement the correct bounded mapping. At minimum, decide and close:
- which schema-backed fields are in-scope for the current sprint,
- which must be surfaced in the authoring UI,
- which must be read/write mapped,
- which must be intentionally deferred and therefore removed from live assumptions.

Do not leave comment/code promises for authoring affordances that do not exist.

## Validation / proof of closure requirements
- prove descriptor/contract/mapper/writer/UI all agree on the final field set
- prove any newly surfaced fields round-trip through read/write
- prove page composition consumes the intended fields where applicable
- add/update tests for the final mapped field set

## Deliverables / closure docs to create
Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/06-map-advanced-hb-articles-presentation-fields.md`

## Explicit boundaries
- Do not bundle team-member child-field expansion here
- Do not combine with promotion-rule or milestone work
- Do not broaden destinations here

## Operating instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
