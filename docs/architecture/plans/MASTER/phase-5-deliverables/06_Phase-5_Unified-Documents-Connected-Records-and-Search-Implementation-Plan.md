# Phase 5 — Unified Documents, Connected Records, and Search Implementation Plan
**Document ID:** 06A  
**Classification:** Phase Implementation Plan Addendum  
**Status:** Proposed Update  
**Primary Role:** Convert Phase 5 into the execution home for the unified HB Intel Documents capability and its connected-record/search behaviors  
**Recommended Parent Location:** `docs/architecture/plans/MASTER/`  
**Read With:**  
- `00_HB-Intel_Master-Development-Summary-Plan.md`  
- `04_Phase-3_Project-Hub-and-Project-Context-Plan.md`  
- `06_Phase-5_Search-Connected-Records-and-Document-Access-Plan.md`  
- `docs/architecture/blueprint/current-state-map.md`  
- `docs/architecture/blueprint/package-relationship-map.md`  
- `docs/architecture/blueprint/Target-Architecture-Blueprint.md`

---

## 1. Purpose

This plan updates the practical implementation posture for Phase 5 by defining how HB Intel should deliver a **unified Documents product** over Microsoft 365 while preserving the existing program logic:

- **Phase 5 remains the primary implementation home** for search, connected records, and document-access unification.
- The feature should **not** be treated as a Phase 3 buildout.
- Phase 3 and early Phase 4 should contribute only the **enabling seams** required so that Phase 5 can execute cleanly and credibly.

This document translates the locked product decisions from the document-access investigation into an execution-hardened implementation plan.

---

## 2. Planning Basis and Repo-Truth Starting Point

### 2.1 Governing program logic

This plan assumes and preserves the following governing sequencing:

1. The **PWA remains the main HB Intel operating surface**.
2. **Project Hub** is the project-centered operating layer.
3. **Phase 5** is the phase that unifies **search and document access**.
4. **Gate F** is not satisfied until search and document journeys are materially simplified.
5. **Phase 5 depends on real data and meaningful project context**; it should not run ahead of those foundations.

### 2.2 Current foundations already present

The implementation plan explicitly builds on existing repo truth rather than assuming a greenfield start:

- `@hbc/auth` is mature and already supports **dual-mode authentication** across PWA and SPFx.
- `@hbc/shell` is mature and already owns **global navigation and project/workspace context**.
- `@hbc/session-state` is mature and already provides **offline-safe IndexedDB session persistence**.
- `@hbc/sharepoint-docs` is mature and already owns **direct Graph API document calls for SharePoint document lifecycle operations**.
- `@hbc/related-items` is mature and already provides the **cross-record relationship panel** pattern.
- `@hbc/workflow-handoff`, `@hbc/acknowledgment`, `@hbc/notification-intelligence`, `@hbc/publish-workflow`, and `@hbc/ui-kit` provide reusable primitives that should be leveraged rather than bypassed.
- `@hbc/features-project-hub` and the PWA `/project-hub` route exist, but Project Hub remains only partially complete and must not absorb the full Documents product prematurely.

### 2.3 Planning consequence

Phase 5 should **not** invent a separate document system.  
It should create an **HB Intel operating layer over Microsoft 365** that uses the current platform foundations and adds:

- normalized navigation,
- context-aware entry,
- connected-record traversal,
- guided publish / handoff behavior,
- preview and native-open behavior,
- permission/source transparency,
- and adaptive desktop/tablet/field usage patterns.

---

## 3. Locked Product and Architecture Decisions

The following decisions are assumed locked for this plan:

### 3.1 Product shape
- One **shared Documents shell** with two entry modes:
  - **Global Documents** from My Work / shell navigation
  - **Workspace-scoped Documents** from Project Hub, Estimating, BD, and other workspaces
- Workspace-scoped Documents is **hard-scoped by default** with a clear **escape hatch** to Global Documents.

### 3.2 Primary roots and smart views
- Primary roots:
  - `My Files`
  - `Projects`
  - `Departments`
  - `Company`
- Secondary smart views:
  - `Shared With Me`
  - `Recent`
  - `Pinned`

