# PCC Record State Machines

## Purpose

Define allowed record state transitions for unified lifecycle implementation. These state machines are closed decisions. Developers may not add ad hoc states without amending this document and its JSON reference.

## State Machines

### ProjectLifecycleEvent

`draft -> active -> pending-review -> accepted -> superseded/archive`

- `accepted` requires evidence unless the event is a source-backed external milestone.
- `archived` is terminal.

### ProjectMemoryRecord

`open -> validated | invalidated -> superseded | converted-to-action | archived`

- `validated` requires source lineage or evidence links.
- `converted-to-action` requires target workflow/action reference.

### ProjectTraceabilityEdge

`candidate -> probable -> verified`

- `verified` requires evidence and source lineage.
- Warranty responsibility edges require obligation, execution, and closeout/field evidence.

### WarrantyTraceRecord

`insufficient-evidence -> pending-evidence -> responsibility-recommended -> responsibility-confirmed -> resolved -> closed`

- Responsibility recommendation is blocked unless the evidence threshold is met.
- Responsibility confirmation requires human review in future runtime.
- `closed-without-determination` is allowed when evidence remains insufficient.

### CrossProjectReference

`candidate -> approved | restricted | redacted | rejected -> archived`

- `approved` requires no reuse blockers.
- `redacted` must be summary-safe.

### UnifiedSearchAskHbiResponse

`not-issued -> grounded | refused | degraded -> audit-pending`

- Grounded requires at least one citation.
- Refused must use canonical `PccHbiRefusalReason`.
- Degraded may not render answer rows.

## Reference JSON

Use `reference/record_state_machines.json` as machine-readable source.
