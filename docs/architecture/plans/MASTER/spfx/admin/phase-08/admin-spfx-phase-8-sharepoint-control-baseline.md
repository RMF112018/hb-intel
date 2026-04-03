# Admin SPFx IT Control Center — Phase 8 SharePoint Control Baseline

**Prompt:** P8-02 — SharePoint Control Baseline and Managed-Asset Boundary
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Define the canonical Phase 8 architecture baseline for the SharePoint control lane and freeze the HB Intel-managed asset boundary.

---

## 1. Purpose

This document establishes the governing architecture baseline for Phase 8 and freezes the first-wave managed-asset boundary so that follow-on implementation prompts do not drift into broad tenant-wide SharePoint governance.

All Phase 8 implementation should reference this baseline as the scope authority.

---

## 2. Why Phase 8 exists

By Phase 8, the platform has:

- a control-plane substrate with run, audit, and evidence persistence (Phases 2–4),
- an adapter registry with SharePoint adapter descriptors (Phase 3),
- an operator-console shell with lane-based navigation (Phase 5),
- install/bootstrap orchestration with preflight, checkpoint, and verification patterns (Phase 6),
- a first-class app-binding model with drift detection and repair (Phase 6A),
- hardened provisioning with failure classification, evidence payloads, recovery guidance, and prelaunch validation (Phase 7).

What the platform does **not** yet have is the ability to:

- observe whether HB Intel-managed SharePoint sites match platform standards,
- compare live site state against expected posture,
- preview what a repair or standards reapplication would change,
- execute controlled repairs without guesswork,
- see app catalog and API access posture for HB Intel packages.

Phase 8 closes this gap by delivering the first-wave SharePoint control lane — scoped strictly to HB Intel-managed assets.

---

## 3. HB Intel-managed SharePoint asset boundary

### 3.1 In-scope first-wave assets

The following asset classes are within the Phase 8 active control boundary:

| Asset class | Identification | Example |
|------------|---------------|---------|
| **HB Intel project sites** | Sites created by the provisioning saga; identified by deterministic URL derivation from project metadata | `{tenantUrl}/sites/{projectNumber}-{projectName}` |
| **HB Intel document libraries** | Libraries created by provisioning Step 2 (CORE_LIBRARIES: Project Documents, Drawings, Specifications) | Libraries within HB Intel project sites |
| **HB Intel data lists** | Lists created by provisioning Step 4 (8 core + 26 workflow-family lists) | Lists within HB Intel project sites |
| **HB Intel template files** | Files uploaded by provisioning Step 3 (TEMPLATE_FILE_MANIFEST + ADD_ON_DEFINITIONS + DEPARTMENT_LIBRARIES) | Files within HB Intel project site libraries |
| **HB Intel Entra security groups** | Three-group permission model created by provisioning Step 6 (`{ProjectNumber}-Leaders`, `{ProjectNumber}-Team`, `{ProjectNumber}-Viewers`) | Groups associated with HB Intel project sites |
| **HB Intel hub association** | Hub site association established by provisioning Step 7 | Association between HB Intel project sites and the configured hub site |
| **HB Intel SPFx packages in tenant app catalog** | SPFx packages identified by `HB_INTEL_SPFX_APP_ID` environment variable | HB Intel web parts in tenant-level app catalog |
| **HB Intel API access permissions** | SharePoint API access permissions requested by the install flow for HB Intel | Specific API permission grants for HB Intel Graph/SharePoint operations |

### 3.2 Boundary derivation

The boundary is derived from **provisioning saga execution state**:

- A site is HB Intel-managed if it was created by the provisioning saga and has a corresponding record in `ProvisioningStatus` table storage.
- The expected standards for that site are derived from the provisioning step definitions (Step 1–7 expectations).
- The expected security groups are derived from the three-group model in Step 6.
- The expected hub association target is the value of `SHAREPOINT_HUB_SITE_ID`.
- The expected app catalog package is identified by `HB_INTEL_SPFX_APP_ID`.

### 3.3 Explicitly out of first-wave active scope

| Asset class | Why excluded |
|------------|-------------|
| Non-HB-Intel SharePoint sites | Tenant-wide governance is not Phase 8 scope |
| Non-HB-Intel app catalog packages | Only HB Intel packages are managed |
| Non-HB-Intel API access permissions | Only HB Intel-related permissions are in scope |
| SharePoint hub site configuration itself | HB Intel controls association, not hub creation or hub-level settings |
| SharePoint tenant-level settings | Tenant admin, not platform control |
| OneDrive or personal sites | Not HB Intel-managed assets |
| Microsoft 365 Groups not created by provisioning | Only the three-group model is in scope |
| Custom SharePoint Framework extensions (non-HB-Intel) | Not platform-managed |

---

## 4. Active vs advisory SharePoint control boundary

### 4.1 Active control (Phase 8 first wave)

Active control means the backend/control plane can **read, compare, preview, and write** corrections for the asset.

