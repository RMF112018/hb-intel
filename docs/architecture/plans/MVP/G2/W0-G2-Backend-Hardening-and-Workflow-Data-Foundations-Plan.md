# Wave 0 — Group 2: Backend Hardening and Workflow Data Foundations Plan

> **Doc Classification:** Canonical Normative Plan — master plan for Wave 0 Group 2 (Backend Hardening and Workflow Data Foundations). Governs `W0-G2-T01` through `W0-G2-T09`. Must be read before any Group 2 task plan is executed.

**Version:** 1.0
**Date:** 2026-03-14
**Status:** Active — ready for implementation once Group 1 acceptance gate is satisfied and ADR-0090 exists on disk
**Governs:** `W0-G2-T01` through `W0-G2-T09`
**Read with:** `CLAUDE.md` v1.6 → `current-state-map.md` → `HB-Intel-Wave-0-Buildout-Plan.md` v1.1 → `W0-G1-Contracts-and-Configuration-Plan.md` v1.1 → this document → individual T01–T09 plans
**Wave 0 umbrella reference:** `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` §Group 2
**Validation basis:** `docs/architecture/plans/MVP/wave-0-validation-report.md`
**Next ADR available:** ADR-0114
**Source authority:** current-state-map.md §1 (Tier 1 governs present truth)

---

## 1. Purpose

Group 2 is the **data-model and provisioning hardening tranche** for Wave 0.

Group 1 locked five foundational contracts: what sites look like, how Entra ID groups are structured, how notifications are dispatched, how configuration is governed, and what the permission model is. Group 2 consumes those locked contracts and builds the **SharePoint list infrastructure, document library structures, seeded file sets, and provisioning saga extensions** that every provisioned project site will contain.

### Why Group 2 Exists

The provisioning saga currently creates a foundational set of artifacts: one document library (`Project Documents`), eight core SharePoint lists, and a scaffolded template file upload mechanism. This foundation is structurally sound but operationally incomplete. A provisioned project site today contains the minimum required to function — it does not yet contain the data structures that will drive Wave 1 application features, support structured data capture for the five workflow families, or enable the relational access patterns that the HB Intel platform depends on.

Group 2 exists to close that gap. Specifically, Group 2 must:

1. Define and implement the **`pid` relational contract** — the column standard that makes every SharePoint list queryable by project from any part of the application
2. Define and implement **workflow-family list schemas** for all five approved families: startup/kickoff/handoff, closeout/turnover/punch, safety/JHA/incident, project controls/permits/inspections/constraints, and financial/buyout/forecast/draw/subcontract
3. Define and implement **parent/child list patterns** where checklist-style or repeating-child-row workflows justify them (JHA steps, closeout items, punch items, kickoff tasks)
4. Define and implement **document library folder structures** for the department-specific libraries (`Commercial Documents`, `Luxury Residential Documents`) using a hybrid-preserve posture derived from the existing operational directory trees
5. Define and implement **seeded file and template provisioning** for selected workflows where transition-state operations require a working file in addition to or instead of a structured list
6. Update **provisioning saga Steps 3 and 4** to execute the full G2 list and library schema against every provisioned project site
7. Define and implement **validation, idempotency, and migration standards** for all G2 provisioned structures
8. Establish **rigorous testing and verification standards** for all G2 provisioning changes

### What Group 2 Is Not

Group 2 is a **data-foundation and provisioning hardening group**. It is not a UI feature-delivery group. Group 2 does not:

- Build new user-facing routes, pages, or UI components in any SPFx or PWA app
- Implement Wave 1 data entry forms, workflow management surfaces, or reporting dashboards
- Expand the provisioning request form with new user-visible fields (that is Group 4/5 scope)
- Implement the `@hbc/workflow-handoff` or `@hbc/bic-next-move` platform wiring (that is Group 3 scope)
- Build the admin UI for provisioning failures or the controller gate review surface (that is Group 4 scope)
- Implement SignalR real-time wiring for app surfaces (that is Group 3 scope)

Every G2 deliverable is a backend or provisioning-config artifact. The surfaces that consume these structures belong to later groups. The absence of consuming surfaces is expected and correct — G2 builds the structure; later groups build against it.

---

## 2. Relationship to Governing Documents

### 2.1 Relationship to Wave 0 Umbrella Plan

