# PCC External Object References

## Scope

Project Site

## URL

`/sites/{ProjectSite}/Lists/PCC External Object References`

## Settings

- Attachments: `False`
- Versioning: `True`
- Folders: `False`
- Logical key: `ProjectId + SystemKey + ObjectType + ExternalObjectId`

## Field Schema

| Display Name                 | Internal Name               |     Type | Required | Indexed | Notes                     |
| ---------------------------- | --------------------------- | -------: | -------: | ------: | ------------------------- |
| Project ID                   | `ProjectId`                 |     Text |     True |    True |                           |
| System Key                   | `SystemKey`                 |     Text |     True |    True |                           |
| Object Type                  | `ObjectType`                |     Text |     True |    True |                           |
| External Object ID           | `ExternalObjectId`          |     Text |     True |    True |                           |
| External Object Number       | `ExternalObjectNumber`      |     Text |    False |    True |                           |
| External Object Display Name | `ExternalObjectDisplayName` |     Text |    False |   False |                           |
| Source URL                   | `SourceUrl`                 |      URL |    False |   False |                           |
| Source Owner                 | `SourceOwner`               |     Text |     True |    True |                           |
| Record Authority             | `RecordAuthority`           |   Choice |     True |    True |                           |
| Last Seen At UTC             | `LastSeenAtUtc`             | DateTime |    False |    True |                           |
| Last Verified At UTC         | `LastVerifiedAtUtc`         | DateTime |    False |    True |                           |
| Permission State             | `PermissionState`           |   Choice |     True |    True |                           |
| Redaction State              | `RedactionState`            |   Choice |     True |    True |                           |
| Evidence Refs JSON           | `EvidenceRefsJson`          |     Note |    False |   False |                           |
| Title                        | `Title`                     |     Text |     True |   False | Human-readable row title. |
| Is Active                    | `IsActive`                  |  Boolean |     True |    True | Active row gate.          |
| Created                      | `Created`                   | DateTime |    False |   False | OOB audit.                |
| Modified                     | `Modified`                  | DateTime |    False |   False | OOB audit.                |
| Created By                   | `Author`                    |     User |    False |   False | OOB audit.                |
| Modified By                  | `Editor`                    |     User |    False |   False | OOB audit.                |

## Implementation Notes

- Provisioning must be idempotent.
- Direct user edits should be mediated by the External Systems Launch Pad UI where possible.
- Internal names are binding contract; display names are UI copy only.
- No secrets may be stored in this list.
