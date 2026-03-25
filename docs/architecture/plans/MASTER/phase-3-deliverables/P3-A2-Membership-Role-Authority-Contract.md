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

This contract establishes the canonical membership authority model, project role vocabulary, access eligibility rules, leadership scope model, executive review authority posture, module visibility governance, override governance, reclassification consequences, and cross-lane membership consistency requirements for Phase 3 Project Hub.

Phase 3 uses a **hybrid membership authority** (Phase 3 plan §8.2):

- **Central auth / registry contracts** own canonical project access eligibility, effective Project Hub role context, module visibility / enablement, canvas defaults and locked tiles, and lane access decisions.
- **Site-local or module-local membership data** may exist as projection, cached, or subordinate data but may **not silently override** canonical Project Hub access truth.

This contract governs how a user's identity, system role, project membership, and Entra group membership combine to produce an effective project role context that determines what that user can see and do within a specific project.

### Authority split — three-tier leadership model

Phase 3 replaces the coarse `Executive` platform role with a precise three-tier model for project oversight and membership:

| Tier | Role | Scope | Nature |
|---|---|---|---|
| 1 | **Leadership** | Company-level or department-level visibility | Platform-level posture; not project membership |
| 2 | **Portfolio Executive Reviewer** | Projects within governed business scope | Non-member oversight posture derived from Leadership eligibility; governed read + annotation + push authority |
| 3 | **Project Executive** | A specific project; named in the registry or Teams group | True project-member authority within project scope |

- **Leadership** is a company-level classification based on position and department.
- **Portfolio Executive Reviewer** is the non-member leadership-derived project oversight posture. It is NOT project membership and does NOT confer operational source-record write authority by default.
- **Project Executive** is the true project-member, project-scoped authority role.

**Repo-truth audit — 2026-03-20.** The repo contains a mature auth infrastructure (`@hbc/auth` v0.3.0) with system-level role mapping, permission resolution, feature gating, and access control override governance. Project membership types (`IProjectMember`, `IExternalMember`) exist in `@hbc/models` but are not yet wired into a project-scoped role resolution pipeline. The Entra three-group model (Leaders, Team, Viewers) is implemented in provisioning and maps to SharePoint permission levels. PH7 route-level membership checks use a `teamMemberUpns.includes()` pattern that must be formalized. The three-tier leadership model defined in this contract is target-state. See §5 for full reconciliation.

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
| **Leadership** | Company-level or business-line/department leadership tier; C-suite or equivalent; eligibility basis for Portfolio Executive Reviewer posture |
| **Portfolio Executive Reviewer (PER)** | The non-member leadership-derived project oversight posture; governed read-heavy + limited annotation + push + report-review-run authority within business scope |
| **Project Executive (PE)** | The true project-member project-scoped authority role; named in the project registry as `projectExecutiveUpn` or in the Leaders Entra group |
| **Governed business scope** | The set of projects accessible to a given Portfolio Executive Reviewer; derived from their department assignment or C-suite breadth |
| **Out-of-scope override** | A central time-bounded override record granting a Portfolio Executive Reviewer posture to a project outside their normal governed business scope |
| **Designated leadership approver** | A fixed named role permitted to approve out-of-scope overrides within their governed business scope; only Manager of Operational Excellence may approve company-wide |
| **Authority loss** | The condition where a Portfolio Executive Reviewer loses scope eligibility (e.g., due to department reclassification), requiring suspension of active review authority |

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

The existing `EXECUTIVE` system role (level 80) maps to the **Leadership** tier for Phase 3 purposes. Phase 3 further resolves leadership users into either **Portfolio Executive Reviewer** (non-member oversight posture) or **Project Executive** (project-member authority) depending on whether they hold an explicit project membership anchor.

### 1.3 Phase 2 hub roles (live)

| Hub Role | Resolution Source | Phase 2 Use |
|---|---|---|
| `Administrator` | `isSiteAdmin: true` OR `HB-Intel-Admins` group | Admin landing, full access |
| `Executive` | `HB-Intel-Executives` group | Executive landing, team view |
| `Member` | Default fallback | Standard member access |

