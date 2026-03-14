# Wave 0 — Group 1: Contracts and Configuration Plan

> **Doc Classification:** Canonical Normative Plan — master plan for Wave 0 Group 1 (Contract and Configuration Decisions). Governs `W0-G1-T01` through `W0-G1-T05`. Must be read before any Group 1 task plan is executed.

**Version:** 1.1
**Date:** 2026-03-14
**Status:** Active — pending product owner review of locked decision selections
**Governs:** `W0-G1-T01` through `W0-G1-T05`
**Read with:** `CLAUDE.md` v1.6 → `current-state-map.md` → `HB-Intel-Wave-0-Buildout-Plan.md` v1.1 → this document → individual T01–T05 plans
**Wave 0 umbrella reference:** `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` §Group 1
**Validation basis:** `docs/architecture/plans/MVP/wave-0-validation-report.md`
**Next ADR available:** ADR-0114

---

## 1. Purpose

Group 1 is the **decision-locking tranche** for Wave 0.

All subsequent Wave 0 groups — backend hardening (G2), shared platform wiring (G3), SPFx surfaces (G4), PWA surfaces (G5), and pilot readiness (G6/G7) — depend on a set of architectural and operational contracts that cannot be deferred to implementation time without producing conflicting assumptions, rework, and integration failures.

Group 1 exists to prevent that outcome. It locks five categories of governing decisions before any Group 2 implementation proceeds:

1. What SharePoint site structure is provisioned for every project, and how the template is composed and governed (T01)
2. What Entra ID security groups are created per project, their naming, lifecycle, and relationship to site permissions (T02)
3. What notifications are sent at each provisioning lifecycle event, who receives them, and how delivery is routed (T03)
4. How environment configuration is classified, protected, and controlled across environments (T04)
5. How the provisioning service principal's SharePoint access is validated, and what the fallback path is if the preferred access model requires additional approval time (T05)

None of these questions can be answered by a single developer in isolation during implementation. They require product owner input, IT/security coordination, and cross-team agreement before the code that depends on them is written. Group 1 creates those answers as documented decisions. It does not build product surfaces.

### What Group 1 is not

Group 1 is not a product delivery group. It does not add user-facing routes, components, or API endpoints. It does not expand backend services. It does not replace Phase 7 closure (that precondition remains separate).

Group 1 may produce short proof-of-concept validation work (e.g., testing a `Sites.Selected` grant in a staging tenant), but that work is validation evidence, not a deployable feature.

---

## 2. Governing Documents and Relationships

### Relationship to Wave 0 Umbrella Plan

`HB-Intel-Wave-0-Buildout-Plan.md` (v1.1) defines Group 1 as the first implementation group (after Phase 7 closure as Group 0). Section **"GROUP 1 — Contracts and Configuration Decisions"** in that plan maps to the five tasks defined here. This plan refines and expands that mapping into implementation-guiding task plans.

Group 1 does not extend or override the Wave 0 umbrella. If a conflict arises between this plan and the umbrella, the umbrella governs — surface the conflict as an amendment rather than silently overriding.

### Relationship to Validation Report

`wave-0-validation-report.md` (2026-03-14) established the corrected repo posture used as the baseline for all Group 1 plans:
- Backend auth uses Managed Identity (`DefaultAzureCredential`), not MSAL OBO — T05 is written accordingly
- `IProjectSetupRequest` does not have a `department` field yet — T01 calls this out as a prerequisite
- Current step 6 only grants `groupMembers + OPEX_UPN`; Entra ID group creation is absent — T02 addresses this
- The notification templates in `packages/provisioning/src/notification-templates.ts` cover 5 events; 3 additional events from the T07 plan are not yet templated — T03 addresses this

### Relationship to MVP Project Setup Plan Set (T01–T08)

The MVP Project Setup plan set (`docs/architecture/plans/MVP/project-setup/`) is the detailed task-level plan for the Project Setup stream, which overlaps significantly with Wave 0 scope. Group 1 decisions feed directly into that plan set:

- T01 (site template) governs T06 (SharePoint Template and Permissions Bootstrap) in the Project Setup set
- T02 (Entra ID groups) governs T06's "Hybrid Permission Bootstrap" section
- T03 (notification contract) governs T07 (Admin Recovery, Notifications, and Audit)
- T04 (environment configuration) governs T05 in the Project Setup set (Provisioning Orchestrator)
- T05 (Sites.Selected) governs T06 and T05 in the Project Setup set

