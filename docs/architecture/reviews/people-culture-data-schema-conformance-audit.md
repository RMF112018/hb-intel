# People & Culture data-schema conformance audit

Phase-14 remediation pass — audits the People & Culture app data
layer against the extracted live SharePoint schema artifacts and
makes the targeted code changes needed for correct, ID-bound, guarded
interaction with the real lists.

## 1. Executive summary

The audit found three classes of mismatches that would cause silent
drift or incorrect behavior against the live SharePoint state:

1. **List binding by display title.** The adapter bound every
   announcements / celebrations / Kudos REST call through
   `getbytitle('…')`. The live SharePoint state has a known URL
   vs title mismatch between the announcements and celebrations
   lists that makes title binding unsafe even though both titles
   happened to coincidentally match today:
   - the list at URL `/Lists/People Culture Announcements1/` is
     titled **`People Culture Announcements`** and contains the
     announcements schema;
   - the list at URL `/Lists/People Culture Announcements/` is
     titled **`People Culture Celebrations`** and contains the
     celebrations schema.
2. **Announcements `PublishDate` internal name.** `ANN_FIELDS.PublishDate`
   was set to the display title `PublishDate`; the live InternalName
   is the mangled `PublishDateMapstopublishDate_x00`. The adapter
   had a runtime resolver that queried `/fields?$filter=Title eq
   'PublishDate'` to discover the mangled name, but the default
   used in the initial `$select` would return 400 if the resolver
   failed silently.
3. **Kudos `WorkflowStatus` was not read as authoritative.** The
   adapter synthesized a tri-state status (`pending` / `approved` /
   `rejected`) from the presence of `ApprovedBy` / `ApprovedDate`.
   The live list has an authoritative `WorkflowStatus` choice field
   with seven states (`pending`, `revisionRequested`, `approved`,
   `approvedScheduled`, `rejected`, `withdrawn`, `removedUnpublished`)
   and moderation is NOT enabled on the list, so `_ModerationStatus`
   is never correct for these rows. The submission writer also
   never wrote `WorkflowStatus`, leaving every new submission with
   an empty publish-state signal.

Secondary issues fixed in the same pass:

- Missing Kudos fields on the read DTO (`Details`, `WasEverPublished`,
  `PinOrder`, `IsFeatured`, `FeaturedExpiresAt`, `ProminenceIntent`,
  `CurrentVisibilityMode`, `IsScheduled`, `ScheduledPublishAt`).
  The adapter ignored them entirely, so the companion and public
  surfaces could not reason about scheduled Kudos, featured Kudos,
  or audience-visibility modes.
- Missing announcements `InternalNotes` read.
- Missing celebrations `ExternalEmployeeId`, `SourceSystem`,
  `LastSynchronizedOn` awareness (not yet projected into DTOs, but
  documented in `CEL_FIELDS`).
- Silent swallow of list fetch errors (`.catch(() => [])`) that
  turned binding failures into empty-state renders. The adapter
  now surfaces per-list error messages through
  `fetchPeopleCultureListData(...).errors` and the `usePeopleCultureData`
  hook routes them through `result.error`.
- No runtime guardrail verified that the critical custom fields
  still exist on each live list. A typo or provisioning rollback
  would silently degrade the adapter.

Every remediation was applied in-place against the existing
adapter seams. No UI redesign, no product-level scope changes,
and no SharePoint schema mutations were performed.

## 2. Files audited