### 3.3 Project document model
- `Projects` uses a **hybrid navigation model**:
  - normalized HB Intel project document zones first,
  - raw SharePoint library/folder structure second.
- Core zones are centrally governed; project-level supplemental zones require controlled approval.

### 3.4 Personal versus governed files
- `My Files` is a **personal staging / working area**.
- Promotion into `Projects`, `Departments`, or `Company` uses a **guided publish / handoff model**.
- The governed destination becomes the **canonical authoritative record** after publish.

### 3.5 Boundary model
- Microsoft 365 is the **federated document substrate**.
- HB Intel is the **document operating layer** on top.
- The **PWA is primary**; SPFx is a **companion / embedded surface**.
- The primary interaction model is **context-first**, with browse and search as strong supporting modes.

### 3.6 Discovery, sync, Teams, and access behavior
- Governed roots use **curated registry first + controlled discoverability**.
- Desktop sync is a **secondary escape hatch**.
- Teams is a **collaboration surface HB Intel complements**, not the primary document operating layer.
- Restricted items use **contextual restricted stubs**, not broad visibility.
- Offline posture is **offline-safe access**, not broad offline editing.
- Default file interaction is **preview-first with native Microsoft 365 handoff**.
- Workspace search is **scoped by default, broaden on demand**.
- Device behavior is a **shared shell + adaptive field/tablet mode**, aligned to `@hbc/ui-kit`.

---

## 4. Strategic Phase Objective

Phase 5 must deliver all of the following together:

1. A **single coherent Documents experience** that reduces confusion around SharePoint, OneDrive, Teams, and desktop sync.
2. A **context-first document journey** that lets users move from project/work context to document to related record to action.
3. A **permission-aware, source-transparent operating layer** that explains where a file lives, why it is visible, and whether it is authoritative.
4. A **federated browse/search/smart-view experience** that feels unified without erasing critical storage and governance boundaries.
5. A **credible field/tablet-ready document experience** that is materially better than “desktop browser squeezed onto a tablet.”
6. A **connected-record model** that makes documents discoverable through work, record, and project context rather than folder memory alone.

---

## 5. Scope

## 5.1 In scope

- Global Documents shell in the PWA
- Workspace-scoped Documents surfaces using the shared shell
- Root model:
  - My Files
  - Projects
  - Departments
  - Company
- Smart views:
  - Pinned
  - Recent
  - Shared With Me (de-emphasized/provisional where platform behavior is limited)
- Curated registry of governed sites/libraries/zones
- Controlled “browse other permitted libraries/sites” path
- Normalized project zones + raw library fallback
- Guided publish / handoff from My Files into governed roots
- Canonical-record cues and source/authority badging
- Connected-record linking and contextual entry points
- Preview-first document interaction model
- Native M365 handoff actions:
  - Open in browser
  - Open in desktop app
  - Download
  - Copy link
  - View location
- Permission-aware restricted stubs in relevant context
- Adaptive tablet/field behavior aligned to `@hbc/ui-kit`
- Telemetry and acceptance instrumentation for findability, preview, handoff, and publish flows

## 5.2 Explicitly out of scope

- Replacing Microsoft 365 as the file storage authority
- Broad offline document editing inside HB Intel
- Full enterprise content-governance redesign outside HB Intel
- Overly broad “all files everywhere” auto-discovery as the default experience
- Building a parallel chat/collaboration layer to replace Teams
- Deep desktop-sync dependency as a primary UX pattern
- A fully custom document editor
- Cross-tenant external-user document strategies unless separately approved

---

## 6. Phase Entry Criteria

Phase 5 document implementation should begin only when the following are materially true:

1. **Phase 1 staging-readiness blockers** are resolved for the needed auth / proxy / environment paths.
2. **Phase 3 Project Hub context contracts** are stable enough to provide authoritative project scope.
3. **Phase 4 domain records** are sufficiently real that connected-record traversal is worth implementing.
4. The document registry and normalized project-zone contract are defined and approved.
5. The PWA shell can host the Global Documents experience without major shell rework.
6. Required Microsoft Graph delegated-scope posture is approved and testable.
7. A first-pass decision on search provider / result taxonomy is made for the v1 scope.