`HB-Intel-Wave-0-Buildout-Plan.md` (v1.1) defines Group 2 as the second implementation group. The umbrella plan's **"GROUP 2 — Backend Hardening and Data Foundations"** section defines G2's purpose at the tranche level. This master plan refines and expands that definition into task-level implementation guidance.

G2 does not extend or override the Wave 0 umbrella plan. If a conflict arises, the umbrella governs — surface the conflict as a plan amendment rather than silently overriding.

### 2.2 Relationship to Group 1

Group 1 produced five locked contracts that G2 consumes directly. G2 plans must respect these contracts without renegotiating them:

| G1 Contract | G2 Consumer Task(s) |
|-------------|---------------------|
| Site template specification (T01) — core libraries, 8 core lists, add-on model, department pruning | T07 (saga updates), T08 (validation rules) |
| Entra ID group model (T02) — three-group naming, lifecycle, role assignments | T07 (step 6 remains G1-owned; G2 must not duplicate) |
| Notification contract (T03) — event matrix, `@hbc/notification-intelligence` integration path | T07 (no new notification events in G2 scope) |
| Environment configuration (T04) — config classification registry | T01 (G2 list/library names are config, not hardcoded strings) |
| Sites.Selected validation (T05) — Path A confirmed or fallback documented | T07 (step 3/4 run inside the permission model T05 determines) |

**Critical G2 constraint from G1:** The G1 T01 plan confirmed 8 core lists in `HB_INTEL_LIST_DEFINITIONS` as the Wave 0 core (product owner decision 2026-03-14). G2 **extends** this existing list set with workflow-family-specific lists. G2 does **not** replace or alter the 8 core lists. G2's workflow-family lists are additions that go into the same Step 4 provisioning path or into a new companion step.

### 2.3 Relationship to Validation Report

`wave-0-validation-report.md` (2026-03-14) established the corrected repo posture that G2 plans must reflect:

- Backend auth uses `DefaultAzureCredential` (Managed Identity), not MSAL OBO — G2 plans reference Managed Identity exclusively
- Step 3 (`step3-template-files.ts`) is scaffolded with `TEMPLATE_FILE_MANIFEST`, `ADD_ON_DEFINITIONS`, and a department library pruning stub — G2 implements the actual asset files and activates the department pruning logic
- Step 4 (`step4-data-lists.ts`) calls `HB_INTEL_LIST_DEFINITIONS` — G2 extends this with the workflow-family lists
- `withRetry` does not parse `Retry-After` headers (G2.1 in the umbrella plan) — G2 must implement this fix
- Steps 3–4 compensation is incomplete (saga only compensates Steps 1, 2, 7) — G2 must document the compensation posture for the additional structures

### 2.4 Relationship to MVP Project Setup Plan Set

The MVP Project Setup plan set (`docs/architecture/plans/MVP/project-setup/`) is the detailed task-level plan for the Project Setup stream. Group 2 runs concurrently with or immediately after the Project Setup stream. Key interactions:

- **T02 (Contracts and State Model):** Project Setup T02 adds the `department` field to `IProjectSetupRequest`. G2 depends on this field being present in `IProvisionSiteRequest` and `IProvisioningStatus` before department library pruning in Step 3 can be activated. If T02 is not yet complete when G2 begins, Step 3 department pruning must remain in its scaffolded (no-op) state until the field is added.
- **T06 (SharePoint Template and Permissions Bootstrap):** T06 specifies the department library pruning implementation. G2's T07 must align with T06's pruning model, not define a competing approach.
- **T07 (Admin Recovery, Notifications, Audit):** T07 handles notification template registration. G2's list provisioning does not introduce new notification events. Any new events discovered during G2 must be logged as a T07 amendment rather than implemented ad-hoc.

### 2.5 Relationship to CLAUDE.md v1.6

All Group 2 plans are governed by CLAUDE.md v1.6 in full. Critical constraints:

- **Phase 7 Gate (§6.3):** G2 implementation may not begin until ADR-0090 exists on disk. G2 planning may proceed before ADR-0090 is created, but no implementation task may start.
- **Zero-Deviation Rule (§1.2):** Any deviation from the locked G2 decisions (§3 below) or locked G1 contracts requires a superseding ADR.
- **Guarded Commit Rule (§1.5):** All G2 code and documentation changes must commit through `pnpm guarded:commit`. No direct `git commit`.
- **Document Classification Rule (§1.4):** Every new document produced by G2 must carry a classification.
- **Package Relationship Rule (§1.7):** Before adding any dependency or creating any new package, consult `docs/architecture/blueprint/package-relationship-map.md`. G2 must not introduce cross-package boundary violations.