| Capability | Active in Phase 8? | Constraint |
|-----------|-------------------|-----------|
| Read site structure (libraries, lists, files) | **Yes** | HB Intel project sites only |
| Compare site structure against standards | **Yes** | Comparison is read-only, side-effect-free |
| Preview repair / reapply impact | **Yes** | Preview produces impact summary, no writes |
| Apply / reapply site standards | **Yes** | Constrained to drifted items within HB Intel sites; requires preview first |
| Repair missing libraries, lists, or files | **Yes** | Idempotent creation only; no destructive deletion |
| Verify hub association and repair | **Yes** | Association join only; no hub reconfiguration |
| Verify Entra group existence and membership posture | **Yes** | Read and compare; repair limited to group creation and membership adds |
| Inspect app catalog package presence and version | **Yes** | Read-only posture check |
| Inspect API access permission status | **Yes** | Read-only posture check |

### 4.2 Advisory only (visible but not actively repaired in Phase 8)

| Capability | Why advisory only |
|-----------|------------------|
| App catalog package upgrade / install | Requires separate ALM workflow and operator confirmation; deferred to later maturity |
| API access permission grant / approval | Requires tenant-admin consent; surfaced as status, not auto-repaired |
| Entra group permission-level reassignment | Structural permission model changes require operator review and checkpoint |
| Template file content updates (beyond missing-file restore) | Content versioning beyond presence check is later-phase maturity |
| Data list schema evolution (new columns, field type changes) | Schema migration is a distinct concern from drift detection |

### 4.3 Rule

If a capability is not listed in 4.1 as "Active," it is advisory by default. No Phase 8 implementation may silently expand the active boundary.

---

## 5. SPFx responsibilities in Phase 8

The Admin SPFx app (`apps/admin`) is the operator console. In Phase 8, it adds:

| Responsibility | Detail |
|---------------|--------|
| **Asset scoping** | Operator selects which HB Intel project site(s) to inspect or repair |
| **Drift review** | Display structured drift findings with severity, expected vs observed values |
| **Standards comparison summary** | Show which standards areas are compliant, drifted, or unknown |
| **Preview display** | Show impact preview before repair or reapplication — what will change |
| **Repair initiation** | Operator launches repair run after reviewing preview; backend executes |
| **Package posture display** | Show app catalog presence/version for HB Intel packages |
| **API posture display** | Show API access permission status for HB Intel-related permissions |
| **Run history and evidence** | Display SharePoint control run history, audit events, and evidence |

**SPFx must NOT:**

- Execute SharePoint Admin API calls, Graph Admin API calls, or PnPjs write operations directly
- Store durable drift or standards state in browser storage
- Auto-approve repair actions without operator review
- Expand the asset scope beyond the managed-asset boundary
- Bypass preview/dry-run before repair initiation

---

## 6. Backend/control-plane responsibilities in Phase 8

The backend control plane (`backend/functions`) owns all privileged execution:

| Responsibility | Detail |
|---------------|--------|
| **Standards resolution** | Resolve what "correct" looks like for a given HB Intel site, derived from provisioning step expectations |
| **Site posture collection** | Read live site state via PnPjs with Managed Identity tokens |
| **Drift comparison** | Compare live state against resolved standards; produce structured drift findings |
| **Preview generation** | Produce impact summary (create/update/delete/no-change items) for proposed repair |
| **Repair orchestration** | Execute controlled repair steps through adapter registry; audit and capture evidence |
| **Package posture collection** | Inspect tenant app catalog for HB Intel SPFx package presence and version |
| **API posture collection** | Inspect API access permission status for HB Intel-related grants |
| **Evidence capture** | Store drift reports, preview results, repair run evidence using existing evidence service |
| **Audit events** | Record `StandardsApplied`, drift detection, repair actions using existing audit service |

All SharePoint control runs use `AdminDomain.SharePointControl` in the existing run/audit/evidence stores.

---

## 7. Adapter responsibilities in Phase 8

Phase 8 extends the existing adapter registry:

| Adapter key | Phase 8 additions |
|------------|------------------|
| `sharepoint-site:lifecycle` | Add invokers for: site posture read, structure comparison, library/list/file presence check, hub association check, repair (idempotent create) |
| `sharepoint-alm:package-install` | Add invoker for: app catalog posture read (package presence, version) |
| `sharepoint-api-access:permissions` | Add invoker for: API access posture read (permission status) |

**Adapter design rules:**

- Comparison invokers must be side-effect-free (read-only).
- Repair invokers must support dry-run mode (via `dryRun` context flag) to produce preview without writes.
- Repair invokers must be idempotent — creating missing items, not deleting or restructuring existing ones.
- Adapters must not expand scope beyond the managed-asset boundary.

---

## 8. Standards comparison / preview / repair boundary

### 8.1 Standards comparison model

Standards are derived from the provisioning saga step definitions:

| Standards area | Source | Check type |
|---------------|--------|-----------|
| **Site existence** | Step 1 — deterministic URL from project metadata | Existence check |
| **Document libraries** | Step 2 — CORE_LIBRARIES list | Presence + versioning configuration |
| **Template files** | Step 3 — TEMPLATE_FILE_MANIFEST | File presence in expected library paths |
| **Data lists** | Step 4 — core + workflow-family list definitions | List presence + expected field schema |
| **Web parts** | Step 5 — `HB_INTEL_SPFX_APP_ID` in app catalog | Package presence in catalog + site install status |
| **Security groups** | Step 6 — three-group naming convention | Group existence in Entra |
| **Hub association** | Step 7 — `SHAREPOINT_HUB_SITE_ID` | Association status |

Standards are **code-default** in Phase 8 (derived from provisioning step definitions). Live-override and merged-source standards belong to the Phase 10 configuration governance model.

### 8.2 Preview / dry-run requirement

All repair and standards-application flows must:

1. Produce a preview result (`IAdminPreviewResponse`) before execution.
2. Show the preview to the operator in the SharePoint control lane.
3. Require operator confirmation before proceeding to active repair.
4. Record the preview as evidence on the run.

Preview must use the existing `IAdminPreviewImpactItem` contract with `changeType: create | update | delete | no-change` to show exactly what would happen.

### 8.3 Repair execution boundary

| Repair action | Allowed? | Constraint |
|--------------|----------|-----------|
| Create missing document library | Yes | Idempotent; versioning enabled |
| Create missing data list | Yes | Idempotent; schema from provisioning Step 4 |
| Upload missing template file | Yes | Idempotent; never overwrite existing (T08 §3.4 pattern) |
| Create missing Entra security group | Yes | Idempotent; follows three-group naming convention |
| Join hub site | Yes | Idempotent; only if not already associated |
| Delete existing library/list/file | **No** | Destructive — out of Phase 8 active scope |
| Modify existing list schema | **No** | Schema migration deferred to later maturity |
| Reassign permission levels | **No** | Structural permission changes require checkpoint; advisory in Phase 8 |
| Install/upgrade app catalog package | **No** | ALM deployment workflow deferred; advisory posture only |

---

## 9. Explicit no-go patterns

| No-go | Rationale |
|-------|-----------|
| **No broad tenant-wide SharePoint active governance in Phase 8** | Only HB Intel-managed assets are in first-wave active scope |
| **No privileged SharePoint repair logic in SPFx** | Backend/control plane owns all writes; SPFx is operator console only |
| **No silent repair without preview / dry-run where practical** | Operator must review impact before any active write |
| **No standards mutation model that conflicts with later config-governance phases** | Phase 8 uses code-default standards from provisioning; Phase 10 adds live-override governance |
| **No treating all SharePoint assets in the tenant as implicitly in-scope** | Managed-asset boundary must be explicit and enforced |
| **No destructive operations (delete, restructure, drop)** | Phase 8 repairs create missing items; it does not remove or restructure existing items |
| **No auto-repair without operator confirmation** | All repairs require preview → operator review → explicit launch |
| **No new persistence tables without justification** | Use existing run/audit/evidence tables with `AdminDomain.SharePointControl` |
| **No Phase 8 control-plane logic in `@hbc/features-admin`** | Features-admin is intelligence/monitoring; control-plane logic belongs in `backend/functions` |
| **No expanding the adapter registry with redundant descriptors** | Extend existing SharePoint adapter descriptors with new invokers rather than creating parallel descriptors |

---

## 10. Cross-links to follow-on Phase 8 artifacts

| Document | Purpose |
|----------|---------|
| [Phase 8 Repo-Truth Audit](admin-spfx-phase-8-repo-truth-audit.md) | Evidence base for this baseline |
| [Phase 8 Summary Plan](Admin-SPFx-IT-Control-Center-Phase-8-Summary-Plan.md) | Objectives, acceptance criteria, non-goals |
| [End-state plan — Phase 8](../admin-spfx-it-control-center-end-state-plan.md) | Deliverables and exit criteria |
| [Target Architecture](../admin-spfx-target-architecture.md) | 4-layer model and key boundaries |
| Prompt-03 — Standards Snapshot and Comparison Model | Formalizes the standards model referenced in section 8.1 |
| Prompt-04 — Drift Detection and Normalization Workflows | Implements the drift comparison described in section 6 |
| Prompt-05 — Preview / Dry-Run and Impact Summary Execution | Implements the preview requirement from section 8.2 |
| Prompt-06 — Controlled Repair / Apply / Reapply Flows | Implements the repair boundary from section 8.3 |
| Prompt-07 — App Catalog and API Posture Validation Lane | Implements the posture visibility from sections 4.1 and 6 |
| Prompt-08 — SPFx SharePoint Control Lane UX | Implements the operator surfaces from section 5 |
| Prompt-09 — Evidence, Audit, Docs, and Runbooks | Documents the completed SharePoint control capabilities |
| Prompt-10 — Validation and Phase 8 Exit Reconciliation | Validates the implementation against this baseline |