| Path | Role | Outcome |
|---|---|---|
| `apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts` | Reads all three PC lists | Rewritten to bind by list GUID, read every documented custom field, map `WorkflowStatus` authoritatively, and surface errors. |
| `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts` | Writes new Kudos drafts | Rewritten to bind by list GUID and persist `WorkflowStatus: 'pending'`, `WasEverPublished: false`, `ProminenceIntent: 'standard'`, `IsFeatured: false`, `IsScheduled: false`. |
| `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts` | React hook wrapping the read adapter | Propagates per-list fetch errors through `result.error` instead of swallowing them. |
| `apps/hb-webparts/src/homepage/data/peopleCultureSpListRegistry.ts` | NEW — authoritative list registry | Single source of truth for list id / title / URL / critical-field contracts. |
| `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts` | KudosEntry DTO contract | Extended with optional `details`, `workflowStatus`, `wasEverPublished`, `pinOrder`, `isFeatured`, `featuredExpiresAt`, `prominenceIntent`, `visibilityMode`, `isScheduled`, `scheduledPublishAt`. `KudosStatus` kept narrow for merged-webpart compatibility; `KudosWorkflowStatus` added as the full 7-state domain type. |
| `apps/hb-webparts/src/homepage/__tests__/peopleCultureSpListBinding.test.ts` | NEW — adapter unit tests | 16 tests covering registry binding, field-name contracts, fetch routing via GUID endpoint, `PublishDate` remap, `WorkflowStatus` → `KudosStatus` derivation, multi-user celebration explosion, fetch error surfacing, and runtime binding guardrails. |
| `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx` | Legacy merged PC webpart runtime | Unchanged — continues to consume `PeopleCultureMergedConfig`. Benefits automatically from the adapter fixes because the DTO shape widened additively. |
| `apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublic.tsx` | Prompt-02 public PC runtime | Unchanged. Still consumes the legacy merged shape via the `legacyAdapter` bridge. |
| `apps/hb-webparts/src/webparts/peopleCultureCompanion/**` | Prompt-03..05 companion | Unchanged. Consumes the split contracts, not the listSource directly. |

## 3. Schema artifacts used

All mappings were verified against the extracted artifacts at
`docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/`:

- `people-culture-announcements-sharepoint-schema-report.md` — overall
  report with the critical URL vs title mismatch call-out.
- `people-culture-announcements1-list-schema.normalized.json` — the
  announcements list (live title `People Culture Announcements`,
  id `2cd191fc-a7ea-49f2-af05-c395c2326e57`).
- `people-culture-announcements-list-schema.normalized.json` — the
  celebrations list (live title `People Culture Celebrations`, id
  `b87bf664-0531-418b-902c-726e5fb87083`).
- `people-culture-kudos-sharepoint-schema-report.md` — the Kudos
  report.
- `people-culture-kudos-list-schema.normalized.json` — the Kudos
  list (id `b01fa4d2-29b1-4e11-b581-4cb3d0951a79`).
- `kudos-audit-events-list-schema.normalized.json` — the Kudos
  audit events list (id `c031c08f-25ac-407c-aa15-650b791efeb0`).
- Sample-item files — used only for key validation, not content
  shape (both lists only have 1 sample row).

## 4. List binding issues found

| Finding | Risk | Remediation |
|---|---|---|
| Adapter bound every read call via `getbytitle('People Culture Announcements')` | Title drift could cross-bind to the celebrations list because the celebrations list's URL is titled `People Culture Announcements`. | New `peopleCultureSpListRegistry` records the live GUID for every list. `buildPcListItemsEndpoint` builds `lists(guid'…')/items` URLs. `fetchPcListItems` replaces the title-based fetcher. |
| Adapter bound the submission writer via `getbytitle('People Culture Kudos')` | Same class of risk — a future title rename would break the writer silently. | `peopleCultureSubmissionSource.ts` now calls `buildPcListItemsEndpoint(siteUrl, PEOPLE_CULTURE_LIST_REGISTRY.kudos)`. |
| `resolvePublishDateField` queried `/fields` by title | Same risk class. | Resolver now uses `buildPcListFieldsEndpoint` against the list GUID. |
| No runtime validation that the critical custom fields still exist on each list | Provisioning rollback, taxonomy rewire, or field delete would silently degrade the adapter. | New `validatePeopleCultureListBindings(siteUrl)` hits `/fields` on every registered list, checks for the critical `InternalName` set, and returns actionable error strings. Caller is expected to surface them visibly. |
| Per-list fetch `.catch(() => [])` swallowed errors | An empty UI looked like "no data" when it was actually a binding failure. | `fetchPeopleCultureListData` now returns `{ config, errors: string[] }`. `usePeopleCultureData` routes `errors` into the hook's `error` field so the webpart error state is visible. |