These roles govern Personal Work Hub behavior (P2-D1). Phase 3 must extend — not replace — this vocabulary for project-scoped use. The Phase 2 `Executive` hub role maps to the Phase 3 **Leadership** tier. Portfolio Executive Reviewer and Project Executive postures are resolved within that tier based on project membership and business scope.

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
| 2 | **Project registry (P3-A1)** | Team anchor fields, `entraGroupSet`, activation-time membership seed, `department` | Registry record per P3-A1 §2.1 |
| 3 | **Central membership contract (this document)** | Project access eligibility, effective project role context, Portfolio Executive Reviewer scope, module visibility | Resolved at project-context entry time |
| 4 | **Project-level overrides** | Per-user `projectRoleId` adjustments within a project; out-of-scope PER overrides | `IProjectMember.projectRoleId`; central access-control override record |
| 5 | **Site-local / module-local data** | Subordinate projection of canonical membership for performance or host-specific rendering | SharePoint group membership, site permissions |

### 2.2 Subordination rule

Site-local or module-local membership data (e.g., SharePoint group membership, module-local caches) may exist for performance, host-specific rendering, or offline resilience. This data is **subordinate** and MUST NOT:

- silently override canonical project access eligibility,
- create membership grants that do not exist in the central contract,
- remove or restrict access that the central contract grants,
- or introduce role semantics that diverge from the project role vocabulary defined in §3.

If a discrepancy is detected between subordinate and canonical membership, the canonical source wins. Subordinate data SHOULD be re-synchronized rather than treated as authoritative.

### 2.3 Leadership scope model

For users who resolve to the **Leadership** tier (system role `EXECUTIVE` level 80 or equivalent), business-scope visibility is determined as follows:

| Leadership classification | Default visibility scope |
|---|---|
| **C-suite** (CEO, COO, CFO, and equivalents) | Company-wide — all projects regardless of department |
| **Business-line / department leadership** | Governed business scope only — projects whose `department` matches the leader's assigned department |

`department` (from P3-A1 §2.1) is the **authoritative Phase 3 business-scope key**. `projectType` remains descriptive/reporting-only and does NOT drive access scoping in Phase 3.

**Out-of-scope access:** A Leadership user may be granted access to projects outside their default business scope through a central time-bounded override record using the existing `AccessControlOverrideRecord` pattern from `@hbc/auth`. An out-of-scope override:
- grants full Portfolio Executive Reviewer posture for the specified project(s),
- does NOT grant project membership or operational source-record write authority,
- has a governed approval requirement (see §2.4),
- expires at the configured `expiresAt` unless renewed.

### 2.4 Designated leadership approver rules

Out-of-scope Portfolio Executive Reviewer access requires approval from a **designated leadership approver**. Designated leadership approvers are:

| Approver | Approval scope |
|---|---|
| **Manager of Operational Excellence** | Company-wide; may approve any out-of-scope PER override |
| **Designated department leadership approver** | Within their governed business scope only; may not approve access outside that scope |

Designated leadership approvers are **fixed named roles** — approval authority is not delegatable to arbitrary individuals. The Manager of Operational Excellence is always the fallback approver for any scope.

---

## 3. Project Role Vocabulary

### 3.1 Project role taxonomy

Phase 3 introduces a **project role** layer that is distinct from system roles. Project roles determine what a user can see and do within a specific project. They are resolved from multiple inputs, not assigned independently.

| Project Role | Tier | Derived From | Project Hub Capabilities |
|---|---|---|---|
| **Project Administrator** | Platform | System role `Administrator` OR `SYSTEM_ADMIN` | Full project access, all modules, canvas governance, membership management, reporting release |
| **Portfolio Executive Reviewer** | Leadership (non-member) | Leadership tier user within governed business scope OR active out-of-scope override | Read-heavy project visibility, limited annotation authority, Push to Project Team, report review-run generation, PX Review approval authority — per policy; NOT project membership; NOT operational source-record write |
| **Project Executive** | Leadership (member) | System role `Executive` OR `PROJECT_EXECUTIVE` level AND explicit project membership (registry anchor or Leaders group) | Full project-member authority within project scope; report approval/release per family policy; canvas governance; report internal review chain participant |
| **Project Manager** | Member | `PROJECT_MANAGER` level AND Leaders group membership OR explicit PM team anchor | Full module access, canvas governance, report authoring (PM narrative), membership management |
| **Superintendent** | Member | `SUPERINTENDENT` level AND Leaders/Team group membership | Full module access (field-oriented), safety authority, canvas with field defaults |
| **Project Team Member** | Member | Team group membership OR explicit `IProjectMember` record | Standard module access, work queue participation, canvas with team defaults |
| **Project Viewer** | Member | Viewers group membership only | Read-only access to approved modules, no work queue participation |
| **External Contributor** | External | `IExternalMember` record with active status | Grant-scoped access to specific modules/actions per `grants[]`, time-bounded |

