# PCC External System Definitions

## Scope

HBCentral

## URL

`/sites/HBCentral/Lists/PCC External System Definitions`

## Settings

- Attachments: `False`
- Versioning: `True`
- Folders: `False`
- Logical key: `SystemKey + IsActive`

## Field Schema

| Display Name | Internal Name | Type | Required | Indexed | Notes |
|---|---|---:|---:|---:|---|
| System Key | `SystemKey` | Text | True | True |  |
| System Category | `SystemCategory` | Choice | True | True |  |
| System Posture | `SystemPosture` | Choice | True | True |  |
| Record Owner | `RecordOwner` | Text | True | False |  |
| MVP Mode | `MvpMode` | Choice | True | True |  |
| Live Read Posture | `LiveReadPosture` | Choice | True | True |  |
| Writeback Policy | `WritebackPolicy` | Choice | True | True |  |
| Allowed Link Types JSON | `AllowedLinkTypesJson` | Note | False | False |  |
| Approved Domains JSON | `ApprovedDomainsJson` | Note | False | False |  |
| Sort Order | `SortOrder` | Number | True | True |  |
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
