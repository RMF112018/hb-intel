# @hbc/saved-views

Shared workspace-state persistence runtime for HB Intel. Provides view lifecycle, scope model, schema compatibility/reconciliation, and module adapter seams.

## Overview

`@hbc/saved-views` is the Tier-1 shared package that owns view lifecycle management, scope-based ownership/permissions, schema compatibility checking, and reconciliation across all HB Intel modules (L-01). Module adapters implement `ISavedViewStateMapper<TState>` to translate between domain-specific state and the saved-views primitive.

## Scope Model

Four ownership scopes with permission rules:

| Scope | Visibility | Edit | Delete |
|---|---|---|---|
| `personal` | Owner only | Owner only | Owner only |
| `team` | Team members | Team admins | Team admins |
| `role` | Users with role | Role admins | Role admins |
| `system` | All users | System admins | System admins |

## ISavedViewStateMapper Boundary Rules

- Module adapters implement `ISavedViewStateMapper<TState>` to map domain state to/from saved view definitions
- Filter field keys, column keys, and sort definitions remain module-owned
- The primitive owns persistence, scope enforcement, and lifecycle
- Adapters must not bypass scope permissions or reconciliation

## Schema Compatibility and Reconciliation

When a saved view references fields that no longer exist (schema drift), the reconciliation engine:
- Identifies missing/removed fields
- Drops incompatible filters, sorts, groups, and columns
- Produces a user-facing explanation of what changed
- Returns `IViewReconciliationResult` with dropped items

## Co-Dependency Surface

- **Export Runtime (SF24):** `ISavedViewContext` provides filter/sort/column state to `IExportRequest.savedViewContext`
- **Bulk Actions (SF27):** `ISavedViewContext` provides execution scope for bulk operations

## Testing

```typescript
import { /* test factories */ } from '@hbc/saved-views/testing';
```

Test factories exported from `/testing` subpath. Coverage threshold: 95/95/95/95.

## Related

- [ADR-0121 — Saved Views Architecture](../../docs/architecture/adr/ADR-0121-saved-views.md)
- [Adoption Guide](../../docs/how-to/developer/saved-views-adoption-guide.md)
- [API Reference](../../docs/reference/saved-views/api.md)
- [SF26 Master Plan](../../docs/architecture/plans/shared-features/SF26-Saved-Views.md)
- [SF26-T09 — Testing and Deployment](../../docs/architecture/plans/shared-features/SF26-T09-Testing-and-Deployment.md)