---

## 3. Locked G2 Decisions

The following decisions were established during the interview process and are locked inputs for all G2 task plans. They may not be reversed or materially altered during G2 planning or implementation without a superseding ADR.

### Decision G2-1 — Workflow Representation Direction
**Selection:** Most structured template workflows should have backing lists created now in preparation for future application features.

**Meaning:** G2 does not wait for Wave 1 app teams to ask for list structures. The lists are created now, empty, as part of provisioning, so that when the consuming features arrive they have a governed, pre-existing structure to build against rather than inventing their own.

**Implication:** G2 will add significantly more lists to the provisioned site than the current 8-list core. This is deliberate. The lists exist to capture structured data when features are ready — not because features are being built now.

### Decision G2-2 — Workflow-Family Scope
**Selection:** All five workflow families get dedicated list groups created for every project site:
1. Startup / kickoff / handoff
2. Closeout / turnover / punch
3. Safety / JHA / incident
4. Project controls / permits / inspections / constraints
5. Financial / buyout / forecast / draw / subcontract

**Meaning:** Every provisioned project site will receive lists across all five families, regardless of project type or department. This is the complete Wave 0 workflow-family scope. No family is optional.

**Implication:** G2 must define schemas for every family and ensure Step 4 provisions all of them. Some lists will be empty for months while Wave 1 features are built. That is the correct and expected state.

### Decision G2-3 — Cross-Family Ownership Rule
**Selection:** Each workflow has one primary owning family. Other families are handled through explicit cross-references, not duplicated ownership.

**Meaning:** A workflow like "Estimating Kickoff" belongs to the Startup family, not to the Financial family — even though it has cost implications. The Financial family references the kickoff record via `pid` rather than owning a duplicate.

**Implication:** T01 defines the ownership doctrine. T02–T06 enforce it. When a field or record type could plausibly belong to more than one family, T01's ownership matrix is the tiebreaker.

### Decision G2-4 — PID Relational Key
**Selection:** Every list includes a `pid` column. `pid` is the 7-digit unique project identifier used for relational data access throughout the application.

**Meaning:** Every SharePoint list item created in a project site stores the project's canonical identifier in a `pid` column. This column is the cross-list query key — any feature that needs to pull all safety records, all financial records, or all closeout records for a given project uses `pid` as the filter.

**Implication:** T01 defines the `pid` field contract (type, format, required status, indexing requirement). Every T02–T06 list schema must include `pid` as a required indexed field. The provisioning saga must populate the `pid` field default value at list creation time so that items added to the list are pre-labeled with the project identifier.

**Alignment note:** The existing codebase uses `projectId` (UUID) and `projectNumber` (formatted string, e.g., "25-001-01"). The `pid` relational key specified in the interview maps to the project's canonical human-readable identifier. T01 must establish the alignment between `pid`, `projectId`, and `projectNumber` and make a clear implementation recommendation. See T01 §PID Alignment Note.

### Decision G2-5 — Source-of-Truth Transition Model
**Selection:** Transition model. Some workflows may remain file-backed temporarily while the list captures the structured fields needed for future features.

**Meaning:** G2 does not force every workflow fully onto lists immediately. For workflows where the operational team currently uses a file (e.g., a PDF safety plan, an Excel buyout log), G2 creates the backing list structure AND provisions the relevant template file. The list exists but may not yet be the operational source of truth. Over time, Wave 1 features will migrate operations onto the list.

**Implication:** T01 defines the four-state seeded-file classification model:
- **Seed now:** Provision both a backing list and a seeded template file
- **List only:** Provision only the backing list; no seeded file required
- **Reference file only:** Provision only a template file; list structure is premature or not yet justified
- **Future feature target:** Neither list nor file in Wave 0; the workflow is recognized but deferred

T02–T06 apply this classification to every workflow in their scope.

### Decision G2-6 — Checklist/Form Modeling
**Selection:** Parent record + child item/task lists for obvious checklist/form workflows.

**Meaning:** When a workflow clearly consists of a header record (the checklist instance) and a set of repeating child records (the checklist items), G2 creates two lists: a parent list with the header fields and a child list with the item fields. The child list includes a lookup column pointing to the parent list.

