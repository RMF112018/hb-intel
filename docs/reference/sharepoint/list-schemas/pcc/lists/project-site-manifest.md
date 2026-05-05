# PCC Project Site Manifest

## 1. Objective
- Planned PCC schema/reference file for `PCC Project Site Manifest`.
- Category: `Project Identity / Site Profile`.
- Storage posture: `Project site`.
- Classification posture: `contract-derived-required`.

## 2. List-Level Metadata
- List ID: ``
- Entity Type Name: ``
- URL: ``
- Default View URL: ``
- Root Folder URL: ``
- Base Template / Base Type: `100` / `0`
- Classification: `contract-derived-required`
- Description: `Project Identity / Site Profile / Project site`
- Hidden: `false`
- Item Count: ``
- Content Types Enabled: ``
- Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
- Moderation: `EnableModeration=false`
- Attachments Enabled: `false`

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| Title | Title | Text | Yes | No | No | No | MaxLength=255 |
| Manifest ID | ManifestId | Note | Yes | No | No | No | RichText=false; Lines=6 |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Project Number | ProjectNumber | Number | Yes | No | No | Yes | Indexed for query/view performance |
| Project Site Url | ProjectSiteUrl | URL | No | No | No | No | Launch/reference value; no secrets or bearer tokens |
| Site Title | SiteTitle | Text | Yes | No | No | No | MaxLength=255 |
| Site Url Slug | SiteUrlSlug | URL | No | No | No | No | Launch/reference value; no secrets or bearer tokens |
| Project Base Number | ProjectBaseNumber | Number | Yes | No | No | No |  |
| Project Base Number No Hyphen | ProjectBaseNumberNoHyphen | Number | Yes | No | No | No |  |
| Project Phase Suffix | ProjectPhaseSuffix | Text | Yes | No | No | No | MaxLength=255 |
| Template Name | TemplateName | Text | Yes | No | No | No | MaxLength=255 |
| Template Version | TemplateVersion | Text | Yes | No | No | No | MaxLength=255 |
| Provisioning Run ID | ProvisioningRunId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Provisioning Status | ProvisioningStatus | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Provisioned At UTC | ProvisionedAtUtc | DateTime | Yes | No | No | No |  |
| Provisioned By UPN | ProvisionedByUpn | Text | Yes | No | No | No | MaxLength=255 |
| Teams Group ID | TeamsGroupId | Text | No | No | No | Yes | Indexed for query/view performance |
| Teams Channel ID | TeamsChannelId | Text | No | No | No | Yes | Indexed for query/view performance |
| Validation Status | ValidationStatus | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Last Validated At UTC | LastValidatedAtUtc | DateTime | Yes | No | No | No |  |
| Archive Status | ArchiveStatus | Choice | No | No | No | Yes | Indexed for query/view performance |
| Archived At UTC | ArchivedAtUtc | DateTime | No | No | No | No |  |
| Manifest JSON | ManifestJson | Note | Yes | No | No | No | RichText=false; Lines=6 |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `project site provisioning manifest`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Person/user references are stored as stable text keys for cross-site portability; SharePoint User fields may be added later for UX only.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `23`
- Hidden fields: `0`
- Non-hidden lookup fields: `0`
- Unique-enforced fields: ``
- Indexed non-hidden fields: `8`
- System/OOB fields are not included in this planned schema file; live tenant extraction should append OOB fields only where integration-relevant.
- Attachments should remain disabled unless a later approved exception is recorded; evidence should be handled by Document Control references.
- Default operational views should filter first on indexed fields such as `ProjectId`, active/status/state fields, module/system keys, or due-date fields.

## 7. Open Questions / Follow-Up Checks
- Confirm final list URL, list GUID, entity type name, and form URLs after provisioning.
- Confirm whether this list should use a shared PCC content type or a list-local item content type.
- Confirm field IDs and site-column reuse before generating Graph/PnP provisioning assets.
- Confirm production index strategy against actual query patterns and expected item volume.
- Confirm whether any tenant-specific retention, sensitivity, or compliance labels apply.
