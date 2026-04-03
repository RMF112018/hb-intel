# Provisioning Readiness Dependency Integration

## Purpose

Documents the P7-07 integration of provisioning launch readiness with install/bootstrap and Entra setup prerequisites. Provisioning prelaunch validation now explicitly checks upstream dependencies instead of discovering them mid-saga.

## Problem

Before P7-07, provisioning prelaunch validation checked provisioning-specific env vars (Graph permission, SharePoint URLs, hub site, app catalog, SPFx app ID, OpEx manager) and request data completeness. It had no awareness of whether:

- The install/bootstrap process had deployed Azure resources (Table Storage, App Insights)
- The Entra app registration had been created (AZURE_CLIENT_ID, API_AUDIENCE)
- Department-specific viewer UPNs were configured for Entra group creation

This meant missing bootstrap prerequisites were discovered as obscure mid-saga failures rather than as clear prelaunch blocks.

## New validation categories

### Bootstrap (`'bootstrap'`)

Checks that install/bootstrap infrastructure is configured. These env vars are set by the install orchestrator (P6-05/06/07) during the "Deploy Azure Resources" and "Create Entra App Registration" install steps.

| Check code | Env var | Install step |
|-----------|---------|-------------|
| `BOOTSTRAP_MISSING_TABLE_ENDPOINT` | `AZURE_TABLE_ENDPOINT` | Deploy Azure Resources |
| `BOOTSTRAP_MISSING_CLIENT_ID` | `AZURE_CLIENT_ID` | Create Entra App Registration |
| `BOOTSTRAP_MISSING_API_AUDIENCE` | `API_AUDIENCE` | Create Entra App Registration |
| `BOOTSTRAP_MISSING_APP_INSIGHTS` | `APPLICATIONINSIGHTS_CONNECTION_STRING` | Deploy Azure Resources |

Remediation for all bootstrap failures directs operators to run the install/setup wizard.

### Entra readiness (`'entra-readiness'`)

Checks that Entra group creation prerequisites are satisfied for the specific request.

| Check code | Condition | Impact |
|-----------|-----------|--------|
| `ENTRA_MISSING_DEPT_VIEWER_CONFIG` | `department` is set on request but `DEPT_BACKGROUND_ACCESS_{DEPARTMENT}` env var is missing | Step 6 creates a Viewers group with empty membership instead of the expected department viewers |

This check uses the same env var naming convention as `getDepartmentBackgroundViewers()` in `entra-group-definitions.ts`: `DEPT_BACKGROUND_ACCESS_{DEPARTMENT}` where the department name is uppercased with hyphens replaced by underscores.

## Validation behavior

- Bootstrap checks run only in non-mock/non-test mode (same gate as environment prerequisite checks)
- Entra readiness checks run only when the relevant condition exists on the request (e.g., department is set) and only in non-mock/non-test mode
- All new checks follow the existing `IPrelaunchFailure` contract: machine-readable code, category, human-readable message, operator remediation
- Healthy runs are unaffected — when all prerequisites are satisfied, provisioning launches cleanly

## Relationship to install/bootstrap infrastructure

| Layer | Responsibility | Checks |
|-------|---------------|--------|
| **Install preflight** (`preflight-service.ts`) | Pre-install readiness for the setup wizard | 6 check categories: backend config, auth identity, SharePoint, Graph/Entra, persistence, install compatibility |
| **Install verification** (`install-verification-service.ts`) | Post-install health checks | Function App health, Table Storage, Graph API, SharePoint, SPFx package, API permissions |
| **Provisioning prelaunch** (`prelaunch-validation.ts`) | Pre-saga readiness for provisioning launch | Environment prerequisites + bootstrap prerequisites + request data + Entra readiness |
| **Health endpoint** (`/health`) | Runtime operational readiness | Tiered config diagnostics (core, SharePoint, provisioning, integrations) |

These layers are complementary, not redundant:
- Install preflight answers "can we start the install?"
- Install verification answers "did the install succeed?"
- Provisioning prelaunch answers "can we launch a provisioning saga?"
- Health endpoint answers "is the function app operational?"

## Implementation location

- Prelaunch validation: `backend/functions/src/functions/provisioningSaga/prelaunch-validation.ts`
- Tests: `backend/functions/src/functions/provisioningSaga/__tests__/prelaunch-validation.test.ts`
- Entra group definitions: `backend/functions/src/config/entra-group-definitions.ts` (reference, not modified)