## 5. Mapping issues found

### 5.1 Announcements list (`People Culture Announcements` / id `2cd191fc-…`)

| Field | Before | After | Notes |
|---|---|---|---|
| `PublishDate` | `ANN_FIELDS.PublishDate = 'PublishDate'` (fragile; runtime resolver needed) | `'PublishDateMapstopublishDate_x00'` (live InternalName) | Resolver retained as a defensive safety net; reads the real internal name via the GUID endpoint. |
| `InternalNotes` | Not read | Added to `$select` and the raw shape | Currently captured for future companion/HR views; not yet projected into the public DTO. |
| `AnnouncementPerson` | Correct (single User field) | Unchanged | Schema verified via `schemaXml` — Mult=FALSE. |
| `AnnouncementType` | Correct; lowercase choices | Unchanged | Schema verified — choices are `promotion`, `newHire`, `baby`, `wedding`, `special`. |
| `HomepageEnabled` filter | `$filter=HomepageEnabled eq 1` | Unchanged | The read-side gate stays the same. Authoritative publish-state signal (not `_ModerationStatus`). |

### 5.2 Celebrations list (`People Culture Celebrations` / id `b87bf664-…`)

| Field | Before | After | Notes |
|---|---|---|---|
| `PersonName` | Correct (UserMulti) | Unchanged | Schema verified — Mult=TRUE, `extractPersonArray` explodes `results[]` into per-person DTO rows. |
| `HomepageEnabledGovernanceextensi` | Correct mangled name | Unchanged | Documented more prominently in the `CEL_FIELDS` jsdoc so future changes don't accidentally "fix" it. |
| `ExternalEmployeeId`, `SourceSystem`, `LastSynchronizedOn` | Not declared | Added as `CEL_FIELDS` entries | Not yet projected into the public DTO; the fields exist in the schema and the adapter is now aware of them for future surfacing. |
| `CelebrationType` filter | Lowercased then compared to `{birthday, anniversary}` | Unchanged | Live choices include Title-Case `Birthday`/`Anniversary`/`Promotion`/`Wedding`/`Engagement`/`Baby`. Filter correctly normalizes to lowercase and drops non-birthday/anniversary rows for the weekly-celebration DTO. The dropped choices are documented in the `CEL_FIELDS` jsdoc and are handled correctly by the case-insensitive comparison. |

### 5.3 Kudos list (`People Culture Kudos` / id `b01fa4d2-…`)

| Field | Before | After | Notes |
|---|---|---|---|
| `WorkflowStatus` | Not read. Adapter synthesized a tri-state from `ApprovedBy`/`ApprovedDate`. | Added to `$select`; `deriveKudosStatus` collapses the full 7-state union into the narrow `KudosStatus` tri-state while also preserving the full `workflowStatus` on the DTO. | Decision-lock rule: `_ModerationStatus` is NOT authoritative because moderation is disabled on the list. |
| `WasEverPublished` | Not read | Read and projected to `KudosEntry.wasEverPublished` | Required boolean on the live schema. |
| `Details` | Not read | Read and projected (HTML-stripped) to `KudosEntry.details` | Optional long-form note. |
| `IsFeatured`, `FeaturedExpiresAt` | Not read | Read and projected | Homepage feature promotion signal. |
| `PinOrder` | Not read | Read and projected | Pinned ordering. |
| `ProminenceIntent` | Not read | Read and projected (`standard`/`pinned`/`featured`) | Live schema default is `standard`. |
| `CurrentVisibilityMode` | Not read | Read and projected (`public`/`associatedOnly`/`internalOnly`) | Live schema default is `internalOnly`. |
| `IsScheduled`, `ScheduledPublishAt` | Not read | Read and projected | Scheduled publish window. |
| `IndividualRecipients`, `TeamRecipients`, `DepartmentRecipients`, `ProjectGroupRecipients` | Read correctly via Person expand + taxonomy labels | Unchanged | The adapter correctly handles single-user vs multi-user and taxonomy taxonomy labels. |

