# W0-G1-T02 — Entra ID Group Lifecycle and Role Model

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 1 task plan for Entra ID security group standard. Governs what groups are created per project, their naming, lifecycle, and relationship to site permissions. Must be locked before G2 step 6 expansion proceeds.

**Phase Reference:** Wave 0 Group 1 — Contracts and Configuration Plan
**Locked Decision Applied:** Decision 2 — 3 standard access groups for every project; Decision 6 — leverage `@hbc/auth`, no redesign
**Estimated Decision Effort:** 1–2 working sessions with product owner and IT/security
**Depends On:** T01 (in flight — needs to know what the provisioned site looks like); T05 (needs Managed Identity permissions scope confirmed)
**Unlocks:** G2 step 6 expansion, T06 of MVP Project Setup plan set (Hybrid Permission Bootstrap section)
**ADR Output:** Contributes to ADR-0114 (Entra ID group model section)

---

## Objective

Define the standard Entra ID security group model for HB Intel project sites: the three groups created per project, their naming convention, purpose, initial membership, SharePoint permission level assignments, lifecycle events, ownership model, and the authorization boundary between Entra ID groups and `@hbc/auth`.

The output of this task is a reference document (`docs/reference/provisioning/entra-id-group-model.md`) that governs G2's expansion of step 6 (`step6-permissions.ts`) from its current thin implementation (UPN-based member list + OPEX_UPN) to the full three-group Entra ID model.

---

## Why This Task Exists

The current provisioning saga step 6 (`step6-permissions.ts`) grants site access by calling:

```typescript
const members = Array.from(new Set([...(status.groupMembers ?? []), OPEX_UPN].filter(Boolean)));
await services.sharePoint.setGroupPermissions(status.siteUrl, members, OPEX_UPN);
```

This implementation:
- Assigns all project members to a single SharePoint group with the same permission level
- Does not create Entra ID security groups
- Does not distinguish Project Leaders/Admins from Project Team from Read Only/Viewers
- Has no lifecycle management (no archival on project close)
- Creates per-user grants rather than group-based grants, which drift over time and make auditing difficult

The locked Decision 2 requires three standard Entra ID security groups per project. This decision is not optional — it is the Wave 0 access standard. T02 defines that standard precisely enough that G2 can implement it without inventing conventions.

---

## Scope

T02 covers:

1. The three-group model: names, purposes, and SharePoint permission level assignments
2. Naming convention standard: exact group name patterns
3. Initial membership specification: who is in which group at provisioning time
4. Lifecycle events: creation (at provisioning), membership changes (ongoing), archival (at project close)
5. Ownership model: who is responsible for membership management
6. The Graph API scope requirement (`Group.ReadWrite.All`) and its relationship to T05
7. The authorization boundary between Entra ID groups and `@hbc/auth`
8. Relationship to the `department` background access pattern

T02 does not cover:

- Implementation of Entra ID group creation in step 6 (that is G2)
- Dynamic group membership rules based on HR systems (future production stage)
- Project team member invitation workflows (those are app surfaces in G4)
- External partner or contractor access (not in Wave 0 scope)
- SharePoint permission inheritance beyond what is required for the three groups
- Modifying `@hbc/auth` — the auth package is a dependency, not a target

---

## Governing Constraints

- **Locked Decision 2:** Three groups only. No additional groups may be added in Wave 0 without an ADR.
- **Locked Decision 4 (Sites.Selected):** The Managed Identity used for provisioning must have `Group.ReadWrite.All` permission in Entra ID in addition to the `Sites.Selected` permission for SharePoint. T05 validates this. T02 specifies the requirement; T05 confirms whether it is approved.
- **Locked Decision 6 (auth boundary):** `@hbc/auth` owns runtime authorization. Entra ID groups own SharePoint site access. These are separate concerns. T02 must not blur them: Entra ID groups control who can access the SharePoint site; `@hbc/auth` (via RBAC roles) controls what users can do inside HB Intel apps.
- **CLAUDE.md §1.2 Zero-Deviation Rule:** Once the group naming standard is locked, all provisioning and app code must use it without exception. Any change to naming requires a superseding ADR.
- **Package boundary:** Group creation occurs in backend provisioning functions, not in any frontend package.

