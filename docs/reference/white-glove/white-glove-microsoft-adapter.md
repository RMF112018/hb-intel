# White-Glove Microsoft Adapter Reference

> Microsoft device management services for Entra identity, Intune enrollment, and Windows Autopilot.

**Backend services:** `backend/functions/src/services/device-management/microsoft/`
**Consumers:** `WhiteGloveRunService` (orchestration), white-glove API routes

## Service architecture

Three distinct services by concern. None overload the existing Graph group service.

| Service | File | Depends on |
|---------|------|------------|
| Microsoft Identity | `microsoft-identity-service.ts` | `IGraphService` |
| Microsoft Intune | `microsoft-intune-service.ts` | `IConnectionRegistryService` |
| Microsoft Autopilot | `microsoft-autopilot-service.ts` | `IConnectionRegistryService` |
| Readiness Probes | `microsoft-readiness-probes.ts` | `IConnectionRegistryService` |

## Microsoft Identity Service

Resolves employee identity and device groups in Entra ID.

| Method | Purpose |
|--------|---------|
| `resolveEmployeeIdentity(upn)` | Look up employee in Entra by UPN |
| `resolveDeviceGroup(groupName)` | Find or create device deployment group |
| `addDeviceToGroup(groupId, deviceObjectId)` | Add device to Entra group |
| `validateIdentityReadiness(employeeUpn)` | Preflight: employee exists and account is enabled |

## Microsoft Intune Service

Handles device enrollment status, compliance, and configuration.

| Method | Purpose |
|--------|---------|
| `checkIntuneReadiness()` | Verify connector configured and healthy |
| `getDeviceEnrollmentStatus(serialNumber)` | Check if device is known to Intune |
| `assignCompliancePolicy(deviceId, policyId)` | Assign compliance policy |
| `assignConfigurationProfile(deviceId, profileId)` | Assign configuration profile |
| `getDeviceComplianceState(deviceId)` | Current compliance status |
| `normalizeIntuneStatus(rawStatus)` | Normalize for SPFx display |

## Microsoft Autopilot Service

Handles Autopilot registration, profile assignment, and technician pre-provisioning.

| Method | Purpose |
|--------|---------|
| `checkAutopilotReadiness()` | Verify connector configured and healthy |
| `getAutopilotDevice(serialNumber)` | Look up device in Autopilot |
| `registerAutopilotDevice(serialNumber, hardwareHash)` | Register device |
| `assignAutopilotProfile(deviceId, profileId)` | Assign deployment profile |
| `getAutopilotProfileStatus(deviceId)` | Profile assignment status |
| `buildTechnicianPreProvisioningContext(deviceRunId, serialNumber)` | Build checkpoint context for technician |
| `normalizeAutopilotStatus(rawStatus)` | Normalize for SPFx display |

## Technician pre-provisioning model

Technician-assisted Windows pre-provisioning is a first-class checkpoint-capable flow:

1. Autopilot profile is assigned to the device
2. A `TechnicianPrep` checkpoint is created on the device run
3. Device run pauses in `AwaitingCheckpoint` status
4. The technician physically powers on the device and completes OOBE
5. The operator approves the checkpoint once the technician confirms ESP completion
6. Device run continues to NinjaOne standardization

The checkpoint maps to `AdminCheckpointCategory.ExternalEventWait` in the generalized model.

## Readiness probes

`runMicrosoftPreflightChecks()` validates before package launch:

| Check | Blocking | Description |
|-------|----------|-------------|
| `ms-intune-connector` | Yes | Intune connector configured and healthy |
| `ms-autopilot-connector` | Yes | Autopilot connector configured and healthy |
| `ms-graph-identity-connector` | Yes | Graph identity connector configured and healthy |
| `ms-graph-permissions` | Yes | Graph device management permissions confirmed |

## Connector requirements

| Connector class | Required for | Configuration |
|----------------|-------------|---------------|
| `microsoft-intune` | Intune enrollment and policy | App registration with Intune API permissions |
| `microsoft-autopilot` | Autopilot registration and profiles | Same or separate app reg with Autopilot permissions |
| `graph-identity` | User/group lookup | Existing Graph identity connector from Phase 9 |

## Ownership boundaries

| Responsibility | Owner |
|---------------|-------|
| Device identity and registration | Microsoft Entra ID |
| Autopilot profile assignment authority | Microsoft Autopilot service |
| Compliance policy enforcement | Microsoft Intune |
| Device enrollment state of record | Microsoft Intune |
| Orchestration and checkpoint coordination | HB Intel backend |
| Operator UX and status display | HB Intel SPFx |

## Adapter registry

Three adapters registered in the adapter registry:

| Adapter key | Category | Operations |
|-------------|----------|------------|
| `microsoft-intune:device-enrollment` | MicrosoftIntune | checkEnrollment, assignCompliancePolicy, assignConfigProfile, getComplianceState |
| `microsoft-autopilot:device-registration` | MicrosoftAutopilot | registerDevice, assignProfile, getProfileStatus, technicianPreProvision |
| `microsoft-identity:device-group` | MicrosoftIdentity | resolveIdentity, resolveGroup, addDeviceToGroup, validateReadiness |

## Cross-references

- [Architecture baseline](../../architecture/plans/MASTER/spfx/admin/white-glove/white-glove-architecture-baseline.md)
- [Domain model](white-glove-domain-model.md)
- [Connector governance](../configuration/white-glove-connector-governance.md)
- [Run spine](white-glove-run-spine.md)