---

## 7. Workstream Structure

## 7.1 Workstream A — Product Model, IA, and UX Doctrine Binding

**Goal:** turn the locked product decisions into a governed executable product model.

### Activities
- Define the Documents product map:
  - global shell
  - workspace-scoped launch states
  - root model
  - smart views
  - preview panel
  - publish flow
- Define the user mental model and naming rules for:
  - personal staging
  - governed records
  - authority
  - restricted items
  - sync
  - native handoff
- Define adaptive behavior by mode:
  - desktop
  - tablet
  - field
- Bind the feature to `@hbc/ui-kit` component patterns, density/adaptivity rules, and visual doctrine.

### Deliverables
- Documents IA and state map
- Interaction contract for global vs scoped modes
- UX doctrine addendum for document surfaces
- Tablet/field adaptation matrix

---

## 7.2 Workstream B — Document Runtime and Boundary Layer

**Goal:** introduce the shared runtime layer that sits above `@hbc/sharepoint-docs`.

### Architectural direction
Create a new shared package such as:

- `@hbc/documents`
- or `@hbc/m365-documents`

This package should own:
- root registry orchestration,
- cross-root navigation state,
- workspace scoping,
- source/authority badging,
- preview/details composition,
- publish/promote semantics,
- and search-result/document-result normalization.

### Activities
- Define public contracts for:
  - `DocumentRoot`
  - `DocumentScope`
  - `DocumentAuthorityState`
  - `DocumentSourceBadge`
  - `DocumentAvailabilityState`
  - `DocumentPromotionIntent`
  - `DocumentCanonicalState`
  - `DocumentPreviewCapability`
- Define adapter boundaries between:
  - `@hbc/documents`
  - `@hbc/sharepoint-docs`
  - `@hbc/auth`
  - `@hbc/session-state`
  - `@hbc/related-items`
  - `@hbc/workflow-handoff`
  - `@hbc/publish-workflow`
- Keep direct SharePoint Graph document operations inside `@hbc/sharepoint-docs`.
- Do **not** push global product logic down into `@hbc/sharepoint-docs`.

### Deliverables
- Package boundary ADR or locked design memo
- Runtime contract catalog
- Adapter ownership matrix
- No-go anti-pattern list

---

## 7.3 Workstream C — Root Registry, Governance, and Discovery

**Goal:** make the governed roots operationally real without exposing raw M365 sprawl as the default shell.

### Activities
- Define registry schemas for:
  - Company roots
  - Department roots
  - Project root mappings
  - Supplemental project zones
- Define governance/approval process for:
  - project-level supplemental zones
  - registration changes
  - ordering and defaults
  - smart-view inclusion rules
- Build the controlled discoverability path:
  - “Browse other permitted libraries/sites”
- Define the visibility rules for:
  - curated roots
  - discovered-but-unregistered locations
  - permission-trimmed presentation
  - restricted stubs

### Deliverables
- Document registry schema
- Governance workflow
- Discovery UX contract
- Administration / maintenance model

---

## 7.4 Workstream D — Project Zones and Workspace-Scoped Launches

**Goal:** make Project Hub and other workspaces able to open the shared Documents shell in meaningful context.

### Activities
- Define normalized project zones and their mapping to:
  - library
  - folder
  - content class
  - document purpose
- Create route/deep-link contracts for:
  - Project Hub → Documents
  - Estimating → Documents
  - BD → Documents
  - other workspace launches
- Implement hard-scoped launch states with escape hatch to Global Documents.
- Implement raw-library fallback in Projects.

### Deliverables
- Project-zone registry
- Workspace launch contract catalog
- Raw-library fallback rules
- Project-scoped search behavior spec

---

## 7.5 Workstream E — Publish, Handoff, and Canonical Record Behavior

**Goal:** implement the operating-model difference between personal working files and governed authoritative files.

### Activities
- Define the publish flow from `My Files` to governed destinations.
- Define whether a personal copy remains and how it is marked after publish.
- Bind publish/handoff events into:
  - `@hbc/workflow-handoff`
  - `@hbc/publish-workflow`
  - `@hbc/acknowledgment` where receipt or sign-off is needed