### 5.4 Kudos Audit Events list (`Kudos Audit Events` / id `c031c08f-…`)

The adapter does not currently read audit events from the public
surface. The registry includes the `kudosAuditEvents` descriptor so
a future prompt can bind by id for audit-replay reconstruction
without reintroducing a title lookup.

## 6. Write-path issues found

### 6.1 Kudos submission (`peopleCultureSubmissionSource.ts`)

| Field | Before | After | Notes |
|---|---|---|---|
| List binding | `getbytitle('People Culture Kudos')` | `buildPcListItemsEndpoint(siteUrl, PEOPLE_CULTURE_LIST_REGISTRY.kudos)` | Bound by GUID, same class of fix as the read path. |
| `WorkflowStatus` | Not written | `'pending'` on every new submission | Required field per decision-lock rules. Makes the submission visible to the companion approvals inbox. |
| `WasEverPublished` | Not written | `false` on every new submission | Required boolean on the live schema. Prevents provisioning defaults from varying by row. |
| `ProminenceIntent` | Not written | `'standard'` on every new submission | Matches the live schema default; explicit write prevents drift if the default ever changes. |
| `IsPinned` | `false` | Unchanged | |
| `IsFeatured` | Not written | `false` on every new submission | Matches the live default; explicit write future-proofs the writer. |
| `IsScheduled` | Not written | `false` on every new submission | Matches the live default. |
| `HomepageEnabled` | `false` | Unchanged | Authoritative publish-state gate. |
| `CelebrateCount` | `0` | Unchanged | |
| `SubmittedById` | Resolved via `ensureUser` from the current user's email | Unchanged | Person field Id-suffix convention preserved. |
| `IndividualRecipients`, taxonomy recipients | Not written (composer does not collect emails / term ids) | Unchanged; documented clearly in the payload jsdoc | Proper person/taxonomy write requires a people-picker and term lookup. HR assigns these during the review workflow. |

The submission writer never touches `_ModerationStatus` — it was
never correct for these lists and is not used.

## 7. Exact code changes made

1. **NEW** `apps/hb-webparts/src/homepage/data/peopleCultureSpListRegistry.ts`
   — authoritative list descriptors (id / title / urlSegment /
   purpose / criticalFieldInternalNames) for the four known PC
   lists, plus `buildPcListItemsEndpoint` and
   `buildPcListFieldsEndpoint` helpers that always emit
   `lists(guid'…')` URLs.

2. **UPDATE** `apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts`
   - Module jsdoc now documents the title vs URL mismatch and the
     authoritative publish-state rule.
   - `SP_LIST_ANNOUNCEMENTS` / `SP_LIST_KUDOS` / `SP_LIST_CELEBRATIONS`
     constants redirect through the registry and are marked
     `@deprecated`.
   - `ANN_FIELDS.PublishDate` defaults to
     `'PublishDateMapstopublishDate_x00'`. `InternalNotes` added.
   - `KUDOS_FIELDS` extended with `Details`, `WorkflowStatus`,
     `WasEverPublished`, `PinOrder`, `IsFeatured`, `FeaturedExpiresAt`,
     `ProminenceIntent`, `CurrentVisibilityMode`, `IsScheduled`,
     `ScheduledPublishAt`.
   - `CEL_FIELDS` extended with `ExternalEmployeeId`, `SourceSystem`,
     `LastSynchronizedOn`.
   - `KUDOS_SELECT` extended.
   - `RawAnnouncementItem` carries both `PublishDate` and the
     mangled `PublishDateMapstopublishDate_x00`.
   - `RawKudosItem` carries the full set of new Kudos fields.
   - `deriveKudosStatus(workflowStatus, raw)` replaces
     `synthesizeStatus(raw)`, falling back to the legacy behavior
     only when `workflowStatus` is missing.
   - `parseKudosWorkflowStatus` / `parseKudosProminenceIntent` /
     `parseKudosVisibilityMode` validate the incoming choice
     values against the live schema vocabularies.
   - `mapKudos` projects every new field onto `KudosEntry`.
   - `fetchListItems(siteUrl, listTitle, ...)` replaced with
     `fetchPcListItems(siteUrl, descriptor, ...)` — binds by GUID.
   - `resolvePublishDateField` uses `buildPcListFieldsEndpoint` by
     GUID.
   - **NEW** `validatePeopleCultureListBindings(siteUrl, listKeys?)`
     — runtime guardrail that verifies every critical custom field
     exists on every registered list and returns actionable error
     messages.
   - `PeopleCultureListDataResult` gains an `errors: string[]`
     field. `fetchPeopleCultureListData` now pushes per-list
     failures into that array instead of silently catching them.