**Critical distinction — Portfolio Executive Reviewer vs Project Executive:**

- **Portfolio Executive Reviewer** is a non-member oversight posture. It is resolved from business-scope eligibility, not project membership. A PER user does NOT appear in the project's membership roster and does NOT have operational source-record write authority.
- **Project Executive** is a true project member. They are named as `projectExecutiveUpn` in the registry record or are in the project's Leaders Entra group with `PROJECT_EXECUTIVE` system role level.

A Leadership-tier user resolves to **Portfolio Executive Reviewer** when they are NOT explicitly project-member-anchored. They resolve to **Project Executive** when they ARE project-member-anchored (registry anchor or Leaders group). These are mutually exclusive postures for a given user-project combination.

### 3.2 Portfolio Executive Reviewer — governed authority

Portfolio Executive Reviewers hold the following authorities, which are **non-member and review-layer only**:

| Authority | Permitted? | Notes |
|---|---|---|
| View project reports | **Yes** | Including draft state within review circle |
| Annotate reports and review-capable module surfaces | **Yes** | Executive review layer only; never a mutation path for source data |
| Generate review runs (report review versions) | **Yes** | Only against latest already-confirmed PM-owned snapshot; if no confirmed snapshot exists, must request one from the project team |
| Approve PX Review | **Yes — by project policy** | Default: not permitted; must be explicitly enabled by project-level policy set by Project Executive |
| Release reports by default | **No** | Release authority is project-policy by report family, not universal for PER |
| Confirm PM draft state | **No** | PM draft ownership belongs exclusively to the PM/Project Executive chain |
| Refresh or confirm canonical release snapshots | **No** | PM-owned operation |
| Assume PM narrative ownership | **No** | |
| Push to Project Team | **Yes** | Creates a structured tracked review/follow-up item; see §3.4 |
| Operational source-record write | **No** | PER posture never grants direct write access to module source-of-truth records |
| Project membership | **No** | PER is not project membership |

### 3.3 Role resolution pipeline

For a given user entering a project context, the effective project role is resolved as follows:

1. **Start with system role.** Read `resolvedRoles` from `NormalizedAuthSession`.
2. **If Leadership tier (EXECUTIVE level 80+):**
   a. Check if user is a named team anchor (`projectExecutiveUpn`) or in the project's Leaders Entra group with executive-level system role → resolves to **Project Executive**.
   b. Check if project `department` is within the user's governed business scope OR if an active out-of-scope override exists → resolves to **Portfolio Executive Reviewer**.
   c. If neither applies, user does not have a PER posture for this project.
3. **Check project membership.** Look up the user in project membership records (`IProjectMember` or `IExternalMember`).
4. **Check Entra group membership.** Determine if the user is in the project's Leaders, Team, or Viewers group via `entraGroupSet`.
5. **Check team anchor fields.** Determine if the user is a named team anchor (PM, Superintendent) in the registry record.
6. **Apply project-level override.** If `IProjectMember.projectRoleId` is set, apply the override.
7. **Resolve effective project role.** Combine all inputs using the precedence in §3.4.
8. **Evaluate module visibility.** Apply the module visibility matrix (§4) to the resolved role.

### 3.4 Push to Project Team — structured tracked item

When a Portfolio Executive Reviewer uses Push to Project Team, the system MUST create a **structured tracked review/follow-up item**, not merely a notification. This item:

- preserves provenance back to the originating executive review artifact,
- aligns with the work queue / handoff behavior (P3-D3) — the PER does NOT convert field-annotations into the work-queue owner,
- carries a default payload of curated summary content; the pusher may choose full-context inclusion at push time,
- remains a separate artifact — the original executive review thread is not converted or absorbed,
- triggers closure loop: when the project team marks the pushed item as resolved, the originating executive review artifact returns to the executive review circle for closure confirmation rather than auto-closing.

