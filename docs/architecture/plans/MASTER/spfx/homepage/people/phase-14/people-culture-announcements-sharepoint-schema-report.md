# Phase-14 — People Culture Announcements SharePoint schema extraction report

Generated: 2026-04-09 21:11:06Z
Target tenant: `hedrickbrotherscom.sharepoint.com`
Target site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
Source of truth: raw + normalized JSON exports in this directory (`*-list-schema.raw.json` / `*-list-schema.normalized.json`).

## 1. Executive summary

Live schema extraction completed for both requested announcement URLs using the proven PnP/CSOM method, read-only, without using SharePoint page HTML as schema source.

Important live-reality note: requested URL labels and resolved SharePoint list titles do not match 1:1:
- URL ending in `People Culture Announcements1` resolves to live title `People Culture Announcements`.
- URL ending in `People Culture Announcements` resolves to live title `People Culture Celebrations`.

- **People Culture Announcements1**: resolved live list title is `People Culture Announcements`; DefaultViewUrl `/sites/HBCentral/Lists/People Culture Announcements1/AllItems.aspx`; fields/views/content types = 106/1/2.
- **People Culture Announcements**: resolved live list title is `People Culture Celebrations`; DefaultViewUrl `/sites/HBCentral/Lists/People Culture Announcements/AllItems.aspx`; fields/views/content types = 100/1/2.

| Requested list | Resolved live title | Id | ItemCount | Fields (total/custom) | Views | Content types |
| --- | --- | --- | --- | --- | --- | --- |
| People Culture Announcements1 | `People Culture Announcements` | `2cd191fc-a7ea-49f2-af05-c395c2326e57` | 1 | 106 / 20 | 1 | 2 |
| People Culture Announcements | `People Culture Celebrations` | `b87bf664-0531-418b-902c-726e5fb87083` | 1 | 100 / 14 | 1 | 2 |

## 2. Extraction method used

Method: **PnP.PowerShell 3.1.0** with CSOM-backed list extraction and delegated device login.

Auth pattern used:
- `Connect-PnPOnline -Url "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" -ClientId "9bc3ab49-b65d-410a-85ad-de819febfddc" -Tenant "hedrickbrothers.com" -DeviceLogin`

Read-only cmdlets used per list:
- `Get-PnPList -Identity <list-id> -Includes ...`
- `Get-PnPField -List <list-id>`
- `Get-PnPView -List <list-id>` with explicit `ViewFields` load
- `Get-PnPContentType -List <list-id>` with explicit `FieldLinks` load
- `Get-PnPListItem -List <list-id> -PageSize 3 -Fields *` for light sample key validation

No write cmdlets (`Add-*`, `Set-*`, `Remove-*`, `Update-*`) were used.

## 3. Completeness verification method

- `People Culture Announcements1` count checks: fields 106==len(flat), views 1==len(flat), content types 2==len(flat), normalized counts match raw, sampleItems=1.
- `People Culture Announcements` count checks: fields 100==len(flat), views 1==len(flat), content types 2==len(flat), normalized counts match raw, sampleItems=1.

Post-write validation performed:
- JSON parse validation for all 4 schema files.
- Required top-level key validation for raw and normalized outputs.
- Cross-file count parity checks (`raw` vs `normalized`) for fields/views/content types.
- Sample-item files written for both lists because each list has `ItemCount=1` and sample validation was used.

## 4. List metadata summary

### 4.1 People Culture Announcements1

| Property | Value |
| --- | --- |
| Requested list label | People Culture Announcements1 |
| Resolved live title | People Culture Announcements |
| Id | `2cd191fc-a7ea-49f2-af05-c395c2326e57` |
| BaseTemplate | 100 |
| BaseType | GenericList |
| Description |  |
| Hidden | false |
| ItemCount | 1 |
| ContentTypesEnabled | false |
| EnableAttachments | true |
| EnableFolderCreation | false |
| EnableVersioning | true |
| EnableMinorVersions | false |
| EnableModeration | false |
| DefaultViewUrl | `/sites/HBCentral/Lists/People Culture Announcements1/AllItems.aspx` |
| EntityTypeName | `People_x0020_Culture_x0020_Announcements1List` |
| ParentWebUrl | `/sites/HBCentral` |

### 4.2 People Culture Announcements

