# 03 | SharePoint `My Projects Registry` Schema

## Objective

Define the exact helper-list schema, governance posture, indexing, views, permissions, and retention behavior for the My Projects projection read store.

---

## 1. List Identity

| Property | Locked value |
|---|---|
| Site | `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard` |
| List title | `My Projects Registry` |
| Intended audience | Backend system + operators |
| Hidden | No |
| General end-user direct read | No |
| Runtime read path | Backend API only |

---

## 2. List Governance

### 2.1 Visibility

The list is **not hidden** to satisfy operator accessibility and supportability.  
However, it must not be a general browseable site-member data source.

### 2.2 Permission model

Break permission inheritance on the list.

Recommended posture:

| Principal | Permission |
|---|---|
| My Dashboard site owners / designated admin group | Full Control or Manage Lists |
| Operations/support group, if designated | Read or Edit according to governance |
| General site members | No direct permission |
| General site visitors | No direct permission |
| Backend Graph app identity | App-only site/list access through existing Graph authorization posture |

This list stores user-project assignment projections and launch metadata. It must be treated as sensitive internal operational data.

---

## 3. Projection Grain and Keys

### 3.1 Grain

One row per:

```text
Normalized UserUpn × Projection RecordKey
```

### 3.2 RecordKey

| Source | RecordKey |
|---|---|
| Projects-backed or merged | `projects:{ProjectsListItemId}` |
| Legacy-only | `legacy:{LegacyRegistryItemId}` |

### 3.3 ProjectionKey

Use:

```text
ProjectionKey = sha256(lower(UserUpn) + "|" + RecordKey)
```

Store the deterministic hash string.  
`ProjectionKey` is:
- unique,
- indexed,
- used for upsert idempotency.

---

## 4. Field Schema

### 4.1 Required core fields

| Display Name | Internal Name | Type | Required | Indexed | Notes |
|---|---|---|---:|---:|---|
| Title | `Title` | Text | Yes | No | Set equal to `ProjectionKey` for readable SharePoint default title posture |
| Projection Key | `ProjectionKey` | Text | Yes | Yes + unique | Deterministic upsert key |
| Record Key | `RecordKey` | Text | Yes | No | `projects:{id}` or `legacy:{id}` |
| User UPN | `UserUpn` | Text | Yes | Yes | Lowercased normalized UPN |
| Projection Source | `ProjectionSource` | Choice | Yes | No | `projects-only`, `merged`, `legacy-only` |
| Is Active | `IsActive` | Boolean | Yes | Yes | Runtime route filters to active only |
| Projection Version | `ProjectionVersion` | Text | Yes | No | Initial value `v1` |
| Projection Content Hash | `ProjectionContentHash` | Text | Yes | No | Hash of serialized business fields to skip no-op updates |

---

### 4.2 Project display fields

| Display Name | Internal Name | Type | Required | Indexed | Notes |
|---|---|---|---:|---:|---|
| Project Number | `ProjectNumber` | Text | Yes | No | Display/sort |
| Project Name | `ProjectName` | Text | Yes | No | Display/sort |
| Project Stage | `ProjectStage` | Text | No | No | Projects stage preferred; Registry fallback only for merged rows |

---

### 4.3 Assignment/provenance fields

| Display Name | Internal Name | Type | Required | Indexed | Notes |
|---|---|---|---:|---:|---|
| Assignment Roles JSON | `AssignmentRolesJson` | Note, plain text | Yes | No | JSON `string[]` |
| Projects List Item ID | `ProjectsListItemId` | Number | No | Yes | For targeted source-slice recompute |
| Legacy Registry Item ID | `LegacyRegistryItemId` | Number | No | Yes | For targeted source-slice recompute |
| Legacy Matched Project List Item ID | `LegacyMatchedProjectListItemId` | Number | No | No | Preserve current provenance semantics |
| Fallback Match Method | `FallbackMatchMethod` | Text | No | No | Current Registry metadata |
| Fallback Match Confidence | `FallbackMatchConfidence` | Text | No | No | Current Registry metadata |

---

### 4.4 SharePoint launch action fields

| Display Name | Internal Name | Type | Required | Notes |
|---|---|---|---:|---|
| SharePoint Action State | `SharePointActionState` | Choice | Yes | `available`, `unavailable` |
| SharePoint Action Kind | `SharePointActionKind` | Choice | Yes | `project-site`, `legacy-folder`, `none` |
| SharePoint Action Label | `SharePointActionLabel` | Text | Yes | UI label |
| SharePoint Action Href | `SharePointActionHref` | Text | No | Store as text, not URL field, to reduce Graph payload brittleness |

---

### 4.5 Procore launch action fields

| Display Name | Internal Name | Type | Required | Notes |
|---|---|---|---:|---|
| Procore Action State | `ProcoreActionState` | Choice | Yes | `available`, `unavailable` |
| Procore Project | `ProcoreProject` | Text | No | Validated raw project token when present |
| Procore Action Label | `ProcoreActionLabel` | Text | Yes | UI label |
| Procore Action Href | `ProcoreActionHref` | Text | No | Deep link |