### 3.5 Role precedence rules

When a user qualifies for multiple project roles, the **highest-capability role** wins:

1. Project Administrator (highest)
2. Portfolio Executive Reviewer (if Leadership tier; non-member but higher platform posture than PE for project-scope questions)
3. Project Executive (project-member anchor)
4. Project Manager
5. Superintendent
6. Project Team Member
7. Project Viewer
8. External Contributor (lowest, grant-scoped)

**Note on PER vs PE precedence:** Portfolio Executive Reviewer and Project Executive are mutually exclusive postures for a given user-project combination. A Leadership-tier user who holds an explicit project-member anchor resolves to Project Executive — the member role takes precedence and they do not simultaneously hold PER posture. The precedence ordering above governs inter-role conflicts only.

A user MUST NOT be assigned conflicting roles within the same project. The resolution pipeline always produces a single effective project role.

### 3.6 Relationship to Phase 2 hub roles

Phase 2 hub roles (`Administrator`, `Executive`, `Member`) govern **Personal Work Hub** behavior and are resolved at the platform level. Phase 3 project roles govern **Project Hub** behavior and are resolved at the project level.

| Phase 2 Hub Role | Default Phase 3 Project Role | Notes |
|---|---|---|
| `Administrator` | Project Administrator | Bypasses project membership checks |
| `Executive` — C-suite | Portfolio Executive Reviewer (company-wide scope) OR Project Executive (if member-anchored) | C-suite always has company-wide PER eligibility |
| `Executive` — department | Portfolio Executive Reviewer (department scope) OR Project Executive (if member-anchored) | Department leadership limited to their governed scope |
| `Member` | Determined by group membership and team anchors | Most users resolve here |

Phase 3 project roles **extend** Phase 2 hub roles — they do not replace them. A user's Phase 2 hub role continues to govern Personal Work Hub behavior regardless of their project role.

---

## 4. Module Visibility and Enablement Rules

### 4.1 Module visibility matrix

Module visibility is determined by the user's effective project role. Modules are classified as **visible** (can see and interact), **read-only** (can see but not modify), **review-layer** (visible at review-annotation depth only, no operational writes), or **hidden** (not rendered).

| Module | Project Admin | Portfolio Executive Reviewer | Project Executive | Project Manager | Superintendent | Team Member | Viewer | External |
|---|---|---|---|---|---|---|---|---|
| Home / Canvas | Visible | Visible (exec view) | Visible | Visible | Visible | Visible | Visible | Visible |
| Project Health | Visible | Review-layer | Visible | Visible | Visible | Visible | Read-only | Grant-scoped |
| Activity | Visible | Read-only | Visible | Visible | Visible | Visible | Read-only | Grant-scoped |
| Related Items | Visible | Read-only | Visible | Visible | Visible | Visible | Read-only | Hidden |
| Work Queue | Visible | Review push only | Visible | Visible | Visible | Visible | Hidden | Hidden |
| Financial | Visible | Review-layer | Visible | Visible | Read-only | Grant-scoped | Hidden | Hidden |
| Schedule | Visible | Review-layer | Visible | Visible | Visible | Visible | Read-only | Grant-scoped |
| Constraints | Visible | Review-layer | Visible | Visible | Visible | Visible | Read-only | Hidden |
| Permits | Visible | Review-layer | Visible | Visible | Visible | Visible | Read-only | Hidden |
| Reports | Visible | Review-run + PX approval (by policy) | Visible | Visible | Read-only | Read-only | Hidden | Hidden |
| Safety | Visible | Read-only | Visible | Visible | Visible | Visible | Read-only | Hidden |

