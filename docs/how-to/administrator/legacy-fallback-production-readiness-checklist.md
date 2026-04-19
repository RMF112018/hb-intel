# Legacy Fallback Production-Readiness Checklist

Use this checklist to close staging-hardening for the Project Sites legacy fallback bridge before any production cutover.

## 1) Hosting and ownership

- [ ] Hosting footprint documented and deployed from repo IaC:
  - `infra/legacy-fallback-hosting.bicep`
  - `infra/legacy-fallback-hosting.staging.bicepparam`
- [ ] Deployment path is scripted and repeatable (`scripts/provision-legacy-fallback-hosting.ts`).
- [ ] Operational owners are assigned:
  - Platform Operations (infrastructure and alerts)
  - Project Sites maintainers (discovery/review workflow)

## 2) Permissions and auth posture

- [ ] Interim posture is explicit: `pilot-interim` + `HB SharePoint Creator` app id (`08c399eb-a394-4087-b859-659d493f8dc7`).
- [ ] Target posture is documented (least-privilege `Sites.Selected` model) and tracked as cutover follow-up.
- [ ] No secrets are committed; secret-bearing settings are environment/Key Vault managed.

## 3) Sync operations and safety controls

- [ ] Daily timer cadence configured (`HBC_LEGACY_FALLBACK_DISCOVERY_TIMER_SCHEDULE`).
- [ ] Manual rerun controls configured:
  - `HBC_LEGACY_FALLBACK_MANUAL_RERUN_ENABLED`
  - `HBC_LEGACY_FALLBACK_RERUN_MIN_INTERVAL_MINUTES`
- [ ] Emergency disable posture validated:
  - `HBC_LEGACY_FALLBACK_ENABLED=false`
  - `HBC_LEGACY_FALLBACK_DISCOVERY_ENABLED=false`
  - `HBC_LEGACY_FALLBACK_DISCOVERY_TIMER_ENABLED=false`
- [ ] Stale record behavior verified: records not seen in a run are set `IsActive=false` with identity preserved (`DriveId + DriveItemId`).

## 4) Schema and provisioning control

- [ ] HBCentral list schemas remain descriptor-authoritative:
  - `Legacy Project Fallback Registry`
  - `Legacy Project Fallback Sync Runs`
- [ ] Any schema updates flow through provisioning script (`scripts/provision-legacy-fallback-lists.ts`), not portal drift.

## 5) Monitoring and alert wiring

- [ ] Legacy fallback alert rules deployed (`infra/monitoring.bicep`):
  - discovery failure burst,
  - registry/sync-run write failures,
  - match anomaly warning threshold.
- [ ] Alert ownership, triage path, and SLA are documented in operator runbook.

## 6) Hosted validation evidence (A–E proof classes)

Mirrors the A–E sequence in `run-legacy-fallback-discovery.md`. No class substitutes for another; every class has a captured artifact.

- [ ] **A. Deployment Proof** — Flex hosting confirmed, deterministic artifact deployed via `azure/functions-action@v1` or `az functionapp deploy --type zip`; no `config-zip` fallback.
- [ ] **B. Registration Proof** — all eight lane functions present in `az functionapp function list` and `/admin/functions` (presence only; registration is not success).
- [ ] **C. Execution Proof** — manual HTTP run returned 2xx with `runId`, or the timer run completed cleanly. `runId` recorded.
- [ ] **D. Persistence Proof** — `Legacy Project Fallback Sync Runs` has the `runId` row with terminal `Status`, `CompletedUtc`, all first-class counters and operational fields populated; `Legacy Project Fallback Registry` has ≥1 row tagged with that `DiscoveryRunId` (skip for dry-runs).
- [ ] **E. Telemetry Proof** — App Insights contains the `invocationId` with `legacy-fallback.boundary.success` markers for `startSyncRun`, `graph.listRootFolders.first`, and `registry.upsert.first-after-sync-run-start`; any `MatchAnomalyExceeded=true` paired with a matching warn log.
- [ ] Evidence JSON collected via `scripts/collect-legacy-fallback-closure-evidence.sh`.
- [ ] One controlled failure/negative-path signal observed in logs and matched to the alert query.

## 7) Closure report

- [ ] Closure report prepared from `legacy-fallback-closure-report-template.md` and attached to the closure PR or ops ticket.
- [ ] Report includes changed files, verification commands, A–E proof artifacts, residual risks, and an explicit scope statement (e.g., **staging hardened, production cutover not executed**).