**Implication:** T01 defines when to use parent/child vs. flat list. Workflows confirmed as parent/child are: Job Startup Checklist, Job Closeout Checklist, JHA (header + steps), and Punch List (already in core, but the parent-list companion is new). T02–T06 specify the exact parent/child structures for each qualifying workflow.

### Decision G2-7 — Mixed Lists and Seeded Files
**Selection:** Mixed approach. G2 creates both backing lists and selected seeded files/templates where operationally useful. Plans distinguish between the four seeded-file states.

**Meaning:** See Decision G2-5. No workflow is forced onto one model. The classification is driven by operational reality: if the team needs a working file today, seed it. If a structured list will serve the feature later, create it. Both can coexist in the transition period.

### Decision G2-8 — Template Document Library / Folder Structures
**Selection:** G2 creates template document library folder structures for transition-state operations. Structures are kept shallow enough to stay governable.

**Meaning:** The department-specific document libraries (`Commercial Documents`, `Luxury Residential Documents`) receive a rationalized folder tree during provisioning. These folder trees are derived from the existing operational directory examples (the ResDir tree for luxury residential; an inferred commercial structure). The trees preserve the main operational sections and most important subfolders but omit obvious legacy clutter, overly deep nesting, and duplicate naming patterns.

**Implication:** T07 specifies the rationalized folder trees. The trees must be created as part of Step 3 (template files) or a companion step. The depth limit is 2 levels below the library root (no 3-level-deep folder paths in the Wave 0 provisioning standard). See §6.2 for the Hybrid-Preserve Doctrine.

### Decision G2-9 — Department Document-Library Posture
**Selection:** Use the shared department library trees as hybrid-preserve references. Preserve the main section structure and the most operationally important subfolders. Allow rationalization of obvious legacy clutter, duplicate naming, and overly deep nesting. Preserve the Group 1 department pruning model.

**Meaning:** The luxury residential ResDir directory tree is the operational reference for the `Luxury Residential Documents` library folder structure. G2 does not replicate it verbatim (that would introduce 3+ levels of nesting for the estimating division structure) and does not flatten it into a generic placeholder. G2 rationalizes it to a 2-level-max folder hierarchy that preserves the operational categories that project teams rely on.

### Decision G2-10 — G2 Scope Boundary
**Selection:** G2 is a data-foundation and provisioning group, not a full feature/UI delivery group.

**Meaning:** If during G2 implementation a developer identifies an opportunity to build a consuming feature (a form, a route, a component), that opportunity must be deferred and tracked as a Group 4/5 task. G2 does not expand scope to include UI work.

---

## 4. Workflow-Family Map

### 4.1 Family Overview

Group 2 defines list structures for five workflow families. Each family has one owning task plan (T02–T06) and a set of lists that belongs exclusively to it.

| Family | Owner Plan | Primary Context | Cross-Family Links |
|--------|-----------|----------------|-------------------|
| Startup / Kickoff / Handoff | T02 | Project start — contract review, Procore setup, team assignment, budget transfer | → Financial (kickoff cost structure), → Safety (safety plan initiation), → Project Controls (permit applications) |
| Closeout / Turnover / Punch | T03 | Project completion — inspections complete, turnover packages, O&M manuals, final payments | → Financial (final payment), → Project Controls (final inspections), → Safety (incident closeout) |
| Safety / JHA / Incident | T04 | Ongoing safety compliance — JHA per work task, incident recording, site safety plan tracking | → Project Controls (permit safety conditions), → Startup (safety plan seeding) |
| Project Controls / Permits / Inspections / Constraints | T05 | Permit lifecycle, required inspections, schedule constraints, 3-week look-ahead posture | → Financial (permit cost impacts), → Closeout (final inspection completion) |
| Financial / Buyout / Forecast / Draw / Subcontract | T06 | Buyout tracking, monthly forecast, pay application schedule, subcontract compliance | → Startup (kickoff cost structure), → Closeout (final cost reconciliation) |

### 4.2 Primary Ownership Doctrine

**Rule:** A workflow record belongs to exactly one family. The owning family's list is the source of record for that workflow type. Other families that need to reference a record from a different family do so by:

