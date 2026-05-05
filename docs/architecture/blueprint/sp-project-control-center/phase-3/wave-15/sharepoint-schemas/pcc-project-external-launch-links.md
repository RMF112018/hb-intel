# PCC Project External Launch Links

## Scope

Project Site

## URL

`/sites/{ProjectSite}/Lists/PCC Project External Launch Links`

## Settings

- Attachments: `False`
- Versioning: `True`
- Folders: `False`
- Logical key: `ProjectId + SystemKey + LinkType + NormalizedTargetKey`

## Field Schema

| Display Name           | Internal Name          |     Type | Required | Indexed | Notes                     |
| ---------------------- | ---------------------- | -------: | -------: | ------: | ------------------------- |
| Project ID             | `ProjectId`            |     Text |     True |    True |                           |
| Project Number         | `ProjectNumber`        |     Text |     True |    True |                           |
| System Key             | `SystemKey`            |     Text |     True |    True |                           |
| Link Type              | `LinkType`             |   Choice |     True |    True |                           |
| Provider Name          | `ProviderName`         |     Text |    False |    True |                           |
| Normalized Target Key  | `NormalizedTargetKey`  |     Text |     True |    True |                           |
| Launch URL             | `LaunchUrl`            |      URL |     True |   False |                           |
| Hostname               | `Hostname`             |     Text |     True |    True |                           |
| Open In New Tab        | `OpenInNewTab`         |  Boolean |     True |   False |                           |
| Approval State         | `ApprovalState`        |   Choice |     True |    True |                           |
| Requires Approval      | `RequiresApproval`     |  Boolean |     True |    True |                           |
| Submitted By UPN       | `SubmittedByUpn`       |     Text |    False |    True |                           |
| Submitted At UTC       | `SubmittedAtUtc`       | DateTime |    False |    True |                           |
| Approved By UPN        | `ApprovedByUpn`        |     Text |    False |    True |                           |
| Approved At UTC        | `ApprovedAtUtc`        | DateTime |    False |    True |                           |
| Sort Order             | `SortOrder`            |   Number |     True |    True |                           |
| Audience Mode          | `AudienceMode`         |   Choice |     True |    True |                           |
| Audience Personas JSON | `AudiencePersonasJson` |     Note |    False |   False |                           |
| Iframe Eligible        | `IframeEligible`       |  Boolean |     True |    True |                           |
| Current Image Eligible | `CurrentImageEligible` |  Boolean |     True |    True |                           |
| Admin Notes            | `AdminNotes`           |     Note |    False |   False |                           |
| Title                  | `Title`                |     Text |     True |   False | Human-readable row title. |
| Is Active              | `IsActive`             |  Boolean |     True |    True | Active row gate.          |
| Created                | `Created`              | DateTime |    False |   False | OOB audit.                |
| Modified               | `Modified`             | DateTime |    False |   False | OOB audit.                |
| Created By             | `Author`               |     User |    False |   False | OOB audit.                |
| Modified By            | `Editor`               |     User |    False |   False | OOB audit.                |

## Implementation Notes

- Provisioning must be idempotent.
- Direct user edits should be mediated by the External Systems Launch Pad UI where possible.
- Internal names are binding contract; display names are UI copy only.
- No secrets may be stored in this list.