**Notes:**
- **Review-layer** means the module is visible to Portfolio Executive Reviewers for executive review annotation purposes only. It does not grant operational write access to module source-of-truth records. Review annotations are in a separate executive review artifact layer.
- **Review push only** for Work Queue means PER may initiate Push-to-Project-Team items but does not own or manage work queue items directly.
- **Grant-scoped** means the module is visible only if the user's `grants[]` include the relevant module permission.
- Financial is restricted for Superintendent and below because financial data has a higher sensitivity classification.
- Safety is NOT included in the executive review layer for Phase 3 (see P3-E1). PER access to Safety is read-only.
- This matrix is a first-release baseline. Module visibility MAY be refined through `FeaturePermissionRegistration` as implementation matures.
- Review-layer visibility before executive push defaults to a restricted review circle only: originating executive reviewer, other authorized executive reviewers, PM / PX / designated surface owner. Wider team visibility occurs only through governed Push-to-Project-Team behavior (§3.4).

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
| Portfolio Executive Reviewer | Identity header, Health, Activity | Reports, Financial summary (review-layer) | Executive review catalog |
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
| User is Leadership tier AND project `department` is within their governed business scope | P3-A1 registry `department`; auth session `Executive` role | Portfolio Executive Reviewer — non-member oversight posture |
| User is Leadership tier AND an active out-of-scope override record exists for this project | `AccessControlOverrideRecord` | Portfolio Executive Reviewer for specified project(s) — non-member, time-bounded |

### 6.2 Who may NOT access a project

A user who satisfies NONE of the eligibility paths in §6.1 MUST NOT be granted access to any project-scoped surface.

Route-scope rules:

- `/project-hub` is the unscoped Project Hub portfolio root. Users with valid Project Hub access may land there according to the route doctrine in P3-B1, even though that does not imply access to every project-scoped route.
- `/project-hub/{projectId}` requires project-specific eligibility for the addressed project.
- When neither unscoped portfolio access nor project-scoped access is valid for the requested context, the system MUST render an in-shell Project Hub no-access / not-available state using `@hbc/smart-empty-state`.

This rule applies in both lanes:
- **PWA:** Route-level membership check before rendering project-scoped pages; no silent redirect to another project.
- **SPFx:** Site context resolution must confirm the user is a member of the project's Entra groups, has explicit membership, or holds a valid Portfolio Executive Reviewer posture.

### 6.3 Administrator bypass

Users with system role `Administrator` bypass per-project membership checks and receive Project Administrator capabilities in all projects. This is consistent with the Phase 2 admin override pattern and the PH7 route-level check (`user.role !== 'Admin'` bypass in PH7-ProjectHub-2 §7.2.4).

### 6.4 Portfolio Executive Reviewer access vs project membership

Access granted through a PER posture (§6.1 paths 5–6) MUST be clearly distinguished from project membership (paths 1–4):

- PER posture grants review-layer and report-interaction authority only (see §3.2).
- PER posture does NOT appear in project membership rosters.
- PER posture does NOT grant access to module operational write actions.
- Revocation of PER eligibility (scope change, override expiration) immediately terminates PER access to the affected projects.

---

## 7. Department Reclassification Effects on Access

When a project's `department` is changed through governed reclassification (P3-A1 §3.6), the following access effects MUST be applied immediately:

### 7.1 Visibility recalculation

All existing Portfolio Executive Reviewer scope eligibility for the project must be recomputed against the new `department` value. This recalculation:

- removes PER access for users whose governed business scope no longer covers the new department,
- grants PER access to users whose governed business scope now covers the new department (if they had no prior access),
- takes effect immediately upon reclassification completion, not at the user's next login.

### 7.2 Permissive exception suspension

Any active out-of-scope override records tied to the old department are immediately moved to **suspended / review-required** status. They MUST be revalidated under the new department scope before they become active again. Revalidation requires the same approval authority as the original override.

### 7.3 Authority loss effects

When reclassification removes a Portfolio Executive Reviewer from valid scope:

| Outcome | Rule |
|---|---|
| **Active review authority terminated** | The user loses authority to approve, annotate, or generate review runs immediately |
| **Read-only legacy visibility preserved** | The user retains read-only access to review artifacts they personally originated |
| **Active workflow responsibility reassigned** | Any active workflows (pending approvals, pushed items awaiting executive closure) are reassigned per §10 |

## 8. External Member Authority

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

## 9. Reassignment and Escalation After Authority Loss

When active review ownership or authority must be reassigned following authority loss (scope removal, reclassification, override expiration, revocation), the following reassignment order applies:

### 9.1 Default reassignment destination

**Project Executive** is the first default reassignment destination for all active review workflows that lose their assigned reviewer.

