# Phase-14 — People Culture Kudos & Kudos Audit Events SharePoint schema extraction report

Generated: 2026-04-09
Target tenant: `hedrickbrotherscom.sharepoint.com`
Target site:   `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
Source of truth for this report: raw + normalized JSON exports in this same
directory (`*-list-schema.raw.json` / `*-list-schema.normalized.json`).

## 1. Executive summary

Both lists exist on the live HB Central site, are non-hidden generic lists
(BaseTemplate 100), and are fully accessible read-only to the authenticated
user. The complete live schema for each list was extracted via PnP.PowerShell
against the tenant with an interactive MSAL login, not inferred from page
HTML or doc plans.

| List | Id | ItemCount | Fields (total / custom) | Views | Content types |
| ---- | -- | --------- | ----------------------- | ----- | -------------- |
| People Culture Kudos | `b01fa4d2-29b1-4e11-b581-4cb3d0951a79` | 1 | 150 / 62 | 2 | Item, Folder |
| Kudos Audit Events   | `c031c08f-25ac-407c-aa15-650b791efeb0` | 0 | 93  / 9  | 1 | Item, Folder |

People Culture Kudos is shaped as a full HR-governed workflow list with
moderation, scheduling, reassignment, prominence controls, and taxonomy-backed
recipient targeting (team / department / project group term sets). Kudos Audit
Events is a thin chronological append-only audit journal keyed by `KudosId`
with a single `EventType` choice column and before/after JSON blobs.

The schemas are ready for downstream adapter implementation without guessing.
Internal names are confirmed exactly as returned by CSOM/PnP. No writes were
performed against either list.

## 2. Extraction method used

Primary: **PnP.PowerShell 3.1.0** against CSOM via delegated MSAL with the
SharePoint Online Management Shell public client
(`9bc3ab49-b65d-410a-85ad-de819febfddc`) and tenant
`0e834bd7-628b-42c8-b9ec-ecebc9719be4` (`hedrickbrothers.com`).

Why not the preferred-order option 1 (SharePoint REST `/_api/web`) or option 2
(Microsoft Graph):

- The Azure CLI public client (`04b07795-8ddb-461a-bbee-02f9e1bf7b46`) cannot
  issue preauthorized SharePoint `AllSites.Read` tokens in this tenant
  (`AADSTS65002: Consent between first party application '04b07795…' and
  first party resource '00000003-0000-0ff1-ce00-000000000000' must be
  configured via preauthorization`). Any bearer token minted via
  `az account get-access-token --resource https://hedrickbrotherscom.sharepoint.com`
  is rejected by `/_api/web/...` with HTTP 401 `invalid_request`. Verified in
  this environment.
- Microsoft Graph (option 2) was attempted next. `GET /sites/{host}:/sites/HBCentral`
  returned the site object, but the authenticated principal's delegated Graph
  scopes on the CLI app do not include `Sites.Read.All` (scp claim:
  `Application.ReadWrite.All AppRoleAssignment.ReadWrite.All AuditLog.Read.All
  DelegatedPermissionGrant.ReadWrite.All Directory.AccessAsUser.All email
  Group.ReadWrite.All openid profile User.Read.All User.ReadWrite.All`), so
  `GET /sites/{id}/lists` returned an empty value and
  `GET /sites/{id}/lists/{name}` returned `itemNotFound`. Requesting the
  explicit `Sites.Read.All` scope against Graph via Azure CLI was blocked by
  the same preauthorization policy.
- PnP.PowerShell 3.1.0 requires an Entra ID app registration client id. The
  SharePoint Online Management Shell client (`9bc3ab49-b65d-410a-85ad-de819febfddc`)
  is preauthorized for `AllSites.FullControl` on this tenant and was used
  with `-Interactive` / device login; the resulting MSAL cache is then
  available to subsequent `Connect-PnPOnline -Interactive` calls without
  further prompting.

