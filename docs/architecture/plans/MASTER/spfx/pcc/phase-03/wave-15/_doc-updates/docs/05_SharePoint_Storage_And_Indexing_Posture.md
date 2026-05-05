# 05 — SharePoint Storage and Indexing Posture

## Storage Decision

Wave 15 uses a split storage model:

1. HB Central global lists: `PCC External System Definitions`, `PCC External URL Policy Registry`.
2. Project site lists: `PCC Project External Launch Links`, `PCC Project External System Mappings`, `PCC External Object References`, `PCC External Review Items`, `PCC External System Health Snapshots`, `PCC External System Audit Events`.
3. Existing HB Central lists referenced, not overloaded: `Projects`, `projectViewerGroups`, `Tool Launcher Contents`, `HB Platform Configuration Registry`, `Priority Actions Band Items`.

## Indexing Rules

Every list must have indexes that support the first filter in common queries. No query may depend on an unindexed high-cardinality field as the first predicate after the list exceeds safe growth.

## Retention

- Audit events: retain active project lifecycle; archival strategy deferred to retention governance but not an implementation blocker.
- Health snapshots: latest and recent history only; no uncontrolled growth.
- Project launch links: versioned, active/archive status retained.