- Provide source and authority explanations:
  - personal draft
  - governed record
  - superseded copy
  - restricted stub
  - sync fallback

### Deliverables
- Publish/handoff flow spec
- Canonical-record UI state model
- Audit / provenance event model
- Notification rules for publish/handoff completion/failure

---

## 7.6 Workstream F — Search, Smart Views, and Connected Records

**Goal:** make document discovery materially better than folder memory.

### Activities
- Implement v1 result taxonomy for:
  - work
  - records
  - documents
  - projects
  - people/owners where applicable
- Implement root-aware search and workspace-scoped search broadening.
- Bind documents into related-item relationships and contextual panels.
- Implement smart views:
  - Pinned
  - Recent
  - Shared With Me (with platform limitations clearly handled)
- Define ranking strategy with source transparency and permission trimming.

### Deliverables
- Search taxonomy and ranking matrix
- Connected-record traversal rules
- Smart-view contract definitions
- Search explainability rules

---

## 7.7 Workstream G — Preview, Native Handoff, and Adaptive Device Behavior

**Goal:** make the first interaction with a document fast, trustworthy, and device-appropriate.

### Activities
- Implement preview-first details panel / surface.
- Define capability matrix:
  - preview supported
  - browser open
  - desktop open
  - download
  - copy link
  - view in source location
- Build adaptive behavior for tablet/field mode:
  - larger hit targets
  - simplified action groups
  - stronger pinned/offline cues
  - lower-density navigation
  - preview-first defaults
- Implement offline-safe continuity:
  - remembered context
  - pinned locations
  - queued publish actions where credible
  - selective cached preview/download patterns

### Deliverables
- File interaction capability matrix
- Preview-provider integration design
- Adaptive UI-kit pattern mapping
- Offline-safe continuity plan

---

## 7.8 Workstream H — Security, Telemetry, Acceptance, and Rollout

**Goal:** make the feature measurable, governable, and safe to adopt.

### Activities
- Validate delegated scope posture and user-consent implications.
- Define “why can/can’t I access this?” explanation patterns.
- Instrument:
  - search success/failure
  - preview-to-open conversion
  - publish completion/failure
  - restricted-stub usage
  - escape-hatch usage
  - sync fallback usage
- Define pilot rollout sequence by user group and workspace.
- Create support, training, and issue-triage guidance.

### Deliverables
- Security and permission explanation matrix
- Telemetry event catalog
- Pilot readiness checklist
- Adoption/training plan

---

## 8. Milestones

### M5.1 — Product and boundary model locked
- runtime package boundary approved
- root model and project zones approved
- governance/registry design approved

### M5.2 — Global Documents shell operational in PWA
- roots render
- curated registry works
- preview/details flow works
- authority/source cues render correctly

### M5.3 — Workspace-scoped Documents operational
- Project Hub scoped launch live
- at least one non-project workspace scoped launch live
- search broadening behavior works as designed

### M5.4 — Publish/handoff and canonical record behavior live
- guided publish works
- governed canonical state is visible
- notification/audit/handoff behavior is traceable

### M5.5 — Search and connected-record traversal materially simplified
- document discovery is live through context + search
- restricted-stub behavior works
- smart views operate within approved limits

### M5.6 — Adaptive field/tablet behavior and pilot readiness complete
- tablet/field mode acceptance passed
- telemetry and support guidance ready
- pilot go/no-go review passed

---

## 9. Ownership and Package/App Boundaries

## 9.1 PWA lane
Owns:
- Global Documents shell
- shared preview/details surface
- root navigation and smart views
- publish/handoff UI
- search and connected-record entry
- adaptive field/tablet behavior in the PWA shell

## 9.2 SPFx lane
Owns:
- contextual launch points
- embedded companion entry panels
- site-context-aware handoff into the shared shell
- limited contextual previews where appropriate

SPFx does **not** own a separate Documents product.

