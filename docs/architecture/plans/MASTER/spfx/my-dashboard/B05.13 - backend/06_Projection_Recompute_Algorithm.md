# 06 | Projection Recompute Algorithm

## Objective

Define the exact incremental recompute behavior that converts source-list changes into `My Projects Registry` row inserts, updates, reactivations, and soft-deactivations.

---

## 1. Core Rule

Every incremental sync recomputes **only the projection slice impacted by changed source items**, not the entire projection set.

A projection slice can be:
- one Projects-backed project record plus any matching Registry counterpart,
- one Registry-backed legacy record plus any matching Projects counterpart,
- a deletion recovery slice when the source item no longer exists.

---

## 2. Preserve Current Semantics

The projection engine must match the current full-aggregation provider’s behavior.

### Preserve exactly
- Projects role assignments determine Projects/merged row visibility.
- Registry role arrays determine legacy-only row visibility.
- Merge explicit match first.
- Fallback merge by project number + year only when uniquely resolvable.
- Projects stage preferred over Registry stage on merged rows.
- SharePoint action priority unchanged.
- Procore/BuildingConnected/DocumentCrunch validation unchanged.
- Warning codes and semantic meanings unchanged unless a carefully documented additive projection-specific warning is introduced.

---

## 3. Shared Domain Refactor

## 3.1 Required extraction

Current domain behavior should be extracted into reusable pure modules so both:
- the legacy aggregation provider, and
- the new projection engine

use the same builders.

### Extract or centralize
- `parseAssignmentRolesFromProjects`
- `parseAssignmentRolesFromRegistry`
- `buildProjectsOnlySharePointAction`
- `buildMergedSharePointAction`
- `buildLegacyOnlySharePointAction`
- `buildProcoreAction`
- `buildBuildingConnectedAction`
- `buildDocumentCrunchAction`
- warning merge utility
- project/registry merge matching utilities
- item sorting utility where needed for read path

### Why
Avoid maintaining two independent interpretations of My Projects behavior during migration.

---

## 4. Projection Row Construction

For each active projected user/project item, construct:

1. `MyProjectLinkItem` using shared domain logic.
2. `My Projects Registry` row using deterministic row mapper.
3. `ProjectionContentHash` from a stable JSON serialization of business-relevant fields.

### Hash includes
- UserUpn
- RecordKey
- source
- project display fields
- assignment roles
- action states/labels/hrefs
- provenance fields
- warnings

### Hash excludes
- LastProjectedAtUtc
- ProjectionBatchId
- timestamps that should not cause unnecessary business updates.

---

## 5. Projects Item Changed Algorithm

### Inputs
- changed Projects item ID,
- source payload from delta where available,
- source-list fetch client for latest row,
- Registry counterpart resolver.

### Steps

```text
1. Fetch latest Projects row by source item ID.
2. If row no longer exists, route to Projects deletion algorithm.
3. Resolve Registry counterpart candidates:
   A. Registry rows explicitly matched to this Projects item ID.
   B. Registry rows matching ProjectNumber + Year unique-fallback rule.
4. Select the counterpart row using current merge precedence.
5. Compute prior affected helper rows:
   query My Projects Registry where ProjectsListItemId == source item ID.
6. Compute new assignment UPN set from Projects role arrays:
   - canonical role arrays first
   - legacy four-field fallback where current provider supports it
7. For each assigned user:
   - build projects-only or merged projection item
   - map to registry row
   - upsert by ProjectionKey
8. For prior active rows whose UserUpn is no longer in the new assignment set:
   - soft-deactivate with reason `assignment-removed`
9. If merge topology changed:
   - reactivate/update rows as needed
   - soft-deactivate obsolete legacy-only rows only if that slice recompute justifies it
10. Record inserted/updated/reactivated/deactivated counts.
```

---

## 6. Registry Item Changed Algorithm

### Inputs
- changed Registry item ID,
- source payload from delta where available,
- source-list fetch client for latest row,
- Projects counterpart resolver.

### Steps

```text
1. Fetch latest Registry row by source item ID.
2. If row no longer exists, route to Registry deletion algorithm.
3. Determine whether the row:
   A. merges to a Projects record, or
   B. remains legacy-only.
4. Compute prior helper rows:
   query My Projects Registry where LegacyRegistryItemId == source item ID.
5. If merged:
   - fetch Projects counterpart
   - Projects role assignments determine users
   - build merged rows for those users
6. If legacy-only:
   - confirm Registry row IsActive == true
   - confirm MatchStatus ∈ matched, unmatched, review-required
   - Registry role assignments determine users
   - build legacy-only rows for those users
7. Upsert current valid rows.
8. Soft-deactivate obsolete rows removed from the slice:
   - assignment removed,
   - row became inactive,
   - row moved from legacy-only to merged,
   - row became excluded by match status.
9. Record write counts.
```

---

## 7. Projects Source Deleted Algorithm

### Inputs
- deleted Projects item ID from delta tombstone.