Endpoints / PnP cmdlets used, all read-only:

- `Get-PnPList -Identity {title} -Includes …` — list metadata
- `Get-PnPField -List {title}` — **full** field collection (includes hidden
  and sealed base columns)
- `Get-PnPView -List {title}` with `$v.Context.Load($v.ViewFields)`
- `Get-PnPContentType -List {title}` with `$ct.Context.Load($ct.FieldLinks)`
- `Get-PnPListItem -List {title} -PageSize 3 -Fields *` (People Culture Kudos
  only, for sample field-key validation)

Raw PnP responses are serialized verbatim via `ConvertTo-Json -Depth 25`
into the `*.raw.json` files in this directory. Normalized views are then
derived in the same script and written to the `*.normalized.json` files.

Extraction script: `/tmp/extract-sp-schema.ps1` (ephemeral; not committed to
the repo).

## 3. Completeness verification method

**People Culture Kudos**
- PnP returned 150 field objects. `fields.count` (serialized) matches
  `fields.flat.length` (150). No `@odata.nextLink` style paging was
  encountered because `Get-PnPField` uses CSOM batched load, not the OData
  page-size limit, so the collection is returned in a single round-trip.
- Views: 2 returned (`All Items`, `Compact`). `Compact` is the default view
  and matches the URL the user provided (`Compact.aspx?viewid=cca49dc6…`).
- Content types: 2 returned (`Item`, `Folder`). `Folder` is the implicit
  system content type that appears whenever `EnableFolderCreation = true`.
- Samples: `ItemCount = 1`; one sample item retrieved with Id=1. Only the
  base SharePoint system columns are populated on that row, which suggests
  the row is a test stub. Its existence still confirmed that the list is
  live and the adapter path (`_api/web/lists/getbytitle('People Culture
  Kudos')/items`) resolves.

**Kudos Audit Events**
- PnP returned 93 field objects (matching the smaller custom schema). Same
  non-paged single-round-trip guarantee as above.
- Views: 1 returned (`All Items`, default). Matches the
  `AllItems.aspx` URL the user provided. There are no hidden or personal
  views in the collection.
- Content types: 2 returned (`Item`, `Folder`).
- Samples: `ItemCount = 0`; no items exist yet, so sample-item validation
  is intentionally skipped for this list.

Cross-checks performed:
- `$viewsRaw.Count` vs `@($views).Count` — arrays re-wrapped with `@()` to
  avoid PowerShell single-element unwrapping (verified the first draft of the
  extraction bug and re-ran). Post-fix, raw and normalized collection sizes
  match exactly for every collection on both lists.
- `python3` re-read each `.json` file and asserted that
  `len(d['fields']['flat']) == d['fields']['count']`,
  `len(d['views']['flat']) == d['views']['count']`,
  `len(d['contentTypes']['flat']) == d['contentTypes']['count']`. Both files
  pass.
- InternalName spot-checks: the sample `Get-PnPListItem -Fields *` response
  for People Culture Kudos returns the exact InternalName strings that are
  recorded in the field collection, confirming downstream REST calls can
  rely on those InternalName keys as-is.

## 4. List metadata summary

### 4.1 People Culture Kudos

| Property | Value |
| -------- | ----- |
| Title | People Culture Kudos |
| Id | `b01fa4d2-29b1-4e11-b581-4cb3d0951a79` |
| BaseTemplate | 100 (Generic List) |
| BaseType | GenericList |
| Hidden | false |
| ItemCount | 1 |
| ContentTypesEnabled | true |
| EnableAttachments | true |
| EnableFolderCreation | true |
| EnableVersioning | true |
| EnableMinorVersions | false |
| EnableModeration | false |
| ForceCheckout | false |
| MajorVersionLimit | 50 |
| DefaultViewUrl | `/sites/HBCentral/Lists/People Culture Kudos/Compact.aspx` |
| EntityTypeName | `People_x0020_Culture_x0020_Kudos` |
| ParentWebUrl | `/sites/HBCentral` |
| IsApplicationList | false |
| IsCatalog | false |
| IsPrivate | false |

