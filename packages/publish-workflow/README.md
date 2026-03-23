# @hbc/publish-workflow

Shared publication workflow primitive for HB Intel. State machine, readiness/approval flow, supersession/revocation, receipt traceability, and module adapter seams.

## Overview

`@hbc/publish-workflow` owns the publication lifecycle: draft → ready-for-review → in-review → approved → published. Supports supersession (newer version replaces published), revocation (admin withdrawal), and frozen receipt traceability.

## Adapter-over-Primitive Boundary Rules

- Adapters consume public exports only
- Module-specific publication policies remain adapter-owned
- Runtime/orchestration ownership stays in the primitive
- Reusable visual primitives belong in `@hbc/ui-kit`

## Offline Queue/Replay Model

Service worker caching + IndexedDB persistence via `@hbc/versioned-record` + Background Sync replay + optimistic statuses.

## State Machine / Rules Export Table

| Directory | Responsibility |
|---|---|
| `src/model/` | Publication state machine, transitions |
| `src/rules/` | Readiness rules, approval rules |
| `src/api/` | Persistence, sync |
| `src/hooks/` | React hooks |
| `src/components/` | Composition shells |
| `src/adapters/` | Module registry |

## Testing

```typescript
import { /* factories */ } from '@hbc/publish-workflow/testing';
```

Coverage threshold: 95/95/95/95.

## Related

- [ADR-0122 — Publish Workflow Architecture](../../docs/architecture/adr/ADR-0122-publish-workflow.md)
- [Adoption Guide](../../docs/how-to/developer/publish-workflow-adoption-guide.md)
- [API Reference](../../docs/reference/publish-workflow/api.md)
- [SF25 Master Plan](../../docs/architecture/plans/shared-features/SF25-Publish-Workflow.md)
- [SF25-T09 — Testing and Deployment](../../docs/architecture/plans/shared-features/SF25-T09-Testing-and-Deployment.md)