1. Storing the `pid` value (to find the record in the owning family's list)
2. Storing a lookup column pointing to the owning family's parent record (for parent/child relationships that span families)
3. Storing a plain text or choice field that names the cross-referenced record title or number (for lightweight cross-references)

**Anti-pattern:** Creating duplicate list structures in two families for the same workflow. If a financial record (subcontract) is referenced by the closeout team, they reference the subcontract's `pid` and contract number — they do not create a duplicate subcontract list in the Closeout family.

### 4.3 Eight Core Lists Relationship

The 8 core lists in `HB_INTEL_LIST_DEFINITIONS` remain owned by the core template — they are not reassigned to workflow families. The workflow-family lists are additive. The family assignment table below clarifies the overlap and ownership:

| List | Core Template Owner | Workflow Family Alignment |
|------|--------------------|-----------------------------|
| RFI Log | Core — `HB_INTEL_LIST_DEFINITIONS` | Project Controls (informational overlap — RFIs relate to clarifications; core ownership preserved) |
| Submittal Log | Core | Project Controls (informational overlap; core ownership preserved) |
| Change Order Log | Core | Financial (informational overlap; core ownership preserved) |
| Issues Log | Core | Project Controls (informational overlap; core ownership preserved) |
| Daily Reports | Core | Startup/Kickoff family context (field activity during active construction) |
| Meeting Minutes | Core | Startup/Kickoff family context (ongoing meeting records) |
| Punch List | Core | Closeout (informational overlap; core ownership preserved — Closeout family creates a parent header list to manage punch groupings) |
| Safety Log | Core | Safety (informational overlap; core ownership preserved — Safety family creates dedicated JHA and Incident lists as separate structures) |

**Critical rule:** G2 must not add `pid` to the 8 core lists as a G2 task. The 8 core lists are owned by the core template (governed by G1 T01). If `pid` needs to be added to the core lists, that is a separate amendment to the G1 T01 plan. G2's `pid` mandate applies only to the new workflow-family lists G2 introduces.

---

## 5. Dependency and Boundary Doctrine

Group 2 touches several packages and services. The boundaries below are binding.

### 5.1 `@hbc/provisioning`

- **G2 Role:** G2 consumes `@hbc/provisioning`'s state machine, status model (`IProvisioningStatus`), notification templates, and Zustand store. G2 may propose additions to `IProvisioningStatus` (e.g., a `workflowListsProvisioned: boolean` flag) via the Project Setup T02 model contract process, but must not unilaterally modify the `@hbc/provisioning` source.
- **Boundary:** G2 does not redesign the provisioning state machine. G2 does not add new saga steps without a clear architectural justification and a companion ADR. If G2 requires a new step (e.g., Step 4b for workflow-family lists), that step addition must be documented in T07 and reviewed before implementation.
- **What G2 may change:** `backend/functions/src/config/list-definitions.ts` (extend with workflow-family lists), `backend/functions/src/config/template-file-manifest.ts` (add seeded files), `backend/functions/src/functions/provisioningSaga/steps/step3-template-files.ts` (activate department pruning, add folder creation), `backend/functions/src/functions/provisioningSaga/steps/step4-data-lists.ts` (extend with workflow-family list provisioning).

### 5.2 `packages/models` (`@hbc/models`)

- **G2 Role:** `IProvisionSiteRequest`, `IProvisioningStatus`, and `IListDefinition` are the canonical data contracts. G2 may need to propose additions: a `workflowListsProvisioned` boolean on `IProvisioningStatus`, and a `pid` default-value field on list definitions.
- **Boundary:** G2 does not modify `@hbc/models` unilaterally. Model changes must go through the Project Setup T02 amendment process. G2 specifies what changes are needed; Project Setup T02 implements them.
- **Current `IListDefinition` (from `backend/functions/src/services/sharepoint-service.ts`):** Has `title`, `description`, `template`, and `fields` (each field has `internalName`, `displayName`, `type`, `required`, `choices`). G2 workflow-family lists follow this exact contract.

### 5.3 `@hbc/auth`

- **G2 Role:** Not directly involved in G2's list provisioning work. Authorization for accessing the lists (read/write/admin) is governed by the Entra ID group model from G1 T02 and `@hbc/auth`'s permission resolution.
- **Boundary:** G2 must not introduce new auth logic, new permission checks, or new role definitions. If G2 surfaces a gap in the permission model (e.g., a new role needed to manage a specific list family), it logs that as a T02 amendment request — not a G2 auth change.

### 5.4 `@hbc/notification-intelligence`

- **G2 Role:** Not directly involved. G2's list provisioning does not generate new notification events.
- **Boundary:** If G2 implementation reveals that a notification should be sent when a workflow-family list is provisioned (e.g., "your project site is now fully provisioned with all workflow lists"), that notification event must be proposed as a G1 T03 amendment — not implemented ad-hoc in G2.

### 5.5 Backend Saga / Config / Services

- **G2 Role:** G2 directly implements changes to:
  - `backend/functions/src/config/list-definitions.ts` — the primary extension point for G2 list additions
  - `backend/functions/src/config/template-file-manifest.ts` — the primary extension point for G2 seeded file additions
  - `backend/functions/src/config/add-on-definitions.ts` — G2 may add new add-on entries if justified by T07
  - `backend/functions/src/functions/provisioningSaga/steps/step3-template-files.ts` — department pruning activation and folder creation
  - `backend/functions/src/functions/provisioningSaga/steps/step4-data-lists.ts` — workflow-family list provisioning extension
  - `backend/functions/src/utils/retry.ts` — G2.1 Retry-After header fix (referenced in Wave 0 umbrella plan)
- **Boundary:** G2 must not redesign the saga orchestrator's step execution loop, retry semantics, compensation semantics, or SignalR push behavior. G2 extends the configuration and step implementations — it does not rearchitect the orchestrator.

### 5.6 `apps/*` (Downstream Consumers)

G2 creates structures that downstream Wave 1 features will consume. G2 must not modify any `apps/*` source unless a bug fix is required (analogous to the admin router fix in the validation report). G2 list structures are backend/provisioning changes only.

---

## 6. Foundational Standards

### 6.1 PID Contract Summary

Every workflow-family list introduced by G2 must include a `pid` column as a required, indexed, single-line text field. `pid` stores the project's canonical identifier. This column is the cross-list query key for every Wave 1 feature that pulls records for a specific project.

Full specification: see T01 §PID Contract.

### 6.2 Hybrid-Preserve Doctrine for Document Library Trees

The department-specific libraries (`Commercial Documents`, `Luxury Residential Documents`) receive a rationalized folder tree during provisioning. The hybrid-preserve doctrine governs how this tree is derived from operational examples:

**Preserve:**
- The main numbered sections (01-Owner Files, 02-Construction Drawings, 03-Engineering Reports, 04-Permit, etc.) — these are the operational navigation categories that project teams rely on
- The most important operationally-used subfolders (e.g., Contract, Insurance, NOC under Owner Files; CPM, 3 Week Look Ahead under Schedule)

**Rationalize:**
- The Division 01–16 bids subfolder tree under Estimating — this is pre-award estimating structure; it does not belong in the provisioned project site library (which is post-award)
- Overly deep nesting beyond 2 levels
- Duplicate naming patterns (e.g., "HB Permits" and "Sub Permits" as separate folders under the same parent — rationalized to a single Permits folder with sub-categorization by file naming convention)
- Legacy folders that have no operational function for the current project team

**Depth limit:** No folder path in the Wave 0 provisioned structure exceeds 2 levels below the library root. The limit prevents navigation complexity and keeps SharePoint folder metadata manageable.

Full folder tree specifications: see T07 §Department Library Folder Trees.

### 6.3 Seeded-File Classification

| Classification | Meaning | G2 Action |
|---------------|---------|-----------|
| **Seed now** | Both a backing list and a seeded template file are provisioned. The file is the operational source of truth in the transition period; the list captures structured data for future features. | Create both the list (in Step 4 extension) and the template file asset (in Step 3 / template-file-manifest.ts) |
| **List only** | Only the backing list is provisioned. No template file is needed because the workflow is sufficiently captured by structured fields. | Create the list only |
| **Reference file only** | Only a template document is seeded into the document library. The workflow does not yet justify a structured list. | Create the template file only |
| **Future feature target** | Neither list nor file in Wave 0. The workflow is recognized but deferred. | No G2 action; log as a future group input |

Full classification decisions per workflow: see T02–T06.

---

## 7. Task Sequencing

### 7.1 Why T01–T09 Are Ordered This Way

The ordering is not arbitrary. Each task builds on contracts established by earlier tasks.

**T01 must come first.** T01 is the schema contract and governance standard that every other data model task (T02–T06) must follow. T01 establishes `pid` semantics, naming conventions, parent/child rules, ownership doctrine, and seeded-file classifications. Without T01, each of T02–T06 would make independent assumptions that may conflict.

**T02–T06 may proceed in parallel once T01 is locked.** The five workflow-family data models (T02–T06) have no ordering dependency on each other — they are independent families. An implementation team with sufficient bandwidth can work T02–T06 in parallel after T01 is finalized. The plans are designed to enable this.

**T07 depends on T01–T06 being complete.** T07 specifies how all of the data model work from T01–T06 is fed into provisioning saga Steps 3 and 4. It cannot be completed until the list schemas, seeded file lists, folder trees, and add-on extensions from T01–T06 are finalized.

**T08 depends on T07.** T08's validation and idempotency rules are specific to the structures T07 says will be provisioned. T08 cannot be written at full precision until T07 specifies what exactly will be created.

**T09 depends on T07 and T08.** The testing and verification plan in T09 tests the provisioning behavior specified in T07 against the validation rules in T08.

### 7.2 Implementation Sequence Within T07–T09

Within the backend implementation work (T07 activation), the recommended sequence is:

1. Implement the `withRetry` Retry-After header fix (G2.1 — this should be the first G2 code change, independently of the list schema work)
2. Extend `list-definitions.ts` with workflow-family lists (driven by T01–T06 finalized schemas)
3. Extend `template-file-manifest.ts` with seeded file entries (driven by T02–T06 seeded-file classifications)
4. Activate Step 3 department library pruning (consuming the `DEPARTMENT_LIBRARIES` config already scaffolded in `core-libraries.ts`)
5. Activate Step 3 folder creation for department library trees
6. Activate Step 4 workflow-family list provisioning (extending `createDataLists` call)
7. Validate end-to-end against staging per T08 and T09

### 7.3 Group 3 Entry Condition

Group 3 may not begin until the following G2 conditions are satisfied:

1. T01 schema contract is locked and all T02–T06 list schemas are finalized
2. T07 provisioning updates are fully implemented and committed (guarded commit)
3. T08 validation has been executed against staging — all structures confirmed present and correctly formed
4. T09 test suite is implemented and all tests pass (P1 gate: build, lint, typecheck, test)
5. `docs/reference/data-model/` reference documents are created and classified
6. No G3 task requires a data structure that is not yet provisioned

---

## 8. Required Supporting Artifacts

Group 2 must produce the following reference and configuration artifacts as part of its deliverable. These are not optional — they are the living implementation record for the structures G2 creates.

| Artifact | Location | Produced by | Consumed by |
|----------|----------|-------------|-------------|
| G2 list schema reference | `docs/reference/data-model/workflow-list-schemas.md` | T01–T06 | Wave 1 app teams, G3, G4 |
| PID contract reference | `docs/reference/data-model/pid-contract.md` | T01 | All workflow-family lists, Wave 1 developers |
| Workflow-family ownership map | `docs/reference/data-model/workflow-family-map.md` | T01, T02–T06 | Wave 1 app teams, G3 |
| Department library folder spec | `docs/reference/provisioning/department-library-folders.md` | T07 | G4 SPFx surfaces, admin runbook |
| Seeded file manifest | `docs/reference/provisioning/seeded-file-manifest.md` | T07 | G4/G5 setup form, admin runbook |
| G2 provisioning update record | In-plan trace (T07 §Implementation Record) | T07 | G3 entry validation |

All reference documents must be added to `current-state-map.md §2` upon creation with the document class "Reference."

### ADR Inputs

G2 is expected to produce inputs for:
- **ADR-0115** (if created): G2 workflow-family list schema decisions — captures the `pid` contract, parent/child decisions, and workflow-family ownership model as a permanent record
- **ADR-0116** (if created): G2 department library folder structure decisions — captures the hybrid-preserve rationalization decisions

Both ADRs should be drafted at the close of T01–T06 planning and formalized after T07 implementation confirms the decisions are implementable.

---

## 9. Acceptance Gate

Group 2 is complete when all of the following conditions are satisfied:

**T01 — Schema Standards and PID Contract:**
- [ ] `pid` field contract is fully specified (type, format, indexing requirement, default value mechanism, alignment with `projectNumber`)
- [ ] Global naming conventions are documented and applied in all T02–T06 schemas
- [ ] Parent/child governance rules are documented with specific criteria for when to use each pattern
- [ ] Seeded-file classification decisions are documented for each workflow in T02–T06
- [ ] Workflow-family ownership matrix is complete

**T02–T06 — Data Model Task Plans:**
- [ ] Every workflow in each family is classified: list-only, seed-now, reference-file-only, or future-feature-target
- [ ] Every list that will be provisioned has a full field schema specified (matching `IListDefinition` contract)
- [ ] Every parent/child relationship is specified (parent list fields, child list fields, lookup column target)
- [ ] `pid` is included in every list schema
- [ ] Every seeded file is named and its target library specified

**T07 — Provisioning Saga Updates:**
- [ ] All G2 list definitions are merged into `list-definitions.ts` or a companion config file
- [ ] All G2 seeded file entries are in `template-file-manifest.ts` or companion
- [ ] Department library pruning in Step 3 is activated and tested
- [ ] Department library folder trees are implemented and tested
- [ ] `withRetry` Retry-After header fix is implemented
- [ ] All Step 3 and Step 4 changes are covered by the guarded commit config

**T08 — Validation, Idempotency, Migration:**
- [ ] Idempotency rules are documented and tested for all G2 structures
- [ ] Migration/coexistence posture is documented for each seeded-file/list combination
- [ ] Staging validation run has confirmed all G2 structures are created correctly

**T09 — Testing and Verification:**
- [ ] Unit tests cover all new config/schema/helper logic
- [ ] Integration tests cover Step 3 and Step 4 behavior for G2 structures
- [ ] Idempotency tests confirm re-run no-ops
- [ ] Negative-path tests cover partial failures
- [ ] All P1 gate tests pass: `pnpm turbo run build && pnpm turbo run lint && pnpm turbo run check-types && pnpm turbo run test` (P1 filter)

**Overall Group 2:**
- [ ] All reference documents exist at `docs/reference/data-model/` and are classified
- [ ] `current-state-map.md §2` is updated with all new G2 documents
- [ ] No UI or feature-delivery work has been introduced
- [ ] Group 3 entry condition is clearly satisfied

---

## 10. Known Risks and Pitfalls

**Risk G2-R1: List count proliferation increases provisioning duration.** G2 adds a significant number of lists to every provisioned site. Each list creation call takes time (PnPjs REST call, SharePoint list creation latency). If the total list count exceeds 30–40, provisioning duration may approach or exceed 10 minutes, risking Azure Function timeout. Mitigation: measure provisioning duration in staging after all lists are defined; if timeout risk exists, introduce a Step 4b with its own retry wrapper rather than stuffing all lists into a single long-running Step 4.

**Risk G2-R2: `pid` default value mechanism is not natively supported in SharePoint list provisioning via PnPjs.** SharePoint lists can have default column values, but the default value mechanism for a new column on a provisioned list is configuration-dependent. If PnPjs `createDataLists` does not support setting a default column value, the `pid` default value must be set through a separate step or via a calculated column formula. T01 must address this and T08 must validate it in staging.

**Risk G2-R3: Department library pruning depends on `status.department` being present.** The `department` field on `IProvisionSiteRequest` and `IProvisioningStatus` is added by Project Setup T02. If G2 implementation begins before T02 is complete, Step 3's pruning activation will fail with a type error. G2 must verify that T02 has added the `department` field before activating the pruning logic. The scaffolded no-op in `step3-template-files.ts` is the correct holding pattern until T02 lands.

**Risk G2-R4: Folder creation in Step 3 adds complexity and potential idempotency issues.** Creating folder trees inside document libraries requires checking whether each folder already exists before creating it, mirroring the `listExists` / `documentLibraryExists` pattern already used. If the SharePoint service does not expose a `folderExists` method, G2 must add one or use an alternative approach (e.g., a `createFolderIfNotExists` wrapper). T09 must verify folder creation idempotency.

**Risk G2-R5: Seeded file assets do not exist yet.** The `template-file-manifest.ts` references file assets in `backend/functions/src/assets/templates/`. G2 must create actual template file assets for every "seed now" classification. If G2 is implemented before the assets are created, Step 3 will silently skip those uploads (per the current graceful skip behavior). The T09 test suite must verify asset file existence, not just successful step execution.

**Risk G2-R6: Financial workflow family schema is complex and may be premature.** Financial list structures (buyout log, draw schedule, forecast) are highly structured and complex. If G2 over-engineers these schemas in Wave 0, it creates migration risk when Wave 1 financial features are built and need different structures. Mitigation: T06 must distinguish between fields that are essential now vs. fields that should wait for Wave 1. The "seed now / list only / reference file only" classification in T06 is the primary risk control.

---

*End of Wave 0 Group 2 — Backend Hardening and Workflow Data Foundations Plan v1.0*