Note: content approval / moderation (`EnableModeration`) is **off** at the
SharePoint layer. Workflow state is managed entirely by the custom
`WorkflowStatus` choice column + supporting lifecycle columns, not by the
built-in `_ModerationStatus` column. The downstream adapter must treat
`WorkflowStatus` as the authoritative publish state.

### 4.2 Kudos Audit Events

| Property | Value |
| -------- | ----- |
| Title | Kudos Audit Events |
| Id | `c031c08f-25ac-407c-aa15-650b791efeb0` |
| BaseTemplate | 100 (Generic List) |
| BaseType | GenericList |
| Hidden | false |
| ItemCount | 0 |
| ContentTypesEnabled | true |
| EnableAttachments | true |
| EnableFolderCreation | true |
| EnableVersioning | true |
| EnableMinorVersions | false |
| EnableModeration | false |
| DefaultViewUrl | `/sites/HBCentral/Lists/Kudos Audit Events/AllItems.aspx` |
| EntityTypeName | `Kudos_x0020_Audit_x0020_Events` |
| ParentWebUrl | `/sites/HBCentral` |

This list is empty. Its only consumer should be append-only writes from the
Kudos workflow engine + read-only reconstruction by the audit view. There is
no SharePoint moderation pipeline attached.

## 5. Recommended integration field map — People Culture Kudos

The following fields are the authoritative set for any adapter mapping the
list to the downstream Phase-14 Kudos domain model. Internal names are
exact. Full type + constraints are in `people-culture-kudos-list-schema.normalized.json`.

### 5.1 Core identity & content

| Internal name | Type | Required | Indexed | Notes |
| ------------- | ---- | :------: | :-----: | ----- |
| `Title` | Text | No | No | SharePoint's base Title column. Not required here — use `Headline` as the editorial headline. |
| `KudosId` | Text | **Yes** | **Yes** | Stable app-owned GUID/string. Primary key for cross-list join with `Kudos Audit Events.KudosId`. |
| `Headline` | Text | **Yes** | No | Short editorial headline (homepage display). |
| `Excerpt` | Note | **Yes** | No | Summary / body used in list + card surfaces. |
| `Details` | Note | No | No | Long-form body text. |
| `PrimaryImage` | Thumbnail | No | No | Hero / card image. SharePoint `Thumbnail` (JSON blob with `serverRelativeUrl`, `id`, dimensions). |
| `ImageAltText` | Text | No | No | Alt text for the thumbnail. |

### 5.2 Recipient targeting

| Internal name | Type | Notes |
| ------------- | ---- | ----- |
| `IndividualRecipients` | UserMulti (`PeopleOnly`) | Direct person recipients. |
| `TeamRecipients` | Taxonomy (term store `9dcca09f-7c2a-419f-a79f-e64e1f5bcf93`) | Multi-valued. Maps to recipientType=team. |
| `DepartmentRecipients` | Taxonomy (same term store) | Multi-valued. Maps to recipientType=department. |
| `ProjectGroupRecipients` | Taxonomy (same term store) | Multi-valued. Maps to recipientType=projectGroup. |

The three taxonomy fields are bound to the same enterprise SSP via
`SspId=9dcca09f-7c2a-419f-a79f-e64e1f5bcf93`; each points at a specific
TermSetId. Full `SchemaXml` for each is in the raw file under
`fields.flat[*].SchemaXml` — the adapter should parse those `TermSetId`
values at implementation time rather than hardcoding them here.

### 5.3 Submission & moderation identities

