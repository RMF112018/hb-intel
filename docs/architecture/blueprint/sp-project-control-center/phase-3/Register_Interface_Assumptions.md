# Interface Assumptions Register

Generated: 2026-04-28

## Objective

Capture implementation assumptions that the planning deliverables depend on but that must be validated before SPFx/backend/provisioning implementation begins.

| ID | Assumption | Applies To | Dependency / Gate | Risk if Wrong | Resolution Path |
|---|---|---|---|---|---|
| IA-001 | PCC shell will ultimately consume backend-normalized read models rather than raw provisioning manifests. | SPFx, backend | Phase 2 Step 4/5 and Prompt 06 gate review | SPFx may bind to unstable package exports. | Validate during implementation gate review. |
| IA-002 | `@hbc/project-site-provisioning` remains no-mutation until Phase 2 explicitly authorizes executor behavior. | Provisioning, backend | Phase 2 closeout | Premature executor work could bypass governance. | Preserve blocked status until Phase 2 closeout. |
| IA-003 | Team & Access automation will be backend-controlled, not SPFx-controlled. | Team & Access | Backend/security gate | Browser-side mutation would violate boundary. | Backend service contract review. |
| IA-004 | Site Health repair execution will be IT/Admin-controlled. | Site Health | Phase 2 Step 6 / backend gate | Project users might trigger unsafe tenant changes. | Model repair request separate from execution. |
| IA-005 | External Systems MVP requires launch links only. | External Systems | Product decision | Overbuilding mapping health/context could expand scope. | Keep mapping health as later-phase. |
| IA-006 | Document Control Center is an access hub, not a document-management workflow engine. | Document Control | Product decision | Incorrect scope could create duplicate Procore/SharePoint workflows. | Preserve access-only MVP boundary. |
| IA-007 | Structured workflow modules can be planned at item level before implementation data models are finalized. | Workflow modules | Future backend/data-model gate | Item model may require storage/schema decisions later. | Keep planning model implementation-independent. |
| IA-008 | Business-facing settings can be edited by PM/PX while technical settings remain IT/Admin-controlled. | Settings | Auth/role gate | Permission model may be too broad if not type-based. | Define setting categories and roles before implementation. |
| IA-009 | Executive Oversight can access Document Control Center through governed read-only permissions. | Executive Oversight | Access/security model | Read-only users may see too much without permission trimming. | Enforce permission-aware file access. |
| IA-010 | Estimating users need MVP turnover visibility but not full structured estimating workflows. | Estimating / Preconstruction | Product decision | Estimating MVP may feel underpowered if handoff is insufficient. | Make turnover visibility strong and defer structured workflows. |

## Treatment

These are planning assumptions only. They should be revisited during the Phase 3 Implementation Gate Review.

---

# Implementation Plan Interface Assumptions

| ID | Assumption | Applies To | Resolution Gate |
|---|---|---|---|
| IA-011 | All modules can use a shared workflow item/status/audit model. | Waves 8–14 | Wave 8 implementation |
| IA-012 | Admin queues can aggregate access, approval, repair, and mapping issues without executing mutation. | Wave 19 | Wave 19 implementation |
| IA-013 | External system launch links can be resolved from configuration/read models without runtime integrations. | Wave 15 | Wave 15 implementation |
| IA-014 | Site Health visibility can be implemented before repair execution. | Wave 17 | Phase 2 validation posture / Wave 17 |
