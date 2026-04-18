# Legacy Fallback Production-Readiness Checklist (Prompt 08)

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

## 5) Monitoring and evidence

- [ ] Legacy fallback alert rules deployed (`infra/monitoring.bicep`):
  - discovery failure burst,
  - registry/sync-run write failures,
  - match anomaly warning threshold.
- [ ] Alert ownership, triage path, and SLA are documented in operator runbook.
- [ ] Staging evidence captured:
  - successful hosted timer or HTTP run,
  - one controlled failure/negative-path signal visible in logs and matching alert query,
  - registry and sync-run writes verified.

## 6) Closure output

- [ ] Prompt 08 closure report includes changed files, verification commands, residual risks, and explicit statement: **staging hardened, production cutover not executed**.