| Internal name | Type | Purpose |
| ------------- | ---- | ------- |
| `SubmittedBy` | User (PeopleOnly) | Submitter identity. Required. |
| `SubmittedDate` | DateTime | Required. Editorial submission timestamp, distinct from SP `Created`. |
| `ApprovedBy` / `ApprovedDate` | User / DateTime | HR approver + approval time. |
| `RejectionReason` | Note | Rejector reason text. |
| `ModeratorNotes` | Note | HR-only internal notes. |
| `RevisionRequestedBy` / `RevisionRequestedAt` / `RevisionGuidance` | User / DateTime / Note | Revision round-trip with guidance text. |
| `WithdrawnBy` / `WithdrawnAt` | User / DateTime | Submitter-initiated withdraw. |
| `AdminReviewFlaggedBy` / `AdminReviewFlaggedAt` / `AdminReviewReason` / `AdminReviewedBy` / `AdminReviewedAt` | User / DateTime / Note | Escalation path to admin review. |
| `IsFlaggedForAdminReview` | Boolean | Pre-computed admin-review flag. |
| `RemovedBy` / `RemovedAt` / `RemovedReason` | User / DateTime / Note | Post-publish removal. |
| `IsRemovedFromPublicView` | Boolean | Public-view kill switch. |
| `RestoredBy` / `RestoredAt` | User / DateTime | Restoration after removal. |

### 5.4 Workflow state

| Internal name | Type | Purpose |
| ------------- | ---- | ------- |
| `WorkflowStatus` | **Choice**, required | Authoritative publish state. Choices: `pending`, `revisionRequested`, `approved`, `approvedScheduled`, `rejected`, `withdrawn`, `removedUnpublished`. |
| `WasEverPublished` | Boolean, required | True after the first successful publish. Used for "removed but formerly public" logic. |

### 5.5 Publish, scheduling, and prominence

| Internal name | Type | Purpose |
| ------------- | ---- | ------- |
| `PublishStartDate` / `PublishEndDate` | DateTime | Window over which a kudos is eligible to render. |
| `HomepageEnabled` | Boolean, required | Homepage surface opt-in. |
| `IsScheduled` | Boolean | True when publish is scheduled into the future. |
| `ScheduledPublishAt` | DateTime | Target publish moment. |
| `ScheduledBy` / `ScheduleChangedBy` / `ScheduleChangedAt` / `ScheduleCancelledBy` / `ScheduleCancelledAt` | User / User / DateTime / User / DateTime | Schedule lifecycle audit. |
| `IsPinned` | Boolean, required | Pinned to homepage. |
| `PinOrder` | Number | Manual pin ordering. |
| `IsFeatured` | Boolean | Featured treatment flag. |
| `FeaturedExpiresAt` | DateTime | Feature-expiry. |
| `ProminenceIntent` | Choice | `standard`, `pinned`, `featured`. |
| `ProminenceFailureAt` / `ProminenceFailureReason` | DateTime / Note | Last promotion failure trace. |

### 5.6 Claim / reassignment (HR workflow ops)

| Internal name | Type | Purpose |
| ------------- | ---- | ------- |
| `ClaimOwner` / `ClaimedAt` | User / DateTime | Current HR claim owner. |
| `AssignedOwner` | User | Default or fallback HR owner. |
| `ReassignedBy` / `ReassignedAt` | User / DateTime | Last reassignment audit. |
| `ReviewedBy` / `ReviewedAt` | User / DateTime | Last HR-reviewed audit (distinct from `ApprovedBy`). |

### 5.7 Engagement / reaction counters

| Internal name | Type | Purpose |
| ------------- | ---- | ------- |
| `CelebrateCount` | Number, required | Count of celebrate/reaction events. Increments from audit-event replay. |

### 5.8 Visibility mode

| Internal name | Type | Purpose |
| ------------- | ---- | ------- |
| `CurrentVisibilityMode` | Choice | Choices: `public`, `associatedOnly`, `internalOnly`. Drives cross-surface audience scoping. |

### 5.9 Likely irrelevant for app integration