### Steps

```text
1. Query helper rows where ProjectsListItemId == deleted ID.
2. Identify related Registry rows:
   - rows previously linked through helper provenance,
   - rows currently explicitly matched to the deleted Projects item if retrievable.
3. Soft-deactivate all active helper rows tied directly to deleted Projects item using reason `project-source-deleted`.
4. For any surviving Registry row that is still active and qualifies as legacy-only:
   - recompute it as legacy-only,
   - upsert helper rows for users from Registry role arrays.
5. Record transition counts:
   merged → legacy-only where applicable.
```

### Why
A deleted Projects record does not necessarily eliminate valid legacy continuity. The Registry counterpart may still be a valid user-facing fallback row.

---

## 8. Registry Source Deleted Algorithm

### Inputs
- deleted Registry item ID from delta tombstone.

### Steps

```text
1. Query helper rows where LegacyRegistryItemId == deleted ID.
2. Determine whether any rows are merged to a still-existing Projects record through helper provenance.
3. Soft-deactivate helper rows tied to the deleted Registry row using reason `registry-source-deleted`.
4. For any surviving Projects source row:
   - recompute it as projects-only,
   - upsert helper rows for Projects-assigned users.
5. Record transition counts:
   merged → projects-only where applicable.
```

---

## 9. Merge Topology Change Rules

### 9.1 legacy-only → merged

If a Registry row becomes matched to a Projects item:
- legacy-only rows for that Registry source become obsolete;
- merged rows are generated from Projects assignment visibility;
- soft-deactivate obsolete legacy-only rows with reason `merge-topology-changed`.

### 9.2 merged → legacy-only

If a Registry row loses valid Projects linkage:
- merged rows may become obsolete;
- if Registry still qualifies as legacy-only, generate legacy-only rows from Registry roles;
- soft-deactivate merged rows if no longer valid.

### 9.3 merged → different Projects counterpart

If matched Projects item changes:
- recompute old Projects slice if necessary,
- recompute new Projects slice,
- avoid leaving helper rows tied to stale counterpart provenance.

---

## 10. Projection Upsert Decision

For each expected row:

```text
existing = find by ProjectionKey
```

### If none
- create new active row.

### If inactive exists
- reactivate:
  - `IsActive = true`
  - clear deactivation fields
  - patch business fields as needed.

### If active exists with same hash
- update only operational fields when necessary:
  - `LastProjectedAtUtc`
  - `ProjectionBatchId`
  - optionally skip even these in high-volume incremental mode if telemetry/runs provide enough timing.

### If active exists with different hash
- patch business fields,
- update hash,
- stamp operational fields.

---

## 11. Soft-Deactivation Decision

Soft-deactivate active rows when:
- the projected user is no longer assigned,
- a row leaves a qualifying state,
- a source record is deleted,
- merge topology changes make the current row invalid,
- full rebuild detects row not in expected active set.

Soft-deactivation patch:

```json
{
  "IsActive": false,
  "DeactivatedAtUtc": "<now>",
  "DeactivationReason": "<closed-set reason>",
  "ProjectionBatchId": "<batch-id>",
  "LastProjectedAtUtc": "<now>"
}
```

---

## 12. Full Rebuild Algorithm

### Steps

```text
1. Acquire global rebuild lease.
2. Load full Projects source set.
3. Load full Registry source set.
4. Compute expected active projection rows across all users.
5. Upsert expected rows by ProjectionKey.
6. Query current active My Projects Registry rows.
7. Soft-deactivate any active current row not present in expected key set.
8. Record run summary.
9. Release lease.
```

### Full rebuild is used for
- initial seed,
- controlled resync after invalid delta state,
- manual operator repair.

---

## 13. Nightly Drift Audit Algorithm

### Steps

```text
1. Acquire drift audit lease.
2. Recompute expected projection key set and content hashes from source lists.
3. Query active helper rows.
4. Compare:
   - missing keys,
   - extra active keys,
   - content hash mismatches.
5. Emit run/telemetry.
6. Do not mutate.
7. Release lease.
```

---

## 14. Weekly Repair Algorithm

When enabled after initial stabilization:

```text
1. Execute drift comparison.
2. Upsert missing rows.
3. Update content mismatches.
4. Soft-deactivate extra active rows.
5. Record counts.
```

---

## 15. Delete vs Hard Delete

### Ordinary projection sync
Use soft-deactivate only.

### Monthly purge
Hard-delete inactive rows older than 90 days.

### State-table records
Do not purge subscription/delta state in ordinary operation. Runs can be retained according to ops policy; this package assumes no purge rule for runs in MVP unless storage cost becomes material.

---

## 16. Expected Write Volume

Given the expected source-list change volume:
- early MVP: bursty edits during rollout,
- steady state: often under 20 source changes/day,

the projection write volume is expected to be low and suitable for SharePoint helper-list upserts, especially with:
- source-slice recompute,
- Service Bus debounce,
- content-hash no-op suppression.
