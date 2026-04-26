# 04 — Load Error Root Cause

## Error

```text
The connector needs a backend API URL or SPFx token provider configuration before writes are enabled.
```

## Direct Root Cause

The current Manager blocks before loading data when all of the following are true:

```text
contract.hostMode === 'sharepoint'
contract.apiBaseUrl is missing
contract.getAccessToken is missing
```

In repo truth, `ManageOrchestrator` explicitly enters the blocked state when SharePoint mode is active and neither an API base URL nor token provider is available.

The token provider is only attached during mount when both of these conditions are true:

```text
SPFx context exists
config.foleonApiResource is populated
```

Therefore the immediate root cause is not that the Manager route is missing. The route exists. The backend route definitions also exist. The failure is that the hosted Manager page instance does not have enough runtime configuration to construct a write-capable management API client.

## Why the Previous Property-Pane-Only Fix Is Insufficient

A narrow fix would set these fields directly on the Foleon Manager page webpart:

```text
contentRegistryListId
placementsListId
eventsListId
foleonApiBaseUrl
foleonApiResource
acceptedFoleonOrigins
expectedManifestId
expectedPackageVersion
```

That would likely clear the immediate blocker, but it would preserve a fragmented configuration model. Homepage Foleon lanes use a related but different config shape (`foleonContentRegistryListId`, `foleonPlacementsListId`, etc.), while the standalone Foleon app uses `contentRegistryListId`, `placementsListId`, and `eventsListId`.

The registry-first direction solves the broader defect by making these values resolve from one authoritative source.

## Registry-First Remediation Path

The corrected sequence is:

1. Provision `HB Platform Configuration Registry` in HBCentral.
2. Seed safe Foleon baseline values and placeholder records for missing list/API values.
3. Add validation that blocks duplicate active logical keys and prevents secret-like values from being stored directly.
4. Add a registry reader/runtime bridge.
5. Resolve Foleon Manager runtime configuration from the registry.
6. Preserve property-pane values as explicit page-level overrides only.
7. Show clear Config tab readiness diagnostics when a registry value is missing, blocked, expired, or invalid.

## Minimum Temporary Fix

If a production incident requires immediate short-term relief before registry adoption, the local agent may configure page/webpart properties directly for:

```text
foleonApiBaseUrl
foleonApiResource
contentRegistryListId
placementsListId
eventsListId
acceptedFoleonOrigins
expectedManifestId
expectedPackageVersion
```

This must be documented as a temporary bridge, not the target architecture.

## Production-Grade Fix

The production-grade fix is registry-backed runtime configuration with deterministic precedence:

```text
1. explicit page/webpart override
2. HB Platform Configuration Registry active value
3. build-time or package default
4. blocked state with actionable diagnostics
```

## Acceptance Criteria

- The Manager no longer blocks solely because page-local properties are empty when valid registry records exist.
- The Manager still blocks safely when both registry and override values are missing or invalid.
- The Config tab explains which source supplied each value.
- No secret values are stored in SharePoint.
- Hosted proof captures registry resolution, token-provider readiness, API URL readiness, and backend safe-config status.