3. **UPDATE** `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
   - Module jsdoc updated.
   - `SP_KUDOS_LIST_TITLE` redirected through the registry and
     marked `@deprecated`.
   - `KudosListItemPayload` shape widened to include
     `WorkflowStatus: 'pending'`, `WasEverPublished: false`,
     `ProminenceIntent: 'standard'`, `IsFeatured: false`,
     `IsScheduled: false`.
   - `buildPayload` writes the new fields.
   - Create request binds via `buildPcListItemsEndpoint(siteUrl,
     PEOPLE_CULTURE_LIST_REGISTRY.kudos)`.

4. **UPDATE** `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
   - Consumes `fetchPeopleCultureListData` `errors`.
   - Surfaces binding errors through `result.error` rather than
     the generic "empty results" message.

5. **UPDATE** `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts`
   - Added `KudosWorkflowStatus`, `KudosProminenceIntent`,
     `KudosCurrentVisibilityMode`.
   - `KudosEntry` extended with optional `details`, `workflowStatus`,
     `wasEverPublished`, `pinOrder`, `isFeatured`, `featuredExpiresAt`,
     `prominenceIntent`, `visibilityMode`, `isScheduled`,
     `scheduledPublishAt`.
   - `KudosStatus` narrow tri-state preserved for merged-webpart
     backward compatibility.

6. **NEW** `apps/hb-webparts/src/homepage/__tests__/peopleCultureSpListBinding.test.ts`
   — 16 tests covering the registry, the ID-bound REST URL builders,
   `ANN_FIELDS` / `KUDOS_FIELDS` / `CEL_FIELDS` contracts,
   `fetchPeopleCultureListData` routing by GUID, the `PublishDate`
   remap, the `WorkflowStatus` → `KudosStatus` derivation,
   multi-user celebration explosion, per-list fetch error surfacing,
   and `validatePeopleCultureListBindings` behavior.

7. **Manifest + package version bumps**
   - `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureWebPart.manifest.json`
     bumped `0.0.3.0` → `0.0.4.0` (reads now consume the corrected
     list source).
   - `apps/hb-webparts/config/package-solution.json` bumped
     `1.0.0.118` → `1.0.0.119`.
   - `hb-webparts.sppkg` rebuilt end-to-end.

## 8. Remaining risks / deferred items

1. **Sample-row-only validation.** Both announcements and
   celebrations lists have `ItemCount=1` and the sample rows expose
   only baseline keys. The field contracts are verified by the
   extracted field metadata, but the full adapter → DTO path has
   not been exercised against a populated production row. Adding
   a single populated smoke item per list (with real values) is
   a reasonable follow-up.
2. **Kudos Audit Events.** Not yet read by any surface. Registry
   includes the descriptor so a future prompt can bind audit
   replay by id.
