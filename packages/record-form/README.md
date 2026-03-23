# @hbc/record-form

Shared record authoring runtime primitive for HB Intel. Provides create/edit/duplicate/template lifecycle, draft recovery, review/submission handoff, offline replay, and module adapter seams for all Phase 3 modules.

## Overview

`@hbc/record-form` is the Tier-1 shared package that owns the record authoring lifecycle, draft persistence, review orchestration, offline resilience, and telemetry across all HB Intel modules (L-01). Individual feature modules create lightweight adapters that supply module-specific schemas and validation rules while the primitive owns lifecycle and trust state.

## Adapter-over-Primitive Boundary Rules

- **Adapters consume primitive public exports only** — no internal imports.
- **Module schemas and validation rules remain adapter-owned** (projection-only).
- **Runtime and orchestration ownership stays in `@hbc/record-form`** — lifecycle state machines, trust computation, draft management, retry logic, review orchestration.
- **Reusable visual primitives belong in `@hbc/ui-kit`** per CLAUDE.md UI Ownership Rule.

## Trust-State Vocabulary

SF23 uses explicit trust vocabulary. Users must always understand the current form state:

| Status | User-Facing Meaning |
|---|---|
| `blocked` | Cannot submit — missing required fields or review gate pending |
| `valid-with-warnings` | Can submit but warnings should be reviewed |
| `saved-locally` | Draft saved to device, not yet synced |
| `queued-to-sync` | Waiting for network to submit |
| `degraded` | Submitted but with reduced confidence |
| `recovered-needs-review` | Draft recovered from offline/crash — review recommended |
| `partially-recovered` | Some fields recovered, some may be missing |
| `synced` | Successfully submitted and confirmed |

**Confidence levels:** `trusted-synced`, `queued-local-only`, `recovered-needs-review`, `partially-recovered`, `degraded`, `failed`.

## Recovery/Replay Model

**Offline resilience (L-04):** Service worker caching + IndexedDB persistence via `@hbc/versioned-record` + Background Sync replay + optimistic statuses.

Recovery states explain themselves: crash recovery, session timeout, offline draft restoration, and conflict detection each produce specific user-facing guidance.

## Next Recommended Action and Review Semantics

- **Next recommended action** derives the most useful next step (submit, review, fix errors, resolve warnings, complete required fields, retry, restore draft).
- **Review steps** are blocking or non-blocking, pre-submit or post-submit, with owner attribution and reassignment history (L-02).
- **BIC ownership** creates granular post-submit handoff with avatar projection in submit surfaces + My Work.

## Testing

```typescript
import { /* test factories */ } from '@hbc/record-form/testing';
```

Test factories and mock adapters are exported from the `/testing` subpath, excluded from production bundles. Coverage threshold: 95/95/95/95.

## Related

- [SF23 Master Plan](../../docs/architecture/plans/shared-features/SF23-Record-Form.md)
- [SF23-T09 — Testing and Deployment](../../docs/architecture/plans/shared-features/SF23-T09-Testing-and-Deployment.md)
