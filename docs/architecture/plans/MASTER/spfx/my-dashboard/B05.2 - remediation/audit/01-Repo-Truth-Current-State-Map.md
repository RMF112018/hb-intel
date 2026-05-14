# HB Intel My Dashboard — My Projects Source-List Schema Provisioning Audit

Prepared: 2026-05-14  
Repo: `RMF112018/hb-intel`  
Branch audited: `main`  
Prompt basis: `FRESH_SESSION_PROMPT_MY_PROJECTS_LIST_PROVISIONING_METHOD_AUDIT_AND_RESEARCH(1).md`


## Phase 2 — Current Repo Truth Map

### My Projects functional contract

The B05A plan establishes My Projects as a backend-mediated, me-scoped read-model feature using:

```http
GET /api/my-work/me/project-links
```

The module resolves assignments by matching the authenticated actor UPN against a canonical fourteen-role taxonomy across both `Projects` and `Legacy Project Fallback Registry`.

### Canonical role source of truth

The shared model package defines the canonical role IDs, internal field names, display labels, and priority order in:

```text
packages/models/src/myWork/MyProjectAssignmentRoles.ts
```

Canonical internal fields:

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


### `Projects` list current state

Repo schema snapshot shows the current `Projects` live snapshot still contains the old/compatibility role posture, including:

- `leadEstimatorUpn` — Text
- `projectManagerUpn` — Text
- `projectExecutiveUpn` — Text
- `supportingEstimatorUpns` — Note
- `procoreProject` — Text

The same file separately documents the fourteen canonical role fields as **operator-gated target additions**, not live-proven fields, unless `scripts/verify-my-project-role-fields.ts` returns `ready: true` for the `Projects` list.

### `Legacy Project Fallback Registry` current state

Repo schema snapshot shows the current live snapshot does not yet include the canonical role fields or `procoreProject` in the base field schema. It documents them as target additions and explicitly states that the Registry has no provider-side fallback for those canonical fields.

### Backend read-model dependency

`my-project-links-read-model-provider.ts` selects the canonical role fields on both lists and uses them for assignment matching. For `Projects`, it also has a migration fallback to the four old fields. For the Registry, there is no role fallback. Therefore missing Registry columns can produce zero matches for users whose assignments exist only in legacy-only rows.

### Existing provisioner architecture

The existing `scripts/provision-legacy-fallback-lists.ts` demonstrates repo-native provisioning capabilities:

- app-only token acquisition via `DefaultAzureCredential` or explicit bearer token;
- HBCentral host-site lock;
- list equivalence resolution by normalized title;
- missing list creation;
- missing field creation;
- compatible field setting updates for required, indexed, defaults, and choices;
- type compatibility checks;
- unresolved drift reporting;
- post-provision schema validation;
- JSON report output.

### Existing readiness and backfill tooling

The repo already contains:

- `scripts/verify-my-project-role-fields.ts` — read-only schema readiness verifier, no mutation, no `--apply` support.
- `scripts/backfill-my-project-role-arrays.ts` — Projects compatibility role migration into canonical fields, default dry-run and explicit `--apply`.
- `scripts/backfill-my-project-legacy-registry-fields.ts` — Registry mirror/preservation backfill, default dry-run and explicit `--apply`.

### Descriptor/docs drift: `FolderWebUrl`

The Registry live snapshot documents `FolderWebUrl` as `Text`, while the legacy fallback descriptor still declares it as `URL`. The existing compatibility helper treats desired `URL` as compatible only with live `URL`, so a descriptor-driven provisioning run that includes that field would report unresolved type drift unless explicitly allowed. This drift must not be ignored because it affects whether a broad legacy fallback provisioning run can close cleanly.

### Identity and permission map

The repo and operator evidence identify two relevant identity seams:

1. **SPFx protected API seam** — My Dashboard package requests `HB SharePoint Creator / access_as_user`. This is delegated API access for the SPFx app and does not prove app-only list mutation permission.
2. **Provisioner app-only seam** — `HB SharePoint Creator` app ID `08c399eb-a394-4087-b859-659d493f8dc7`, documented in repo and supported by operator-provided app registration JSON.

The Function App ARM JSON also identifies a UAMI runtime identity `77ad3593-5414-4122-a649-74916f8c0d7a`. If the provisioner executes under that UAMI rather than the HB SharePoint Creator app registration, its effective permissions must be separately proven.
