# PCC External Review Items

## Scope

Project Site

## URL

`/sites/{ProjectSite}/Lists/PCC External Review Items`

## Settings

- Attachments: `False`
- Versioning: `True`
- Folders: `False`
- Logical key: `ProjectId + SystemKey + IssueType + SubjectKey`

## Field Schema

| Display Name          | Internal Name         |     Type | Required | Indexed | Notes                     |
| --------------------- | --------------------- | -------: | -------: | ------: | ------------------------- |
| Project ID            | `ProjectId`           |     Text |     True |    True |                           |
| System Key            | `SystemKey`           |     Text |     True |    True |                           |
| Issue Type            | `IssueType`           |   Choice |     True |    True |                           |
| Subject Key           | `SubjectKey`          |     Text |     True |    True |                           |
| Review State          | `ReviewState`         |   Choice |     True |    True |                           |
| Current Owner Persona | `CurrentOwnerPersona` |     Text |    False |    True |                           |
| Current Owner UPN     | `CurrentOwnerUpn`     |     Text |    False |    True |                           |
| Priority Action ID    | `PriorityActionId`    |     Text |    False |    True |                           |
| Approval Request ID   | `ApprovalRequestId`   |     Text |    False |    True |                           |
| Due At UTC            | `DueAtUtc`            | DateTime |    False |    True |                           |
| Issue Summary         | `IssueSummary`        |     Note |     True |   False |                           |
| Resolution Summary    | `ResolutionSummary`   |     Note |    False |   False |                           |
| Title                 | `Title`               |     Text |     True |   False | Human-readable row title. |
| Is Active             | `IsActive`            |  Boolean |     True |    True | Active row gate.          |
| Created               | `Created`             | DateTime |    False |   False | OOB audit.                |
| Modified              | `Modified`            | DateTime |    False |   False | OOB audit.                |
| Created By            | `Author`              |     User |    False |   False | OOB audit.                |
| Modified By           | `Editor`              |     User |    False |   False | OOB audit.                |

## Implementation Notes

- Provisioning must be idempotent.
- Direct user edits should be mediated by the External Systems Launch Pad UI where possible.
- Internal names are binding contract; display names are UI copy only.
- No secrets may be stored in this list.
