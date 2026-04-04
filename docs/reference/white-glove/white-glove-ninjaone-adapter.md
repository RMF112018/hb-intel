# White-Glove NinjaOne Adapter Reference

> NinjaOne post-enrollment standardization, software deployment, script execution, and validation.

**Backend services:** `backend/functions/src/services/device-management/ninjaone/`
**Consumers:** `WhiteGloveRunService` (orchestration), white-glove API routes

## Service architecture

Two services plus a bundle mapping module. NinjaOne is strictly post-enrollment — it is NOT the enrollment authority for any device.

| Service | File | Depends on |
|---------|------|------------|
| NinjaOne API | `ninjaone-api-service.ts` | `IConnectionRegistryService` |
| NinjaOne Standardization | `ninjaone-standardization-service.ts` | `IConnectionRegistryService` |
| Bundle Mapping | `ninjaone-bundle-mapping.ts` | `@hbc/models` (package families, device platforms) |
| Readiness Probes | `ninjaone-readiness-probes.ts` | `IConnectionRegistryService` |

## NinjaOne API Service

Manages OAuth/API connectivity and organization verification.

| Method | Purpose |
|--------|---------|
| `checkNinjaOneReadiness()` | Verify connector configured and healthy |
| `validateApiConnection()` | Test OAuth token exchange + API call |
| `getOrganization()` | Verify org access and device count |

## NinjaOne Standardization Service

Post-enrollment device standardization operations.

| Method | Purpose |
|--------|---------|
| `assignPolicyBundle(deviceId, bundleId)` | Assign policy bundle to device |
| `triggerSoftwareBundle(deviceId, bundleId)` | Trigger software installation |
| `triggerScript(deviceId, scriptId, params?)` | Execute automation script |
| `getStandardizationStatus(deviceId)` | Check bundle/script completion |
| `getValidationResult(deviceId, validationId)` | Post-standardization validation |
| `normalizeStandardizationStatus(rawStatus)` | Normalize for SPFx display |

## Bundle mapping

Package templates map to NinjaOne bundles by family + platform:

| Bundle type | Purpose | Applied to |
|------------|---------|------------|
| Policy | Device management policies | All platforms |
| Software | Application installation | Windows, macOS |
| Script | Post-enrollment configuration | Windows, macOS |
| Validation | Standardization verification | All platforms |

### Platform bundle counts

| Platform | Bundle types |
|----------|-------------|
| Windows desktop/laptop | Policy, Software, Script, Validation (4) |
| macOS laptop | Policy, Software, Script, Validation (4) |
| iPhone | Policy, Validation (2) |
| iPad | Policy, Validation (2) |

### Bundle IDs (code defaults)

| Platform | Policy | Software | Script | Validation |
|----------|--------|----------|--------|------------|
| Windows | `n1-win-baseline-policy` | `n1-win-standard-software` | `n1-win-post-enroll-config` | `n1-win-validation` |
| macOS | `n1-mac-baseline-policy` | `n1-mac-standard-software` | `n1-mac-post-enroll-config` | `n1-mac-validation` |
| iPhone | `n1-ios-baseline-policy` | — | — | `n1-ios-validation` |
| iPad | `n1-ipados-baseline-policy` | — | — | `n1-ipados-validation` |

## Readiness probes

| Check | Blocking | Description |
|-------|----------|-------------|
| `ninjaone-api-connector` | Yes | NinjaOne API connector configured and healthy |

## NinjaOne tasks delegated

| Task | NinjaOne responsibility |
|------|------------------------|
| Policy application | Apply device management policies post-enrollment |
| Software deployment | Install application bundles on enrolled devices |
| Script execution | Run automation scripts for configuration |
| Validation | Verify standardization completion |
| Remediation | Re-apply policies/software on validation failure |

## What NinjaOne does NOT own

| Responsibility | Actual owner |
|---------------|-------------|
| Device enrollment | Microsoft Autopilot or Apple ADE |
| Device identity | Microsoft Entra ID |
| MDM enrollment authority | Microsoft Intune |
| ADE assignment | Apple Business Manager |
| Orchestration | HB Intel backend |

## Retry semantics

NinjaOne operations are generally idempotent:
- Policy reassignment is safe to retry
- Software bundle re-trigger is safe (NinjaOne skips already-installed)
- Script re-execution depends on script design (most are idempotent)
- Validation re-run is always safe

Max retries: 3, backoff: 5s (from `white-glove-retry-semantics.ts`)

## Adapter registry

| Adapter key | Category | Operations |
|-------------|----------|------------|
| `ninjaone:standardization` | NinjaOne | assignPolicy, triggerSoftware, triggerScript, getStatus |
| `ninjaone:validation` | NinjaOne | validate, getValidationResult |

## Cross-references

- [Architecture baseline](../../architecture/plans/MASTER/spfx/admin/white-glove/white-glove-architecture-baseline.md)
- [Domain model](white-glove-domain-model.md)
- [Connector governance](../configuration/white-glove-connector-governance.md)
- [Microsoft adapter](white-glove-microsoft-adapter.md)
- [Apple adapter](white-glove-apple-adapter.md)