---

## Three-Group Model

### Overview

Every provisioned project site in HB Intel must have exactly three Entra ID security groups created during provisioning (Step 6). No more, no less, at Wave 0.

| Group Role | Purpose | SharePoint Permission Level |
|-----------|---------|----------------------------|
| Project Leaders/Admins | Full control of the project site; can modify structure, lists, permissions | `Full Control` |
| Project Team | Day-to-day project work; can read, write, and contribute to all content | `Contribute` |
| Read Only/Viewers | Stakeholders who need visibility but must not modify content | `Read` |

### Group Purposes in Detail

**Project Leaders/Admins** (`Full Control`)
This group contains the project superintendent, project manager, and any HB Intel platform admins who are assigned to the project. Full Control is required for this group because project leaders must be able to manage the site's list structure, add views, manage document libraries, and configure web parts after provisioning. This group is not for all staff — it is for the project's accountable leaders.

**Project Team** (`Contribute`)
This group contains all active project personnel — estimators, project engineers, field supervisors, sub-contractors who need document access, and administrative staff assigned to the project. Contribute access allows creating, editing, and deleting content they own within lists and libraries. This is the primary group for day-to-day site usage.

**Read Only/Viewers** (`Read`)
This group contains leadership stakeholders, clients (if given access), department directors, and any party that needs read-only visibility into project status, documents, or reports. Members cannot create or modify content.

---

## Naming Convention

### Standard Pattern

```
HB-{ProjectNumber}-Leaders
HB-{ProjectNumber}-Team
HB-{ProjectNumber}-Viewers
```

Where `{ProjectNumber}` is the project number from `IProjectSetupRequest.projectNumber` (format: `##-###-##`, e.g., `25-001-01`).

**Examples for project `25-001-01`:**
- `HB-25-001-01-Leaders`
- `HB-25-001-01-Team`
- `HB-25-001-01-Viewers`

### Naming Governance Rules

- Group names must be composed exactly as specified. No abbreviations, no alternate prefixes, no spaces.
- The `HB-` prefix namespaces all HB Intel project groups and distinguishes them from other organizational groups.
- The suffix must be exactly `Leaders`, `Team`, or `Viewers` — not `Admins`, `Members`, `ReadOnly`, or any other variant.
- Group display names in Entra ID must match the technical names exactly (no separate display name).
- Group descriptions must follow the template: `HB Intel project group for [role] on project [projectNumber] — [projectName]` (populated at creation time).
- Mail-enabled distribution is not required for Wave 0. Groups are security groups only.

### Why This Naming Pattern

- `HB-` prefix enables IT admins to filter and manage all HB Intel project groups as a set in Entra ID
- Project number (not project name) is the unique identifier — project names can change; project numbers do not
- The suffix is descriptive in plain English so group purpose is immediately clear to any admin

---

## Initial Membership Specification

At provisioning time (Step 6), the following principals must be added to each group:

### Leaders Group — Initial Members
- UPNs from `IProvisionSiteRequest.groupMembers` that are tagged as leaders (requires an addition to the request model — see §Field Additions)
- `OPEX_MANAGER_UPN` environment variable value (the OpEx manager is always a leader-level participant)
- If no leader-level members are specified, the `triggeredBy` UPN (the person who triggered provisioning) is the default initial leader

### Team Group — Initial Members
- All other UPNs from `IProvisionSiteRequest.groupMembers` not already in the Leaders group
- The `submittedBy` UPN (the Estimating Coordinator who submitted the request) is a default Team member

### Viewers Group — Initial Members
- Department background access UPNs (from `DEPT_BACKGROUND_ACCESS_{DEPT}` environment configuration — see T04)
- No project personnel are initially in the Viewers group

**Important:** Initial membership is a starting point, not a final state. Membership management (adding/removing members over the project lifecycle) is a post-provisioning app concern, not a provisioning saga concern.