| Scenario | First reassignment target | Escalation path |
|---|---|---|
| PER loses scope (reclassification) | Project Executive | → Project Manager (if no PE) → Architecture-lead-approved exception |
| PER override expires | Project Executive | → Project Manager (if no PE) → Architecture-lead-approved exception |
| PER is revoked | Project Executive | → Project Manager (if no PE) → Architecture-lead-approved exception |

### 9.2 Broader authority hierarchy for escalation

The broader authority hierarchy for escalation when the default destination is unavailable is:

1. Portfolio Executive Reviewer (another eligible PER from the reviewer pool)
2. Project Executive
3. Project Member (Project Manager or above)

In all cases, the original out-of-scope reviewer retains only read-only originator visibility to artifacts they created. They do not retain active workflow authority after authority loss.

### 9.3 Reassignment notification

The Project Executive (or fallback assignee) MUST receive a notification when active workflows are reassigned to them due to authority loss. The reassignment event MUST be recorded in the relevant audit trail.

## 10. Cross-Lane Membership Consistency Rules

The following MUST remain consistent across both the PWA and SPFx lanes:

1. **Same membership source.** Both lanes MUST resolve project membership from the same canonical membership data. Neither lane may maintain a shadow membership registry.
2. **Same eligibility resolution.** Given the same user and project, both lanes MUST resolve the same access eligibility (granted or denied).
3. **Same effective role.** Given the same user and project, both lanes MUST resolve the same effective project role.
4. **Same module visibility.** The module visibility matrix (§4.1) applies equally in both lanes. Lane-specific depth differences (PWA richer, SPFx broader companion) are governed by the lane capability matrix (P3-G1), not by different membership rules.
5. **Same external member treatment.** External member access rules apply equally in both lanes.
6. **Shared auth infrastructure.** Both lanes consume `@hbc/auth` for system-level role resolution. Neither lane may introduce a parallel auth pipeline.

---

## 11. Repo-Truth Reconciliation Notes

The following reconciliations are locked for Phase 3 and MUST be honored in downstream design and implementation reviews:

1. **`IProjectMember` not yet wired to project role resolution — controlled evolution**
   `IProjectMember` exists in `packages/models/src/auth/IProjectMembership.ts` with a `projectRoleId` field, but no project-scoped role resolution pipeline consumes it. The role resolution pipeline defined in §3.3 is target-state. Classified as **controlled evolution**.

2. **PH7 `teamMemberUpns.includes()` check — compliant, requires formalization**
   PH7-ProjectHub-2 §7.2.4 defines a route-level membership check using `teamMemberUpns.includes(user.upn)`. This is functionally correct but does not account for Entra group resolution, external members, Portfolio Executive Reviewer posture, or role-based module visibility. Phase 3 must formalize this into the eligibility rules in §6 while preserving the intent.

3. **System role hierarchy not yet integrated with project roles — controlled evolution**
   The nine-level system role hierarchy in `AuthEnums.ts` (`SYSTEM_ADMIN` through `FIELD_STAFF`) exists but does not currently feed into project role resolution. Phase 2 hub roles (`Administrator`, `Executive`, `Member`) are resolved from provider hints, not from the system role hierarchy. Phase 3 project roles (§3) bridge this gap by mapping system role levels to project role capabilities. This is **controlled evolution**.

4. **`FeaturePermissionRegistration` not yet used for project modules — controlled evolution**
   The feature permission registration pattern exists in `@hbc/auth` but no Project Hub modules are registered. Module visibility in §4 should be implemented using this pattern. The new `review-layer` visibility classification must map to a `FeaturePermissionRegistration` grant that allows view/annotate but blocks all operational writes. Classified as **controlled evolution**.

5. **Entra group-to-project-role mapping not yet implemented — controlled evolution**
   Entra project groups (Leaders, Team, Viewers) are created during provisioning and stored in `IEntraGroupSet`, but no runtime pipeline resolves group membership into project roles. The mapping defined in §3.1 and §6.1 is target-state. Classified as **controlled evolution**.