Implementation agents working on any T06 or T07 task from the Project Setup plan set must confirm that the relevant Group 1 decisions are locked before proceeding.

### Relationship to CLAUDE.md v1.6

All Group 1 plans are governed by CLAUDE.md v1.6 in full. Specific binding constraints applied in this group:

- **Zero-Deviation Rule (§1.2):** Any deviation from locked decisions in T01–T05 requires a superseding ADR. Decision outputs from Group 1 become locked once approved.
- **Phase 7 Gate (§6.3):** Group 1 planning may proceed before Phase 7 closes; Group 1 *implementation* (validation work, config management) may proceed concurrently with Phase 7 closure if the work is clearly bounded. Group 2 implementation may not begin until ADR-0090 exists on disk.
- **Guarded Commit Rule (§1.5):** Any code or documentation changes made during Group 1 must commit through `pnpm guarded:commit`.
- **Document Classification Rule (§1.4):** All outputs produced by Group 1 must carry a document classification.

---

## 3. Locked Interview Decisions

The following decisions were made during the business interview process and are locked inputs for all Group 1 task plans. They may not be reversed or materially altered during Group 1 planning without a superseding ADR.

### Decision 1 — Site Template Model
**Selection:** Core template plus selectable add-ons.
**Meaning:** Every provisioned project site receives a standard core — a defined set of document libraries, SharePoint lists, navigation structure, and template files that all projects share regardless of type or department. Add-ons are additional packages of structure that are applied on top of the core when selected at setup time or governed by department.
**Implications:** T01 must define what "core" means precisely for Wave 0. The core must be minimal enough to be reliable and fast to provision. Add-ons are governed — they are not ad-hoc customizations; they are defined packages with their own provisioning logic.

### Decision 2 — Project Access Model
**Selection:** 3 standard access groups for every project.
**Groups:** Project Leaders/Admins, Project Team, Read Only/Viewers.
**Meaning:** Every provisioned project site gets exactly three Entra ID security groups with predictable naming, predictable role assignments, and a predictable lifecycle. This model is not flexible at Wave 0 — it is the standard.
**Implications:** T02 must define naming convention, initial membership rules, role assignments (SharePoint permission levels), lifecycle events (creation at provisioning, archival at project close), and change-ownership model. Individual UPN grants in step 6 must be replaced by or supplemented with group-based access.

### Decision 3 — Notification Delivery Approach
**Selection:** Email first, Teams later.
**Mandatory platform integration:** `@hbc/notification-intelligence`.
**Meaning:** Wave 0 primary delivery channel for all provisioning lifecycle notifications is email. Teams integration is a future milestone and must not be required for Wave 0 completion. The `@hbc/notification-intelligence` package is the mandatory notification platform seam — notification dispatch from provisioning events must flow through it, not through bespoke one-off delivery logic.
**Implications:** T03 must define the event-to-notification matrix, recipient model, message format rules, and the integration path through the existing backend notification pipeline. T03 must explicitly defer Teams to a post-Wave-0 milestone.

### Decision 4 — Permission Approval Model
**Selection:** Preferred secure path (`Sites.Selected` / Managed Identity with least-privilege scope) first, with documented fallback.
**Meaning:** The preferred architecture is the provisioning service's Managed Identity granted per-site permissions via `Sites.Selected`. This requires IT/security approval and tenant admin action. The fallback (broader-scope access) is documented as a contingency only — it is not the default approach, it is not normalized, and it requires its own security review and ADR if activated.
**Implications:** T05 must define the validation plan for the preferred path, the IT/security coordination required, and the fallback specification. The fallback must be written conservatively — it documents what to do if the preferred path is delayed, not a shortcut that avoids governance.

### Decision 5 — Configuration Management Model
**Selection:** Centralized configuration with limited business-controlled items.
**Meaning:** Technical and security-sensitive configuration (connection strings, Managed Identity references, tenant URLs, environment flags) is protected and managed via infrastructure-controlled configuration (e.g., Azure App Configuration, Key Vault references in Function App settings). A small, explicitly defined set of business-facing settings (e.g., department definitions, background access lists, notification preferences) may be adjustable without code changes through a governed mechanism.
**Implications:** T04 must classify all required configuration settings into governance buckets, define the protected vs. business-controlled boundary, specify environment separation requirements, and describe the change-control model for each bucket.

