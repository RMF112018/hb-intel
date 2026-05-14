# HB Intel My Dashboard — My Projects Source-List Schema Provisioning Audit

Prepared: 2026-05-14  
Repo: `RMF112018/hb-intel`  
Branch audited: `main`  
Prompt basis: `FRESH_SESSION_PROMPT_MY_PROJECTS_LIST_PROVISIONING_METHOD_AUDIT_AND_RESEARCH(1).md`


## Phase 2 — Required Columns and Schema Gap Assessment

### Complete required schema delta

#### `Projects`

The `Projects` list requires fourteen canonical role-array fields:

| Internal Name | Target Type | Required | Indexed | Storage / Semantics |
|---|---:|---:|---:|---|
| `leadEstimatorUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `estimatorUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `idsManagerUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `projectAccountantUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `projectAdministratorUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `projectCoordinatorUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `superintendentUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `leadSuperintendentUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `projectManagerUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `leadProjectManagerUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `projectExecutiveUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `safetyCoordinatorUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `qcManagerUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `warrantyManagerUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |


No new `procoreProject` field is required for `Projects` because it already exists as `Text` in the live schema snapshot.

#### `Legacy Project Fallback Registry`

The Registry requires the same fourteen canonical role-array fields plus one `procoreProject` Text field.

| Internal Name | Target Type | Required | Indexed | Storage / Semantics |
|---|---:|---:|---:|---|
| `leadEstimatorUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `estimatorUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `idsManagerUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `projectAccountantUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `projectAdministratorUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `projectCoordinatorUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `superintendentUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `leadSuperintendentUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `projectManagerUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `leadProjectManagerUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `projectExecutiveUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `safetyCoordinatorUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `qcManagerUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `warrantyManagerUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |


| Internal Name | Target Type | Required | Indexed | Storage / Semantics |
|---|---:|---:|---:|---|
| `procoreProject` | Text | No | No | Raw Procore project identifier/token |

### Target-field semantics

- Role fields store canonical UPN arrays as JSON-serialized `string[]` values.
- Fields are intentionally Note / MultiLineText, not SharePoint Person fields.
- Fields are not indexed because matching is performed by backend normalized parsing, not fragile OData filtering against JSON text.
- `procoreProject` stores the raw token used to construct `https://app.procore.com/{procoreProject}/project/home`.

### Existing contracts that define the columns

- `packages/models/src/myWork/MyProjectAssignmentRoles.ts` defines the canonical field list and role IDs.
- `backend/functions/src/services/projects-list-contract.ts` includes the canonical fields in `IProjectsListItem`, `PROJECTS_LIST_FIELD_MAP`, and `OPTIONAL_EXTENSION_FIELDS`.
- `backend/functions/src/services/projects-role-schema-readiness.ts` defines required fields for readiness checks.
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts` includes the fourteen Registry role fields plus `procoreProject` in the descriptor.
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md` and `legacy-project-fallback-registry.md` document target additions and readiness behavior.
- `docs/reference/spfx-surfaces/my-dashboard/my-projects-schema-readiness.md` documents the operator readiness gate.

### Schema contract status

| Contract Area | Status | Notes |
|---|---|---|
| Canonical role field list | Fully defined | Shared model source is coherent and reused by provider and readiness helper. |
| Projects target docs | Fully defined, target-only until verifier passes | Live snapshot table does not prove the fields exist. |
| Registry target docs | Fully defined, target-only until verifier passes | Registry has no provider fallback; non-ready is a real functional blocker. |
| Projects persistence contract | Partially aligned | Fields are present but still classified as optional extension fields in general schema readiness. Dedicated verifier is authoritative. |
| Legacy fallback descriptor | Partially aligned | Includes target fields, but also contains `FolderWebUrl` URL-vs-Text drift relative to live snapshot. |
| Runtime provider | Functionally dependent | Provider selects canonical fields; missing Registry columns directly impair legacy-only My Projects matches. |

### Pre-provision blocking issues

1. Confirm execution identity for mutation: HB SharePoint Creator app registration vs Function App UAMI.
2. Resolve or intentionally isolate `FolderWebUrl` drift so it does not block My Projects schema provisioning.
3. Implement a dedicated source-list provisioner that targets only the My Projects schema delta, rather than rerunning the full legacy fallback descriptor blindly.
4. Ensure new provisioner includes explicit dry-run/apply gates.
