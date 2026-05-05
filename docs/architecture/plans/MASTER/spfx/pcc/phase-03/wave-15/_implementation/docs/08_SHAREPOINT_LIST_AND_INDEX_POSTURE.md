# SharePoint List and Index Posture

## Storage Model

Wave 15 uses a split storage model.

### HB Central Global Lists

```text
PCC External System Definitions
PCC External URL Policy Registry
```

### Project Site Lists

```text
PCC Project External Launch Links
PCC Project External System Mappings
PCC External Object References
PCC External Review Items
PCC External System Health Snapshots
PCC External System Audit Events
```

### Existing HB Central Lists Referenced Only

```text
Projects
projectViewerGroups
Tool Launcher Contents
HB Platform Configuration Registry
Priority Actions Band Items
User Information List
```

Do not overload existing HB Central lists with project-specific Launch Pad child records.

## Implementation Boundary

This package does not create, provision, mutate, or populate SharePoint lists.

Use list schemas to shape models, fixtures, and future read-model expectations only.

## Indexing Principles

Every future list-backed query must have an indexed first predicate.

High-cardinality or high-growth fields that should be indexed according to schema docs include:

- `ProjectId`
- `ProjectNumber`
- `SystemKey`
- `LinkType`
- `Hostname`
- `ApprovalState`
- `RequiresApproval`
- `SubmittedAtUtc`
- `ApprovedAtUtc`
- `AudienceMode`
- `IframeEligible`
- `CurrentImageEligible`
- `IsActive`
- `MappingScope`
- `SourceObjectType`
- `MappingState`
- `FreshnessBand`
- `ReviewState`
- `CurrentOwnerPersona`
- `CurrentOwnerUpn`
- `DueAtUtc`
- `HealthState`
- `ObservedAtUtc`
- `Severity`
- `EventType`
- `ActorUpn`
- `OccurredAtUtc`
- `CorrelationId`

## Query Pattern Examples

### Approved Project Launch Links

```text
ProjectId = ? AND IsActive = true AND ApprovalState = approved
```

### Pending Custom Link Review

```text
ProjectId = ? AND ApprovalState = submitted
```

### System Mapping Health

```text
ProjectId = ? AND SystemKey = ? AND MappingState IN (stale, conflict, missing, review-required)
```

### Source Health Latest Snapshot

```text
ProjectId = ? AND SystemKey = ? ORDER BY ObservedAtUtc DESC
```

### Audit Timeline

```text
ProjectId = ? AND OccurredAtUtc >= ? ORDER BY OccurredAtUtc DESC
```

## Retention / Growth Guidance

- Audit events: retain through active project lifecycle; archival deferred.
- Health snapshots: latest and recent history only; avoid uncontrolled growth.
- Project launch links: retain active/archive/version state.
- Review items: retain resolved history but avoid rendering unbounded lists.
- HBI lineage: derived/read-model projection, not independent system of record unless future architecture authorizes storage.

## Implementation Implication

Even though this package is mock/read-model-first, fixture and read-model shapes should anticipate list-backed query constraints.

Do not implement client-side assumptions that require loading all rows from a large list and filtering locally in production.
