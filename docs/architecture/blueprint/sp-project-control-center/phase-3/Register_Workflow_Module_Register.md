# Workflow Module Register

Generated: 2026-04-28

## Objective

Define the structured workflow modules that PCC planning must account for, including MVP priority, later-phase direction, target state, work center placement, and audit posture.

## Module Priority

| Module                             | MVP Priority | Work Center                                               | Target Product State                                                                                                | Interim Fallback                                      |
| ---------------------------------- | -----------: | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Project Lifecycle Readiness Center |          Yes | Project Readiness                                         | Structured lifecycle-readiness in-app workflow seeded by startup, safety, and closeout checklist definition files   | Template/reference launch if implementation not ready |
| Permit & Inspection Control Center |          Yes | Project Readiness                                         | Unified permit/inspection command-center target posture with internal `permits` and `required-inspections` families | Template/reference launch if implementation not ready |
| Responsibility Matrix              |          Yes | Project Readiness                                         | Structured item-level in-app workflow including owner-contract responsibility mapping                               | Template/reference launch if implementation not ready |
| Constraints Log                    |          Yes | Project Readiness                                         | Make-Ready Constraint & Risk Exposure Center (`Constraints Log` official name)                                      | Template/reference launch if implementation not ready |
| Buyout Log                         |          Yes | Project Readiness, with checkpoint ties where appropriate | Structured item-level in-app workflow                                                                               | Template/reference launch if implementation not ready |
| Estimating Kickoff                 |        Later | Project Readiness / Preconstruction classification        | Structured workflow later                                                                                           | Turnover visibility/access in MVP                     |
| Post-Bid Autopsy                   |        Later | Project Readiness / Preconstruction classification        | Structured workflow later                                                                                           | Turnover visibility/access in MVP                     |
| Job Closeout Checklist             |        Later | Project Readiness / Closeout classification               | Structured workflow later                                                                                           | Template/reference launch if implementation not ready |