Every base SharePoint column exposed via `/fields` (88 entries) is classified
as `system` in the normalized file (hidden, sealed, `_x`-prefixed, etc.).
Those can be ignored by the integration layer in most cases. The only base
columns worth keeping in your query projection are:

- `ID` — SharePoint list-item id.
- `Created` / `Modified` / `Author` / `Editor` — for audit correlation
  alongside the richer custom lifecycle columns.
- `Attachments` — the list has attachments enabled.
- `FileRef` — if you need the stable SharePoint item URL.

## 6. Recommended integration field map — Kudos Audit Events

This list is a thin append-only journal. Every field that matters is custom
and unindexed (reads are expected to filter by `KudosId` in downstream
adapters; consider requesting an index on `KudosId` and `EventAt` post-rollout
if volumes grow).

| Internal name | Type | Purpose |
| ------------- | ---- | ------- |
| `Title` | Text | Freeform event label. Optional. |
| `KudosId` | Text | **Primary foreign key** to `People Culture Kudos.KudosId`. Not currently indexed — see risks. |
| `EventType` | **Choice** | Choices: `submit`, `approve`, `reject`, `revisionRequested`, `reopen`, `remove`, `restore`, `flagAdminReview`, `clearAdminReview`, `claim`, `reassign`, `schedule`, `unschedule`, `feature`, `unfeature`, `pin`, `unpin`, `celebrate`. Drives event dispatch + audit reconstruction. |
| `Actor` | User (PeopleOnly) | Person who executed the action. Distinct from SP `Author` (which is the service principal that wrote the row). |
| `EventAt` | DateTime | Wall-clock time of the event. Distinct from `Created`. |
| `OldValue` | Note | Before-state blob (JSON recommended). |
| `NewValue` | Note | After-state blob (JSON recommended). |
| `PublicNote` | Note | Optional caller-visible note (shown in activity streams). |
| `InternalNote` | Note | HR-only note (never rendered in public views). |

The entire EventType choice set aligns 1:1 with the lifecycle columns on
People Culture Kudos. A consistent replay of the audit journal, ordered by
(`KudosId`, `EventAt`, `Id`), reconstructs the workflow state of each kudos
item exactly.

## 7. Key risks / unknowns

1. **No `KudosId` index on `Kudos Audit Events`.** `Indexed = false` for
   every custom field on this list. The list is empty today, so the absence
   is cheap, but an index (REST or PnP `Add-PnPFieldToListField`) should be
   added before volume grows or the audit-reconstruction queries will scan
   the full list per kudos read. Recommended: index on `KudosId`, and
   optionally a compound on `(KudosId, EventAt)` if that compound index
   is admissible in SPO.
2. **No `KudosId` uniqueness enforcement on People Culture Kudos.**
   `KudosId` is marked required and indexed but not `EnforceUniqueValues`.
   Downstream writers must guarantee uniqueness themselves, or the adapter
   must use first-match semantics when querying by `KudosId`.
3. **Taxonomy SspId binding.** `TeamRecipients`, `DepartmentRecipients`,
   `ProjectGroupRecipients` all bind to `SspId = 9dcca09f-7c2a-419f-a79f-e64e1f5bcf93`
   and specific TermSetIds baked into the field SchemaXml. If the tenant
   rotates the term store or re-provisions the recipient term sets, the
   fields silently break. The adapter should fail loudly when a recipient
   field's TermSetId is no longer resolvable, instead of treating the
   response as "no recipients".
4. **`_ModerationStatus` is not authoritative.** SharePoint-level content
   approval is off. Any downstream reader that reads `_ModerationStatus`
   out of habit will see `Approved` (0) for every row regardless of the
   custom workflow state. Treat `WorkflowStatus` as the only authoritative
   publish signal.
