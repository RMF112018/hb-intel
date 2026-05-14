
# Plan Summary — My Projects Source-List Provisioning Implementation

## Recommended build

Create a dedicated repo-native TypeScript provisioner:

```text
scripts/provision-my-projects-source-list-schema.ts
```

The script provisions only the missing My Projects schema fields on existing HBCentral source lists.

## Required schema

### Projects

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


### Legacy Project Fallback Registry

Same fourteen role-array fields plus:

| Internal Name | Target Type | Required | Indexed | Storage / Semantics |
|---|---:|---:|---:|---|
| `procoreProject` | Text | No | No | Raw Procore project identifier/token |

## Execution sequence after implementation

```bash
pnpm tsx scripts/verify-my-project-role-fields.ts --json
pnpm tsx scripts/provision-my-projects-source-list-schema.ts --json
pnpm tsx scripts/provision-my-projects-source-list-schema.ts --apply --json
pnpm tsx scripts/verify-my-project-role-fields.ts --json
pnpm tsx scripts/backfill-my-project-role-arrays.ts --json
pnpm tsx scripts/backfill-my-project-role-arrays.ts --apply --json
pnpm tsx scripts/backfill-my-project-legacy-registry-fields.ts --json
pnpm tsx scripts/backfill-my-project-legacy-registry-fields.ts --apply --json
```

## Identity warning

The operator provided evidence for `HB SharePoint Creator` app ID `08c399eb-a394-4087-b859-659d493f8dc7` and Function App UAMI client ID `77ad3593-5414-4122-a649-74916f8c0d7a`. The implementation must make the selected execution identity explicit in docs and reports.
