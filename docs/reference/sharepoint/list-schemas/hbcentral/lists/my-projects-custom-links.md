# My Projects Custom Links

## 1. Objective

Canonical schema reference for the `My Projects Custom Links` SharePoint list — the user-authored "More Project Resources" registry surfaced under My Dashboard → My Projects. Per-project additional links such as supplementary SharePoint sites, permitting sites, private provider portals, and owner/client portals.

## 2. List-Level Metadata

- Host site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- List title: `My Projects Custom Links`
- Description: `User-authored custom resource links for My Dashboard My Projects.`
- Base Template: `100` (Generic list)
- Descriptor source: `backend/functions/src/services/my-projects-custom-links/list-descriptor.ts`
- Package source of truth: `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.12 - m-p-add-links/02_SharePoint_Custom_Links_List_Schema.md`

## 3. Field Schema

The built-in `Title` column carries the custom-link display title — a separate `LinkTitle` column is intentionally **not** created.

| Internal Name          | Display Name            | Type     | Indexed | Required (app) | Notes                                                              |
| ---------------------- | ----------------------- | -------- | :-----: | :------------: | ------------------------------------------------------------------ |
| `Title`                | (built-in)              | Text     |    —    |      Yes       | Custom-link display title                                          |
| `ProjectNumber`        | Project Number          | Text     |    ✓    |      Yes       | Join key into Projects / Legacy Registry                           |
| `ProjectYear`          | Project Year            | Number   |    ✓    |       No       | Supplementary identifier                                           |
| `ProjectsListItemId`   | Projects List Item Id   | Number   |    ✓    |  Conditional   | One-of with `LegacyRegistryItemId`; server-validated at write time |
| `LegacyRegistryItemId` | Legacy Registry Item Id | Number   |    ✓    |  Conditional   | One-of with `ProjectsListItemId`; server-validated at write time   |
| `LinkUrl`              | Link Url                | Text     |    —    |      Yes       | Target URL (stored as Text per contract)                           |
| `Visibility`           | Visibility              | Choice   |    ✓    |      Yes       | Values: `private`, `project`                                       |
| `CreatedByUpn`         | Created By Upn          | Text     |    ✓    |      Yes       | Creator UPN (filter key for own-private rows)                      |
| `CreatedByOid`         | Created By Oid          | Text     |    —    |       No       | Creator Azure OID                                                  |
| `CreatedAtUtc`         | Created At Utc          | DateTime |    —    |      Yes       | ISO 8601 (UTC)                                                     |
| `UpdatedAtUtc`         | Updated At Utc          | DateTime |    —    |      Yes       | ISO 8601 (UTC)                                                     |
| `DeletedAtUtc`         | Deleted At Utc          | DateTime |    —    |       No       | Soft-delete timestamp (null when active)                           |
| `DeletedByUpn`         | Deleted By Upn          | Text     |    —    |       No       | Soft-delete performer UPN                                          |
| `DeletedByOid`         | Deleted By Oid          | Text     |    —    |       No       | Soft-delete performer OID                                          |
| `IsActive`             | Is Active               | Boolean  |    ✓    |      Yes       | Default `1`; soft-delete sets `false`                              |

## 4. Visibility Semantics

| Value     | Effective scope                                                                                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `private` | Visible only to the row's `CreatedByUpn`.                                                                                                                              |
| `project` | Visible to any user currently entitled to the referenced project under My Projects' actor-entitlement filter (same role-array rules used by the My Projects provider). |

Entitlement is re-checked at the read path on every request; soft-deleted rows (`IsActive=false`) are excluded.

## 5. One-of Provenance Rule

Each row must carry exactly one of `ProjectsListItemId` or `LegacyRegistryItemId`. The constraint is enforced at the backend write seam, not as a SharePoint list-level rule, because:

- The list cannot express "exactly one of these two columns is set" natively.
- Both columns must remain present and indexed so reads can join by either provenance ID without a secondary lookup.
- Client-supplied IDs are never trusted; the backend re-resolves the project against the actor's current entitlement before persisting.

## 6. Indexed Fields Rationale

Indexed columns support the provider join + entitlement filter without triggering SharePoint's non-indexed-query warning:

- `ProjectNumber`, `ProjectsListItemId`, `LegacyRegistryItemId` — primary join keys
- `Visibility`, `CreatedByUpn`, `IsActive` — filter keys for the read path (own-private vs project-visible, exclude soft-deleted)
- `ProjectYear` — secondary sort/filter

## 7. Soft-Delete Convention

The application performs soft-delete only in v1:

- Set `IsActive=false`
- Set `DeletedAtUtc` (ISO 8601 UTC)
- Set `DeletedByUpn` + `DeletedByOid` (the deleting actor)

The SharePoint item is retained; the recycle bin is unaffected. Reads filter `IsActive=true` before any other join. There is no API-level "restore" surface in v1.

## 8. Authorship & Concurrency

- Creator-only edits/deletes — backend enforces `actor.upn === item.CreatedByUpn` for update/delete commands.
- No ETag / `If-Match` concurrency in v1. Concurrent edits resolve last-write-wins; UI surfaces single-creator semantics so collisions are rare.

## 9. Operator Workflow

See `docs/how-to/administrator/provision-my-projects-custom-links.md` for the deterministic command sequence (verifier → dry-run → apply → post-apply verifier).