---

### 4.6 BuildingConnected launch action fields

| Display Name | Internal Name | Type | Required | Notes |
|---|---|---|---:|---|
| BuildingConnected Action State | `BuildingConnectedActionState` | Choice | Yes | `available`, `unavailable` |
| BuildingConnected Action Label | `BuildingConnectedActionLabel` | Text | Yes | UI label |
| BuildingConnected Action Href | `BuildingConnectedActionHref` | Text | No | Store as text |

---

### 4.7 Document Crunch launch action fields

| Display Name | Internal Name | Type | Required | Notes |
|---|---|---|---:|---|
| Document Crunch Action State | `DocumentCrunchActionState` | Choice | Yes | `available`, `unavailable` |
| Document Crunch Action Label | `DocumentCrunchActionLabel` | Text | Yes | UI label |
| Document Crunch Action Href | `DocumentCrunchActionHref` | Text | No | Store as text |

---

### 4.8 Warning and operational fields

| Display Name | Internal Name | Type | Required | Notes |
|---|---|---|---:|---|
| Warnings JSON | `WarningsJson` | Note, plain text | No | Current MyProjectLinkWarning[] serialized |
| Last Projected At UTC | `LastProjectedAtUtc` | DateTime | Yes | Projection write timestamp |
| Max Source Modified UTC | `MaxSourceModifiedUtc` | DateTime | No | Max known source modified time used during projection |
| Projection Batch ID | `ProjectionBatchId` | Text | Yes | Seed/rebuild/incremental batch provenance |
| Deactivated At UTC | `DeactivatedAtUtc` | DateTime | No | Soft-deactivation stamp |
| Deactivation Reason | `DeactivationReason` | Choice | No | See choices below |

#### `DeactivationReason` choices

- `assignment-removed`
- `project-source-deleted`
- `registry-source-deleted`
- `merge-topology-changed`
- `rebuild-obsolete`
- `manual-repair`
- `other`

---

## 5. Indexing and Uniqueness

### Required indexed fields

| Field |
|---|
| `ProjectionKey` |
| `UserUpn` |
| `IsActive` |
| `ProjectsListItemId` |
| `LegacyRegistryItemId` |

### Unique-value enforcement

Set:

```text
ProjectionKey → Enforce unique values = Yes
```

This converts the list into a safer idempotent projection target and prevents duplicate active or inactive records with the same projection identity.

---

## 6. Views

Create at least these views:

### 6.1 Active Projection Rows
Filter:
```text
IsActive = Yes
```

Recommended columns:
- UserUpn
- ProjectNumber
- ProjectName
- ProjectionSource
- LastProjectedAtUtc
- ProjectionBatchId

### 6.2 Inactive Retained Rows
Filter:
```text
IsActive = No
```

Recommended columns:
- UserUpn
- ProjectNumber
- ProjectName
- DeactivatedAtUtc
- DeactivationReason

### 6.3 Recent Projection Writes
Sort:
```text
LastProjectedAtUtc descending
```

### 6.4 Source-Link Inspection
Columns:
- ProjectsListItemId
- LegacyRegistryItemId
- RecordKey
- ProjectionSource

---

## 7. Write Semantics

### 7.1 Upsert semantics

Use `ProjectionKey` to find existing rows.

If none exists:
- create row.

If existing row exists:
- compare `ProjectionContentHash`.
- if unchanged:
  - update only operational metadata when necessary.
- if changed:
  - patch full projected business fields.
- set `IsActive=true` and clear deactivation fields when reactivating.

### 7.2 Soft-deactivation semantics

Do not hard-delete during:
- incremental source changes,
- ordinary assignment removal,
- ordinary source deletion handling,
- rebuild cleanup.

Soft-deactivate the existing row.

### 7.3 Purge semantics

Monthly purge physically deletes:
```text
IsActive == false
AND DeactivatedAtUtc < utcNow - 90 days
```

---

## 8. Read Semantics

The backend query for the user read route is:

```text
UserUpn == currentActorUpn
AND IsActive == true
```

The backend then reconstructs:
- `MyProjectLinkItem[]`
- `summary` counts
- source-readiness/projection-readiness envelope fields

The frontend must not query the list directly.

---

## 9. Provisioning Contract

The repo implementation package must add:
- machine-readable schema descriptor,
- dry-run verifier,
- operator-gated provisioner,
- documentation aligned to existing My Projects source-list provisioning posture.

The provisioner must:
- detect missing fields,
- detect wrong-type drift,
- refuse destructive recreation,
- require explicit `--apply` for creates,
- emit structured JSON option.

---

## 10. Why Text Fields for Hrefs

Use text columns rather than SharePoint hyperlink columns for action URLs because:
- the existing Registry has already experienced URL/field-type drift;
- the backend owns link validation;
- Graph POST/PATCH payload handling is simpler and less brittle with text.

The runtime UI receives typed action objects from the backend, not raw SharePoint URL field semantics.