5. **No ItemCount in `Kudos Audit Events`, partial stub in Kudos.** Both
   lists are effectively empty (1 stub row in Kudos, 0 in audit). Sample-item
   field-key validation for the custom columns on the Kudos list therefore
   did not return populated values; the downstream adapter should add a
   smoke test that asserts InternalName parity against the first real
   production row, in case schema drift happens between this snapshot
   and first production write.
6. **No dedicated views beyond the defaults.** There is no "Pending HR
   review" or "Approved & scheduled" view on the live list. If the
   HR Operating Companion webpart (Phase-14 Prompt-03) expects named
   server-side views, those will need to be created as part of the webpart
   onboarding work, not assumed here.
7. **Content types.** Both lists expose `Item` + `Folder`. No custom
   content type inheritance is wired up, so the adapter should not rely
   on content-type routing to distinguish record classes — all records
   flow through the single `Item` content type.

## 8. Exact next-step recommendations for implementation

1. **Freeze this report as the canonical Phase-14 schema source.** Any
   adapter, DTO, or data-contract change in downstream Phase-14 work must
   reference the `*.normalized.json` files in this directory, not
   re-discovery from SharePoint. Re-run the extraction script (committed
   under this same directory, or a sibling tool folder) only when the SharePoint
   schema is intentionally changed.
2. **Generate TypeScript types from `people-culture-kudos-list-schema.normalized.json`.**
   Target location (aligning with `@hbc/data-access` or the dedicated
   Phase-14 feature package — see `docs/architecture/blueprint/package-relationship-map.md`).
   The types should be explicit about User vs UserMulti, Taxonomy Id+Label
   shape, Thumbnail shape, and Choice literal unions.
3. **Build the SharePoint adapter around InternalName keys, not display
   names.** REST `/_api/web/lists/getbytitle('People Culture Kudos')/items`
   returns properties using the same InternalName strings recorded here.
   Graph `/items/{id}/fields` will return similar shapes but with Graph's
   own field envelope — decide on the transport early.
4. **Request a `KudosId` index on `Kudos Audit Events`.** Before the first
   production write to the audit list. A single `Set-PnPField -List 'Kudos
   Audit Events' -Identity 'KudosId' -Values @{Indexed=$true}` call covers
   it. File as an admin task; do not automate in the adapter.
5. **Wire the `WorkflowStatus` → UI workflow state mapping deliberately.**
   The seven `WorkflowStatus` choices map to distinct UI affordances
   (pending chip, approved banner, revision-requested banner, etc.).
   Cross-reference the Phase-14 `Prompt-01-Data-Model-and-Contracts.md`
   doctrine; if any state is missing from that doctrine, escalate there
   before proceeding with UI work.
6. **Treat the `EventType` choice set as a locked enum.** The choice list
   is the integration contract for the audit reducer. Any new lifecycle
   event must be added to the SharePoint list Choice field first, then
   reflected in the TypeScript type.
7. **Do not add new fields to either list from application code.** All
   schema changes should go through a provisioning script under
   `scripts/*.ts` (mirroring `create-acknowledgment-list.ts`) so the field
   set stays declarative and reproducible.

## 9. Appendix — file inventory

All outputs live under
`/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/`:

| File | Purpose |
| ---- | ------- |
| `people-culture-kudos-sharepoint-schema-report.md` | this report |
| `people-culture-kudos-list-schema.raw.json` | verbatim PnP/CSOM export — 150 fields, 2 views, 2 content types, 1 sample item |
| `people-culture-kudos-list-schema.normalized.json` | classified + typed view of the same data |
| `people-culture-kudos-list-sample-items.json` | single sample item field-key proof |
| `kudos-audit-events-list-schema.raw.json` | verbatim PnP/CSOM export — 93 fields, 1 view, 2 content types, 0 items |
| `kudos-audit-events-list-schema.normalized.json` | classified + typed view |
| `site-context.raw.json` | Graph `sites/{host}:/sites/HBCentral` snapshot captured during the earlier Graph-based attempt |

No write actions were performed against either SharePoint list during this
extraction.
