# @hbc/bulk-actions

Shared bulk-actions primitive for HB Intel. Selection semantics, per-item eligibility, chunked execution, mixed-result reporting, and module adapter seams.

## Overview

`@hbc/bulk-actions` owns selection scope management, eligibility evaluation, chunked execution, and result aggregation. Module adapters register actions; the primitive orchestrates execution.

## Selection-Scope Vocabulary

| Scope | Description |
|---|---|
| `selected-rows` | Only explicitly selected rows |
| `filtered-set` | All rows matching current filter/sort state |
| `all` | All rows regardless of filter state |

## Immediate vs Configured Actions

- **Immediate:** Execute on confirm with no additional input
- **Configured:** Require user input dialog before execution

## Eligibility and Safety

- Per-item eligibility check before execution
- Destructive actions require explicit confirmation
- Permission gating via `permissionKey`

## Chunked Execution

Large selections are split into chunks. Results report success/failed/skipped per item with retryable flag.

## Selection Sources

Current: `HbcDataTable`, `ListLayout`. Future seams: `CanvasTile`, `TreeView`.

## Testing

```typescript
import { /* factories */ } from '@hbc/bulk-actions/testing';
```

## Related

- [SF27 Master Plan](../../docs/architecture/plans/shared-features/SF27-Bulk-Actions.md)
