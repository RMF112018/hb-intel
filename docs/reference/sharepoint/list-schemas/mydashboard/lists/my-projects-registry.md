# My Projects Registry

## 1. Objective

Canonical schema reference for the `My Projects Registry` SharePoint list — the backend-mediated projection store for My Dashboard | My Projects. Holds one row per `Normalized UserUpn × RecordKey` projection slice (Projects-backed, merged, or legacy-only). End users do **not** read this list directly; the runtime route `GET /api/my-work/me/project-links` filters to the calling actor's active rows server-side.

## 2. List-Level Metadata

- Host site: `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard`
- List title: `My Projects Registry`
- Description: `Backend-mediated projection of My Projects user-project assignments and launch metadata. Operator/system-facing; not a general end-user data source.`
- Base Template: `100` (Generic list)
- Hidden: **No** (operator usability)
- Permission inheritance: **Broken** (restricted role assignments — see §5)
- Descriptor source: `backend/functions/src/services/my-projects-projection/registry-list-descriptor.ts`
- Machine-readable schema: `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.13 - backend/resources/My_Projects_Registry_Schema.json`
- Package source of truth: `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.13 - backend/03_SharePoint_My_Projects_Registry_Schema.md`

## 3. Field Schema

The SharePoint built-in `Title` column is set by the projection writer to equal `ProjectionKey` for readable default-title behavior; the descriptor does not redeclare `Title`.

| Internal Name                    | Display Name                        | Type          | Indexed | Unique | Required (app) | Notes                                                              |
| -------------------------------- | ----------------------------------- | ------------- | :-----: | :----: | :------------: | ------------------------------------------------------------------ |
| `ProjectionKey`                  | Projection Key                      | Text          |    ✓    |   ✓    |      Yes       | `sha256(lower(UserUpn) + '\|' + RecordKey)`; idempotent upsert key |
| `RecordKey`                      | Record Key                          | Text          |    —    |   —    |      Yes       | `projects:{id}` or `legacy:{id}`                                   |
| `UserUpn`                        | User UPN                            | Text          |    ✓    |   —    |      Yes       | Lowercased normalized UPN                                          |
| `ProjectionSource`               | Projection Source                   | Choice        |    —    |   —    |      Yes       | Values: `projects-only`, `merged`, `legacy-only`                   |
| `IsActive`                       | Is Active                           | Boolean       |    ✓    |   —    |      Yes       | Runtime filter (`IsActive=true`); default `1`                      |
| `ProjectionVersion`              | Projection Version                  | Text          |    —    |   —    |      Yes       | Initial value `v1`                                                 |
| `ProjectionContentHash`          | Projection Content Hash             | Text          |    —    |   —    |      Yes       | Skip-update sentinel for unchanged business payload                |
| `ProjectNumber`                  | Project Number                      | Text          |    —    |   —    |      Yes       | Display/sort                                                       |
| `ProjectName`                    | Project Name                        | Text          |    —    |   —    |      Yes       | Display/sort                                                       |
| `ProjectStage`                   | Project Stage                       | Text          |    —    |   —    |       No       | Projects preferred; Registry fallback only for merged rows         |
| `AssignmentRolesJson`            | Assignment Roles JSON               | MultiLineText |    —    |   —    |      Yes       | Stored as `Note`; JSON `string[]`                                  |
| `ProjectsListItemId`             | Projects List Item ID               | Number        |    ✓    |   —    |       No       | Targeted source-slice recompute                                    |
| `LegacyRegistryItemId`           | Legacy Registry Item ID             | Number        |    ✓    |   —    |       No       | Targeted source-slice recompute                                    |
| `LegacyMatchedProjectListItemId` | Legacy Matched Project List Item ID | Number        |    —    |   —    |       No       | Registry-side provenance                                           |
| `FallbackMatchMethod`            | Fallback Match Method               | Text          |    —    |   —    |       No       | Registry-side provenance                                           |
| `FallbackMatchConfidence`        | Fallback Match Confidence           | Text          |    —    |   —    |       No       | Registry-side provenance                                           |
| `SharePointActionState`          | SharePoint Action State             | Choice        |    —    |   —    |      Yes       | Values: `available`, `unavailable`                                 |
| `SharePointActionKind`           | SharePoint Action Kind              | Choice        |    —    |   —    |      Yes       | Values: `project-site`, `legacy-folder`, `none`                    |
| `SharePointActionLabel`          | SharePoint Action Label             | Text          |    —    |   —    |      Yes       | UI label                                                           |
| `SharePointActionHref`           | SharePoint Action Href              | Text          |    —    |   —    |       No       | Stored as Text per package contract                                |
| `ProcoreActionState`             | Procore Action State                | Choice        |    —    |   —    |      Yes       | Values: `available`, `unavailable`                                 |
| `ProcoreProject`                 | Procore Project                     | Text          |    —    |   —    |       No       | Validated raw token when present                                   |
| `ProcoreActionLabel`             | Procore Action Label                | Text          |    —    |   —    |      Yes       | UI label                                                           |
| `ProcoreActionHref`              | Procore Action Href                 | Text          |    —    |   —    |       No       | Deep link, stored as Text                                          |
| `BuildingConnectedActionState`   | BuildingConnected Action State      | Choice        |    —    |   —    |      Yes       | Values: `available`, `unavailable`                                 |
| `BuildingConnectedActionLabel`   | BuildingConnected Action Label      | Text          |    —    |   —    |      Yes       | UI label                                                           |
| `BuildingConnectedActionHref`    | BuildingConnected Action Href       | Text          |    —    |   —    |       No       | Stored as Text                                                     |
| `DocumentCrunchActionState`      | Document Crunch Action State        | Choice        |    —    |   —    |      Yes       | Values: `available`, `unavailable`                                 |
| `DocumentCrunchActionLabel`      | Document Crunch Action Label        | Text          |    —    |   —    |      Yes       | UI label                                                           |
| `DocumentCrunchActionHref`       | Document Crunch Action Href         | Text          |    —    |   —    |       No       | Stored as Text                                                     |
| `WarningsJson`                   | Warnings JSON                       | MultiLineText |    —    |   —    |       No       | Stored as `Note`; current `MyProjectLinkWarning[]` serialized      |
| `LastProjectedAtUtc`             | Last Projected At UTC               | DateTime      |    —    |   —    |      Yes       | Projection write timestamp                                         |
| `MaxSourceModifiedUtc`           | Max Source Modified UTC             | DateTime      |    —    |   —    |       No       | Max source modified time at projection                             |
| `ProjectionBatchId`              | Projection Batch ID                 | Text          |    —    |   —    |      Yes       | Seed/rebuild/incremental batch provenance                          |
| `DeactivatedAtUtc`               | Deactivated At UTC                  | DateTime      |    —    |   —    |       No       | Soft-deactivation stamp                                            |
| `DeactivationReason`             | Deactivation Reason                 | Choice        |    —    |   —    |       No       | Closed set; see §4                                                 |

