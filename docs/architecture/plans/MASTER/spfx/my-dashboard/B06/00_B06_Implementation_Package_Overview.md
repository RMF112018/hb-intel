# 00 — B06 Implementation Package Overview

## Objective

Implement the remaining **documentation alignment work** required to make Batch 06 authoritative and visible across the My Dashboard planning suite.

This package does **not** add B06 to the repository. B06 already exists on live `main`. The implementation objective is to reconcile the surrounding documents so the My Dashboard plan family now inherits B06’s closed decisions with no contradictory drift.

---

## Repo-truth posture

### Canonical B06 artifact is already present
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md
```

### One internal filename drift remains inside B06
B06 currently names a longer predecessor filename for B05, while live repo truth uses:

```text
B05_Adobe_Sign_Integration_Architecture_Development.md
```

That mismatch should be corrected.

### Folder authority index is stale
The dev-plan README currently indexes only through B03 and must be extended through B06.

### Umbrella outline is stale for B06
The outline must be reconciled for:
- batch authority posture,
- route taxonomy refinement in Section 18,
- operational resilience in Section 22,
- security/privacy/telemetry in Section 23,
- risk exposure in Section 27,
- open-item cleanup where B06 closes decisions.

---

## Why this matters

Without this reconciliation:

- future planning agents may not see B06 as an active authority,
- later implementation work may reopen no-cache or auto-polling decisions,
- the outline may continue to present B06-closed items as unresolved,
- B06’s telemetry/evidence/privacy restrictions may be missed during implementation,
- a stale B05 filename inside B06 can create downstream navigation and search failures.

---

## Package philosophy

This package is deliberately:

- **repo-truth-first**
- **docs-only**
- **B06-scoped**
- **non-deferrable**
- **explicit about exact files**
- **designed for local code-agent execution**
- **careful not to duplicate B05 reconciliation work**

Where the current outline contains older B05 drift that is unrelated to B06’s direct scope, this package should not re-implement the B05 prompt package. It should only correct B06-related contradictions and record any clearly residual upstream drift if encountered.

---

## B06 closed decisions to preserve

The package must protect these B06 decisions:

| Domain | Closed B06 position |
|---|---|
| Refresh | Initial load + manual focused-module refresh only |
| Auto-polling | Prohibited in MVP |
| Queue cache | No durable queue cache |
| Queue replay | No persisted stale queue replay as current |
| Freshness | `generatedAtUtc` required; `isStale` reserved for real stale behavior |
| Retry | Bounded transient retries only; avoid retry storms |
| Throttling | Honor `Retry-After`; classify rate limit safely |
| Webhooks | Future-state only |
| Telemetry | Classification-first; no tokens or row metadata |
| Evidence | PCC sanitization inherited plus My Dashboard queue-specific restrictions |
| Error paths | No raw provider error strings into telemetry |
| Risk | Token leakage, stale-data misrepresentation, source URL safety, and privacy leakage are hard gates |

---

## Final implementation target

After execution, the repository should communicate:

1. **B06 exists and is active authority.**
2. **The outline defers to B06 where B06 has developed detail.**
3. **No one should infer auto-polling or durable caching is permitted in MVP.**
4. **No one should infer raw queue content is acceptable in telemetry/evidence.**
5. **The B05 predecessor path referenced by B06 is accurate.**