3. **Runtime guardrail call site.** `validatePeopleCultureListBindings`
   is exported but not yet invoked at webpart startup. A thin
   "call this on first mount, surface errors through the hook"
   wiring pass is a reasonable follow-up.
4. **Person-picker write path.** Kudos submission still cannot
   write Person / Taxonomy recipient fields because the composer
   does not collect account names. HR assigns recipients in the
   companion review flow; this limitation is unchanged and
   documented.
5. **Profile photos from list data.** The announcements list does
   not carry person photo metadata; profile photos are still
   resolved at the companion/public runtime layer via
   `createSharePointUserPhotoResolver` and fall through to initials
   when resolution fails (Prompt-04 behavior).
6. **`AudienceTags` taxonomy SspId binding.** The adapter parses
   pipe-delimited taxonomy note values and extracts labels only.
   It does not resolve the taxonomy term GUID or walk the term
   store. This matches the Prompt-02 legacy adapter behavior and
   is deferred to the targeted audience work.
7. **Pre-existing homepage test failures.** Eight test files
   (`bundleBudget`, `compositionPreview`, `discoveryWebpart`,
   `interactiveStates`, `motionAndAccessibility`,
   `operationalAwarenessWebparts`, `topBandWebparts`,
   `utilityWebparts`) are still red on `main`. Outside this
   audit's scope.

## 9. Validation performed

| Check | Command | Result |
|---|---|---|
| Typecheck | `npm run check-types` (apps/hb-webparts) | **clean** |
| Lint | `npm run lint` (apps/hb-webparts) | **clean** |
| Adapter unit tests | `npm test -- peopleCultureSpListBinding` | **16 / 16 pass** |
| Prompt-01 regression | `npm test -- peopleCultureSplitModel` | **36 / 36 pass** |
| Prompt-02 regression | `npm test -- peopleCulturePublicRuntime` | **16 / 16 pass** |
| Prompt-03 regression | `npm test -- peopleCultureCompanionRuntime` | **16 / 16 pass** |
| Prompt-04 regression | `npm test -- peopleCultureMediaAndPreview` | **18 / 18 pass** |
| Prompt-05 regression | `npm test -- peopleCulturePermissionsAndIntake` | **28 / 28 pass** |
| Full hb-webparts suite | `npm test` | **250 passing**, 14 pre-existing failures in unrelated files — no regressions introduced by this audit. |
| sppkg build | `npx tsx tools/build-spfx-package.ts --domain hb-webparts` | **clean**; 15 shim entries (including the new PnpOps webpart added by parallel work); `.sppkg` structure verified; final package **3045.8 KB**. |
| Live SharePoint writes | — | **None performed.** Audit is read-only against the extracted schema artifacts. |

## 10. Completion note

- The audit **did** find mismatches — see §1 and §5/§6.
- The most important remediations landed are: (a) binding every PC
  list call by GUID via the new registry, (b) fixing the
  `PublishDate` InternalName, (c) making `WorkflowStatus` the
  authoritative Kudos publish-state signal on both read and write
  paths, (d) extending the Kudos DTO with the previously-ignored
  scheduling / prominence / visibility fields, and (e) surfacing
  list fetch failures through the hook instead of silently turning
  them into empty-state UI.
- Files changed: see §7.
- Bindings now use list **IDs** as the primary identifier and
  **InternalName** values for every field select / filter / write.
  Title strings are deprecated and retained only for logging.
- What remains unproven because the live lists contain only stub
  rows: the full DTO projection on populated announcement /
  celebration / Kudos rows. The field contracts are verified via
  the extracted field metadata, but end-to-end behavior against a
  populated production row should be revisited once HR authors a
  real row. Recommended next step: drop a single populated smoke
  item per list and re-run `fetchPeopleCultureListData` against
  it to exercise the full normalization pipeline.
- `hb-webparts.sppkg` rebuilt at `1.0.0.119`; a deployment
  validation pass (upload, approve, instantiate the legacy merged
  webpart on a test page) is recommended before the corrected
  read path is promoted to production.
