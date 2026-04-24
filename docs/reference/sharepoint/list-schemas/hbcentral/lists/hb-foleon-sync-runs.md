# HB_FoleonSyncRuns

Operational log of Foleon sync jobs. Provisioned ahead of the backend
sync work so schema and indexes are stable; reader/tenant admins can
query historical runs once Wave 02 writers ship.

## Purpose

- Observability: track every sync run (Docs, Projects, Analytics) with
  a deterministic correlation ID.
- Stale-data detection: surface last-success timestamps per run kind to
  the admin UI.
- Support: capture a bounded error summary per failed run without
  leaking secrets or raw Foleon API responses.

## Schema authority

- Code: `apps/hb-intel-foleon/src/schema/foleonListSchemas.ts` →
  `FOLEON_SYNC_RUNS_SCHEMA`.
- Provisioning dry-run:
  `pnpm --filter @hbc/spfx-hb-intel-foleon provision:print`.

## Fields

| Internal name    | Display name      | Type     | Required | Indexed | Notes                                          |
| ---------------- | ----------------- | -------- | -------- | ------- | ---------------------------------------------- |
| `Title`          | Title             | Text     | yes      | no      | Human-scannable label (e.g. `Docs 2026-04-24`) |
| `RunId`          | Run ID            | Text     | yes      | yes (unique) | UUID per run                             |
| `RunKind`        | Run Kind          | Choice   | yes      | yes     | `Docs` \| `Projects` \| `Analytics`            |
| `Status`         | Status            | Choice   | yes      | yes     | `Running` \| `Succeeded` \| `Failed` \| `Cancelled` |
| `StartedUtc`     | Started (UTC)     | DateTime | yes      | yes     |                                                |
| `EndedUtc`       | Ended (UTC)       | DateTime | no       | yes     | Null while `Status = Running`                  |
| `TriggerSource`  | Trigger Source    | Choice   | yes      | yes     | `Timer` \| `Manual` \| `AdminApi`              |
| `ItemsFetched`   | Items Fetched     | Number   | no       | no      |                                                |
| `ItemsWritten`   | Items Written     | Number   | no       | no      |                                                |
| `ErrorCount`     | Error Count       | Number   | no       | yes     | Zero on success; bounded on failure            |
| `ErrorsJson`     | Errors JSON       | Note     | no       | no      | Bounded JSON summary; never raw API payloads   |
| `CorrelationId`  | Correlation ID    | Text     | no       | yes     | Ties to backend tracing                        |
| `BackendVersion` | Backend Version   | Text     | no       | no      | Backend semver at write time                   |

## Required indexed set

`RunId`, `RunKind`, `Status`, `StartedUtc`, `EndedUtc`, `TriggerSource`,
`ErrorCount`, `CorrelationId`.

## Views

- **Recent Runs** — sort `StartedUtc desc`.
- **Failed Runs** — filter `Status eq 'Failed'`, sort `StartedUtc desc`.

## Versioning

Enabled. Run history is low-volume and audit-relevant.

## Consumers

- Frontend utility: `FoleonSyncStatus.deriveFoleonSyncStatus` computes
  fresh/stale/in-flight status from the most-recent rows.
- No writer exists in Wave 01. Wave 02 adds the backend sync host that
  writes to this list.

## Launch posture

See
`docs/architecture/decisions/ADR-2026-04-24-foleon-phase-01-launch-scope.md`
for the launch-scope decision. This list is provisioned at launch even
though it starts empty — the contract must exist before writers ship.
