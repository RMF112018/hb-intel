# Closure 03 — Team-member seam realigned to tenant schema

## Objective
Bring the full `HB Article Team Members` seam (contract, row mapper,
list-field writer, list descriptor, team-viewer adapter, validation
engine, and authoring UI) into alignment with the authoritative tenant
list schema and eliminate every non-schema assumption.

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRowMappers.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherListDescriptors.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/teamViewerAdapter.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- Fixture/assertion updates across:
  `publisherChildRelationships.test.ts`, `teamViewerAdapter.test.ts`,
  `teamViewerSharedContract.test.ts`,
  `validation/validationEngine.test.ts`,
  `pageGeneration/pageCompositor.test.ts`,
  `pageGeneration/pagePublishLifecycle.test.ts`,
  `preview/previewBuilder.test.ts`, `publishOrchestrator.test.ts`,
  `articleSyncBack.test.ts`, `__tests__/publisherEndToEnd.test.ts`.

## Exact issue closed
The previous `PublisherTeamMemberRow` contract, mapper, writer, list
descriptor, team-viewer adapter, validation engine, and TeamPanel UI
were based on pre-tenant field names and misread the SharePoint
field types for the actual `HB Article Team Members` list:

- Required tenant field `Title` was neither read nor written.
- `PersonPrincipal` is a SharePoint User field (Lookup→User
  Information List), but the writer emitted a bare string into a
  nonexistent text column.
- Unsupported columns `JobTitle`, `PhotoUrl`, `ResumeRichText`,
  `ResumeDocumentUrl`, and `IncludeInViewer` were read from and
  written to the tenant list; none exist on the schema.
- Supported tenant columns `Role`, `Company`, `Department`,
  `GroupKey`, `ParentMemberId`, and `IsFeaturedMember` were never
  surfaced on the contract, in the mapper, in the writer, or in the
  UI.

As a result, posts against the tenant list dropped supported data
(Role / Department / Company / GroupKey / ParentMemberId /
IsFeaturedMember / Title), rejected the `Title` requirement, and
silently wrote to columns that do not exist.

## Remediation
1. **Contract (`publisherContracts.ts`).** `PublisherTeamMemberRow`
   now carries exactly the tenant column set: required `ArticleId`,
   `TeamMemberId`, `Title`, `PersonPrincipal`, `DisplayName`; optional
   `PersonPrincipalId` (resolved User id), `Role`, `Company`,
   `Department`, `GroupKey`, `ParentMemberId`, `IsFeaturedMember`,
   `SortOrder`, `BioSnippet`, `ContactLink`. The legacy fields are
   removed. The contract documents the User-field writer contract
   so callers resolve `PersonPrincipal` → `PersonPrincipalId` before
   persisting.
2. **Row mapper (`publisherRowMappers.ts`).** `mapTeamMemberRow` now
   requires the tenant `Title` column. It accepts both the flattened
   and expanded shapes of the `PersonPrincipal` User field (falling
   back to `EMail` / `Email` / `Title` on the expanded object) and
   reads the resolved numeric `PersonPrincipalId` alongside the
   tenant-supported optional columns.
3. **Writer (`publisherWriters.ts`).** `mapTeamMemberRowToListFields`
   emits only the tenant columns, writes the User field as
   `PersonPrincipalId: <number>`, and drops every removed legacy
   column. Doc comment captures the caller's resolution
   responsibility.
4. **List descriptor (`publisherListDescriptors.ts`).** The MVP
   `$select` field list for `HB Article Team Members` is replaced
   with the tenant-supported column set (including
   `PersonPrincipalId`).
5. **Team-viewer adapter (`teamViewerAdapter.ts`).**
   `selectVisibleTeamMembers` no longer filters on the nonexistent
   `IncludeInViewer` column — every authored row is visible.
   `mapPublisherRowToTeamViewerPerson` sources `jobTitle` /
   `projectRole` from `Role`, `department` from `Department`, and
   `groupKey` from `GroupKey`; `photoUrl`, `resumeRichText`, and
   `resumeDocumentUrl` are left undefined so the Team Viewer
   webpart's Graph-enriched reader fills photo/department at render.
