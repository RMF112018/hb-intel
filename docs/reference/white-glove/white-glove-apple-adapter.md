# White-Glove Apple Adapter Reference

> Apple device management services for ABM, ADE, APNs, and Intune-managed Apple devices.

**Backend services:** `backend/functions/src/services/device-management/apple/`
**Consumers:** `WhiteGloveRunService` (orchestration), white-glove API routes

## Service architecture

Three distinct services by concern. iPhone, iPad, and macOS are explicitly differentiated.

| Service | File | Depends on |
|---------|------|------------|
| Apple ABM | `apple-abm-service.ts` | `IConnectionRegistryService` |
| Apple ADE | `apple-ade-service.ts` | `IConnectionRegistryService` |
| Apple MDM | `apple-mdm-service.ts` | `IConnectionRegistryService` |
| Readiness Probes | `apple-readiness-probes.ts` | `IConnectionRegistryService` |

## Apple Business Manager Service

Manages device assignment and server token validation.

| Method | Purpose |
|--------|---------|
| `checkAbmReadiness()` | Verify ABM connector configured and healthy |
| `getDeviceAssignment(serialNumber)` | Look up ABM assignment for a device |
| `validateAbmToken()` | Check ABM server token validity and expiry |
| `getAssignmentProfile(serialNumber)` | Which MDM server the device is assigned to |
| `normalizeAbmStatus(rawStatus)` | Normalize for SPFx display |

## Apple Automated Device Enrollment Service

Manages ADE enrollment with explicit platform differentiation.

| Method | Purpose |
|--------|---------|
| `checkAdeReadiness()` | Verify ADE connector configured and healthy |
| `getAdeDevice(serialNumber)` | Look up device in ADE |
| `getAdeEnrollmentProfile(serialNumber)` | Enrollment profile assigned |
| `validateAdeAssignmentPosture(serialNumber, platform)` | Platform-specific posture validation |
| `normalizeAdeStatus(rawStatus)` | Normalize for SPFx display |

### Platform-specific posture validation

| Platform | Requirements |
|----------|-------------|
| iPhone | ADE assignment to correct MDM server + supervised enrollment profile |
| iPad | ADE assignment to correct MDM server + supervised enrollment profile |
| macOS | ADE assignment to correct MDM server + enrollment profile (supervision optional) |

## Apple MDM Service

Manages enrollment status, supervised state, and APNs-backed device management.

| Method | Purpose |
|--------|---------|
| `checkApnReadiness()` | Verify APNs connector configured and healthy |
| `getDeviceEnrollmentStatus(serialNumber, platform)` | Enrollment status with platform differentiation |
| `getSupervisedState(serialNumber)` | Supervised state (critical for iOS/iPadOS) |
| `getDeviceMdmProfile(serialNumber)` | MDM profile assigned |
| `normalizeAppleMdmStatus(rawStatus)` | Normalize for SPFx display |

### Supervised state importance

- **iPhone/iPad:** Must be supervised for full management (app installation, restriction enforcement, single-app mode)
- **macOS:** Supervision optional — management via MDM profile is sufficient for most operations

## Readiness probes

`runApplePreflightChecks()` validates before package launch:

| Check | Blocking | Description |
|-------|----------|-------------|
| `apple-abm-connector` | Yes | ABM connector configured and healthy |
| `apple-ade-connector` | Yes | ADE connector configured and healthy |
| `apple-apns-connector` | Yes | APNs connector configured and healthy |

## Apple-specific failure cases

| Failure | Meaning | Operator action |
|---------|---------|-----------------|
| Missing assignment | Device not in ABM or not assigned to MDM server | Assign device in Apple Business Manager |
| Token invalid/missing | ABM server token expired or not uploaded | Renew and upload server token |
| APNs dependency failure | APNs certificate expired or push service unreachable | Renew APNs certificate |
| Unsupported posture | Device assigned but enrollment profile missing or incompatible | Assign correct enrollment profile in ADE |
| Not ready for automated enrollment | Device not in ADE or awaiting enrollment | Verify device is purchased through ABM and assigned |

## Connector requirements

| Connector class | Required for | Configuration |
|----------------|-------------|---------------|
| `apple-abm` | ABM device assignment | ABM server token with MDM server assignment |
| `apple-ade` | ADE enrollment profiles | ADE enrollment profile configuration |
| `apple-apns` | MDM push notifications | APNs certificate for Intune MDM |

## Ownership boundaries

| Responsibility | Owner |
|---------------|-------|
| Device procurement and ABM assignment | Apple Business Manager |
| ADE enrollment profile assignment | Apple ADE |
| Supervised enrollment state | Apple device (set during enrollment) |
| MDM enrollment authority | Apple ADE + Intune MDM |
| Push notification delivery | Apple APNs |
| Orchestration and status aggregation | HB Intel backend |
| Operator UX and evidence display | HB Intel SPFx |

## Adapter registry

| Adapter key | Category | Operations |
|-------------|----------|------------|
| `apple-abm:device-assignment` | AppleAbm | getAssignment, validateToken, getAssignmentProfile |
| `apple-ade:enrollment` | AppleAde | getDevice, getEnrollmentProfile, validatePosture |
| `apple-mdm:supervised-enrollment` | AppleMdm | getEnrollmentStatus, getSupervisedState, getMdmProfile |

## Cross-references

- [Architecture baseline](../../architecture/plans/MASTER/spfx/admin/white-glove/white-glove-architecture-baseline.md)
- [Domain model](white-glove-domain-model.md)
- [Connector governance](../configuration/white-glove-connector-governance.md)
- [Microsoft adapter](white-glove-microsoft-adapter.md)
