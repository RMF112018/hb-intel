# PCC External URL Policy Registry

## Scope

HBCentral

## URL

`/sites/HBCentral/Lists/PCC External URL Policy Registry`

## Settings

- Attachments: `False`
- Versioning: `True`
- Folders: `False`
- Logical key: `SystemKey + Hostname + PolicyState`

## Field Schema

| Display Name | Internal Name | Type | Required | Indexed | Notes |
|---|---|---:|---:|---:|---|
| System Key | `SystemKey` | Text | True | True |  |
| Hostname | `Hostname` | Text | True | True |  |
| URL Scheme | `UrlScheme` | Choice | True | True |  |
| Policy State | `PolicyState` | Choice | True | True |  |
| Allow Iframe | `AllowIframe` | Boolean | True | True |  |
| Allow Current Image Preview | `AllowCurrentImagePreview` | Boolean | True | True |  |
| Requires PM PX Approval | `RequiresPmPxApproval` | Boolean | True | True |  |
| Policy Reason | `PolicyReason` | Note | False | False |  |
| Last Reviewed At | `LastReviewedAt` | DateTime | False | True |  |
| Reviewed By UPN | `ReviewedByUpn` | Text | False | False |  |
| Title | `Title` | Text | True | False | Human-readable row title. |
| Is Active | `IsActive` | Boolean | True | True | Active row gate. |
| Created | `Created` | DateTime | False | False | OOB audit. |
| Modified | `Modified` | DateTime | False | False | OOB audit. |
| Created By | `Author` | User | False | False | OOB audit. |
| Modified By | `Editor` | User | False | False | OOB audit. |


## Implementation Notes

- Provisioning must be idempotent.
- Direct user edits should be mediated by the External Systems Launch Pad UI where possible.
- Internal names are binding contract; display names are UI copy only.
- No secrets may be stored in this list.