| Property | Value |
| --- | --- |
| Requested list label | People Culture Announcements |
| Resolved live title | People Culture Celebrations |
| Id | `b87bf664-0531-418b-902c-726e5fb87083` |
| BaseTemplate | 100 |
| BaseType | GenericList |
| Description |  |
| Hidden | false |
| ItemCount | 1 |
| ContentTypesEnabled | false |
| EnableAttachments | true |
| EnableFolderCreation | false |
| EnableVersioning | true |
| EnableMinorVersions | false |
| EnableModeration | false |
| DefaultViewUrl | `/sites/HBCentral/Lists/People Culture Announcements/AllItems.aspx` |
| EntityTypeName | `People_x0020_Culture_x0020_AnnouncementsList` |
| ParentWebUrl | `/sites/HBCentral` |

## 5. Recommended integration field map (app-facing)

Notes:
- All field names below are **InternalName** values from live schema.
- Recommendations are based only on extracted schema contracts (no UI inference).

### 5.1 People Culture Announcements1 (resolved title: `People Culture Announcements`)

- Headline/title: `Headline`, `Title`, `PersonDisplayName`
- Summary/body/details: `Summary`, `InternalNotes`
- Person/profile identity: `AnnouncementPerson`, `PersonDisplayName`
- Announcement/celebration type/category: `AnnouncementType`
- Publish/workflow status: `HomepageEnabled`, `_ModerationStatus`
- Audience/visibility: `AudienceTags`
- Scheduling: `PublishDateMapstopublishDate_x00`, `StartDisplayDate`, `EndDisplayDate`
- Pin/feature/homepage-driving: `IsPinned`, `PriorityOverride`, `HomepageEnabled`
- Media/image/photo: `PrimaryImage`, `ImageAltText`
- Display-relevant dates: `PublishDateMapstopublishDate_x00`, `StartDisplayDate`, `EndDisplayDate`
- Approval/moderation/review: `InternalNotes`, `_ModerationStatus`

Top implementation-critical fields for this list:
- `AnnouncementId`, `AnnouncementType`, `Headline`, `Summary`, `HomepageEnabled`

### 5.2 People Culture Announcements (resolved title: `People Culture Celebrations`)

- Headline/title: `Title`, `PersonDisplayName`
- Summary/body/details: Not present in extracted custom schema.
- Person/profile identity: `PersonName`, `PersonDisplayName`, `ExternalEmployeeId`
- Announcement/celebration type/category: `CelebrationType`, `SourceSystem`
- Publish/workflow status: `HomepageEnabledGovernanceextensi`, `_ModerationStatus`
- Audience/visibility: `AudienceTags`
- Scheduling: `CelebrationDate`
- Pin/feature/homepage-driving: `HomepageEnabledGovernanceextensi`
- Media/image/photo: `PrimaryImage`, `ImageAltText`
- Display-relevant dates: `CelebrationDate`, `LastSynchronizedOn`
- Approval/moderation/review: `_ModerationStatus`

Top implementation-critical fields for this list:
- `AnnouncementId`, `PersonName`, `CelebrationType`, `CelebrationDate`, `HomepageEnabledGovernanceextensi`

## 6. Key risks / unknowns

1. **Requested labels vs live titles are divergent.** Integrations should bind by list ID/URL, not display title strings.
2. **Both sample rows only expose system keys.** Light sample validation confirms baseline item keys but not populated custom-value payloads.
3. **No SharePoint moderation workflow enabled.** `EnableModeration=false` on both lists; custom publish governance must rely on custom fields.
4. **Taxonomy field (`AudienceTags`) present on both lists.** Consumer must handle taxonomy value shapes explicitly.
5. **Potentially generated internal names (for example `PublishDateMapstopublishDate_x00`, `HomepageEnabledGovernanceextensi`).** Code should use these exact internal names until schema is intentionally refactored.

## 7. Exact next-step recommendations for implementation

1. Use these normalized files as the adapter contract source for people/culture announcement reads.
2. Bind production queries by **list ID** and internal field names, not display titles.
3. Generate typed DTOs from normalized field metadata for both list variants and map by requested URL target.
4. Add runtime guardrails to fail fast if required critical fields are missing at startup.
5. If list title cleanup is desired, treat it as separate SharePoint governance work (outside adapter implementation).

## 8. Output inventory

- `people-culture-announcements1-list-schema.raw.json`
- `people-culture-announcements1-list-schema.normalized.json`
- `people-culture-announcements-list-schema.raw.json`
- `people-culture-announcements-list-schema.normalized.json`
- `people-culture-announcements1-list-sample-items.json`
- `people-culture-announcements-list-sample-items.json`
- `people-culture-announcements-sharepoint-schema-report.md`

All files are under:
`/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/`
