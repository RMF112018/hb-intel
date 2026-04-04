# White-Glove Tenant Prerequisites

## Purpose

IT-facing guide for preparing the tenant environment before using the white-glove employee device deployment feature. After `.sppkg` delivery, IT must complete these steps without code edits.

## Prerequisites by platform

### Microsoft (Intune / Autopilot / Entra)

| Requirement | Action | Verified by |
|-------------|--------|-------------|
| Entra app registration | Register an app with Intune and Graph API permissions | Connector readiness probe |
| Admin consent | Grant admin consent for the app registration | Connector test action |
| Intune license | Ensure Intune licenses are assigned to target users | Manual verification |
| Autopilot profiles | Create deployment profiles in Intune for white-glove pre-provisioning | Autopilot readiness probe |
| Device registration | Register target device hardware hashes in Autopilot | Autopilot device lookup |
| Entra groups | Ensure device management groups exist or will be auto-created | Identity readiness probe |

### Apple (ABM / ADE / APNs)

| Requirement | Action | Verified by |
|-------------|--------|-------------|
| ABM enrollment | Enroll in Apple Business Manager | ABM connector readiness |
| ABM server token | Upload ABM server token to the connector | ABM token validation |
| ADE configuration | Configure Automated Device Enrollment profiles | ADE readiness probe |
| APNs certificate | Upload APNs certificate for Intune MDM | APNs connector readiness |
| Device serial numbers | Ensure devices are purchased through ABM and assigned to the MDM server | ABM device assignment lookup |
| Supervised profiles | Configure supervised enrollment profiles for iPhone and iPad | ADE posture validation |

### NinjaOne

| Requirement | Action | Verified by |
|-------------|--------|-------------|
| NinjaOne account | Active NinjaOne tenant with API access | API readiness probe |
| OAuth credentials | Configure API client ID and secret | Connector test action |
| Policy bundles | Create baseline policy bundles for each platform | Manual verification |
| Software bundles | Create standard software bundles for Windows and macOS | Manual verification |
| Automation scripts | Upload post-enrollment configuration scripts | Manual verification |
| Validation scripts | Upload validation check scripts | Manual verification |

## First-use readiness workflow

1. **Deploy the Admin SPFx app** (`.sppkg` installation via Setup wizard)
2. **Navigate to WG Connections** (`/white-glove/connections`)
3. **Configure each connector:**
   - Microsoft Intune → provide app registration details
   - Microsoft Autopilot → provide Autopilot-specific credentials
   - Apple ABM → upload server token
   - Apple ADE → configure enrollment profile details
   - Apple APNs → upload APNs certificate details
   - NinjaOne → provide OAuth client credentials
4. **Test each connector** using the "Test Connection" button
5. **Navigate to WG Readiness** (`/white-glove/readiness`)
6. **Run readiness check** — all connector checks must pass
7. **Verify package templates** — 6 families should be visible in WG Standards
8. **Launch a test package** (dry-run if available) to verify the full workflow

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---------|-------------|------------|
| Connector shows "untested" | Connector configured but never tested | Click "Test Connection" |
| Connector shows "unhealthy" | Credentials expired or API unreachable | Verify credentials, check network, re-test |
| Readiness check fails on connector | Connector not configured | Configure the connector in WG Connections |
| Readiness check fails on permissions | Graph permissions not consented | Grant admin consent in Entra portal |
| ABM device not found | Device not purchased through ABM | Verify ABM device list in Apple Business Manager |
| Autopilot device not found | Hardware hash not registered | Register device in Intune Autopilot |
| NinjaOne API error | OAuth token invalid or expired | Reconfigure NinjaOne credentials |

## Environment separation

| Setting | Development | Staging | Production |
|---------|------------|---------|-----------|
| Adapter mode | `mock` | `proxy` | `proxy` |
| Connector credentials | Test values | Staging tenant | Production tenant |
| Package launches | Simulated | Staging devices | Real employee devices |

## Cross-references

- [Connector Governance Reference](../reference/configuration/white-glove-connector-governance.md)
- [White-Glove Architecture Index](../architecture/plans/MASTER/spfx/admin/white-glove/README.md)
- [IT Department Setup Guide](../architecture/plans/MASTER/spfx/admin/phase-09.1/IT-Department-Setup-and-Enablement-Guide.md)
