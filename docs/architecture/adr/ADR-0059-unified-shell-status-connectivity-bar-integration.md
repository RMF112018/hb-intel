# ADR-0059: Unified Shell-Status / Connectivity Bar Integration

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.6 (Unified Shell-Status / Connectivity Bar Integration)
- **Related Plans:** `docs/architecture/plans/PH5.6-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.6 requires HB Intel to reuse the existing top connectivity bar as the canonical shell-status rail and expand it beyond network-only signaling. Status must derive from centralized shell/auth/connectivity state, enforce a fixed priority hierarchy, use plain-language messaging, and expose only limited safe actions. Degraded mode also requires section-level labels while deferring richer sub-state contribution systems.

## Decision

1. Implement a centralized shell-status domain in `@hbc/shell` with required states:
   - `initializing`
   - `restoring-session`
   - `connected`
   - `reconnecting`
   - `degraded`
   - `access-validation-issue`
   - `error-failure`
2. Enforce fixed status priority hierarchy (highest first):
   1. `error-failure`
   2. `access-validation-issue`
   3. `restoring-session`
   4. `initializing`
   5. `degraded`
   6. `reconnecting`
   7. `connected`
3. Restrict shell-status actions to approved, state-gated actions only:
   - `retry`
   - `sign-in-again`
   - `learn-more`
4. Integrate status derivation in `ShellCore` so the bar consumes centralized snapshots rather than direct subsystem updates.
5. Upgrade `HbcConnectivityBar` as canonical status rail consumer with:
   - snapshot-driven message rendering
   - approved action rendering with allowlist checks
   - legacy connectivity-only compatibility path for incremental adoption
6. Add degraded mode section-label derivation in shell status utilities and pass through centralized status snapshots.

## Consequences

### Positive

- One trusted shell-status surface across runtime environments.
- Deterministic, explainable message arbitration through fixed priority.
- Safer action exposure through explicit allowlist gating.
- Backward compatibility retained while migrating existing connectivity consumers.

### Tradeoffs

- Shell-core status model becomes a stronger dependency for top-rail messaging.
- Existing UI surfaces that still use legacy connectivity-only props do not automatically get full unified status behavior until migrated.

## Deferred Expansion Path

Phase 5.6 explicitly defers richer sub-state contributions and feature-specific status composition. Future expansion may add:
- finer-grained sub-states per shell domain
- feature-level contribution contracts
- richer status action contexts
- expanded diagnostics/telemetry views

These are documented as future paths and intentionally not implemented in this phase.

## Traceability

- `docs/architecture/plans/PH5.6-Auth-Shell-Plan.md` §5.6 items 1-8
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` locked Option C shell-status decisions
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
