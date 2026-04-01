# Gap 6 Final Field Semantics

## Purpose

This document is the definitive reference for the post-Gap-6 field model for the Project Setup / Estimating solution. It defines the current intended meaning and storage location of the key fields affected by Gap 6 closure.

## Retained Fields

### `groupMembers`
- **Meaning:** Standard read/write site members — the core project team.
- **Derivation:** During form normalization, `groupMembers` is computed as the union of `projectManagerUpn`, `leadEstimatorUpn`, and `supportingEstimatorUpns`. It is not directly entered by the user in the estimating wizard.
- **SP column:** `field_10` (internal name; display name `GroupMembersJson`)
- **SP type:** Note (MultiLineText). JSON-serialized `string[]`.
- **Provisioning role:** Populates the **Team** Entra ID security group (Contribute access).

### `groupLeaders`
- **Meaning:** Elevated workflow/project leaders — not a generic membership catchall.
- **Derivation:** During form normalization, derived from `projectExecutiveUpn` (single person → single-element array).
- **SP column:** `field_11` (internal name; display name `GroupLeadersJson`)
- **SP type:** Note (MultiLineText). JSON-serialized `string[]`.
- **Provisioning role:** Populates the **Leaders** Entra ID security group (Full Control access), along with `OPEX_MANAGER_UPN`.

### `viewerUPNs`
- **Meaning:** Project-level additive read-only exceptions only. Individual UPNs granted read-only access beyond the department default viewer groups.
- **SP column:** `viewerUPNs` (named column — not the legacy `field_18`)
- **SP type:** Note (MultiLineText). JSON-serialized `string[]`.
- **Provisioning role:** Not yet wired into provisioning. Intended to supplement department default viewer groups as additive individual-level exceptions.
- **Important:** This is NOT the full effective viewer audience. See "Effective Viewer Model" below.

### `leadEstimatorUpn`
- **Meaning:** The lead estimator assigned to the project. This is the authoritative replacement for the retired `projectLeadId` concept.
- **SP column:** `leadEstimatorUpn` (named column, P2-07)
- **SP type:** Text.
- **Note:** `projectLeadId` was a legacy alias for the project manager role. In the current model, the PM role is explicitly `projectManagerUpn` and the lead estimator role is explicitly `leadEstimatorUpn`. Both exist as first-class fields.

### `addOns`
- **Meaning:** Selected add-on pack slugs for the project (e.g., `'bid-board'`, `'drawing-log'`).
- **SP column:** `addOns` (named column — not the legacy `field_19`)
- **SP type:** Note (MultiLineText). JSON-serialized `string[]`.

### Department default viewer groups (`projectViewerGroups` list)
- **Meaning:** Department-based default read-only audience policy. Each department row maps to a set of Entra ID security group IDs that should receive read-only access on all project sites in that department.
- **SP list:** `projectViewerGroups` (separate list on HBCentral)
- **Key fields:** `Title` (department key), `DefaultViewerGroupIdsJson` (Note, JSON array of group IDs), `IsActive` (Choice)
- **Provisioning role:** Not yet wired. Currently, department background viewers are read from `DEPT_BACKGROUND_ACCESS_{DEPT}` environment variables. The `projectViewerGroups` adapter is ready but deferred until list data is populated.

## Effective Viewer Model

Effective read-only membership for a provisioned project site is:

```
department default viewer groups (from projectViewerGroups list)
  + project-level viewerUPNs exceptions (from Projects list)
```

Neither source alone represents the full viewer audience.

## Retired Fields

### `projectLeadId` — REMOVED (P9-G6-02)
- **Reason:** Superseded by `leadEstimatorUpn` at the business level. In code, `projectLeadId` was a legacy alias for the project manager role — all usages replaced with `projectManagerUpn`.
- **SP column:** `field_17` — intentionally absent from live schema; never created.

### `additionalTeamMemberUpns` — REMOVED (P9-G6-02)
- **Reason:** Overlapped with `groupMembers`. The `groupMembers` field is now the single authoritative field for standard read/write project team members, derived from the defined role fields during normalization.
- **SP column:** Removed from live schema.