### Decision 6 — Auth Dependency and Boundary
**Selection:** Leverage `@hbc/auth`; do not redesign it.
**Meaning:** `@hbc/auth` is an existing, P1-tested foundational package implementing dual-mode auth (MSAL for PWA, SPFx context for webparts) with Zustand stores, role/feature gates, and permission resolution. Group 1 must treat `@hbc/auth` as an immutable dependency for all app-level authorization concerns. Group 1 must not introduce parallel auth logic, redefine dual-runtime strategy, or attempt to modify `@hbc/auth` to support Group 1 requirements.
**Implications:** Where Group 1 decisions have authorization implications (e.g., who can select which template add-ons, who can view the failures inbox), those authorization decisions must be expressed through `@hbc/auth`'s existing permission/role model — not new custom checks.

---

## 4. Group 1 Scope

Group 1 contains exactly five tasks. The table below summarizes each task's purpose, primary decision produced, and relationship to later groups.

| Task | Name | Primary Decision | Unlocks |
|------|------|-----------------|---------|
| T01 | Site Template Specification | Core template definition + add-on governance model | G2 step 3/4 implementation, G4 setup form add-on selection |
| T02 | Entra ID Group Lifecycle and Role Model | Group naming, lifecycle, and role assignment standard | G2 step 6 expansion, G4 team assignment form |
| T03 | Notification Contract and Delivery Model | Event-to-notification matrix + delivery integration path | G2/G3 notification wiring, G4/G5 state-change notifications |
| T04 | Environment Configuration and Operational Governance | Config classification + protected/business-controlled boundary | G2 environment validation (G2.6), G6 operational readiness |
| T05 | Sites.Selected Validation and Fallback Path | Preferred vs. fallback permission scope determination | G2 step 6 implementation approach, G1.5 → G2 entry condition |

No task in Group 1 is optional. The five decisions are interdependent: T01 depends on T04 (where are template definitions stored?), T02 depends on T05 (what access mechanism provisions the groups?), T03 depends on T02 (who are the recipients?). The sequencing described in §6 accounts for these dependencies.

---

## 5. Package and Boundary Doctrine

Group 1 decisions govern contracts consumed by several packages and services. The following package boundaries are binding for all Group 1 work.

### `@hbc/auth`
- **Role in Group 1:** Foundational dependency for all authorization decisions. All app-level permission checks in Group 1 consumers must use `@hbc/auth` primitives (`RoleGate`, `FeatureGate`, `usePermissionStore`, `useAuthStore`).
- **Boundary:** Group 1 must not modify `@hbc/auth` source. If Group 1 reveals a gap in `@hbc/auth`'s permission model, surface it as an ADR proposal, not a patch.
- **Current exports relevant to Group 1:** `RoleGate`, `FeatureGate`, `PermissionGate`, `usePermissionStore`, `useAuthStore`, `resolveEffectivePermissions`.

### `@hbc/provisioning`
- **Role in Group 1:** T01, T02, and T03 all produce contracts that extend or align with the provisioning package's data model. The `IProjectSetupRequest` interface (in `@hbc/models`, re-exported by `@hbc/provisioning`) does not yet have a `department` field — T01 specifies the contract aligned with the MVP Project Setup T02 locked definition: `ProjectDepartment = 'commercial' | 'luxury-residential'`. MVP Project Setup T02 implements the field addition to `IProjectSetupRequest`.
- **Boundary:** Group 1 does not modify `@hbc/provisioning` source. It specifies the contracts that a later task (from the Project Setup plan set) will implement.
- **State machine relevance:** `STATE_NOTIFICATION_TARGETS` in `packages/provisioning/src/state-machine.ts` maps 5 states to notification recipient groups. T03 extends this with 3 additional events and distinguishes first/second failure escalation. All T03 events are grounded in real state machine transitions — `NeedsClarification` is a confirmed lifecycle state with an existing notification target entry. Actual code changes to the state machine are out of Group 1 scope.

### `@hbc/notification-intelligence`
- **Role in Group 1:** T03 aligns provisioning lifecycle notifications with `@hbc/notification-intelligence`'s three-tier model (`immediate` / `watch` / `digest`) and delivery channel model (`push` / `email` / `in-app` / `digest-email`).
- **Boundary:** Group 1 does not modify `@hbc/notification-intelligence` source. It produces the notification registration specifications that a later task will register via `NotificationRegistry.register()`.
- **Key contracts:** `INotificationRegistration`, `NotificationSendPayload`, `NotificationTier`, `NotificationChannel` from `packages/notification-intelligence/src/types/INotification.ts`.