### Field Addition Required: `groupLeaders`

The current `IProvisionSiteRequest` has `groupMembers: string[]` — a flat list with no role distinction. The three-group model requires distinguishing leaders from team members.

**Required addition to `IProvisionSiteRequest`:**
```typescript
/** UPNs of project personnel assigned to the Leaders/Admins group (Full Control). */
groupLeaders: string[];
/** UPNs of project personnel assigned to the Team group (Contribute). */
groupMembers: string[];  // existing field — reinterpreted as Team-only
```

This field addition is specified here and implemented in Project Setup T02 (model hardening). The setup request form must present separate inputs for project leaders vs. project team members.

---

## SharePoint Permission Assignment

### Replacement Strategy

The current step 6 pattern (UPN-based `setGroupPermissions`) must be **replaced** by a group-based assignment pattern. The three Entra ID security groups are created first, then the SharePoint site's built-in groups are configured to include the Entra ID groups.

### Implementation Pattern (G2 implements)

Step 6 must perform the following operations in sequence:

1. **Create Leaders group** via Microsoft Graph API: `POST /groups` with security group settings
2. **Create Team group** via Microsoft Graph API
3. **Create Viewers group** via Microsoft Graph API
4. **Populate initial members** for each group (batch add via `POST /groups/{id}/members/$ref`)
5. **Assign Entra ID groups to SharePoint site permission levels:**
   - Leaders group → Full Control (can be set via SharePoint REST API or PnPjs)
   - Team group → Contribute
   - Viewers group → Read
6. **Retain OPEX_UPN structural access** — ensure `OPEX_MANAGER_UPN` is in the Leaders group (covered by initial membership rules)

### SharePoint Integration Method

Assigning Entra ID security groups to SharePoint permission levels is done via PnPjs group membership API, not the same `setGroupPermissions` method used for individual UPNs. The `ISharePointService` interface (`backend/functions/src/services/sharepoint-service.ts`) will need a new method for group-based permission assignment. G2 specifies this interface extension; T02 specifies the requirement.

### Idempotency Requirement

Before creating each group:
- Query Entra ID for an existing group matching the name pattern: `displayName eq 'HB-{projectNumber}-Leaders'`
- If the group exists, skip creation and use the existing group ID
- Log idempotent skips as non-error events

Before assigning groups to SharePoint permission levels:
- Check current site group assignments
- Skip the assignment if the Entra ID group is already assigned at the correct permission level

---

## Lifecycle Events

### Creation
- **Trigger:** Step 6 of provisioning saga
- **Action:** Create all three groups in Entra ID; populate initial members; assign to SharePoint permission levels
- **Failure handling:** If group creation fails, Step 6 fails. Saga compensation (Step 7→2→1 rollback) removes the SharePoint site but does not currently remove Entra ID groups. G2 must add group deletion to the compensation logic for Step 6 (document this in the step as a compensation gap until implemented).

### Ongoing Membership Management
- **Trigger:** Admin action in HB Intel app (future surface — not in Wave 0 UI scope)
- **Action:** Add or remove members via Microsoft Graph API (`/groups/{id}/members`)
- **Wave 0 status:** No membership management UI is in Wave 0 scope. Initial membership is set at provisioning. Post-provisioning membership changes require manual Graph API calls or admin action in Entra ID until a management surface is built.
- **Ownership:** The project's Leaders group members are responsible for membership management. IT/security is not involved in routine membership changes.

### Project Archival (Project Close)
- **Trigger:** Project completion / explicit close action
- **Action:** Transition all three groups to a disabled/archived state:
  - Rename groups: `HB-{ProjectNumber}-Leaders-ARCHIVED`, `HB-{ProjectNumber}-Team-ARCHIVED`, `HB-{ProjectNumber}-Viewers-ARCHIVED`
  - Mark groups as `securityEnabled: false` (disables new sign-ins using the group for resource access)
  - Do NOT delete groups — retain them for audit history per governance requirements