## 9.3 Shared packages
- `@hbc/documents` (new): shared document operating layer
- `@hbc/sharepoint-docs`: SharePoint document lifecycle and direct Graph file operations
- `@hbc/auth`: auth and permission state
- `@hbc/shell`: workspace and project context
- `@hbc/session-state`: offline-safe state and queued transitions
- `@hbc/related-items`: connected-record traversal
- `@hbc/workflow-handoff`: publish/handoff orchestration
- `@hbc/publish-workflow`: governed publication lifecycle
- `@hbc/notification-intelligence`: completion/failure guidance and priority notification routing
- `@hbc/ui-kit`: all reusable visual patterns and adaptive interaction design

---

## 10. Acceptance Criteria

Phase 5 should not be considered complete until all of the following are true:

1. A user can open **Global Documents** from the main operating shell and understand the available roots without training.
2. A user can open **workspace-scoped Documents** from Project Hub and stay inside context unless they deliberately broaden.
3. A user can distinguish:
   - personal vs governed,
   - authoritative vs non-authoritative,
   - available vs restricted,
   - preview vs native-open actions.
4. A user can publish from `My Files` into a governed root with clear canonical-record outcomes.
5. Project document access no longer requires remembering raw SharePoint storage structure in the normal case.
6. Search and connected-record entry materially reduce time-to-document for common project/work use cases.
7. Tablet/field users can complete the priority read/preview/open flows without desktop-only assumptions.
8. Permission failures are explainable in plain language.
9. Telemetry can prove whether the feature is actually simplifying document journeys.
10. The rollout can proceed without sync being the default answer to findability.

---

## 11. No-Go Conditions

Do **not** declare this feature ready if any of the following are still true:

- The primary user experience is still a raw SharePoint library dump.
- `My Files` and governed project/company records are visually or behaviorally indistinguishable.
- Search broadly surfaces inaccessible content without clear control.
- Project Hub can only link to raw library URLs and not to normalized scoped entry.
- Tablet/field behavior is merely responsive shrink-down, not an adaptive mode.
- The product depends on deprecated “Shared With Me” behavior as a core user promise.
- Desktop sync is still the recommended primary workflow.
- The implementation leaks direct Graph file operations outside the permitted package boundary.

---

## 12. Risks and Mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| Phase 5 starts before Phase 3/4 foundations are real | Results in a shallow file browser instead of a contextual operating layer | Gate entry on project context, auth, registry, and domain-record readiness |
| Overloading `@hbc/sharepoint-docs` | Collapses product logic into a SharePoint-only package | Introduce a separate shared operating-layer package |
| Raw M365 sprawl overwhelms users | Recreates the exact confusion this feature is supposed to solve | Curated registry first + controlled discoverability |
| Personal OneDrive becomes shadow record system | Teams may keep working from non-governed copies | Guided publish + canonical-record cues |
| Tablet/field adoption fails | Desktop-first file UX performs poorly in real jobsite workflows | Adaptive field/tablet mode aligned to UI kit |
| Deprecated or fragile M365 endpoints distort the product | “Shared With Me” and some convenience patterns are unstable | Keep convenience views secondary and replaceable |
| Permission opacity erodes trust | Users stop trusting search and document surfaces | Restricted stubs only in meaningful context + plain-language explanation |

---

## 13. Immediate Next Actions

1. Approve this Phase 5 addendum as the implementation posture for the unified Documents feature.
2. Create the paired **Phase 3 Enabling Plan** as the current execution control document.
3. Decide the exact package name and ownership boundary for the new shared documents layer.
4. Stand up a short spike for:
   - delegated auth/token flow,
   - root enumeration,
   - project-zone mapping,
   - preview/handoff feasibility,
   - publish/canonical state transition.
5. Update the Phase 5 master plan so this feature is explicitly represented as a core workstream rather than implied only generically.

---

## 14. Summary Verdict

The unified Documents feature should be implemented as a **Phase 5 primary workstream**, not as a Phase 3 feature build.  
Phase 5 should deliver it as a **PWA-owned, Microsoft-365-backed, context-first operating layer** that uses existing HB Intel primitives and adds the missing product/runtime behavior needed to make document access materially simpler and more trustworthy.