Wave 9 grounding source path: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/`.
Wave 10 target architecture authority path: `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Permit_Inspection_Control_Center_Target_Architecture.md`.

Responsibility Matrix governance notes:

- Official module name is `Responsibility Matrix` (subtitle: `RACI + Owner-Contract Responsibility Control Center`).
- It is one unified Project Readiness module and not separate workbook launchers.
- Workbook-source counting posture: `109` workbook-derived task-row context (82 PM task-text rows plus 27 Field rows with assignment marks); strict marked assignment rows total `98`.
- Owner-contract workbook is currently template/schema-only (no populated default obligation-description rows).
- Responsibility Matrix owns responsibility modeling posture (assignment lifecycle/handoffs, current action owner, workflow steps, decision-rights overlay, exceptions, Matrix Health Score posture) while:
  - Wave 8 retains framework ownership;
  - Wave 14 retains approval/checkpoint execution ownership;
  - HB Document Control Center retains evidence-binary ownership;
  - Team & Access retains project roster/access-state ownership.
- Documentation posture only: no legal advice, no automatic creation of legal obligations, and no external-system writeback/runtime mutation claim.

Constraints Log governance notes:

- Official module name remains `Constraints Log` (subtitle: `Make-Ready Constraint & Risk Exposure Center`).
- Governing docs place Wave 12 under Project Readiness; current source-model mapping (`constraints-log`) to `risk-issues-decision` is a tracked alignment item and is not changed here.
- Governance boundary terms: risk (uncertain future), constraint (known blocker), issue (active problem), delay exposure (schedule-impact condition for review), and change exposure (scope/cost/contract impact condition for review).
- Embedded risk/exposure posture does not replace claims handling, formal delay analysis, enterprise change-management systems, or enterprise risk systems.
- External-system posture remains launcher/reference-only; no writeback/runtime mutation.

Buyout Log governance notes:

- Official module name remains `Buyout Log` (subtitle: `Buyout Control Center`).
- Buyout Log is an MVP Project Readiness workflow module with Procurement / Project Controls classification and future Procurement & Buyout Center affinity.

## Item-Level Workflow Model

Each MVP workflow module should be planned to support item-level tracking:

| Field / Capability                  | MVP Planning Requirement                    |
| ----------------------------------- | ------------------------------------------- |
| Item title / description            | Required                                    |
| Owner                               | Required                                    |
| Due date                            | Required where applicable                   |
| Status                              | Required                                    |
| Comments                            | Required                                    |
| Attachments / supporting references | Required where applicable                   |
| Reviewer                            | Required where applicable                   |
| Approval decision                   | Required where applicable                   |
| Escalation path                     | Required where applicable                   |
| History                             | Business audit trail                        |
| Source template mapping             | Required for migration/reference continuity |

## Workflow Status Model

Recommended statuses:

| Status              | Meaning                                             |
| ------------------- | --------------------------------------------------- |
| Not Started         | Item has not been acted on.                         |
| In Progress         | Item is actively being worked.                      |
| Blocked             | Item cannot proceed due to a dependency or issue.   |
| Needs Review        | Item is ready for review/approval.                  |
| Approved            | Item was approved by the appropriate role.          |
| Rejected / Returned | Item requires correction.                           |
| Complete            | Item is complete and no further action is required. |
| Deferred            | Item is intentionally deferred.                     |
| Not Applicable      | Item does not apply to the project.                 |

## Auditability

MVP workflow auditability is **business audit trail**:

- status changes;
- owner changes;
- due-date changes;
- comments;
- reviewer actions;
- approval decisions.

Compliance-grade immutable event/evidence logs are reserved for technical, provisioning, Site Health, repair, and admin-control-plane actions.

## Work Center Placement

All workflow modules live under **Project Readiness** in MVP, with functional classification:

| Classification                 | Modules                                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Startup                        | Project Lifecycle Readiness Center, Permit & Inspection Control Center, Responsibility Matrix, Constraints Log |
| Procurement / Project Controls | Buyout Log                                                                                                     |
| Preconstruction / Estimating   | Estimating Kickoff, Post-Bid Autopsy                                                                           |
| Closeout                       | Job Closeout Checklist                                                                                         |

---

# Workflow Module Implementation Waves

| Module                             |        Wave | Depends On            |
| ---------------------------------- | ----------: | --------------------- |
| Project Readiness Module Framework |           8 | Waves 1–3             |
| Project Lifecycle Readiness Center |           9 | Wave 8                |
| Permit & Inspection Control Center |          10 | Wave 8                |
| Responsibility Matrix              |          11 | Prior readiness waves |
| Constraints Log                    |          12 | Wave 8                |
| Buyout Log                         |          13 | Wave 8                |
| Approvals / Checkpoints            |          14 | Waves 6, 8–13         |
| Estimating Kickoff                 | Later phase | Post-MVP decision     |
| Post-Bid Autopsy                   | Later phase | Post-MVP decision     |
| Job Closeout Checklist             | Later phase | Post-MVP decision     |

## Unified Lifecycle Doctrine Alignment (2026-05-03)

Module register aligns to:

- [`../Unified_PCC_Lifecycle_Objective_Architecture.md`](../Unified_PCC_Lifecycle_Objective_Architecture.md)
- [`../PCC_Role_And_Stage_Lens_Model.md`](../PCC_Role_And_Stage_Lens_Model.md)
- [`../PCC_Cross_Stage_Traceability_Model.md`](../PCC_Cross_Stage_Traceability_Model.md)
- [`../PCC_Warranty_Traceability_Model.md`](../PCC_Warranty_Traceability_Model.md)

Clarifications:

- Workflow modules remain structured control patterns in one unified project context.
- Constraints Log can hold risk/issues/decision governance affinity and still feed Project Readiness signals.
- Buyout Log can hold procurement/buyout affinity and still feed Project Readiness signals.
- These affinity and rollup relationships are lineage-governed architecture and do not duplicate source ownership.