- **Wave 0 status:** Project archival lifecycle is not implemented at Wave 0. Document this as a known gap; archival must be implemented before any project can formally close in the system.
- **Retention policy:** Archived groups must be retained for at minimum 7 years to support audit requirements (construction industry standard). IT policy governs the exact retention timeline.

---

## Ownership Model

### Who Creates Groups
Groups are created automatically by the provisioning saga (Step 6). No human intervention is required for creation. The Managed Identity must have `Group.ReadWrite.All` permission.

### Who Manages Membership
Initial membership: set by the provisioning saga from the setup request data.
Post-provisioning membership: managed by Project Leaders — the people in the Leaders group can add/remove members to Team and Viewers groups via Entra ID or any management surface built in a future wave.

### Who Can Archive Groups
Project archival (when implemented) must be an admin-level action, gated by `HBIntelAdmin` role in `@hbc/auth`. Regular project members must not be able to trigger archival.

---

## `@hbc/auth` Authorization Boundary

This is a critical boundary that T02 must explicitly define and that all downstream implementors must respect.

### What Entra ID Groups Own
- **SharePoint site access** — who can access the SharePoint site that was provisioned for the project
- **Initial content permissions** — who can read/write/contribute to documents and lists within the site

### What `@hbc/auth` Owns
- **HB Intel app authorization** — who can see and interact with HB Intel app surfaces (SPFx webparts, PWA routes, admin pages)
- **Role-based feature visibility** — whether a user sees the controller gate review UI, the admin failures inbox, the project setup form, etc.
- **Permission resolution** — the `usePermissionStore` and `resolveEffectivePermissions` functions in `@hbc/auth` determine what a user can do inside HB Intel apps

### Boundary Rule
These two authorization systems are independent. A user may be in the `HB-25-001-01-Team` Entra ID group (can access the SharePoint site) but not have the `admin:access-control:view` permission in `@hbc/auth` (cannot see the admin webpart). Both must be true for full access in the relevant context.

Provisioning step 6 manages the Entra ID group side only. `@hbc/auth` role assignments are managed separately and are not modified by provisioning.

### Anti-Pattern to Avoid
Do not replicate the Entra ID group model inside `@hbc/auth` stores or permission tables. The two systems serve different concerns. Adding `HB-{projectNumber}-Leaders` membership checks to `@hbc/auth` is a duplication that creates maintenance burden.

---

## Graph API Scope Requirement

