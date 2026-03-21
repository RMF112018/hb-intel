# P3-A2: Membership / Role Authority Contract

| Field | Value |
|---|---|
| **Doc ID** | P3-A2 |
| **Phase** | Phase 3 |
| **Workstream** | A — Shared-canonical Project Hub contracts |
| **Document Type** | Contract |
| **Owner** | Project Hub / Project Operations platform owner + Auth / Architecture |
| **Update Authority** | Architecture lead; changes require review by Auth lead and Experience lead |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 3 Plan §4, §8.2](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-A1](P3-A1-Project-Registry-and-Activation-Contract.md); [P2-D1](../phase-2-deliverables/P2-D1-Role-to-Hub-Entitlement-Matrix.md); [P2-B0](../phase-2-deliverables/P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [Entra ID Group Model](../../../reference/provisioning/entra-id-group-model.md); [current-state-map](../../../blueprint/current-state-map.md); [package-relationship-map](../../../blueprint/package-relationship-map.md) |

---

## Contract Statement

This contract establishes the canonical membership authority model, project role vocabulary, access eligibility rules, module visibility governance, and cross-lane membership consistency requirements for Phase 3 Project Hub.

Phase 3 uses a **hybrid membership authority** (Phase 3 plan §8.2):

- **Central auth / registry contracts** own canonical project access eligibility, effective Project Hub role context, module visibility / enablement, canvas defaults and locked tiles, and lane access decisions.
- **Site-local or module-local membership data** may exist as projection, cached, or subordinate data but may **not silently override** canonical Project Hub access truth.

This contract governs how a user's identity, system role, project membership, and Entra group membership combine to produce an effective project role context that determines what that user can see and do within a specific project.

**Repo-truth audit — 2026-03-20.** The repo contains a mature auth infrastructure (`@hbc/auth` v0.3.0) with system-level role mapping, permission resolution, feature gating, and access control override governance. Project membership types (`IProjectMember`, `IExternalMember`) exist in `@hbc/models` but are not yet wired into a project-scoped role resolution pipeline. The Entra three-group model (Leaders, Team, Viewers) is implemented in provisioning and maps to SharePoint permission levels. PH7 route-level membership checks use a `teamMemberUpns.includes()` pattern that must be formalized. See §5 for full reconciliation.

---

## Contract Scope

### This contract governs

- Who owns project membership decisions (authority model)
- The project role vocabulary and how it relates to system roles
- How project access eligibility is determined
- How effective project role context is resolved for a user within a project
- Module visibility and enablement rules by project role
- Canvas default and locked tile assignments by project role
- External member access authority and constraints
- Cross-lane membership consistency requirements
- Reconciliation of existing auth/membership types with the Phase 3 target model

### This contract does NOT govern

- Project registry identity, activation transaction, or site association rules — see [P3-A1](P3-A1-Project-Registry-and-Activation-Contract.md)
- Module publication into shared spines — see P3-A3 (Shared spine publication contract set)
- System-level role definitions, job-title mapping, or admin access control — governed by `@hbc/auth` and the access control backend
- Personal Work Hub entitlement (Phase 2 scope) — see [P2-D1](../phase-2-deliverables/P2-D1-Role-to-Hub-Entitlement-Matrix.md)
- Runtime auth store implementation — governed by `@hbc/auth` (`useAuthStore`, `usePermissionStore`)
- Provisioning saga implementation — governed by `@hbc/provisioning`

---

## Definitions

| Term | Meaning |
|---|---|
| **Membership authority** | The contract that determines who can decide whether a user has access to a project and at what role level |
| **System role** | A platform-wide role derived from the user's identity, job title, and Entra group membership (e.g., `Administrator`, `Executive`, `Member`); resolved by `mapIdentityToAppRoles()` |
| **Project role** | A project-scoped role that determines what a user can see and do within a specific project; derived from system role, Entra project group membership, and optional project-level override |
| **Effective project role context** | The resolved set of project-scoped permissions and visibility rules for a specific user within a specific project, after all inputs are combined |
| **Entra project group** | One of the three per-project Entra ID security groups created during provisioning: Leaders, Team, or Viewers |
| **Project-level role override** | An optional `projectRoleId` assigned to a specific user within a specific project that supplements or adjusts their default project role |
| **Module visibility** | Whether a user can see and access a specific Project Hub module (e.g., Financial, Safety, Reports) within a project |
| **Canvas defaults** | The initial tile arrangement on a user's project home canvas, determined by their effective project role |
| **External member** | A user outside the organization granted time-bounded, grant-scoped access to a specific project |
| **Subordinate membership data** | Project membership information stored in site-local or module-local surfaces that is derived from canonical membership but does not override it |

---

## 1. Current-State Reconciliation

### 1.1 Auth infrastructure (mature)

| Artifact | Location | Status | Key details |
|---|---|---|---|
| `@hbc/auth` | `packages/auth/` (v0.3.0) | **Mature** | Role mapping, permission resolution, feature gating, access control overrides, guards, hooks |
| `mapIdentityToAppRoles()` | `packages/auth/src/roleMapping.ts` | **Live** | Single seam: provider identity → `[Administrator, Executive, Member]` |
| `NormalizedAuthSession` | `packages/auth/src/types.ts` | **Live** | `resolvedRoles: string[]`, `permissionSummary`, `runtimeMode` |
| `FeaturePermissionRegistration` | `packages/auth/src/types.ts` | **Live** | Feature-level visibility and action gating with `StandardActionPermission` |
| `BaseRoleDefinition` | `packages/auth/src/types.ts` | **Live** | HB Intel system-of-record role with versioned grants |
| Access control overrides | `packages/auth/src/types.ts` | **Live** | `AccessControlOverrideRecord` with approval/expiration/audit |
| Guards | `packages/auth/src/index.ts` | **Live** | `RoleGate`, `FeatureGate`, `PermissionGate`, `ProtectedContentGuard` |
| Hooks | `packages/auth/src/hooks/index.ts` | **Live** | `useCurrentUser`, `usePermission`, `usePermissionEvaluation`, `useFeatureFlag` |

### 1.2 System role hierarchy (live)

| System Role | Level | Job Title Pattern |
|---|---|---|
| `SYSTEM_ADMIN` | 90 | Full administrative access |
| `EXECUTIVE` | 80 | Executive leadership |
| `PROJECT_EXECUTIVE` | 70 | Project executive oversight |
| `PROJECT_MANAGER` | 60 | Project management |
| `SUPERINTENDENT` | 50 | On-site superintendent |
| `PRECONSTRUCTION` | 40 | Estimating / preconstruction |
| `PROJECT_SUPPORT` | 30 | Project support / coordination |
| `OFFICE_STAFF` | 20 | Office administrative |
| `FIELD_STAFF` | 10 | Field operational |

**Note:** System roles are defined in `packages/models/src/auth/AuthEnums.ts` with job-title-to-role mapping in `IJobTitleMapping`. The Phase 2 hub role resolution pipeline (`mapIdentityToAppRoles()`) currently produces three canonical app roles (`Administrator`, `Executive`, `Member`) from provider hints. The system role hierarchy above exists for broader platform use but does not yet feed directly into the Phase 2 hub role pipeline.

### 1.3 Phase 2 hub roles (live)

| Hub Role | Resolution Source | Phase 2 Use |
|---|---|---|
| `Administrator` | `isSiteAdmin: true` OR `HB-Intel-Admins` group | Admin landing, full access |
| `Executive` | `HB-Intel-Executives` group | Executive landing, team view |
| `Member` | Default fallback | Standard member access |

These roles govern Personal Work Hub behavior (P2-D1). Phase 3 must extend — not replace — this vocabulary for project-scoped use.

### 1.4 Project membership types (live, not yet wired)

| Type | Location | Status |
|---|---|---|
| `IProjectMember` | `packages/models/src/auth/IProjectMembership.ts` | **Live** — `userId`, `projectId`, `displayName`, `email`, `projectRoleId?`, `addedAt`, `addedBy` |
| `IExternalMember` | `packages/models/src/auth/IProjectMembership.ts` | **Live** — `id`, `projectId`, `grants[]`, `invitedBy`, `invitedAt`, `expiresAt?`, `status` |
| `IExternalProjectAccess` | `packages/models/src/auth/IAuth.ts` | **Live** — per-user project access with grants and expiration |

**Gap:** These types exist but are not yet consumed by a project-scoped role resolution pipeline. PH7 route-level membership checks use `teamMemberUpns.includes()` directly (PH7-ProjectHub-2 §7.2.4) — a functional but ungoverned pattern.

### 1.5 Entra project groups (live)

| Group | SharePoint Permission Level | Initial Members |
|---|---|---|
| `HB-{projectNumber}-Leaders` | Full Control | `groupLeaders` UPNs + OpEx manager + fallback |
| `HB-{projectNumber}-Team` | Contribute | `groupMembers` UPNs + submitting user |
| `HB-{projectNumber}-Viewers` | Read | Department-specific background viewers |

Groups are created during provisioning Step 6 and stored as `IEntraGroupSet` in `IProvisioningStatus`. The group IDs are carried into the canonical project registry record (`entraGroupSet` field in P3-A1).

### 1.6 SPFx auth integration (live)

The SPFx project hub uses `resolveSpfxPermissions()` → `bootstrapSpfxAuth()` to bridge SharePoint page context into the shared `@hbc/auth` store. Both lanes consume unified auth infrastructure.

---

## 2. Membership Authority Model

### 2.1 Authority hierarchy

Phase 3 membership authority follows a strict hierarchy:

| Priority | Authority | Owns | Source |
|---|---|---|---|
| 1 | **Platform auth (`@hbc/auth`)** | System-level role resolution, session normalization, permission evaluation | `NormalizedAuthSession.resolvedRoles`, `permissionSummary` |
| 2 | **Project registry (P3-A1)** | Team anchor fields, `entraGroupSet`, activation-time membership seed | Registry record per P3-A1 §2.1 |
| 3 | **Central membership contract (this document)** | Project access eligibility, effective project role context, module visibility | Resolved at project-context entry time |
| 4 | **Project-level overrides** | Per-user `projectRoleId` adjustments within a project | `IProjectMember.projectRoleId` |
| 5 | **Site-local / module-local data** | Subordinate projection of canonical membership for performance or host-specific rendering | SharePoint group membership, site permissions |

### 2.2 Subordination rule

Site-local or module-local membership data (e.g., SharePoint group membership, module-local caches) may exist for performance, host-specific rendering, or offline resilience. This data is **subordinate** and MUST NOT:

- silently override canonical project access eligibility,
- create membership grants that do not exist in the central contract,
- remove or restrict access that the central contract grants,
- or introduce role semantics that diverge from the project role vocabulary defined in §3.

If a discrepancy is detected between subordinate and canonical membership, the canonical source wins. Subordinate data SHOULD be re-synchronized rather than treated as authoritative.

---

## 3. Project Role Vocabulary

### 3.1 Project role taxonomy

Phase 3 introduces a **project role** layer that is distinct from system roles. Project roles determine what a user can see and do within a specific project. They are resolved from multiple inputs, not assigned independently.

| Project Role | Derived From | Project Hub Capabilities |
|---|---|---|
| **Project Administrator** | System role `Administrator` OR `SYSTEM_ADMIN` | Full project access, all modules, canvas governance, membership management, reporting release |
| **Project Executive** | System role `Executive` OR `PROJECT_EXECUTIVE` level AND project membership | Health visibility, reporting, activity oversight, canvas with executive defaults |
| **Project Manager** | `PROJECT_MANAGER` level AND Leaders group membership OR explicit PM team anchor | Full module access, canvas governance, report authoring, membership management |
| **Superintendent** | `SUPERINTENDENT` level AND Leaders/Team group membership | Full module access (field-oriented), safety authority, canvas with field defaults |
| **Project Team Member** | Team group membership OR explicit `IProjectMember` record | Standard module access, work queue participation, canvas with team defaults |
| **Project Viewer** | Viewers group membership only | Read-only access to approved modules, no work queue participation |
| **External Contributor** | `IExternalMember` record with active status | Grant-scoped access to specific modules/actions per `grants[]`, time-bounded |

### 3.2 Role resolution pipeline

For a given user entering a project context, the effective project role is resolved as follows:

1. **Start with system role.** Read `resolvedRoles` from `NormalizedAuthSession`.
2. **Check project membership.** Look up the user in project membership records (`IProjectMember` or `IExternalMember`).
3. **Check Entra group membership.** Determine if the user is in the project's Leaders, Team, or Viewers group via `entraGroupSet`.
4. **Check team anchor fields.** Determine if the user is a named team anchor (PM, Superintendent, PX) in the registry record.
5. **Apply project-level override.** If `IProjectMember.projectRoleId` is set, apply the override.
6. **Resolve effective project role.** Combine all inputs using the precedence in §3.3.
7. **Evaluate module visibility.** Apply the module visibility matrix (§4) to the resolved role.

### 3.3 Role precedence rules

When a user qualifies for multiple project roles, the **highest-capability role** wins:

1. Project Administrator (highest)
2. Project Executive
3. Project Manager
4. Superintendent
5. Project Team Member
6. Project Viewer
7. External Contributor (lowest, grant-scoped)

A user MUST NOT be assigned conflicting roles within the same project. The resolution pipeline always produces a single effective project role.

### 3.4 Relationship to Phase 2 hub roles

Phase 2 hub roles (`Administrator`, `Executive`, `Member`) govern **Personal Work Hub** behavior and are resolved at the platform level. Phase 3 project roles govern **Project Hub** behavior and are resolved at the project level.

| Phase 2 Hub Role | Default Phase 3 Project Role (when project-member) | Notes |
|---|---|---|
| `Administrator` | Project Administrator | Bypasses project membership checks |
| `Executive` | Project Executive | Requires project membership for non-admin access |
| `Member` | Determined by group membership and team anchors | Most users resolve here |

Phase 3 project roles **extend** Phase 2 hub roles — they do not replace them. A user's Phase 2 hub role continues to govern Personal Work Hub behavior regardless of their project role.

---

## 4. Module Visibility and Enablement Rules

### 4.1 Module visibility matrix

Module visibility is determined by the user's effective project role. Modules are classified as **visible** (can see and interact), **read-only** (can see but not modify), or **hidden** (not rendered).

| Module | Project Admin | Project Executive | Project Manager | Superintendent | Team Member | Viewer | External |
|---|---|---|---|---|---|---|---|
| Home / Canvas | Visible | Visible | Visible | Visible | Visible | Visible | Visible |
| Project Health | Visible | Visible | Visible | Visible | Visible | Read-only | Grant-scoped |
| Activity | Visible | Visible | Visible | Visible | Visible | Read-only | Grant-scoped |
| Related Items | Visible | Visible | Visible | Visible | Visible | Read-only | Hidden |
| Work Queue | Visible | Visible | Visible | Visible | Visible | Hidden | Hidden |
| Financial | Visible | Visible | Visible | Read-only | Grant-scoped | Hidden | Hidden |
| Schedule | Visible | Visible | Visible | Visible | Visible | Read-only | Grant-scoped |
| Constraints | Visible | Visible | Visible | Visible | Visible | Read-only | Hidden |
| Permits | Visible | Visible | Visible | Visible | Visible | Read-only | Hidden |
| Reports | Visible | Visible | Visible | Read-only | Read-only | Hidden | Hidden |
| Safety | Visible | Visible | Visible | Visible | Visible | Read-only | Hidden |

**Notes:**
- **Grant-scoped** means the module is visible only if the user's `grants[]` include the relevant module permission.
- Financial is restricted for Superintendent and below because financial data has a higher sensitivity classification.
- This matrix is a first-release baseline. Module visibility MAY be refined through `FeaturePermissionRegistration` as implementation matures.

### 4.2 Feature permission integration

Module visibility SHOULD be implemented using the existing `FeaturePermissionRegistration` pattern from `@hbc/auth`:

- Each Project Hub module registers a `featureId` with `requiredFeatureGrants` and `actionGrants`.
- The `FeatureAccessEvaluation` output (`visible`, `allowed`, `locked`) determines rendering behavior.
- Project role → permission grant mapping is maintained as a governed configuration, not hard-coded.

### 4.3 Action-level permissions

Within visible modules, action-level permissions follow the `StandardActionPermission` vocabulary:

| Action | Meaning in Project Hub context |
|---|---|
| `view` | Can see module data |
| `create` | Can create new records (constraints, permits, safety items, etc.) |
| `edit` | Can modify existing records |
| `approve` | Can approve/release reports, sign off on checklists |
| `admin` | Can manage module configuration, membership within module scope |

---

## 5. Canvas Defaults and Locked Tiles by Role

### 5.1 Default canvas assignment

Every project role receives a default canvas tile arrangement on the project home page. Canvas governance is fully defined in P3-C1 (Project Canvas Governance Note) — this section specifies only the role-based defaults and locked tile rules.

| Project Role | Mandatory Locked Tiles | Role-Default Tiles | Optional Tiles |
|---|---|---|---|
| Project Administrator | Identity header, Health, Work Queue, Activity | All module tiles | Full optional catalog |
| Project Executive | Identity header, Health, Activity | Reports, Financial summary | Subset of optional catalog |
| Project Manager | Identity header, Health, Work Queue, Activity | All module tiles | Full optional catalog |
| Superintendent | Identity header, Health, Work Queue, Activity, Safety | Schedule, Permits, Constraints | Field-oriented optional catalog |
| Project Team Member | Identity header, Health, Work Queue, Activity | Schedule, Related Items | Subset of optional catalog |
| Project Viewer | Identity header, Health, Activity | — | — |
| External Contributor | Identity header | Grant-scoped tiles only | — |

### 5.2 Locked tile rules

- **Mandatory locked tiles** MUST appear on every canvas for the given role and MUST NOT be removed or hidden by the user.
- The identity header and Health tiles are **locked for all roles** per Phase 3 plan §9.3.
- Locked tile governance applies equally in both lanes per the canvas governance rules in P3-C1.

---

## 6. Project Access Eligibility Rules

### 6.1 Who may access a project

A user is eligible to access a project in Project Hub if ANY of the following are true:

| Eligibility Path | Source | Result |
|---|---|---|
| User has system role `Administrator` | `NormalizedAuthSession.resolvedRoles` | Project Administrator — bypasses per-project membership |
| User is a named team anchor in the registry | P3-A1 registry record (PM, Superintendent, PX UPNs) | Project role per team anchor type |
| User is in a project Entra group | `entraGroupSet` (Leaders, Team, or Viewers) | Project role per group type |
| User has an `IProjectMember` record | Central membership data | Project role per `projectRoleId` or group membership |
| User has an active `IExternalMember` record | Central membership data | External Contributor with grant-scoped access |

### 6.2 Who may NOT access a project

A user who satisfies NONE of the eligibility paths in §6.1 MUST NOT be granted access to any project-scoped surface. The system MUST redirect non-members to the project selector or an appropriate access-denied state.

This rule applies in both lanes:
- **PWA:** Route-level membership check before rendering project-scoped pages.
- **SPFx:** Site context resolution must confirm the user is a member of the project's Entra groups or has explicit membership.

### 6.3 Administrator bypass

Users with system role `Administrator` bypass per-project membership checks and receive Project Administrator capabilities in all projects. This is consistent with the Phase 2 admin override pattern and the PH7 route-level check (`user.role !== 'Admin'` bypass in PH7-ProjectHub-2 §7.2.4).

---

## 7. External Member Authority

### 7.1 External member model

External members (`IExternalMember`) have project-scoped access that is:

- **Grant-scoped:** Access is limited to specific permissions in `grants[]`. No system roles apply.
- **Time-bounded:** `expiresAt` governs access expiration. Expired members MUST be denied access.
- **Status-gated:** Only members with `status: 'active'` receive access. `expired` and `revoked` members are denied.
- **Project-specific:** Each `IExternalMember` record is scoped to a single `projectId`. Cross-project access requires separate records.

### 7.2 External member capabilities

- External members MUST NOT receive system roles, project-level role overrides, or Entra group membership.
- External members MAY access modules where their `grants[]` include the module's required permission.
- External members MUST NOT access Financial, Reports, Work Queue, Related Items, Constraints, or Permits modules unless explicitly granted.
- External members MUST NOT participate in membership management, report approval, or canvas governance.

### 7.3 External member lifecycle

| Event | Authority | Action |
|---|---|---|
| Invitation | Project Manager or Project Administrator | Creates `IExternalMember` record with grants and optional expiration |
| Access | Central membership contract | Validated on every project-scoped request |
| Renewal | Project Manager or Project Administrator | Extends `expiresAt` |
| Revocation | Project Manager, Project Administrator, or system process | Sets `status: 'revoked'` |
| Expiration | System process | Sets `status: 'expired'` when `expiresAt` is passed |

---

## 8. Cross-Lane Membership Consistency Rules

The following MUST remain consistent across both the PWA and SPFx lanes:

1. **Same membership source.** Both lanes MUST resolve project membership from the same canonical membership data. Neither lane may maintain a shadow membership registry.
2. **Same eligibility resolution.** Given the same user and project, both lanes MUST resolve the same access eligibility (granted or denied).
3. **Same effective role.** Given the same user and project, both lanes MUST resolve the same effective project role.
4. **Same module visibility.** The module visibility matrix (§4.1) applies equally in both lanes. Lane-specific depth differences (PWA richer, SPFx broader companion) are governed by the lane capability matrix (P3-G1), not by different membership rules.
5. **Same external member treatment.** External member access rules apply equally in both lanes.
6. **Shared auth infrastructure.** Both lanes consume `@hbc/auth` for system-level role resolution. Neither lane may introduce a parallel auth pipeline.

---

## 9. Repo-Truth Reconciliation Notes

The following reconciliations are locked for Phase 3 and MUST be honored in downstream design and implementation reviews:

1. **`IProjectMember` not yet wired to project role resolution — controlled evolution**
   `IProjectMember` exists in `packages/models/src/auth/IProjectMembership.ts` with a `projectRoleId` field, but no project-scoped role resolution pipeline consumes it. The role resolution pipeline defined in §3.2 is target-state. Classified as **controlled evolution**.

2. **PH7 `teamMemberUpns.includes()` check — compliant, requires formalization**
   PH7-ProjectHub-2 §7.2.4 defines a route-level membership check using `teamMemberUpns.includes(user.upn)`. This is functionally correct but does not account for Entra group resolution, external members, or role-based module visibility. Phase 3 must formalize this into the eligibility rules in §6 while preserving the intent.

3. **System role hierarchy not yet integrated with project roles — controlled evolution**
   The nine-level system role hierarchy in `AuthEnums.ts` (`SYSTEM_ADMIN` through `FIELD_STAFF`) exists but does not currently feed into project role resolution. Phase 2 hub roles (`Administrator`, `Executive`, `Member`) are resolved from provider hints, not from the system role hierarchy. Phase 3 project roles (§3) bridge this gap by mapping system role levels to project role capabilities. This is **controlled evolution**.

4. **`FeaturePermissionRegistration` not yet used for project modules — controlled evolution**
   The feature permission registration pattern exists in `@hbc/auth` but no Project Hub modules are registered. Module visibility in §4 should be implemented using this pattern. Classified as **controlled evolution**.

5. **Entra group-to-project-role mapping not yet implemented — controlled evolution**
   Entra project groups (Leaders, Team, Viewers) are created during provisioning and stored in `IEntraGroupSet`, but no runtime pipeline resolves group membership into project roles. The mapping defined in §3.1 and §6.1 is target-state. Classified as **controlled evolution**.

6. **SPFx permission resolution — compliant, scope-limited**
   `resolveSpfxPermissions()` in the SPFx project hub webpart bridges SharePoint page context into `@hbc/auth`. This is **compliant** with the cross-lane consistency requirement (§8) but currently resolves only system-level permissions, not project-scoped membership. Extension to project-scoped resolution is required.

7. **External member access not yet implemented — controlled evolution**
   `IExternalMember` and `IExternalProjectAccess` types exist but no access validation pipeline consumes them. The external member authority defined in §7 is target-state. Classified as **controlled evolution**.

---

## 10. Acceptance Gate Reference

**Gate:** Role-governance gate (Phase 3 plan §18.1, §18.5 — cross-lane and core module components)

| Field | Value |
|---|---|
| **Pass condition** | Project membership is resolved from canonical sources; effective project role determines module visibility consistently across both lanes; no parallel role logic exists outside `@hbc/auth` |
| **Evidence required** | P3-A2 (this document), project role resolution implementation, module visibility enforcement, cross-lane membership consistency tests, external member access validation |
| **Primary owner** | Auth / Architecture + Project Hub platform owner |

---

## 11. Policy Precedence

This contract establishes the **membership and role authority foundation** that downstream Phase 3 deliverables must conform to:

| Deliverable | Relationship to P3-A2 |
|---|---|
| **P3-A1** — Project Registry and Activation Contract | Provides team anchor fields and `entraGroupSet` consumed by the role resolution pipeline (§3.2) |
| **P3-A3** — Shared Spine Publication Contract Set | Must use project membership context to determine publication visibility per project |
| **P3-C1** — Project Canvas Governance Note | Must implement canvas defaults by project role per §5 |
| **P3-C2** — Mandatory Core Tile Family Definition | Must respect module visibility matrix (§4.1) for tile rendering |
| **P3-E1** — Module Classification Matrix | Must align module visibility with this contract's matrix |
| **P3-E2** — Module Source-of-Truth / Action-Boundary Matrix | Must use `StandardActionPermission` vocabulary per §4.3 |
| **P3-G1** — PWA / SPFx Capability Matrix | Must respect cross-lane membership consistency (§8); lane depth differences must not create membership divergence |
| **P3-H1** — Acceptance Checklist | Must include membership and role governance gate evidence |
| **Any implementation artifact** | Must use `@hbc/auth` infrastructure for role and permission resolution; no parallel auth pipelines |

If a downstream deliverable conflicts with this contract, this contract takes precedence unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 3 Plan §8.2](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