### Backend Provisioning Functions
- **Role in Group 1:** T01's template decisions govern `step3-template-files.ts` and `step4-data-lists.ts`. T02's group model governs `step6-permissions.ts`. T03's notification matrix aligns with `backend/functions/src/functions/notifications/` pipeline. T05's access decision governs `backend/functions/src/services/sharepoint-service.ts` and the provisioning identity model.
- **Boundary:** Group 1 does not modify backend source. It specifies contracts that G2 implements.
- **Auth posture (validated):** Backend uses `DefaultAzureCredential` (Managed Identity) via `SharePointService` — not MSAL OBO. All Group 1 plans use Managed Identity language consistently.

### `@hbc/models` (provisioning types)
- **Role in Group 1:** `IProjectSetupRequest`, `IProvisioningStatus`, `IProvisionSiteRequest` are the canonical data contracts. T01 and T02 identify fields that must be added (e.g., `department`, Entra ID group identifiers). Those field additions are specified in Group 1 plans and implemented in Group 2 / Project Setup T02.
- **Boundary:** Group 1 does not modify `@hbc/models` source. It specifies what additions are needed.

---

## 6. Task Dependency Sequencing

The five Group 1 tasks are not fully parallelizable. The following sequencing reflects their dependency structure.

### Phase A: Parallel decision work (T01, T03, T04 may proceed together)

**T04** has no dependencies within Group 1 and should begin immediately. Config classification does not depend on any template or group decision. The sooner T04 is locked, the sooner environment provisioning and function app configuration can be validated.

**T01** may proceed in parallel with T04. T01 requires product owner input on what constitutes the Wave 0 core template. It does not depend on T02, T03, or T05.

**T03** may proceed in parallel with T04. T03 requires product owner input on notification clarity and recipient model. It depends on T02 for the full recipient definition (group names), but T03 can complete most of its event matrix and tier classification before T02 is locked, with recipient group names filled in as T02 completes.

### Phase B: T02 after T01 initiates, T05 in parallel with T02

**T02** depends on T01 being in flight (it needs to know what the provisioned site looks like to define appropriate access sets). T02 also depends on T05 being in progress (the group creation in step 6 requires the provisioning identity to have `Group.ReadWrite.All` scope — which T05 validates).

**T05** proceeds in parallel with T02. T05's primary external dependency (IT/security engagement for `Sites.Selected`) should be initiated as early as possible — even before T01 is complete. Early engagement reduces risk of blocking G2.

### Phase C: Group 2 entry condition

Group 2 may not begin until all of the following are true:
1. T01 decision is locked (core template defined; add-on model documented)
2. T02 decision is locked (group naming and lifecycle standard defined)
3. T03 decision is locked (notification matrix and delivery path defined)
4. T04 decision is locked (config classification confirmed; production config governance path established)
5. T05 decision is locked (preferred access path confirmed or fallback path formally documented)

These five conditions constitute the **Group 1 acceptance gate** (see §8).

---

## 7. Required Supporting Artifacts

Group 1 produces **decision documents**, not code. The expected outputs are:

| Artifact | Location | Produced by | Consumed by |
|----------|----------|-------------|-------------|
| Wave 0 site template specification | `docs/reference/provisioning/site-template.md` | T01 | G2 step 3/4, T06 Project Setup plan |
| Entra ID group standard | `docs/reference/provisioning/entra-id-group-model.md` | T02 | G2 step 6, T06 Project Setup plan |
| Notification event matrix | `docs/reference/provisioning/notification-event-matrix.md` | T03 | G3 notification wiring, T07 Project Setup plan |
| Config classification registry | `docs/reference/configuration/wave-0-config-registry.md` | T04 | G2 environment validation, G6 operational readiness |
| Sites.Selected validation record | `docs/reference/configuration/sites-selected-validation.md` | T05 | G2 step 6, T06 Project Setup plan |

All five reference documents must be added to `current-state-map.md §2` upon creation using document class "Reference."

### ADR inputs

Group 1 is expected to produce the inputs for ADR-0114 (Wave 0 site template, Entra ID group design, notification channel, service principal scope). ADR-0114 should be drafted once T01–T05 decisions are locked, and should capture the locked decisions as a permanent reference. ADR-0114 is produced at the end of Group 1, not before.

