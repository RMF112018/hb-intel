# Entra ID Group Model — Project Site Permissions

**Traceability:** W0-G1-T02
**Classification:** Living Reference (Diátaxis Reference quadrant)

## Three-Group Model

Every provisioned HB Intel project site receives three Entra ID security groups that map to SharePoint permission levels:

| Group Suffix | SharePoint Permission Level | Purpose |
|---|---|---|
| `Leaders` | Full Control | Project leaders — full administrative access to the project site |
| `Team` | Contribute | Team members — can create, edit, and delete content |
| `Viewers` | Read | Background viewers — read-only access for department oversight |

## Naming Convention

Groups follow the pattern:

```
HB-{projectNumber}-{roleSuffix}
```

Examples:
- `HB-25-001-01-Leaders`
- `HB-25-001-01-Team`
- `HB-25-001-01-Viewers`

The `buildGroupDisplayName(projectNumber, roleSuffix)` function in `backend/functions/src/config/entra-group-definitions.ts` enforces this convention.

## Initial Membership

When a project site is provisioned, groups are populated with the following initial members:

### Leaders Group
- All UPNs from `groupLeaders` (the project leaders designated in the setup request)
- The OpEx manager UPN (`OPEX_MANAGER_UPN` env var)
- **Fallback:** If `groupLeaders` is empty, the `triggeredBy` user is added as the initial leader

### Team Group
- All UPNs from `groupMembers` (the team members designated in the setup request)
- The `submittedBy` user (Estimating Coordinator who submitted the request)

### Viewers Group
- Department-specific background viewers read from `DEPT_BACKGROUND_ACCESS_{DEPARTMENT}` env var
- Returns an empty set if no department is specified or the env var is not configured

## Field Additions (IProvisioning Model)

T02 adds the following optional fields to the provisioning model interfaces:

| Field | Interface | Type | Purpose |
|---|---|---|---|
| `groupLeaders` | `IProvisionSiteRequest`, `IProvisioningStatus`, `IProjectSetupRequest` | `string[]` | UPNs for the Leaders group |
| `department` | `IProvisionSiteRequest`, `IProvisioningStatus`, `IProjectSetupRequest` | `ProjectDepartment` | Department for background viewer lookup |
| `entraGroups` | `IProvisioningStatus` | `IEntraGroupSet` | Stores created group IDs for post-provisioning management |

All fields are optional to preserve backward compatibility with existing callers and stored records.

## Lifecycle Events

### Creation (Step 6 — Set Permissions)
1. For each group definition, attempt `getGroupByDisplayName` for idempotency
2. If not found, call `createSecurityGroup` with the interpolated display name and description
3. Populate initial members via `addGroupMembers`
4. Assign each group to its SharePoint permission level via `assignGroupToPermissionLevel`
5. Store the three group IDs in `status.entraGroups`

### Deletion / Compensation
Group deletion is **not yet implemented** (documented compensation gap). Site deletion (Step 1 compensation) removes SharePoint permission assignments but does not delete the Entra ID groups themselves. This gap is acceptable for Wave 0 because:
- Orphaned groups are inert (no site to access)
- Manual cleanup is feasible at current project volume
- Automated group cleanup is planned for a future wave

## Graph API Scope

The `GraphService` requires `Group.ReadWrite.All` application permission in Entra ID. This consent is tracked as a G2 dependency (T05). Until T05 is complete:
- `GraphService` (real) throws "G2 pending" errors on all methods
- `MockGraphService` provides a functional in-memory implementation for tests and mock mode

For the full permission model (Sites.Selected vs. FullControl fallback), staging validation test cases, and IT/Security engagement guidance, see [Sites.Selected Validation](../configuration/sites-selected-validation.md).

## Auth Boundary

Per T02 §@hbc/auth Authorization Boundary, this implementation does **not** modify `packages/auth/`. The Entra ID group model operates at the backend provisioning layer only. Frontend authorization continues to use the existing `@hbc/auth` dual-mode system.

## Department Background Access

Department background viewers are configured via environment variables:

| Env Var | Department | Value |
|---|---|---|
| `DEPT_BACKGROUND_ACCESS_COMMERCIAL` | `commercial` | Comma-separated UPNs |
| `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL` | `luxury-residential` | Comma-separated UPNs |

The `getDepartmentBackgroundViewers(department)` function handles the env var lookup and parsing.

## Config Reference

| File | Contents |
|---|---|
| `backend/functions/src/config/entra-group-definitions.ts` | Group definitions, naming functions, department viewer lookup |
| `backend/functions/src/services/graph-service.ts` | `IGraphService` interface, `GraphService` (scaffold), `MockGraphService` |
| `packages/models/src/provisioning/IProvisioning.ts` | `ProjectDepartment`, `IEntraGroupSet`, updated request/status interfaces |
| `backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts` | Three-group creation, membership, and SharePoint assignment logic |
