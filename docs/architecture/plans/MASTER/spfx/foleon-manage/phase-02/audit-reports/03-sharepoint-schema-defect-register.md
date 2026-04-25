---
generated_utc: 2026-04-25T08:22:25Z
scope: HB Intel Foleon SPFx list provisioning audit
package_under_review: hb-intel-foleon 1.0.11.0
uploaded_sppkg_sha256: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
web_research_status: Not performed; web search was unavailable in this ChatGPT session. Local agent must verify current Microsoft Learn guidance before implementation.
---


# 03 — SharePoint Schema Defect Register

## Defect Register

| ID | Severity | Category | File | List | Defect | Fix |
|---|---|---|---|---|---|---|
| FLP-001 | Critical | Indexed column overreach | `schema-content-registry.xml` | `HB_FoleonContentRegistry` | 27 custom fields are marked `Indexed="TRUE"`. | Reduce to launch-critical/query-critical indexes. |
| FLP-002 | High | Cross-list lookup | `schema-homepage-placements.xml` | `HB_FoleonHomepagePlacements` | Required lookup is created during same feature activation as target list. | Make optional or provision post-create through controlled script/backend. |
| FLP-003 | High | Provisioning mechanism | `package-solution.json`, assets | All | Complex lists are created automatically when app is added to site. | Move long-term provisioning to PnP/Graph/backend. |
| FLP-004 | Medium | Unique constraint semantics | all unique-intent schemas | Content/Event/Sync | `AllowDuplicateValues="FALSE"` is treated as proof but tenant uniqueness is unproven. | Verify supported field attribute and validate via REST/PnP. |
| FLP-005 | Medium | Test gap | `featureAssets.test.ts` | All | Tests do not validate index count, path resolution, package parity, or SharePoint usability. | Add model-based XML validation tests. |
| FLP-006 | Medium | Package proof gap | `prove-foleon-package.ts` | All | Proof validates file presence but not schema correctness. | Add XML parse, package relationship, CustomSchema, byte parity, stale file, index count checks. |
| FLP-007 | Medium | Tenant residue | tenant | All | Failed feature activation can leave corrupted lists. | Capture evidence, clean site repro, backup/delete/reprovision test lists. |

## Per-List Notes

### `HB_FoleonContentRegistry`

- Field count: 39 custom fields.
- Current custom indexed field count: 27.
- Unique-intent field: `FoleonDocId`.
- Main risk: too many Feature Framework-created indexes.

Recommended launch indexes:

```text
FoleonDocId
PublishStatus
IsVisible
IsHomepageEligible
PublishedOn
DisplayFrom
DisplayThrough
SortRank
AllowEmbed
SyncSource
```

Optional post-provision indexes after usage proof:

```text
FoleonProjectId
ContentTypeKey
IsFeatured
RequiresExternalOpen
```

Avoid launch indexes unless proven necessary:

```text
FoleonDocUid
FoleonIdentifier
FoleonProjectName
MarketingOwner
IssueDate
FirstPublishedOn
FoleonModifiedOn
RelatedProjectNumber
RelatedProjectName
Region
Sector
OpenMode
LastSynced
```

### `HB_FoleonHomepagePlacements`

- Field count: 10 custom fields.
- Current custom indexed field count: 8.
- Main risk: required lookup to `HB_FoleonContentRegistry`.

Recommended changes:

- Keep `ContentIdCache`.
- Make `ContentLookup` optional or post-provisioned.
- Validate `ContentLookupId` REST projection after provisioning.
- Do not require users to directly edit SharePoint list rows as the normal management flow.

### `HB_FoleonInteractionEvents`

- Field count: 13 custom fields.
- Current custom indexed field count: 9.
- Unique-intent field: `EventId`.
- Main risk: not likely the list-load root cause, but uniqueness must be validated.

Recommended changes:

- Consider reducing indexes to the required set:
  - `EventId`
  - `EventType`
  - `FoleonDocId`
  - `ContentRegistryItemId`
  - `PageContext`
  - `EventTimestamp`
  - `SessionId`
- Do not index `UserEmailHash` or `UserDepartment` at launch unless reporting queries need them.

### `HB_FoleonSyncRuns`

- Field count: 12 custom fields.
- Current custom indexed field count: 8.
- Unique-intent field: `RunId`.
- Main risk: low.

Recommended changes:

- Keep required indexes.
- Validate unique constraint.
- Confirm views open.
