# Custom Links Field Contract

## List
```text
My Projects Custom Links
```

## Built-in field
| Field | Use |
|---|---|
| `Title` | Custom link display title |

## Custom fields

| Internal Name | Display Name | Type | Indexed | Required |
|---|---|---|---:|---:|
| `ProjectNumber` | Project Number | Text | Yes | app-required |
| `ProjectYear` | Project Year | Number | Yes | No |
| `ProjectsListItemId` | Projects List Item Id | Number | Yes | conditional |
| `LegacyRegistryItemId` | Legacy Registry Item Id | Number | Yes | conditional |
| `LinkUrl` | Link Url | Text | No | app-required |
| `Visibility` | Visibility | Choice(`private`,`project`) | Yes | app-required |
| `CreatedByUpn` | Created By Upn | Text | Yes | app-required |
| `CreatedByOid` | Created By Oid | Text | No | No |
| `CreatedAtUtc` | Created At Utc | DateTime | No | app-required |
| `UpdatedAtUtc` | Updated At Utc | DateTime | No | app-required |
| `DeletedAtUtc` | Deleted At Utc | DateTime | No | No |
| `DeletedByUpn` | Deleted By Upn | Text | No | No |
| `DeletedByOid` | Deleted By Oid | Text | No | No |
| `IsActive` | Is Active | Boolean | Yes | app-required |

## Conditional identity rule
At least one of:
- `ProjectsListItemId`
- `LegacyRegistryItemId`

must be provided and entitlement-validated.
