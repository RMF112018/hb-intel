# P3-A1: Project Registry and Activation Contract

| Field | Value |
|---|---|
| **Doc ID** | P3-A1 |
| **Phase** | Phase 3 |
| **Workstream** | A — Shared-canonical Project Hub contracts |
| **Document Type** | Contract |
| **Owner** | Project Hub / Project Operations platform owner |
| **Update Authority** | Architecture lead; changes require review by Experience lead and Platform lead |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 3 Plan §2, §4, §8](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [PH7.1 Foundation & Data Models](../../ph7-project-hub/PH7-ProjectHub-1-Foundation-DataModels.md); [current-state-map](../../../blueprint/current-state-map.md); [package-relationship-map](../../../blueprint/package-relationship-map.md); [P2-B0](../phase-2-deliverables/P2-B0-Lane-Ownership-and-Coexistence-Rules.md) |

---

## Contract Statement

This contract establishes the canonical project registry model, project identity rules, site association authority, and single-transaction activation contract for Phase 3. It governs how projects are represented, created, validated, and made available across both the PWA and SPFx lanes.

The **project registry** is the single canonical source of project identity for all Project Hub surfaces, modules, spines, and reports. Project sites, project-local lists, and module records are subordinate project-linked surfaces — they are not the canonical source of project identity.

The **activation transaction** is the single governed operation that transitions a project from provisioned/handed-off state into a valid, routeable Project Hub record. Partial activation is not an acceptable steady-state pattern.

**Repo-truth audit — 2026-03-20.** The current repo contains two project identity models that must be reconciled: `IActiveProject` (live in `@hbc/models`, used by the PWA `ProjectHubPage` and `projectStore`) and `IProjectHubProject` (defined in PH7.1, not yet implemented). The existing handoff seam (`SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG` in `@hbc/provisioning`) provides a Wave 1 activation path via `onAcknowledged` that creates a project record with ID `project-${handoffId}`. This contract formalizes and governs that seam. See §5 for full reconciliation.

---

## Contract Scope

### This contract governs

- The canonical project registry record model and field authority
- Project identity rules (immutability, uniqueness, cross-lane consistency)
- Site association rules and subordination
- The single-transaction activation contract (preconditions, validation, outputs, guarantees)
- Post-activation state requirements for both lanes
- Registry-level cross-lane consistency requirements
- Reconciliation of `IActiveProject` and `IProjectHubProject` into a unified canonical model

### This contract does NOT govern

- Project context continuity, switching, and return-memory — see P3-B (Project context continuity and switching contract)
- Role and project-membership authority and reconciliation rules — see P3-A2 (Membership / role authority contract)
- Module publication into activity, health, work, and related-items spines — see P3-A3 (Shared spine publication contract set)
- Canvas-first project home governance — see P3-C (Project canvas governance note)
- Lane-specific module depth and capability rules — see P3-G (PWA / SPFx capability matrix)
- Provisioning saga step implementation detail — governed by `@hbc/provisioning` and backend function app
- Runtime project store implementation — governed by `@hbc/shell` (`projectStore.ts`)

---

## Definitions

| Term | Meaning |
|---|---|
| **Project registry** | The single canonical data store that owns project identity, lifecycle classification, site association(s), and primary team anchors for all Project Hub surfaces |
| **Registry record** | A single entry in the project registry representing one canonical project |
| **Project identity** | The immutable set of fields that uniquely identify a project across all surfaces and lanes: `projectId` and `projectNumber` |
| **Site association** | The binding between a canonical registry record and one or more provisioned SharePoint project sites |
| **Activation transaction** | The single governed operation that creates or finalizes a canonical registry record from a provisioning/handoff completion event |
| **Activation preconditions** | The set of conditions that must be satisfied before an activation transaction may execute |
| **Post-activation guarantee** | A property of the registry record that must be true immediately after activation completes |
| **Subordinate surface** | A project-linked data surface (SharePoint site, project-local list, module record) whose existence depends on the canonical registry record but does not define project identity |
| **Routeable context** | The minimum set of registry fields required to construct a valid Project Hub route for a project in either lane |

---

## 1. Current-State Reconciliation

### 1.1 Existing project identity models

The repo currently contains two project identity models at different maturity levels:

| Model | Location | Status | Fields |
|---|---|---|---|
| `IActiveProject` | `packages/models/src/project/IProject.ts` | **Live** — used by PWA `ProjectHubPage`, `projectStore`, `IProjectRepository` | `id`, `name`, `number`, `status`, `startDate`, `endDate` |
| `IProjectHubProject` | PH7.1 §7.1.3 (plan-only, not yet implemented) | **Deferred Scope** — defined in locked PH7 plans, not yet in code | `projectId`, `projectNumber`, `projectName`, `projectLocation`, `projectType`, `startDate`, `scheduledCompletionDate`, `siteUrl`, team UPNs (PM, Super, PX), `teamMemberUpns` |

**Reconciliation requirement:** Phase 3 must produce a **single canonical registry record type** that subsumes both models. The canonical type must:
- retain backward compatibility with `IActiveProject` consumers during transition,
- incorporate the richer fields from `IProjectHubProject` that are required for Project Hub operation,
- and resolve naming inconsistencies (`id` vs `projectId`, `endDate` vs `scheduledCompletionDate`).

### 1.2 Existing provisioning and activation seams

| Artifact | Location | Status |
|---|---|---|
| `IProjectSetupRequest` | `packages/models/src/provisioning/IProvisioning.ts` | **Live** — provisioning request model (W0-G3 / D-PH6-01) |
| `IProvisioningStatus` | `packages/models/src/provisioning/IProvisioning.ts` | **Live** — backend provisioning tracking in Azure Table Storage |
| `SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG` | `packages/provisioning/src/handoff-config.ts` | **Live** — handoff config with `onAcknowledged` seam creating record ID `project-${handoffId}` |
| `IHandoffPackage` / `IHandoffConfig` | `packages/workflow-handoff/src/types/IWorkflowHandoff.ts` | **Live** — generic handoff framework |
| `IProjectRepository` | `packages/data-access/src/ports/IProjectRepository.ts` | **Live** — data access contract (CRUD + portfolio summary) |
| `ProjectState` store | `packages/shell/src/stores/projectStore.ts` | **Live** — runtime Zustand store with localStorage persistence |

**Reconciliation requirement:** The existing `onAcknowledged` seam in `SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG` is the current Wave 1 activation path. Phase 3 must formalize this into a governed activation transaction that satisfies the preconditions and guarantees defined in this contract, without breaking the existing handoff framework.

### 1.3 Existing membership models

| Artifact | Location | Status |
|---|---|---|
| `IProjectMember` | `packages/models/src/auth/IProjectMembership.ts` | **Live** — project membership with `userId`, `projectId`, `projectRoleId` |
| `IExternalMember` | `packages/models/src/auth/IProjectMembership.ts` | **Live** — external project access with grants and expiration |
| `IExternalProjectAccess` | `packages/models/src/auth/IAuth.ts` | **Live** — project-scoped permission grants |
| Entra groups | Created during provisioning Step 6 | **Live** — Leaders, Team, Viewers groups per project |

**Note:** Membership authority rules are governed by P3-A2, not this contract. This contract defines only the registry-level team anchor fields that are populated during activation.

---

## 2. Canonical Project Registry Model

### 2.1 Registry record fields

The canonical project registry record is the authoritative source for the fields listed below. Fields are classified by mutability and population timing.

| Field | Type | Mutability | Populated at | Description |
|---|---|---|---|---|
| `projectId` | `string` (UUID v4) | **Immutable** | Activation | System-generated unique identifier; primary key |
| `projectNumber` | `string` | **Immutable** | Activation | Human-assigned project code (format: `##-###-##`); unique across registry |
| `projectName` | `string` | **Mutable** | Activation | Display name; may be updated by authorized users |
| `lifecycleStatus` | `ProjectLifecycleStatus` | **Mutable** | Activation | Current lifecycle classification (see §2.2) |
| `projectType` | `string` | **Mutable** | Activation (optional) | Project type classification |
| `projectLocation` | `string` | **Mutable** | Activation (optional) | Project geographic location |
| `department` | `'commercial' \| 'luxury-residential'` | **Mutable** | Activation | Business department (from provisioning W0-G1-T02) |
| `startDate` | `string` (ISO 8601) | **Mutable** | Activation | Project start date |
| `scheduledCompletionDate` | `string` (ISO 8601) | **Mutable** | Activation (optional) | Projected completion date |
| `siteUrl` | `string` | **Immutable** | Activation | Primary SharePoint project site URL (see §4) |
| `siteAssociations` | `ISiteAssociation[]` | **Mutable** | Activation (primary); post-activation (additional) | All associated site bindings (see §4) |
| `projectManagerUpn` | `string` | **Mutable** | Activation | UPN of Project Manager |
| `projectManagerName` | `string` | **Mutable** | Activation | Display name of Project Manager |
| `superintendentUpn` | `string` | **Mutable** | Activation (optional) | UPN of Superintendent |
| `superintendentName` | `string` | **Mutable** | Activation (optional) | Display name of Superintendent |
| `projectExecutiveUpn` | `string` | **Mutable** | Activation (optional) | UPN of Project Executive |
| `projectExecutiveName` | `string` | **Mutable** | Activation (optional) | Display name of Project Executive |
| `estimatedValue` | `number` | **Mutable** | Activation (optional) | Estimated contract value |
| `clientName` | `string` | **Mutable** | Activation (optional) | Client/owner name |
| `activatedAt` | `string` (ISO 8601) | **Immutable** | Activation | Timestamp of activation transaction completion |
| `activatedByUpn` | `string` | **Immutable** | Activation | UPN of user who acknowledged the handoff/activation |
| `sourceHandoffId` | `string` | **Immutable** | Activation | Reference to the originating handoff package ID |
| `entraGroupSet` | `IEntraGroupSet` | **Immutable** | Activation | Entra security group IDs (leaders, team, viewers) created during provisioning |

### 2.2 Lifecycle status values

| Status | Meaning |
|---|---|
| `Active` | Project is in active execution |
| `Planning` | Project is in pre-execution planning |
| `OnHold` | Project execution is temporarily suspended |
| `Completed` | Project execution is complete; closeout may be in progress |
| `Closed` | Project is fully closed and archived |

### 2.3 Backward compatibility

During the Phase 3 transition period:

- The canonical registry record type MUST be a superset of `IActiveProject` fields so that existing consumers (PWA `ProjectHubPage`, `projectStore`, `IProjectRepository`) continue to function.
- The `id` field in `IActiveProject` maps to `projectId` in the canonical type.
- The `endDate` field in `IActiveProject` maps to `scheduledCompletionDate` in the canonical type.
- The `number` field in `IActiveProject` maps to `projectNumber` in the canonical type.
- Existing `IProjectRepository` consumers MUST NOT break during migration. The repository interface may be extended but not narrowed.

---

## 3. Project Identity Rules

### 3.1 Immutability rules

The following fields are **immutable** after activation and MUST NOT be modified by any surface, module, or administrative action without an explicit Architecture-lead-approved exception:

- `projectId`
- `projectNumber`
- `siteUrl` (primary site association)
- `activatedAt`
- `activatedByUpn`
- `sourceHandoffId`
- `entraGroupSet`

### 3.2 Uniqueness rules

| Constraint | Scope | Enforcement |
|---|---|---|
| `projectId` must be globally unique | Entire registry | System-generated UUID v4; collision is not a realistic concern |
| `projectNumber` must be unique | Entire registry | Validated during activation; reject if duplicate |
| `siteUrl` must be unique | Entire registry | Validated during activation; one primary site per project |

### 3.3 Cross-lane identity consistency

Both the PWA and SPFx lanes MUST resolve the same `projectId` and `projectNumber` for a given project. Neither lane may maintain a separate project identity namespace. This is enforced by both lanes consuming the same canonical registry through shared data access contracts.

### 3.4 Project identity in routes

- The PWA uses `projectId` or `projectNumber` as the route parameter for project-scoped pages.
- The SPFx lane resolves project identity from the site context (site URL → registry lookup) or from explicit route/query parameters.
- In both cases, the registry record is the authoritative source. Route-carried identity takes precedence over cached or session-stored identity per Phase 3 plan §4.2.

---

## 4. Site Association Rules

### 4.1 Site association model

A site association binds a canonical registry record to a provisioned SharePoint project site.

| Field | Type | Description |
|---|---|---|
| `siteUrl` | `string` | SharePoint site URL |
| `associationType` | `'primary' \| 'additional'` | Primary (created during provisioning) or additional (bound post-activation) |
| `associatedAt` | `string` (ISO 8601) | When the association was created |
| `associatedByUpn` | `string` | Who created the association |

### 4.2 Authority rules

1. Every activated project MUST have exactly **one primary site association** established during activation.
2. Additional site associations MAY be added post-activation by authorized users.
3. Site associations are **subordinate** to the canonical registry record. The site does not define project identity — the registry record does.
4. If a site URL appears in a site association, the registry record is the authority for which project that site belongs to. Site-local metadata (e.g., SharePoint site title) is display-convenient but not authoritative for project identity.

### 4.3 SPFx site resolution

When the SPFx lane loads within a SharePoint project site:

1. Resolve the current site URL.
2. Look up the site URL in the registry's site associations.
3. If found, use the associated `projectId` as the canonical project identity for that session.
4. If not found, the SPFx surface MUST NOT silently fabricate a project context. It should display appropriate guidance or error state.

---

## 5. Project Activation Transaction Contract

### 5.1 Transaction definition

The activation transaction is a **single atomic operation** that transitions a project from a provisioned/handed-off state into a valid, routeable Project Hub record. It is triggered when an authorized user acknowledges a handoff package.

The current implementation seam is `SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.onAcknowledged` in `packages/provisioning/src/handoff-config.ts`. Phase 3 formalizes this seam into a governed contract.

### 5.2 Activation preconditions

ALL of the following MUST be true before the activation transaction may execute:

| Precondition | Source | Validation |
|---|---|---|
| Provisioning status is `Completed` or `BaseComplete` | `IProvisioningStatus.overallStatus` | Checked by `validateReadiness()` in handoff config |
| `siteUrl` is available and non-empty | `IProvisioningStatus.siteUrl` | Checked by `validateReadiness()` |
| `projectLeadId` (PM UPN) is assigned | `IProjectSetupRequest.projectLeadId` | Required for handoff recipient resolution |
| `projectNumber` is unique in the registry | Registry lookup | Reject activation if duplicate |
| `siteUrl` is unique in the registry | Registry lookup | Reject activation if duplicate |
| Entra security groups are created | `IProvisioningStatus.entraGroups` | Groups must exist for membership to function |
| Acknowledging user has handoff-acknowledgment authority | Auth / role check | User must be the handoff recipient or have delegated authority |
| No existing registry record with same `projectId` | Registry lookup | Prevent double-activation |

### 5.3 Transaction outputs

When the activation transaction completes successfully, it MUST produce ALL of the following:

1. A **canonical registry record** with all required fields populated per §2.1.
2. A **primary site association** binding the project to the provisioned SharePoint site.
3. A **routeable project context** — the registry record contains sufficient data for both the PWA and SPFx to construct valid Project Hub routes.
4. An **acknowledged handoff package** — the source handoff package status is set to `acknowledged` with `createdDestinationRecordId` pointing to the new registry record.
5. **Audit trail** — `activatedAt`, `activatedByUpn`, and `sourceHandoffId` are recorded immutably.

### 5.4 Transaction atomicity

The activation transaction MUST be atomic:

- If any output cannot be produced, the entire transaction MUST fail and no partial state may persist.
- On failure, the handoff package MUST remain in its pre-activation state (`sent` or `received`).
- The user MUST receive a clear error indicating what failed and whether retry is appropriate.

### 5.5 Partial activation prohibition

Partial activation is **not an acceptable steady-state pattern** (Phase 3 plan §4.4). Specifically:

- A registry record MUST NOT exist without a valid primary site association.
- A registry record MUST NOT exist without sufficient fields for routeable context.
- A site association MUST NOT exist without a corresponding registry record.
- A handoff MUST NOT be marked `acknowledged` without a valid registry record having been created.

---

## 6. Post-Activation State Guarantees

Immediately after a successful activation transaction, the following MUST be true:

| Guarantee | Description |
|---|---|
| **PWA routeable** | The project is navigable in the PWA via `/project-hub/:projectId` or equivalent route |
| **SPFx resolvable** | The SPFx lane can resolve the project via site URL lookup in the registry |
| **Identity consistent** | Both lanes resolve the same `projectId` and `projectNumber` |
| **Team anchors populated** | At minimum, `projectManagerUpn` is populated; other team anchors populated where available from the handoff seed data |
| **Lifecycle set** | `lifecycleStatus` is set to an appropriate initial value (typically `Active` or `Planning`) |
| **Module-ready** | The registry record provides sufficient context for always-on core modules (§11 of Phase 3 plan) to initialize |
| **Store-publishable** | The runtime `ProjectState` store can load and cache the activated project immediately |
| **Membership-ready** | Entra group bindings exist so that project-level membership resolution can begin immediately |

---

## 7. Cross-Lane Registry Consistency Rules

The following MUST remain consistent across both lanes:

1. **Same registry source.** Both lanes MUST read project identity from the same canonical registry. Neither lane may maintain a shadow registry.
2. **Same identity resolution.** Given the same `projectId`, both lanes MUST resolve the same `projectNumber`, `projectName`, `lifecycleStatus`, and team anchors.
3. **Same site association truth.** Both lanes MUST use the same site association data. The SPFx lane MUST NOT assume site-to-project bindings that are not present in the registry.
4. **Same lifecycle semantics.** Lifecycle status values have the same meaning in both lanes.
5. **Same activation truth.** A project is either activated in the registry or it is not. There is no lane-specific activation state.

---

## 8. Repo-Truth Reconciliation Notes

The following reconciliations are locked for Phase 3 and MUST be honored in downstream design and implementation reviews:

1. **`IActiveProject` → canonical registry record — controlled evolution**
   `IActiveProject` (v0.0.1, `packages/models/src/project/IProject.ts`) is the current live project identity model with 6 fields. The canonical registry record defined in §2.1 has ~24 fields. The transition requires extending `IActiveProject` or replacing it with the canonical type while maintaining backward compatibility per §2.3. This is classified as **controlled evolution** — the contract is intentionally ahead of implementation.

2. **`IProjectHubProject` not yet implemented — controlled evolution**
   `IProjectHubProject` is defined in PH7.1 §7.1.3 (locked plan, ADR-0091) but not yet present in code. The canonical registry record in §2.1 reconciles and subsumes the PH7-planned fields. At Phase 3 kickoff, the PH7 type definition must be aligned with this contract rather than implemented independently.

3. **Handoff `onAcknowledged` seam — compliant, requires formalization**
   The existing `SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.onAcknowledged` in `packages/provisioning/src/handoff-config.ts` creates a project record with ID `project-${handoffId}`. This is a functional Wave 1 activation path. Phase 3 must formalize this into the governed activation transaction defined in §5 without breaking the existing `IHandoffConfig` framework. The current seam is **compliant** with the contract's intent but does not yet enforce all preconditions (§5.2) or guarantees (§6).

4. **`IProjectRepository` — compliant, requires extension**
   The current `IProjectRepository` (`packages/data-access/src/ports/IProjectRepository.ts`) provides CRUD and portfolio summary operations over `IActiveProject`. Phase 3 must extend this interface to support the canonical registry record type. The existing interface is **compliant** and should be extended, not replaced.

5. **`ProjectState` store — compliant, requires type update**
   The Zustand store in `packages/shell/src/stores/projectStore.ts` persists `activeProject: IActiveProject | null`. Phase 3 must update this to use the canonical registry record type. The store pattern is **compliant**.

6. **Provisioning Entra group creation — compliant**
   Provisioning Step 6 creates Leaders, Team, and Viewers Entra groups per project. The group IDs are stored in `IProvisioningStatus.entraGroups` as `IEntraGroupSet`. This is **compliant** with the activation contract's requirement for membership-ready post-activation state.

7. **`projectId` generation — requires alignment**
   The current handoff seam generates `projectId` as `project-${handoffId}` (a composite string). The canonical registry requires UUID v4. This generation strategy must be aligned during implementation — either the handoff seam adopts UUID v4, or the contract accepts the current format as a valid project ID. This is a **known gap** requiring an implementation-time decision.

---

## 9. Acceptance Gate Reference

**Gate:** Cross-lane contract gates (Phase 3 plan §18.1) — registry component

| Field | Value |
|---|---|
| **Pass condition** | Both lanes consume the same canonical project registry; activated projects are valid and routeable in both lanes; no partial activation exists |
| **Evidence required** | P3-A1 (this document), canonical type implementation, activation transaction implementation with precondition enforcement, cross-lane identity resolution test scenarios |
| **Primary owner** | Project Hub / Project Operations platform owner + Architecture |

**Gate:** Project activation gates (Phase 3 plan §18.2)

| Field | Value |
|---|---|
| **Pass condition** | Setup/handoff acknowledgment performs a valid activation transaction; activated projects land with valid record, site association, and routeable context; partial activation is not accepted |
| **Evidence required** | P3-A1 (this document), activation transaction implementation, precondition validation tests, atomicity verification, post-activation guarantee tests |
| **Primary owner** | Project Hub / Project Operations platform owner + Platform |

---

## 10. Policy Precedence

This contract establishes the **registry and activation foundation** that downstream Phase 3 deliverables must conform to:

| Deliverable | Relationship to P3-A1 |
|---|---|
| **P3-A2** — Membership / role authority contract | Must use the registry record's team anchor fields and `entraGroupSet` as inputs to membership resolution |
| **P3-A3** — Shared spine publication contract set | Must use `projectId` from the registry as the canonical project key for all spine publications |
| **P3-B** — Project context continuity and switching contract | Must treat the registry as the source of truth for project identity; route-carried `projectId` must resolve against the registry |
| **P3-C** — Project canvas governance note | Must use registry record fields for project identity header and canvas context |
| **P3-G** — PWA / SPFx capability matrix | Must respect cross-lane registry consistency rules (§7) |
| **P3-H** — Acceptance checklist | Must include registry and activation gate evidence |
| **Any implementation artifact** | Must include repo-truth reconciliation notes where current-state and target-state differ |

If a downstream deliverable conflicts with this contract, this contract takes precedence unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 3 Plan §4, §8](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
