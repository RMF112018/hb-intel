# PCC Project External System Mappings

## Scope

Project Site

## URL

`/sites/{ProjectSite}/Lists/PCC Project External System Mappings`

## Settings

- Attachments: `False`
- Versioning: `True`
- Folders: `False`
- Logical key: `ProjectId + SystemKey + MappingScope + SourceObjectType`

## Field Schema

| Display Name | Internal Name | Type | Required | Indexed | Notes |
|---|---|---:|---:|---:|---|
| Project ID | `ProjectId` | Text | True | True |  |
| Project Number | `ProjectNumber` | Text | True | True |  |
| System Key | `SystemKey` | Text | True | True |  |
| Mapping Scope | `MappingScope` | Choice | True | True |  |
| Source Object Type | `SourceObjectType` | Text | True | True |  |
| External Object ID | `ExternalObjectId` | Text | False | True |  |
| External Object Number | `ExternalObjectNumber` | Text | False | True |  |
| External Display Name | `ExternalDisplayName` | Text | False | False |  |
| Mapping State | `MappingState` | Choice | True | True |  |
| Freshness Band | `FreshnessBand` | Choice | True | True |  |
| Last Verified At UTC | `LastVerifiedAtUtc` | DateTime | False | True |  |
| Owner Persona | `OwnerPersona` | Text | False | True |  |
| Owner UPN | `OwnerUpn` | Text | False | True |  |
| Lineage JSON | `LineageJson` | Note | False | False |  |
| Review Item ID | `ReviewItemId` | Text | False | True |  |
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