Creating and managing Entra ID security groups via Microsoft Graph API requires the provisioning service principal (the Azure Function's Managed Identity) to have the `Group.ReadWrite.All` application permission granted in Entra ID.

This permission:
- Must be granted by a tenant admin (not self-assigned)
- Requires IT/security coordination alongside the `Sites.Selected` permission validation (T05)
- Must be documented as a prerequisite for G2 step 6 implementation

**Validation required (T05 coordinates):** Before G2 implements group creation, IT/security must confirm that `Group.ReadWrite.All` has been granted to the function app's Managed Identity in the staging tenant. G2 may not proceed with group creation code until this is confirmed.

---

## Department Background Access

The Wave 0 core template specifies department-based background access to the Viewers group. The specific UPN lists are environment configuration (see T04), but the model is defined here.

**Locked department values for Wave 0:** `commercial` and `luxury-residential` only (per `ProjectDepartment` type locked in T01 and MVP Project Setup T02). The background access pattern applies exactly to these two values.

**Pattern:**
- At provisioning time, the department value from the request (`IProvisionSiteRequest.department`) determines whether any background access principals are added to the Viewers group
- Background access lists are stored in environment configuration, not hardcoded
- Example: all projects with `department = 'commercial'` automatically add the Commercial Department leadership distribution list to the Viewers group

**Implementation in step 6:**
```typescript
// Read from environment config per T04's governance model
// department is 'commercial' | 'luxury-residential' for Wave 0
const deptViewers = getDepartmentBackgroundViewers(status.department);
// Add to Viewers group initial membership
```

This pattern requires `department` on `IProvisioningStatus` — a field addition covered by T01 and implemented in Project Setup T02.

> **Note:** If a project's department is neither `commercial` nor `luxury-residential` (which is not possible in Wave 0 but may occur if the type is expanded in a future wave), the `getDepartmentBackgroundViewers` function must return an empty array rather than failing.

---

## Reference Document Requirements

T02 must produce `docs/reference/provisioning/entra-id-group-model.md`. That document must include:

1. Three-group model: group roles, names, SharePoint permission levels
2. Naming convention standard with examples
3. Initial membership rules per group
4. Field additions required (`groupLeaders` on `IProvisionSiteRequest`)
5. Lifecycle events: creation, ongoing management, archival
6. Graph API scope requirement
7. `@hbc/auth` boundary statement
8. Department background access model

---

## Acceptance Criteria

- [ ] Three-group model is documented: exact group role names, SharePoint permission levels
- [ ] Naming convention is locked: exact pattern, prefix, suffix, no variants permitted
- [ ] Initial membership rules are documented per group (who goes in which group at provisioning)
- [ ] `groupLeaders` field addition is documented for `IProvisionSiteRequest`
- [ ] Lifecycle events are documented: creation (step 6), ongoing management, archival procedure
- [ ] `Group.ReadWrite.All` scope requirement is documented and flagged for T05 coordination
- [ ] `@hbc/auth` authorization boundary is explicitly documented
- [ ] Department background access model is documented (Viewers group initial population)
- [ ] Compensation gap (group deletion on saga rollback) is documented
- [ ] Reference document (`docs/reference/provisioning/entra-id-group-model.md`) exists and is complete
- [ ] Reference document is added to `current-state-map.md §2` as "Reference"
- [ ] G2 can implement step 6 from this specification without inventing group naming or membership conventions

---

## Known Risks and Pitfalls

**Risk T02-R1: `Group.ReadWrite.All` approval delays block G2.** This permission requires tenant admin action. If IT/security approval is slow, G2 step 6 expansion is blocked. Mitigate by submitting the permission request (alongside `Sites.Selected`) at the earliest opportunity during Group 1 — do not wait for T02 to be fully locked.

**Risk T02-R2: Project number changes.** Project numbers occasionally change during early project setup (before the site is provisioned). If a project number changes after the groups are created, the group names are stale. Wave 0 does not address this case — document it as a known limitation. A group rename workflow is a future operational concern.

**Risk T02-R3: Provisioning saga group creation interacting with throttling.** Creating 3 groups + batch member additions via Graph API introduces additional HTTP calls in step 6. Each call is subject to Graph API throttling. Step 6 must use `withRetry` for Graph API calls with the same Retry-After handling that T05/G2.1 establishes for SharePoint calls. Step 6 is currently the most likely step to be expanded significantly in G2.

**Risk T02-R4: Over-permissioning Leaders group.** `Full Control` on a SharePoint site is a significant permission level — it allows structural changes, permission changes, and content deletion. Wave 0's assumption is that Project Leaders/Admins are senior, trusted project personnel. If the Leaders group membership is incorrect at provisioning, the site will have broadly privileged users. Membership input validation (who is in `groupLeaders`) should be considered for the G4 setup form.

---

## Follow-On Consumers

- **G2 step 6 expansion:** The direct implementation consumer of T02 decisions. Step 6 must create the three groups, populate initial members, and assign SharePoint permission levels.
- **T06 (MVP Project Setup plan set):** The Hybrid Permission Bootstrap section of T06 uses T02's model to define the full three-tier permission grant implementation pattern.
- **G4.1 (Project Setup Request Form):** The request form must present separate `groupLeaders` and `groupMembers` inputs so the provisioning engine can populate the correct groups.
- **Future membership management surface:** Any Wave 1+ surface for adding/removing project team members must use the Entra ID group IDs stored in `IProvisioningStatus` (a field to be added by Project Setup T02) rather than rebuilding group discovery.

---

*End of W0-G1-T02 — Entra ID Group Lifecycle and Role Model v1.1 (Corrected 2026-03-14: department background access section aligned to locked 2-value `ProjectDepartment` type; guard note added for future type expansion)*