---

## 8. Acceptance Gate

Group 1 is complete when all of the following conditions are satisfied:

**T01 Complete:**
- [ ] Wave 0 core template is defined: document libraries, list titles, navigation structure
- [ ] Add-on governance model is defined: at minimum two selectable add-ons specified
- [ ] `department` field requirement documented for `IProjectSetupRequest`
- [ ] Reference document exists at `docs/reference/provisioning/site-template.md`

**T02 Complete:**
- [ ] Three-group naming standard is locked: exact group name patterns defined
- [ ] Initial membership rules documented per group
- [ ] SharePoint permission level assignments documented per group
- [ ] Lifecycle events (creation, archival) documented
- [ ] Graph API scope requirement (`Group.ReadWrite.All`) documented
- [ ] Reference document exists at `docs/reference/provisioning/entra-id-group-model.md`

**T03 Complete:**
- [ ] Event-to-notification matrix is complete for all provisioning lifecycle events
- [ ] Tier classification (immediate/watch/digest) is assigned to each event
- [ ] `INotificationRegistration` specifications are documented for each event type
- [ ] Backend pipeline integration path is confirmed (via `SendNotification` endpoint)
- [ ] Teams deferral decision is documented
- [ ] Reference document exists at `docs/reference/provisioning/notification-event-matrix.md`

**T04 Complete:**
- [ ] All required Wave 0 configuration settings are enumerated
- [ ] Each setting is classified into its governance bucket (infrastructure-controlled vs. business-controlled)
- [ ] Environment separation requirements are documented
- [ ] Change-control model per bucket is documented
- [ ] Reference document exists at `docs/reference/configuration/wave-0-config-registry.md`

**T05 Complete:**
- [ ] Preferred access path (Managed Identity + `Sites.Selected`) is validated in staging OR IT approval timeline is confirmed
- [ ] Fallback path (if needed) is formally documented with access scope, security review requirement, and ADR requirement
- [ ] Group 2 entry condition for step 6 is clearly stated
- [ ] Reference document exists at `docs/reference/configuration/sites-selected-validation.md`

**Group 1 overall:**
- [ ] ADR-0114 is drafted (may be created at the close of Group 1 once all T01–T05 decisions are confirmed)
- [ ] All five reference documents are added to `current-state-map.md §2`
- [ ] No Group 2 implementation task has been started

---

---

## 9. Validation and Correction Record

**v1.1 Corrections (2026-03-14):** Group 1 plans validated against governing docs, repo code seams, and MVP Project Setup plan set. The following corrections were applied:

| Task | Issue | Correction |
|------|-------|-----------|
| T01 | `ProjectDepartment` union included `mixed-use` and `other` — not locked in any governing doc | Locked to `commercial \| luxury-residential` per MVP T02 and feature decision doc; `mixed-use`/`other` labeled as proposed future extensions |
| T01 | Department library add-on model (`luxury-residential-documents`, `commercial-documents`) conflicted with T06 pruning model | Removed department keys from add-on registry; added explicit §Department Library Model section with T06 pruning implementation guidance |
| T01 | Add-on count and criteria description incorrect post-correction | Updated add-on registry to 2 add-ons (safety-pack, closeout-pack) |
| T01 | `addOns` field attributed to MVP Project Setup T02 (incorrect — T02 specifies different model extensions) | Attribution corrected; field identified as a new G2 requirement |
| T01 | Punch List / Safety Log core/add-on decision not labeled as a proposal | Added "Proposed Default — pending product owner confirmation" status label |
| T02 | Department background access section implied broader department support | Aligned to `commercial \| luxury-residential` only; guard note added for future expansion |
| T03 | `provisioning.clarification-requested` event lacked explicit state machine alignment | Confirmed `NeedsClarification` is a real lifecycle state; added trigger language citing `STATE_NOTIFICATION_TARGETS`; added state-to-event mapping table in baseline section |
| T04 | `DEPT_BACKGROUND_ACCESS_MIXED_USE` referenced unvalidated department value | Removed from config registry; aligned to 2 locked department values only |
| T05 | Long-term steady-state target was described as a Risk item only, not a locked governance section | Added explicit §Long-Term Steady-State Target section; pilot bridge bounded to ≤3 projects; Option A1 designated as concurrent Wave 0 GA requirement; Risk T05-R4 upgraded |

*End of Wave 0 Group 1 — Contracts and Configuration Plan v1.1*
