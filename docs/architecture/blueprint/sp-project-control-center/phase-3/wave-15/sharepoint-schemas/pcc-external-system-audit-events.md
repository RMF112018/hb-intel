# PCC External System Audit Events

## Scope

Project Site

## URL

`/sites/{ProjectSite}/Lists/PCC External System Audit Events`

## Settings

- Attachments: `False`
- Versioning: `False`
- Folders: `False`
- Logical key: `EventId`

## Field Schema

| Display Name       | Internal Name      |     Type | Required | Indexed | Notes                     |
| ------------------ | ------------------ | -------: | -------: | ------: | ------------------------- |
| Event ID           | `EventId`          |     Text |     True |    True |                           |
| Correlation ID     | `CorrelationId`    |     Text |     True |    True |                           |
| Project ID         | `ProjectId`        |     Text |     True |    True |                           |
| System Key         | `SystemKey`        |     Text |    False |    True |                           |
| Event Type         | `EventType`        |   Choice |     True |    True |                           |
| Actor UPN          | `ActorUpn`         |     Text |    False |    True |                           |
| Actor Persona      | `ActorPersona`     |     Text |    False |    True |                           |
| Event At UTC       | `EventAtUtc`       | DateTime |     True |    True |                           |
| Redaction State    | `RedactionState`   |   Choice |     True |    True |                           |
| Event Payload JSON | `EventPayloadJson` |     Note |    False |   False |                           |
| Title              | `Title`            |     Text |     True |   False | Human-readable row title. |
| Is Active          | `IsActive`         |  Boolean |     True |    True | Active row gate.          |
| Created            | `Created`          | DateTime |    False |   False | OOB audit.                |
| Modified           | `Modified`         | DateTime |    False |   False | OOB audit.                |
| Created By         | `Author`           |     User |    False |   False | OOB audit.                |
| Modified By        | `Editor`           |     User |    False |   False | OOB audit.                |

## Implementation Notes

- Provisioning must be idempotent.
- Direct user edits should be mediated by the External Systems Launch Pad UI where possible.
- Internal names are binding contract; display names are UI copy only.
- No secrets may be stored in this list.
