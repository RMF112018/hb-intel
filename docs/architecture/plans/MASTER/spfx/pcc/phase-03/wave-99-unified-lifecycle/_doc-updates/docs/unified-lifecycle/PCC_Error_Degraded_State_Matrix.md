# PCC Error / Empty / Degraded State Matrix

## Purpose

Define standard UI and HBI behavior for non-happy paths.

## Standard States

- `loading`
- `empty`
- `source-unavailable`
- `backend-unavailable`
- `missing-config`
- `stale`
- `unauthorized`
- `forbidden`
- `permission-restricted`
- `insufficient-evidence`
- `feature-disabled`
- `tenant-gate-not-cleared`

## Rules

- Degraded states must not render restricted raw data.
- Backend/source unavailable states must not render stale hidden answer rows.
- HBI must refuse or qualify when evidence is insufficient or stale.
- Warranty responsibility conclusions are blocked in insufficient-evidence states.
- Tenant-gated live behaviors remain preview/fixture only.

## Reference JSON

Use `reference/error_degraded_state_matrix.json` as machine-readable source.