## 4. Indexed and Unique Fields

| Concern                | Field(s)                                     | Rationale                                                                      |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| Idempotent upsert      | `ProjectionKey` (unique)                     | Sole projection identity; `EnforceUniqueValues=true` prevents duplicate slices |
| User read filter       | `UserUpn`, `IsActive`                        | Backend route filters `UserUpn = actorUpn AND IsActive = true`                 |
| Source-slice recompute | `ProjectsListItemId`, `LegacyRegistryItemId` | Worker locates affected slices by source-list item ID                          |

`DeactivationReason` choice set: `assignment-removed`, `project-source-deleted`, `registry-source-deleted`, `merge-topology-changed`, `rebuild-obsolete`, `manual-repair`, `other`.

## 5. Governance

- **Hidden**: No. The list is visible to operators with appropriate role assignments for supportability.
- **Permission inheritance**: Broken on the list. Restricted access only:
  - MyDashboard site owners / designated admin group: Full Control or Manage Lists.
  - Operations/support group (if designated): Read or Edit per governance.
  - General site members and visitors: **no direct permission**.
  - Backend Graph app identity: app-only site/list access via the federated Graph token lane.
- **Runtime read path**: backend-only. The SPFx My Projects card does **not** query this list. `GET /api/my-work/me/project-links` (post-cutover) reads the actor's `IsActive=true` rows server-side and reconstructs the existing envelope.
- **No row-level ACLs**: row-level ACL design is intentionally out of scope. Tenant isolation comes from `UserUpn` filtering at the backend, not from SharePoint per-row permissions.

The provisioner does **not** script the permission-inheritance break. Operators apply restricted role assignments manually after `--apply`. See `docs/how-to/administrator/provision-my-projects-registry-schema.md`.

## 6. RecordKey and ProjectionKey Semantics

| Source                   | RecordKey format                |
| ------------------------ | ------------------------------- |
| Projects-backed / merged | `projects:{ProjectsListItemId}` |
| Legacy-only              | `legacy:{LegacyRegistryItemId}` |

```
ProjectionKey = sha256(lower(UserUpn) + "|" + RecordKey)
```

The deterministic hash gives the upsert key. Two rows with the same `ProjectionKey` are forbidden by SharePoint's `EnforceUniqueValues` constraint.

## 7. Soft-Deactivation, Retention, and Purge

- Obsolete rows are **not hard-deleted** during incremental sync. The projection engine sets `IsActive=false`, stamps `DeactivatedAtUtc`, and writes a closed-set `DeactivationReason`.
- Inactive rows are retained for **90 days** (`HBC_MY_PROJECTS_PROJECTION_INACTIVE_RETENTION_DAYS`).
- A monthly purge job hard-deletes rows where `IsActive=false AND DeactivatedAtUtc < utcNow - 90 days`.
- Reactivation clears `DeactivatedAtUtc` / `DeactivationReason` and re-sets `IsActive=true`.

## 8. Operator Workflow

See `docs/how-to/administrator/provision-my-projects-registry-schema.md` for the deterministic command sequence (verifier → dry-run → apply → operator permission step → post-apply verifier).