6. **SPFx permission resolution — compliant, scope-limited**
   `resolveSpfxPermissions()` in the SPFx project hub webpart bridges SharePoint page context into `@hbc/auth`. This is **compliant** with the cross-lane consistency requirement (§10) but currently resolves only system-level permissions, not project-scoped membership. Extension to project-scoped resolution and Portfolio Executive Reviewer posture resolution is required.

7. **External member access not yet implemented — controlled evolution**
   `IExternalMember` and `IExternalProjectAccess` types exist but no access validation pipeline consumes them. The external member authority defined in §8 is target-state. Classified as **controlled evolution**.

8. **Portfolio Executive Reviewer posture pipeline not yet implemented — controlled evolution**
   No `department`-based scope resolution pipeline or out-of-scope `AccessControlOverrideRecord` lookup for PER exists in the current codebase. The `AccessControlOverrideRecord` type exists in `@hbc/auth` and has been extended for PER scope management. The three-tier leadership model and scope resolution defined in §2.3, §3.1, and §6.1 are target-state. PER pipeline implementation remains **controlled evolution**.

   **Blocker note — resolved 2026-03-22:** `AccessControlOverrideRecord` extended in `@hbc/auth` v0.4.0 with `overrideType` (`'general' | 'out-of-scope-per'`), `projectIds`, `department`, and `approverScope` fields. PER-specific helpers added: `createPerOverrideRequest`, `isPerOverride`, `getPerOverridesForUser`, `getPerOverridesForProject`, `suspendPerOverridesForDepartmentChange`. Backward-compatible — existing override records unaffected. Structural sufficiency confirmed.

9. **Department reclassification visibility-recalculation trigger not yet implemented — controlled evolution**
   No automatic visibility-recalculation trigger on `department` change exists. Phase 3 must implement the recomputation and override-suspension behavior defined in P3-A1 §3.6 and §7 of this contract. Classified as **controlled evolution**.

---

## 12. Acceptance Gate Reference

**Gate:** Role-governance gate (Phase 3 plan §18.1, §18.5 — cross-lane and core module components)

| Field | Value |
|---|---|
| **Pass condition** | Project membership is resolved from canonical sources; effective project role determines module visibility consistently across both lanes; Portfolio Executive Reviewer posture is correctly resolved from business scope; department reclassification triggers visibility recalculation; no parallel role logic exists outside `@hbc/auth` |
| **Evidence required** | P3-A2 (this document), project role resolution implementation, PER scope resolution implementation, module visibility enforcement, cross-lane membership consistency tests, department reclassification effects tests, override/exception suspension tests |
| **Primary owner** | Auth / Architecture + Project Hub platform owner |

---

## 13. Policy Precedence

This contract establishes the **membership and role authority foundation** that downstream Phase 3 deliverables must conform to:

| Deliverable | Relationship to P3-A2 |
|---|---|
| **P3-A1** — Project Registry and Activation Contract | Provides team anchor fields, `entraGroupSet`, and `department` consumed by the role resolution and PER scope pipelines |
| **P3-A3** — Shared Spine Publication Contract Set | Must use project membership context to determine publication visibility per project |
| **P3-C1** — Project Canvas Governance Note | Must implement canvas defaults by project role per §5; PER canvas defaults are distinct from PE canvas defaults |
| **P3-C2** — Mandatory Core Tile Family Definition | Must respect module visibility matrix (§4.1) for tile rendering; review-layer tiles require separate governance |
| **P3-E1** — Module Classification Matrix | Must align module visibility with this contract's matrix; executive review-capable surfaces per §3.2 |
| **P3-E2** — Module Source-of-Truth / Action-Boundary Matrix | Must use `StandardActionPermission` vocabulary per §4.3; review-layer annotations must not create source mutation paths |
| **P3-F1** — Reports Workspace Contract | Must implement PER report permissions and report-family policy hierarchy per §3.2 |
| **P3-G1** — PWA / SPFx Capability Matrix | Must respect cross-lane membership consistency (§10); lane depth differences must not create membership divergence |
| **P3-H1** — Acceptance Checklist | Must include membership, PER scope, and department reclassification governance gate evidence |
| **Any implementation artifact** | Must use `@hbc/auth` infrastructure for role and permission resolution; no parallel auth pipelines |

If a downstream deliverable conflicts with this contract, this contract takes precedence unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-22
**Governing Authority:** [Phase 3 Plan §8.2](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