6. **Validation engine (`validationEngine.ts`).** The
   `invalid-team-configuration` rule now triggers on an empty
   authored list rather than on `IncludeInViewer` count, with an
   updated operator-facing message.
7. **Authoring UI (`ArticlePublisher.tsx`).** `TeamPanel` now
   authors `Title`, `DisplayName`, `PersonPrincipal`, `Role`,
   `Company`, `Department`, and `IsFeaturedMember`. The legacy
   `Job title`, `Photo URL`, and `Include in viewer` fields are
   removed. New rows default to `Title: ''` so the required tenant
   field is always present on the draft shape.

## Tests added or updated
- `publisherChildRelationships.test.ts`: existing FK guards updated
  to pass `Title`. **New tests**:
  - "team-member write payload emits tenant columns only and no
    removed legacy fields" — asserts every tenant column is
    emitted (including `PersonPrincipalId`), every removed legacy
    field is absent, and `ContactLink` is serialized as a URL
    field.
  - "team-member read mapper rejects rows missing required tenant
    Title" — proves the new required-field enforcement.
  - "team-member read mapper resolves the expanded PersonPrincipal
    User shape" — proves the mapper reads `{EMail, Title}` and
    `PersonPrincipalId` off the expanded User payload.
- `teamViewerAdapter.test.ts`: `selectVisibleTeamMembers` test
  rewritten to assert that every authored row is kept (no more
  `IncludeInViewer` filter); the person-mapping test asserts the
  tenant-aligned field projection (Role → jobTitle/projectRole,
  Department, GroupKey); the `buildTeamViewerPersonList` test
  covers ordering only.
- `validation/validationEngine.test.ts`: the
  `invalid-team-configuration` test now checks the empty-list case.
- `teamViewerSharedContract.test.ts`, `pageCompositor.test.ts`,
  `pagePublishLifecycle.test.ts`, `articleSyncBack.test.ts`,
  `preview/previewBuilder.test.ts`, `publishOrchestrator.test.ts`,
  `publisherEndToEnd.test.ts`: all `PublisherTeamMemberRow`
  fixtures updated to include the required `Title` and drop the
  removed fields.

Run baseline on `main` before these changes: 19 failed, 140 passed.
Run after these changes: 19 failed, 143 passed. The three new
publisherChildRelationships tests added by this prompt all pass;
no test that was passing before is now failing (the 19 pre-existing
failures are unrelated to the team-member seam).

## Proof of behavioral closure
- The contract, mapper, writer, descriptor, adapter, validation,
  and UI all name the same tenant-aligned field set; no layer
  references a removed column. The TypeScript project compiles
  clean.
- A round-trip through `mapTeamMemberRow` → `mapTeamMemberRowToListFields`
  preserves every tenant column and emits no legacy columns
  (asserted by the new writer test).
- `PersonPrincipal` is documented as a User field; the writer
  emits `PersonPrincipalId` rather than a bare string, and the
  reader tolerates both flattened and expanded REST shapes.
- The authoring UI opens a draft with the required `Title` field
  present, and the TeamViewer adapter treats every authored row
  as visible (matching the tenant schema's absence of an
  `IncludeInViewer` column).

## Remaining follow-up risks
- Writer-side `PersonPrincipal` → `PersonPrincipalId` resolution
  is contract-level only: no callers have yet been wired to run
  `ensureUserByEmail` before invoking the writer. A follow-up
  should inject an id resolver into
  `createSharePointTeamMembersWriter` so authored principal
  strings get resolved to ids on save. Today, the writer emits
  `PersonPrincipalId: null` when no id is provided; SharePoint
  will clear the User field, which is the correct failure mode
  but still needs an upstream resolver for a production
  round-trip.
- Some tenant optional columns (`Company`, `Department`,
  `GroupKey`, `ParentMemberId`, `IsFeaturedMember`) now have
  authoring UI coverage for the most common editor workflow,
  but `ParentMemberId` does not yet have a structured picker —
  it is carried on the contract for adapter/writer parity and
  will be surfaced when hierarchical team authoring is added.
